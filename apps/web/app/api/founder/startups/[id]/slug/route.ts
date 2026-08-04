import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getFounderSession } from '@/lib/founder-auth';

export const dynamic = 'force-dynamic';

const sql = neon(process.env.DATABASE_URL!);

const COOLDOWN_DAYS = 45;

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getFounderSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;
    const body = await request.json();
    const newSlug = body.slug?.trim().toLowerCase();

    // Validate slug format
    if (!newSlug || newSlug.length < 3) {
      return NextResponse.json({ error: 'Slug must be at least 3 characters' }, { status: 400 });
    }
    if (newSlug.length > 80) {
      return NextResponse.json({ error: 'Slug must be under 80 characters' }, { status: 400 });
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(newSlug)) {
      return NextResponse.json({ error: 'Slug can only contain lowercase letters, numbers, and hyphens' }, { status: 400 });
    }

    // Verify ownership
    const startups = await sql`
      SELECT id, slug, "slugChangedAt", "previousSlugs", "ownerId"
      FROM "Startup"
      WHERE id = ${id} AND "ownerId" = ${session.userId} AND "deletedAt" IS NULL
      LIMIT 1
    `;

    if (startups.length === 0) {
      return NextResponse.json({ error: 'Startup not found or not owned by you' }, { status: 404 });
    }

    const startup = startups[0] as any;

    // Same slug — no change needed
    if (startup.slug === newSlug) {
      return NextResponse.json({ success: true, slug: newSlug });
    }

    // Check 45-day cooldown (founders only)
    if (startup.slugChangedAt) {
      const lastChanged = new Date(startup.slugChangedAt + 'Z');
      const cooldownEnd = new Date(lastChanged.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
      if (new Date() < cooldownEnd) {
        const daysLeft = Math.ceil((cooldownEnd.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
        return NextResponse.json({
          error: `You can change your URL again in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} (next change: ${cooldownEnd.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' })})`
        }, { status: 429 });
      }
    }

    // Check slug uniqueness
    const existing = await sql`
      SELECT id FROM "Startup" WHERE slug = ${newSlug} AND id != ${id} LIMIT 1
    `;
    if (existing.length > 0) {
      return NextResponse.json({ error: 'This URL is already taken. Try a different one.' }, { status: 409 });
    }

    // Also check AiTool slugs (cross-table uniqueness)
    const toolCheck = await sql`SELECT id FROM "AiTool" WHERE slug = ${newSlug} LIMIT 1`;
    if (toolCheck.length > 0) {
      return NextResponse.json({ error: 'This URL is already in use. Try a different one.' }, { status: 409 });
    }

    // Store old slug in previousSlugs array
    const previousSlugs = startup.previousSlugs || [];
    if (!previousSlugs.includes(startup.slug)) {
      previousSlugs.push(startup.slug);
    }

    // Update slug
    await sql`
      UPDATE "Startup"
      SET slug = ${newSlug},
          "slugChangedAt" = NOW(),
          "previousSlugs" = ${previousSlugs},
          "updatedAt" = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true, slug: newSlug, previousSlug: startup.slug });
  } catch (error: any) {
    console.error('[PUT /api/founder/startups/[id]/slug]', error);
    return NextResponse.json({ error: 'Failed to update URL' }, { status: 500 });
  }
}

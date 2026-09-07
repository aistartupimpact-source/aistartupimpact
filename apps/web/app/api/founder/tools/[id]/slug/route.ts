import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getFounderSession } from '@/lib/founder-auth';

export const dynamic = 'force-dynamic';
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

    if (!newSlug || newSlug.length < 3) return NextResponse.json({ error: 'Slug must be at least 3 characters' }, { status: 400 });
    if (newSlug.length > 80) return NextResponse.json({ error: 'Slug must be under 80 characters' }, { status: 400 });
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(newSlug)) return NextResponse.json({ error: 'Only lowercase letters, numbers, and hyphens allowed' }, { status: 400 });

    const tools = await sql`
      SELECT id, slug, "slugChangedAt", "previousSlugs", "ownerId"
      FROM "AiTool"
      WHERE id = ${id} AND "ownerId" = ${session.userId} AND "deletedAt" IS NULL
      LIMIT 1
    `;

    if (tools.length === 0) return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    const tool = tools[0] as any;

    if (tool.slug === newSlug) return NextResponse.json({ success: true, slug: newSlug });

    // 45-day cooldown
    if (tool.slugChangedAt) {
      const lastChanged = new Date(tool.slugChangedAt + 'Z');
      const cooldownEnd = new Date(lastChanged.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
      if (new Date() < cooldownEnd) {
        const daysLeft = Math.ceil((cooldownEnd.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
        return NextResponse.json({ error: `You can change your URL again in ${daysLeft} days` }, { status: 429 });
      }
    }

    // Uniqueness check
    const existing = await sql`SELECT id FROM "AiTool" WHERE slug = ${newSlug} AND id != ${id} LIMIT 1`;
    if (existing.length > 0) return NextResponse.json({ error: 'This URL is already taken' }, { status: 409 });

    // Also check Startup slugs (cross-table uniqueness)
    const startupCheck = await sql`SELECT id FROM "Startup" WHERE slug = ${newSlug} LIMIT 1`;
    if (startupCheck.length > 0) {
      return NextResponse.json({ error: 'This URL is already in use. Try a different one.' }, { status: 409 });
    }

    const previousSlugs = tool.previousSlugs || [];
    if (!previousSlugs.includes(tool.slug)) previousSlugs.push(tool.slug);

    await sql`
      UPDATE "AiTool"
      SET slug = ${newSlug}, "slugChangedAt" = NOW(), "previousSlugs" = ${previousSlugs}, "updatedAt" = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true, slug: newSlug });
  } catch (error: any) {
    console.error('[PUT /api/founder/tools/[id]/slug]', error);
    return NextResponse.json({ error: 'Failed to update URL' }, { status: 500 });
  }
}

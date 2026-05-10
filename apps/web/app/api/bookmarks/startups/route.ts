import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/user-session';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET - Get all saved startups for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession();
    
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const savedStartups = await sql`
      SELECT 
        ss.id as "savedId",
        ss."createdAt"::text as "savedAt",
        s.id,
        s.name,
        s.slug,
        s.tagline,
        s."logoUrl",
        s.stage,
        s."headquartersCity",
        s."isVerified"
      FROM "SavedStartup" ss
      INNER JOIN "Startup" s ON s.slug = ss."startupSlug"
      WHERE ss."userId" = ${session.id}
        AND s."deletedAt" IS NULL
      ORDER BY ss."createdAt" DESC
    `;

    return NextResponse.json({ startups: savedStartups });
  } catch (error) {
    console.error('Error fetching saved startups:', error);
    return NextResponse.json({ error: 'Failed to fetch saved startups' }, { status: 500 });
  }
}

// POST - Save a startup
export async function POST(request: NextRequest) {
  try {
    const session = await getUserSession();
    
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { startupId } = await request.json();

    if (!startupId) {
      return NextResponse.json({ error: 'Startup slug required' }, { status: 400 });
    }

    // Check if already saved
    const existing = await sql`
      SELECT id FROM "SavedStartup"
      WHERE "userId" = ${session.id} AND "startupSlug" = ${startupId}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Startup already saved' }, { status: 400 });
    }

    // Save the startup
    await sql`
      INSERT INTO "SavedStartup" (id, "userId", "startupSlug", "createdAt")
      VALUES (gen_random_uuid(), ${session.id}, ${startupId}, NOW())
    `;

    return NextResponse.json({ success: true, message: 'Startup saved successfully' });
  } catch (error) {
    console.error('Error saving startup:', error);
    return NextResponse.json({ error: 'Failed to save startup' }, { status: 500 });
  }
}

// DELETE - Unsave a startup
export async function DELETE(request: NextRequest) {
  try {
    const session = await getUserSession();
    
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startupId = searchParams.get('startupId');

    if (!startupId) {
      return NextResponse.json({ error: 'Startup slug required' }, { status: 400 });
    }

    await sql`
      DELETE FROM "SavedStartup"
      WHERE "userId" = ${session.id} AND "startupSlug" = ${startupId}
    `;

    return NextResponse.json({ success: true, message: 'Startup unsaved successfully' });
  } catch (error) {
    console.error('Error unsaving startup:', error);
    return NextResponse.json({ error: 'Failed to unsave startup' }, { status: 500 });
  }
}

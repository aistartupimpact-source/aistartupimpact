import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/user-session';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET - Get all saved tools for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession();
    
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const savedTools = await sql`
      SELECT 
        st.id as "savedId",
        st."createdAt"::text as "savedAt",
        t.id,
        t.name,
        t.slug,
        t.tagline,
        t."logoUrl",
        t."pricingModel",
        t."avgRating",
        t."reviewCount"
      FROM "SavedTool" st
      INNER JOIN "AiTool" t ON t.slug = st."toolSlug"
      WHERE st."userId" = ${session.id}
        AND t."deletedAt" IS NULL
        AND t.status = 'APPROVED'
      ORDER BY st."createdAt" DESC
    `;

    return NextResponse.json({ tools: savedTools });
  } catch (error) {
    console.error('Error fetching saved tools:', error);
    return NextResponse.json({ error: 'Failed to fetch saved tools' }, { status: 500 });
  }
}

// POST - Save a tool
export async function POST(request: NextRequest) {
  try {
    const session = await getUserSession();
    
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { toolId } = await request.json();

    if (!toolId) {
      return NextResponse.json({ error: 'Tool slug required' }, { status: 400 });
    }

    // Check if already saved
    const existing = await sql`
      SELECT id FROM "SavedTool"
      WHERE "userId" = ${session.id} AND "toolSlug" = ${toolId}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Tool already saved' }, { status: 400 });
    }

    // Save the tool
    await sql`
      INSERT INTO "SavedTool" (id, "userId", "toolSlug", "createdAt")
      VALUES (gen_random_uuid(), ${session.id}, ${toolId}, NOW())
    `;

    return NextResponse.json({ success: true, message: 'Tool saved successfully' });
  } catch (error) {
    console.error('Error saving tool:', error);
    return NextResponse.json({ error: 'Failed to save tool' }, { status: 500 });
  }
}

// DELETE - Unsave a tool
export async function DELETE(request: NextRequest) {
  try {
    const session = await getUserSession();
    
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('toolId');

    if (!toolId) {
      return NextResponse.json({ error: 'Tool slug required' }, { status: 400 });
    }

    await sql`
      DELETE FROM "SavedTool"
      WHERE "userId" = ${session.id} AND "toolSlug" = ${toolId}
    `;

    return NextResponse.json({ success: true, message: 'Tool unsaved successfully' });
  } catch (error) {
    console.error('Error unsaving tool:', error);
    return NextResponse.json({ error: 'Failed to unsave tool' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/user-session';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET - Check if items are saved
export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession();
    
    if (!session?.id) {
      return NextResponse.json({ saved: {} });
    }

    const { searchParams } = new URL(request.url);
    const toolIds = searchParams.get('toolIds')?.split(',').filter(Boolean) || [];
    const startupIds = searchParams.get('startupIds')?.split(',').filter(Boolean) || [];

    const saved: Record<string, boolean> = {};

    // Check saved tools
    if (toolIds.length > 0) {
      const savedTools = await sql`
        SELECT "toolSlug" FROM "SavedTool"
        WHERE "userId" = ${session.id}
          AND "toolSlug" = ANY(${toolIds})
      `;
      savedTools.forEach((row: any) => {
        saved[`tool-${row.toolSlug}`] = true;
      });
    }

    // Check saved startups
    if (startupIds.length > 0) {
      const savedStartups = await sql`
        SELECT "startupSlug" FROM "SavedStartup"
        WHERE "userId" = ${session.id}
          AND "startupSlug" = ANY(${startupIds})
      `;
      savedStartups.forEach((row: any) => {
        saved[`startup-${row.startupSlug}`] = true;
      });
    }

    return NextResponse.json({ saved });
  } catch (error) {
    console.error('Error checking saved items:', error);
    return NextResponse.json({ saved: {} });
  }
}

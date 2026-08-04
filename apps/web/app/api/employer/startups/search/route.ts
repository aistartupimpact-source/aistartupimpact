import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getEmployerSession } from '@/lib/employer-auth';

export const dynamic = 'force-dynamic';

const sql = neon(process.env.DATABASE_URL!);

// GET: Search startups for linking to employer account
export async function GET(request: NextRequest) {
  try {
    const session = await getEmployerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const q = request.nextUrl.searchParams.get('q')?.trim();
    if (!q || q.length < 2) return NextResponse.json({ startups: [] });

    const startups = await sql`
      SELECT id, name, slug, "logoUrl", "headquartersCity", stage, "websiteUrl"
      FROM "Startup"
      WHERE "deletedAt" IS NULL
        AND "isApproved" = true
        AND (name ILIKE ${'%' + q + '%'} OR slug ILIKE ${'%' + q + '%'})
      ORDER BY name ASC
      LIMIT 10
    `;

    return NextResponse.json({ startups });
  } catch (error: any) {
    console.error('[GET /api/employer/startups/search]', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

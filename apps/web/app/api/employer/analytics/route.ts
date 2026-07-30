import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getEmployerSession } from '@/lib/employer-auth';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const session = await getEmployerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Overall stats
    const stats = await sql`
      SELECT
        COUNT(*) FILTER (WHERE "isActive" = true AND "deletedAt" IS NULL) AS "activeJobs",
        COUNT(*) FILTER (WHERE "deletedAt" IS NULL) AS "totalJobs",
        COALESCE(SUM("viewsCount"), 0) AS "totalViews",
        COALESCE(SUM("applicationsCount"), 0) AS "totalApplications",
        COALESCE(SUM("savedCount"), 0) AS "totalSaved",
        COALESCE(SUM("clicksCount"), 0) AS "totalClicks"
      FROM "JobBoardListing"
      WHERE "employerId" = ${session.id}
    `;

    // Per-job breakdown
    const jobStats = await sql`
      SELECT id, slug, title, "viewsCount", "applicationsCount", "savedCount", "clicksCount",
             "publishedAt"::text, "isActive"
      FROM "JobBoardListing"
      WHERE "employerId" = ${session.id} AND "deletedAt" IS NULL
      ORDER BY "viewsCount" DESC
      LIMIT 20
    `;

    // Application status breakdown
    const pipeline = await sql`
      SELECT a.status, COUNT(*)::int AS count
      FROM "JobBoardApplication" a
      JOIN "JobBoardListing" l ON l.id = a."listingId"
      WHERE l."employerId" = ${session.id}
      GROUP BY a.status
      ORDER BY count DESC
    `;

    // Recent applications (last 7 days)
    const recentApps = await sql`
      SELECT COUNT(*)::int AS count
      FROM "JobBoardApplication" a
      JOIN "JobBoardListing" l ON l.id = a."listingId"
      WHERE l."employerId" = ${session.id}
        AND a."appliedAt" >= NOW() - INTERVAL '7 days'
    `;

    const overview = stats[0] as any;
    const totalViews = parseInt(overview?.totalViews || '0');
    const totalApps = parseInt(overview?.totalApplications || '0');

    return NextResponse.json({
      overview: {
        activeJobs: parseInt(overview?.activeJobs || '0'),
        totalJobs: parseInt(overview?.totalJobs || '0'),
        totalViews,
        totalApplications: totalApps,
        totalSaved: parseInt(overview?.totalSaved || '0'),
        totalClicks: parseInt(overview?.totalClicks || '0'),
        ctr: totalViews > 0 ? ((totalApps / totalViews) * 100).toFixed(1) : '0',
        recentApplications: (recentApps[0] as any)?.count || 0,
      },
      jobStats,
      pipeline,
    });
  } catch (error: any) {
    console.error('[GET /api/employer/analytics]', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

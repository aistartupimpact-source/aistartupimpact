import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'all';
    const dateRange = searchParams.get('dateRange') || 'all';

    // Build date filter
    let dateFilter = '';
    const now = new Date();
    if (dateRange === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = `AND timestamp >= '${today.toISOString()}'`;
    } else if (dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = `AND timestamp >= '${weekAgo.toISOString()}'`;
    } else if (dateRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = `AND timestamp >= '${monthAgo.toISOString()}'`;
    }

    // Build consent filter
    let consentFilter = '';
    if (filter === 'accepted') {
      consentFilter = `AND categories->>'analytics' = 'true' AND categories->>'marketing' = 'true'`;
    } else if (filter === 'rejected') {
      consentFilter = `AND categories->>'analytics' = 'false' AND categories->>'marketing' = 'false'`;
    } else if (filter === 'customized') {
      consentFilter = `AND NOT (
        (categories->>'analytics' = 'true' AND categories->>'marketing' = 'true') OR
        (categories->>'analytics' = 'false' AND categories->>'marketing' = 'false')
      )`;
    }

    // Fetch logs
    const logs = await sql`
      SELECT 
        id,
        consent_id,
        timestamp,
        categories,
        method,
        policy_version,
        schema_version,
        ip_hash,
        user_agent,
        country,
        created_at
      FROM consent_logs
      WHERE 1=1 ${sql.unsafe(dateFilter)} ${sql.unsafe(consentFilter)}
      ORDER BY created_at DESC
      LIMIT 100
    `;

    // Calculate stats
    const statsQuery = await sql`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN categories->>'analytics' = 'true' AND categories->>'marketing' = 'true' THEN 1 ELSE 0 END) as accepted_all,
        SUM(CASE WHEN categories->>'analytics' = 'false' AND categories->>'marketing' = 'false' THEN 1 ELSE 0 END) as rejected_all,
        SUM(CASE WHEN categories->>'analytics' = 'true' THEN 1 ELSE 0 END) as analytics_accepted,
        SUM(CASE WHEN categories->>'marketing' = 'true' THEN 1 ELSE 0 END) as marketing_accepted,
        SUM(CASE WHEN method = 'banner' THEN 1 ELSE 0 END) as method_banner,
        SUM(CASE WHEN method = 'preferences' THEN 1 ELSE 0 END) as method_preferences,
        SUM(CASE WHEN method = 'link' THEN 1 ELSE 0 END) as method_link
      FROM consent_logs
      WHERE 1=1 ${sql.unsafe(dateFilter)}
    `;

    const statsRow = statsQuery[0];
    const total = parseInt(statsRow.total as string);
    const acceptedAll = parseInt(statsRow.accepted_all as string);
    const rejectedAll = parseInt(statsRow.rejected_all as string);
    const customized = total - acceptedAll - rejectedAll;

    const stats = {
      total,
      acceptedAll,
      rejectedAll,
      customized,
      analyticsAccepted: parseInt(statsRow.analytics_accepted as string),
      marketingAccepted: parseInt(statsRow.marketing_accepted as string),
      byMethod: {
        banner: parseInt(statsRow.method_banner as string),
        preferences: parseInt(statsRow.method_preferences as string),
        link: parseInt(statsRow.method_link as string),
      },
    };

    return NextResponse.json({
      logs,
      stats,
    });
  } catch (error) {
    console.error('Failed to fetch consent logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch consent logs' },
      { status: 500 }
    );
  }
}

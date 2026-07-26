import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || !['SUPER_ADMIN', 'EDITOR_IN_CHIEF'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Activity by user (last 30 days)
    const userActivity = await sql`
      SELECT 
        u.id as "userId",
        u.name as "userName",
        u.email as "userEmail",
        u.role as "userRole",
        u.avatar as "userAvatar",
        COUNT(al.id)::int as "totalActions",
        COUNT(CASE WHEN al.action = 'CREATE' THEN 1 END)::int as "creates",
        COUNT(CASE WHEN al.action = 'UPDATE' THEN 1 END)::int as "updates",
        COUNT(CASE WHEN al.action = 'DELETE' THEN 1 END)::int as "deletes",
        MAX(al."createdAt")::text as "lastActivity"
      FROM "User" u
      LEFT JOIN "AuditLog" al ON al."userId" = u.id AND al."createdAt" >= NOW() - INTERVAL '30 days'
      WHERE u."isActive" = true
      GROUP BY u.id, u.name, u.email, u.role, u.avatar
      ORDER BY "totalActions" DESC
    `;

    // Activity by resource type (last 30 days)
    const resourceActivity = await sql`
      SELECT 
        "resourceType",
        COUNT(*)::int as total,
        COUNT(CASE WHEN action = 'CREATE' THEN 1 END)::int as creates,
        COUNT(CASE WHEN action = 'UPDATE' THEN 1 END)::int as updates,
        COUNT(CASE WHEN action = 'DELETE' THEN 1 END)::int as deletes
      FROM "AuditLog"
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY "resourceType"
      ORDER BY total DESC
    `;

    // Recent deletes (important for super admin oversight)
    const recentDeletes = await sql`
      SELECT 
        al.id,
        al.action,
        al."resourceType",
        al."resourceId",
        al.before,
        al."createdAt"::text as "createdAt",
        u.name as "userName",
        u.email as "userEmail",
        u.role as "userRole"
      FROM "AuditLog" al
      LEFT JOIN "User" u ON u.id = al."userId"
      WHERE al.action = 'DELETE'
      ORDER BY al."createdAt" DESC
      LIMIT 20
    `;

    // Daily activity (last 14 days)
    const dailyActivity = await sql`
      SELECT 
        DATE(al."createdAt")::text as date,
        COUNT(*)::int as total
      FROM "AuditLog" al
      WHERE al."createdAt" >= NOW() - INTERVAL '14 days'
      GROUP BY DATE(al."createdAt")
      ORDER BY date ASC
    `;

    // Total counts
    const totals = await sql`
      SELECT 
        COUNT(*)::int as "allTime",
        COUNT(CASE WHEN "createdAt" >= NOW() - INTERVAL '24 hours' THEN 1 END)::int as "last24h",
        COUNT(CASE WHEN "createdAt" >= NOW() - INTERVAL '7 days' THEN 1 END)::int as "last7d",
        COUNT(CASE WHEN "createdAt" >= NOW() - INTERVAL '30 days' THEN 1 END)::int as "last30d"
      FROM "AuditLog"
    `;

    return NextResponse.json({
      userActivity,
      resourceActivity,
      recentDeletes,
      dailyActivity,
      totals: totals[0] || { allTime: 0, last24h: 0, last7d: 0, last30d: 0 },
    });
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    return NextResponse.json({ error: 'Failed to fetch audit stats' }, { status: 500 });
  }
}

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

  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const userId = searchParams.get('userId') || null;
  const action = searchParams.get('action') || null;
  const resourceType = searchParams.get('resourceType') || null;
  const from = searchParams.get('from') || null;
  const to = searchParams.get('to') || null;
  const offset = (page - 1) * limit;

  try {
    // Build dynamic filter
    let conditions = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (userId) {
      conditions += ` AND al."userId" = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }
    if (action) {
      conditions += ` AND al.action = $${paramIndex}`;
      params.push(action);
      paramIndex++;
    }
    if (resourceType) {
      conditions += ` AND al."resourceType" = $${paramIndex}`;
      params.push(resourceType);
      paramIndex++;
    }
    if (from) {
      conditions += ` AND al."createdAt" >= $${paramIndex}::timestamp`;
      params.push(from);
      paramIndex++;
    }
    if (to) {
      conditions += ` AND al."createdAt" <= $${paramIndex}::timestamp`;
      params.push(to);
      paramIndex++;
    }

    // Use tagged template for the query since neon doesn't support parameterized strings easily
    // We'll use separate queries based on filters
    const logs = await sql`
      SELECT 
        al.id,
        al."userId",
        al.action,
        al."resourceType",
        al."resourceId",
        al.before,
        al.after,
        al."ipAddress",
        al."createdAt"::text as "createdAt",
        u.name as "userName",
        u.email as "userEmail",
        u.role as "userRole",
        u.avatar as "userAvatar"
      FROM "AuditLog" al
      LEFT JOIN "User" u ON u.id = al."userId"
      WHERE 1=1
        AND (${userId}::text IS NULL OR al."userId" = ${userId})
        AND (${action}::text IS NULL OR al.action = ${action})
        AND (${resourceType}::text IS NULL OR al."resourceType" = ${resourceType})
        AND (${from}::text IS NULL OR al."createdAt" >= ${from}::timestamp)
        AND (${to}::text IS NULL OR al."createdAt" <= ${to}::timestamp)
      ORDER BY al."createdAt" DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    // Get total count for pagination
    const countResult = await sql`
      SELECT COUNT(*)::int as total
      FROM "AuditLog" al
      WHERE 1=1
        AND (${userId}::text IS NULL OR al."userId" = ${userId})
        AND (${action}::text IS NULL OR al.action = ${action})
        AND (${resourceType}::text IS NULL OR al."resourceType" = ${resourceType})
        AND (${from}::text IS NULL OR al."createdAt" >= ${from}::timestamp)
        AND (${to}::text IS NULL OR al."createdAt" <= ${to}::timestamp)
    `;

    const total = countResult[0]?.total || 0;

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}

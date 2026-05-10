import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  console.log('🔵 Admin API: Fetching web users...');
  
  try {
    const session = await getServerSession(authOptions);
    console.log('🔵 Admin session:', { hasSession: !!session, user: session?.user?.email });

    if (!session?.user) {
      console.log('❌ No session - unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔵 Querying database for web users using raw SQL...');
    
    // Use raw SQL to avoid Prisma DateTime serialization issues with Neon HTTP adapter
    const users = await sql`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.slug,
        u.avatar,
        u.bio,
        u.twitter,
        u.linkedin,
        u."isActive",
        u."lastLoginAt"::text AS "lastLoginAt",
        u."createdAt"::text AS "createdAt",
        COALESCE(COUNT(s.id), 0)::int AS "sessionCount"
      FROM "WebUser" u
      LEFT JOIN "WebUserSession" s ON s."webUserId" = u.id
      GROUP BY u.id, u.email, u.name, u.slug, u.avatar, u.bio, u.twitter, u.linkedin, u."isActive", u."lastLoginAt", u."createdAt"
      ORDER BY u."createdAt" DESC
    `;

    // Transform to match expected format
    const formattedUsers = users.map((user: any) => ({
      ...user,
      _count: {
        WebUserSession: user.sessionCount,
      },
    }));

    console.log(`✅ Found ${formattedUsers.length} web users`);
    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error('❌ Error fetching web users:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to fetch web users' },
      { status: 500 }
    );
  }
}

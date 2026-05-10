import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

const JWT_SECRET = new TextEncoder().encode(
  process.env.USER_JWT_SECRET || 'user-secret-change-in-production'
);

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('user-token')?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    // Verify token
    const verified = await jwtVerify(token, JWT_SECRET);
    const payload = verified.payload as any;

    // Get web user from database using raw SQL to avoid Prisma DateTime serialization issues
    const users = await sql`
      SELECT 
        id, email, name, avatar, slug, bio, twitter, linkedin, 
        "isActive", "termsAcceptedAt"::text as "termsAcceptedAt"
      FROM "WebUser"
      WHERE id = ${payload.userId}
      LIMIT 1
    `;

    if (users.length === 0 || !users[0].isActive) {
      return NextResponse.json({ user: null });
    }

    const user = users[0];

    return NextResponse.json({ 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        slug: user.slug,
        bio: user.bio,
        twitter: user.twitter,
        linkedin: user.linkedin,
        termsAcceptedAt: user.termsAcceptedAt,
      }
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ user: null });
  }
}

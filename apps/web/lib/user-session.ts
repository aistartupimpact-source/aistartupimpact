import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

const JWT_SECRET = new TextEncoder().encode(
  process.env.USER_JWT_SECRET || 'user-secret-change-in-production'
);

export interface UserSession {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  slug: string;
  bio: string | null;
  twitter: string | null;
  linkedin: string | null;
  termsAcceptedAt: Date | null;
}

/**
 * Server-side function to get the current user session
 * Use this in Server Components and Server Actions
 */
export async function getUserSession(): Promise<UserSession | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('user-token')?.value;

    if (!token) {
      return null;
    }

    // Verify JWT token
    const verified = await jwtVerify(token, JWT_SECRET);
    const payload = verified.payload as any;

    // Get user from database using raw SQL to avoid Prisma caching issues
    const users = await sql`
      SELECT 
        id, email, name, avatar, slug, bio, twitter, linkedin, 
        "isActive", "termsAcceptedAt"::text as "termsAcceptedAt"
      FROM "WebUser"
      WHERE id = ${payload.userId}
      LIMIT 1
    `;

    if (users.length === 0 || !users[0].isActive) {
      return null;
    }

    const user = users[0];

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      slug: user.slug,
      bio: user.bio,
      twitter: user.twitter,
      linkedin: user.linkedin,
      termsAcceptedAt: user.termsAcceptedAt ? new Date(user.termsAcceptedAt) : null,
    };
  } catch (error) {
    console.error('getUserSession error:', error);
    return null;
  }
}

/**
 * Check if user is authenticated (returns boolean)
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getUserSession();
  return session !== null;
}

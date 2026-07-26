import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { SignJWT } from 'jose';
import { randomBytes } from 'crypto';

const sql = neon(process.env.DATABASE_URL!);
const JWT_SECRET = new TextEncoder().encode(
  process.env.USER_JWT_SECRET || 'user-secret-change-in-production'
);

function generateId(): string {
  return randomBytes(16).toString('hex');
}

function generateSlug(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  return `${base}-${randomBytes(3).toString('hex')}`;
}

/**
 * POST /api/user/auth/bridge-session
 * Creates a WebUser session for a founder who just completed 2FA.
 * This bridges the founder's auth to the community session system.
 * Only callable after successful founder 2FA verification (founder_session cookie must be set).
 */
export async function POST(request: NextRequest) {
  try {
    const { founderId } = await request.json();
    if (!founderId) {
      return NextResponse.json({ error: 'Missing founderId' }, { status: 400 });
    }

    // Get founder data
    const founders = await sql`
      SELECT id, email, name, avatar
      FROM "FounderUser"
      WHERE id = ${founderId}
      LIMIT 1
    `;

    if (founders.length === 0) {
      return NextResponse.json({ error: 'Founder not found' }, { status: 404 });
    }

    const founder = founders[0];

    // Find or create WebUser for this email
    let webUsers = await sql`
      SELECT id, email, name, avatar, slug
      FROM "WebUser"
      WHERE email = ${founder.email.toLowerCase()}
      LIMIT 1
    `;

    if (webUsers.length === 0) {
      const newId = generateId();
      const slug = generateSlug(founder.name || founder.email.split('@')[0]);
      await sql`
        INSERT INTO "WebUser" (id, email, name, slug, avatar, "isActive", "lastLoginAt", "createdAt", "updatedAt")
        VALUES (${newId}, ${founder.email.toLowerCase()}, ${founder.name}, ${slug}, ${founder.avatar || null}, true, NOW(), NOW(), NOW())
        ON CONFLICT (email) DO NOTHING
      `;
      webUsers = await sql`
        SELECT id, email, name, avatar, slug FROM "WebUser" WHERE email = ${founder.email.toLowerCase()} LIMIT 1
      `;
    }

    const user = webUsers[0];

    // Create session token
    const sessionId = generateId();
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      sessionId,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(JWT_SECRET);

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await sql`
      INSERT INTO "WebUserSession" (id, "webUserId", "refreshToken", "expiresAt", "ipAddress", "userAgent", "createdAt")
      VALUES (${sessionId}, ${user.id}, ${token}, ${expiresAt.toISOString()}, 'bridge', 'bridge', NOW())
    `;

    const response = NextResponse.json({ success: true });
    response.cookies.set('user-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Bridge session error:', error);
    return NextResponse.json({ error: 'Failed to bridge session' }, { status: 500 });
  }
}

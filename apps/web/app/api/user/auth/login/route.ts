import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { randomBytes } from 'crypto';
import { authRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { loginSchema, validateInput } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const sql = neon(process.env.DATABASE_URL!);

const JWT_SECRET = new TextEncoder().encode(
  process.env.USER_JWT_SECRET || 'user-secret-change-in-production'
);

function generateId(): string {
  return randomBytes(16).toString('hex');
}

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  const random = randomBytes(3).toString('hex');
  return `${base}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request);
    let remaining = 999;

    if (authRateLimit) {
      try {
        const { success: rateLimitSuccess, remaining: rem } = await authRateLimit.limit(identifier);
        remaining = rem;
        if (!rateLimitSuccess) {
          return NextResponse.json(
            { error: 'Too many login attempts. Please try again in 15 minutes.' },
            { status: 429, headers: { 'X-RateLimit-Remaining': '0' } }
          );
        }
      } catch (rateLimitError) {
        console.error('Rate limit check failed:', rateLimitError);
      }
    }

    // Input validation
    const body = await request.json();
    const validation = validateInput(loginSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400, headers: { 'X-RateLimit-Remaining': remaining.toString() } }
      );
    }

    const { email, password } = validation.data;
    const emailLower = email.toLowerCase();

    // ─── Try WebUser first ───────────────────────────
    const webUsers = await sql`
      SELECT id, email, name, "passwordHash", avatar, slug, "isActive"
      FROM "WebUser"
      WHERE email = ${emailLower}
      LIMIT 1
    `;

    if (webUsers.length > 0) {
      const user = webUsers[0];

      if (!user.isActive) {
        return NextResponse.json({ error: 'Account is deactivated. Please contact support.' }, { status: 403 });
      }
      if (!user.passwordHash) {
        return NextResponse.json({ error: 'Please sign in with Google' }, { status: 400 });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      // Success — create session for WebUser
      return await createWebUserSession(user, request);
    }

    // ─── Try FounderUser ─────────────────────────────
    const founders = await sql`
      SELECT id, email, name, "passwordHash", avatar, status, "twoFactorEnabled", "emailVerified"
      FROM "FounderUser"
      WHERE email = ${emailLower}
      LIMIT 1
    `;

    if (founders.length > 0) {
      const founder = founders[0];

      if (founder.status === 'SUSPENDED') {
        return NextResponse.json({ error: 'Account is suspended. Please contact support.' }, { status: 403 });
      }
      if (!founder.passwordHash) {
        return NextResponse.json({ error: 'Please sign in with Google' }, { status: 400 });
      }
      if (!founder.emailVerified) {
        return NextResponse.json({ error: 'Please verify your email first. Check your inbox.' }, { status: 403 });
      }

      const isValid = await bcrypt.compare(password, founder.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      // 2FA check
      if (founder.twoFactorEnabled) {
        return NextResponse.json({ success: false, requires2FA: true, userId: founder.id });
      }

      // Founder doesn't have a WebUser — create one on the fly for unified session
      // This bridges the gap: founder can now use the community features too
      const webUser = await ensureWebUser(founder as any);
      return await createWebUserSession(webUser, request);
    }

    // ─── Try EventOrganizer ──────────────────────────
    const organizers = await sql`
      SELECT id, email, name, "passwordHash", avatar, status, "emailVerified"
      FROM "EventOrganizer"
      WHERE email = ${emailLower}
      LIMIT 1
    `;

    if (organizers.length > 0) {
      const organizer = organizers[0];

      if (organizer.status === 'SUSPENDED') {
        return NextResponse.json({ error: 'Account is suspended. Please contact support.' }, { status: 403 });
      }
      if (!organizer.passwordHash) {
        return NextResponse.json({ error: 'Please sign in with Google' }, { status: 400 });
      }

      const isValid = await bcrypt.compare(password, organizer.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      // Organizer doesn't have a WebUser — create one for unified session
      const webUser = await ensureWebUser(organizer as any);
      return await createWebUserSession(webUser, request);
    }

    // ─── Nothing found ───────────────────────────────
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Ensure a WebUser record exists for a given account (from FounderUser or EventOrganizer).
 * This allows them to get a user-token cookie and use community features.
 */
async function ensureWebUser(account: { id: string; email: string; name: string; avatar?: string | null; passwordHash?: string | null }) {
  // Check if WebUser already exists for this email
  const existing = await sql`
    SELECT id, email, name, avatar, slug, "isActive"
    FROM "WebUser"
    WHERE email = ${account.email.toLowerCase()}
    LIMIT 1
  `;

  if (existing.length > 0) {
    return existing[0];
  }

  // Create a WebUser from the founder/organizer data
  const newId = generateId();
  const slug = generateSlug(account.name || account.email.split('@')[0]);

  await sql`
    INSERT INTO "WebUser" (id, email, name, slug, avatar, "passwordHash", "isActive", "lastLoginAt", "createdAt", "updatedAt")
    VALUES (${newId}, ${account.email.toLowerCase()}, ${account.name}, ${slug}, ${account.avatar || null}, ${account.passwordHash || null}, true, NOW(), NOW(), NOW())
    ON CONFLICT (email) DO NOTHING
  `;

  // If conflict (race condition), fetch the existing one
  const created = await sql`
    SELECT id, email, name, avatar, slug, "isActive"
    FROM "WebUser"
    WHERE email = ${account.email.toLowerCase()}
    LIMIT 1
  `;

  return created[0];
}

/**
 * Create a WebUserSession and return the response with cookie.
 */
async function createWebUserSession(user: any, request: NextRequest) {
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
    VALUES (
      ${sessionId}, ${user.id}, ${token}, ${expiresAt.toISOString()},
      ${request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'},
      ${request.headers.get('user-agent') || 'unknown'}, NOW()
    )
  `;

  await sql`UPDATE "WebUser" SET "lastLoginAt" = NOW() WHERE id = ${user.id}`;

  const response = NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, slug: user.slug },
  });

  response.cookies.set('user-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });

  return response;
}

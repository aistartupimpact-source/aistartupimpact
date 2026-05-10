import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { randomBytes } from 'crypto';
import { authRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { loginSchema, validateInput } from '@/lib/validation';

const sql = neon(process.env.DATABASE_URL!);

const JWT_SECRET = new TextEncoder().encode(
  process.env.USER_JWT_SECRET || 'user-secret-change-in-production'
);

function generateId(): string {
  return randomBytes(16).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - prevent brute force attacks
    const identifier = getClientIdentifier(request);
    const { success: rateLimitSuccess, remaining } = await authRateLimit.limit(identifier);
    
    if (!rateLimitSuccess) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 15 minutes.' },
        { status: 429, headers: { 'X-RateLimit-Remaining': '0' } }
      );
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

    // Find user
    const users = await sql`
      SELECT id, email, name, "passwordHash", avatar, slug, "isActive"
      FROM "WebUser"
      WHERE email = ${email.toLowerCase()}
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0];

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // Verify password
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'Please sign in with Google' },
        { status: 400 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

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

    // Create session in database
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await sql`
      INSERT INTO "WebUserSession" (
        id, "webUserId", "refreshToken", "expiresAt", "ipAddress", "userAgent", "createdAt"
      ) VALUES (
        ${sessionId},
        ${user.id},
        ${token},
        ${expiresAt.toISOString()},
        ${request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'},
        ${request.headers.get('user-agent') || 'unknown'},
        NOW()
      )
    `;

    // Update last login
    await sql`
      UPDATE "WebUser"
      SET "lastLoginAt" = NOW()
      WHERE id = ${user.id}
    `;

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        slug: user.slug,
      },
    });

    response.cookies.set('user-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

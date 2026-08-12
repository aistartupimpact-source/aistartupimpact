import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { SignJWT } from 'jose';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI_USER || 'http://localhost:3000/api/user/auth/google/callback';
const JWT_SECRET = new TextEncoder().encode(
  process.env.USER_JWT_SECRET!
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

export async function GET(request: NextRequest) {
  console.log('🔵 Google OAuth callback started');
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state') || '/profile';
    const error = searchParams.get('error');

    console.log('🔵 OAuth params:', { hasCode: !!code, state, error });

    if (error) {
      console.log('❌ OAuth error from Google:', error);
      return NextResponse.redirect(new URL('/?error=oauth_cancelled', request.url));
    }

    if (!code) {
      console.log('❌ No authorization code received');
      return NextResponse.redirect(new URL('/?error=oauth_failed', request.url));
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID || '',
        client_secret: GOOGLE_CLIENT_SECRET || '',
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      console.error('Google OAuth: no access token received');
      return NextResponse.redirect(new URL('/?error=oauth_token_failed', request.url));
    }

    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const googleUser = await userInfoResponse.json();

    if (!googleUser.email) {
      return NextResponse.redirect(new URL('/?error=oauth_no_email', request.url));
    }

    const existingUsers = await sql`
      SELECT id, email, name, avatar, slug, "isActive"
      FROM "WebUser"
      WHERE email = ${googleUser.email.toLowerCase()}
      LIMIT 1
    `;

    let user;
    if (existingUsers.length === 0) {
      const newUserId = generateId();
      const newUserSlug = generateSlug(googleUser.name || googleUser.email.split('@')[0]);

      try {
        await sql`
          INSERT INTO "WebUser" (
            id, email, name, slug, avatar, "isActive", "lastLoginAt", "createdAt", "updatedAt"
          ) VALUES (
            ${newUserId},
            ${googleUser.email.toLowerCase()},
            ${googleUser.name || googleUser.email.split('@')[0]},
            ${newUserSlug},
            ${googleUser.picture || null},
            true,
            NOW(),
            NOW(),
            NOW()
          )
        `;
      } catch (insertError) {
        console.error('User insert failed:', insertError);
        throw insertError;
      }
      
      user = {
        id: newUserId,
        email: googleUser.email.toLowerCase(),
        name: googleUser.name || googleUser.email.split('@')[0],
        avatar: googleUser.picture || null,
        slug: newUserSlug,
        isActive: true,
      };
    } else {
      user = existingUsers[0];
    }

    if (!user.isActive) {
      return NextResponse.redirect(new URL('/?error=account_deactivated', request.url));
    }

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

    // Create session in database using raw SQL
    console.log('🔵 Creating session in database...');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    try {
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
      console.log('✅ Session created');
    } catch (sessionError) {
      console.error('❌ Session creation failed:', sessionError);
      throw sessionError;
    }

    // Update last login using raw SQL
    console.log('🔵 Updating last login...');
    await sql`
      UPDATE "WebUser"
      SET "lastLoginAt" = NOW()
      WHERE id = ${user.id}
    `;

    // Set cookie and redirect (validate returnTo to prevent open redirects)
    let redirectPath = '/profile';
    if (typeof state === 'string' && state.startsWith('/') && !state.startsWith('//')) {
      redirectPath = state;
    }
    const response = NextResponse.redirect(new URL(redirectPath, request.url));
    response.cookies.set('user-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('❌ Google OAuth callback error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    
    // Log Prisma-specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Prisma error code:', (error as any).code);
      console.error('Prisma error meta:', (error as any).meta);
    }
    
    return NextResponse.redirect(new URL('/?error=oauth_error', request.url));
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { SignJWT } from 'jose';
import { randomBytes } from 'crypto';

const sql = neon(process.env.DATABASE_URL!);

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI_USER || 'http://localhost:3000/api/user/auth/google/callback';
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

    // Exchange code for tokens
    console.log('🔵 Exchanging code for tokens...');
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
    console.log('🔵 Token response:', { hasAccessToken: !!tokens.access_token, error: tokens.error });

    if (!tokens.access_token) {
      console.log('❌ No access token received:', tokens);
      return NextResponse.redirect(new URL('/?error=oauth_token_failed', request.url));
    }

    // Get user info from Google
    console.log('🔵 Fetching user info from Google...');
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const googleUser = await userInfoResponse.json();
    console.log('🔵 Google user info:', { email: googleUser.email, name: googleUser.name });

    if (!googleUser.email) {
      console.log('❌ No email in Google user info');
      return NextResponse.redirect(new URL('/?error=oauth_no_email', request.url));
    }

    // Find or create user using raw SQL to avoid Prisma DateTime issues
    console.log('🔵 Looking for existing user...');
    const existingUsers = await sql`
      SELECT id, email, name, avatar, slug, "isActive"
      FROM "WebUser"
      WHERE email = ${googleUser.email.toLowerCase()}
      LIMIT 1
    `;
    console.log('🔵 Query result:', { count: existingUsers.length });

    let user;
    if (existingUsers.length === 0) {
      console.log('🔵 Creating new user...');
      const newUserId = generateId();
      const newUserSlug = generateSlug(googleUser.name || googleUser.email.split('@')[0]);
      
      console.log('🔵 New user data:', {
        id: newUserId,
        email: googleUser.email.toLowerCase(),
        name: googleUser.name || googleUser.email.split('@')[0],
        slug: newUserSlug,
        avatar: googleUser.picture || null,
      });

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
        console.log('✅ User insert successful');
      } catch (insertError) {
        console.error('❌ User insert failed:', insertError);
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
      console.log('✅ User created:', user.id);
    } else {
      user = existingUsers[0];
      console.log('✅ User found:', user.id);
    }

    if (!user.isActive) {
      console.log('❌ User account is deactivated');
      return NextResponse.redirect(new URL('/?error=account_deactivated', request.url));
    }

    // Create session token
    console.log('🔵 Creating session token...');
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

    // Set cookie and redirect
    console.log('✅ OAuth success! Redirecting to:', state);
    const response = NextResponse.redirect(new URL(state, request.url));
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

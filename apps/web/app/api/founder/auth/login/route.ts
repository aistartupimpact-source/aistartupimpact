import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { verifyPassword, setFounderSession } from '@/lib/founder-auth';
import { authRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { loginSchema, validateInput } from '@/lib/validation';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (with fallback)
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
        // Continue without rate limiting if it fails
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
    
    const validated = validation.data;
    
    // Find user with raw SQL
    const users = await sql`
      SELECT id, email, name, "passwordHash", company, "emailVerified", status, "twoFactorEnabled"
      FROM "FounderUser"
      WHERE email = ${validated.email.toLowerCase()}
      LIMIT 1
    `;
    
    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    const user = users[0];
    
    // Verify password
    const isValid = await verifyPassword(validated.password, user.passwordHash);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email first. Check your inbox for the verification link.' },
        { status: 403 }
      );
    }
    
    // Check if account is active
    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Your account has been suspended. Please contact support.' },
        { status: 403 }
      );
    }
    
    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Return special response indicating 2FA is required
      // Don't set session yet - wait for 2FA verification
      return NextResponse.json({
        requires2FA: true,
        userId: user.id,
        email: user.email,
        message: 'Please enter your 2FA code',
      });
    }
    
    // Update last login with raw SQL
    await sql`
      UPDATE "FounderUser"
      SET "lastLoginAt" = NOW(), "updatedAt" = NOW()
      WHERE id = ${user.id}
    `;
    
    // Set session
    await setFounderSession(user.id, user.email, user.name);
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company,
      }
    });
    
  } catch (error: any) {
    console.error('Login error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Invalid input data' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}

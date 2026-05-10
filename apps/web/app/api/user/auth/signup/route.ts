import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { authRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { signupSchema, validateInput } from '@/lib/validation';

const sql = neon(process.env.DATABASE_URL!);

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
    // Rate limiting - prevent spam signups (with fallback)
    const identifier = getClientIdentifier(request);
    let remaining = 999;
    
    if (authRateLimit) {
      try {
        const { success: rateLimitSuccess, remaining: rem } = await authRateLimit.limit(identifier);
        remaining = rem;
        
        if (!rateLimitSuccess) {
          return NextResponse.json(
            { error: 'Too many signup attempts. Please try again in 15 minutes.' },
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
    const validation = validateInput(signupSchema, body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400, headers: { 'X-RateLimit-Remaining': remaining.toString() } }
      );
    }

    const { email, password, name } = validation.data;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM "WebUser"
      WHERE email = ${email.toLowerCase()}
      LIMIT 1
    `;

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const userId = generateId();
    const userSlug = generateSlug(name);
    
    await sql`
      INSERT INTO "WebUser" (
        id, email, "passwordHash", name, slug, "isActive", "createdAt", "updatedAt"
      ) VALUES (
        ${userId},
        ${email.toLowerCase()},
        ${passwordHash},
        ${name},
        ${userSlug},
        true,
        NOW(),
        NOW()
      )
    `;

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: userId,
        email: email.toLowerCase(),
        name: name,
        slug: userSlug,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

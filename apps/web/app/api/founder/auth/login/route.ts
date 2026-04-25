import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { verifyPassword, setFounderSession } from '@/lib/founder-auth';
import { z } from 'zod';

const sql = neon(process.env.DATABASE_URL!);

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);
    
    // Find user with raw SQL
    const users = await sql`
      SELECT id, email, name, "passwordHash", company, "emailVerified", status
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

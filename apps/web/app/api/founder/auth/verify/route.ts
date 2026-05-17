import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { z } from 'zod';

const sql = neon(process.env.DATABASE_URL!);

const verifySchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = verifySchema.parse(body);
    
    // Find user with this verification token using raw SQL
    const users = await sql`
      SELECT id, email, name, "emailVerified", status
      FROM "FounderUser"
      WHERE "verifyToken" = ${validated.token}
      LIMIT 1
    `;
    
    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired verification link' },
        { status: 400 }
      );
    }
    
    const user = users[0];
    
    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email already verified. You can now login.' },
        { status: 200 }
      );
    }
    
    // Update user - verify email and activate account using raw SQL
    await sql`
      UPDATE "FounderUser"
      SET "emailVerified" = true,
          "verifyToken" = NULL,
          status = 'ACTIVE',
          "updatedAt" = NOW()
      WHERE id = ${user.id}
    `;
    
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now login.'
    });
    
  } catch (error: any) {
    console.error('Verification error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}

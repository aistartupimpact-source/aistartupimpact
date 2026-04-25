import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Development-only endpoint to manually verify emails
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user
    const users = await sql`
      SELECT id, email, name, "emailVerified", status
      FROM "FounderUser"
      WHERE email = ${email.toLowerCase()}
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Update user - verify email and activate account
    await sql`
      UPDATE "FounderUser"
      SET 
        "emailVerified" = true,
        "verifyToken" = null,
        status = 'ACTIVE',
        "updatedAt" = NOW()
      WHERE id = ${user.id}
    `;

    return NextResponse.json({
      success: true,
      message: `Email verified successfully for ${user.email}`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: true,
        status: 'ACTIVE'
      }
    });

  } catch (error: any) {
    console.error('Manual verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}

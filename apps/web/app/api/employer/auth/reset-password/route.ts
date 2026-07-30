import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) return NextResponse.json({ error: 'Token and password required' }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });

    // Password strength check
    if (!/[A-Z]/.test(password)) return NextResponse.json({ error: 'Password must contain an uppercase letter' }, { status: 400 });
    if (!/[a-z]/.test(password)) return NextResponse.json({ error: 'Password must contain a lowercase letter' }, { status: 400 });
    if (!/[0-9]/.test(password)) return NextResponse.json({ error: 'Password must contain a number' }, { status: 400 });

    // Find employer by valid reset token
    const employers = await sql`
      SELECT id FROM "JobBoardEmployer"
      WHERE "resetToken" = ${token} AND "resetTokenExpiry" > NOW() AND "isActive" = true
      LIMIT 1
    `;

    if (employers.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired reset link. Please request a new one.' }, { status: 400 });
    }

    const employer = employers[0] as any;
    const passwordHash = await bcrypt.hash(password, 12);

    // Update password + clear token + reset login attempts
    await sql`
      UPDATE "JobBoardEmployer"
      SET "passwordHash" = ${passwordHash},
          "resetToken" = NULL,
          "resetTokenExpiry" = NULL,
          "failedLoginAttempts" = 0,
          "lockedUntil" = NULL,
          "updatedAt" = NOW()
      WHERE id = ${employer.id}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[POST /api/employer/auth/reset-password]', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}

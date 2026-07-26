import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);
const JWT_SECRET = new TextEncoder().encode(
  process.env.USER_JWT_SECRET || 'user-secret-change-in-production'
);

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('user-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const verified = await jwtVerify(token, JWT_SECRET);
    const userId = (verified.payload as any).userId;
    const email = (verified.payload as any).email;

    const { currentPassword, newPassword } = await request.json();
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
    }

    // Get current user
    const users = await sql`
      SELECT "passwordHash" FROM "WebUser" WHERE id = ${userId} LIMIT 1
    `;
    if (users.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const user = users[0];

    // If user has a password, verify current password
    if (user.passwordHash) {
      if (!currentPassword) return NextResponse.json({ error: 'Current password required' }, { status: 400 });
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // Hash and update
    const newHash = await bcrypt.hash(newPassword, 12);

    await sql`UPDATE "WebUser" SET "passwordHash" = ${newHash} WHERE id = ${userId}`;

    // Sync to UnifiedUser and FounderUser if they exist
    if (email) {
      await sql`UPDATE "UnifiedUser" SET "passwordHash" = ${newHash} WHERE email = ${email.toLowerCase()}`;
      await sql`UPDATE "FounderUser" SET "passwordHash" = ${newHash} WHERE email = ${email.toLowerCase()}`;
    }

    return NextResponse.json({ success: true, message: 'Password updated' });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

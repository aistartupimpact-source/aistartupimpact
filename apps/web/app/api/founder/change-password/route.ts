import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireFounderAuth, verifyPassword, hashPassword } from '@/lib/founder-auth';
import { changePasswordSchema, validateInput } from '@/lib/validation';

export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  try {
    const session = await requireFounderAuth();

    const body = await request.json();
    const validation = validateInput(changePasswordSchema, body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }
    const { currentPassword, newPassword } = validation.data;

    // Get user's current password hash using raw SQL (same as login)
    const users = await sql`
      SELECT id, email, "passwordHash", "authProvider"
      FROM "FounderUser"
      WHERE id = ${session.userId}
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];

    if (!user.passwordHash) {
      return NextResponse.json(
        { success: false, error: 'User is using OAuth login' },
        { status: 400 }
      );
    }

    const isValidPassword = await verifyPassword(currentPassword, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password using the same function as signup
    const newPasswordHash = await hashPassword(newPassword);

    // Update password using raw SQL
    await sql`
      UPDATE "FounderUser"
      SET "passwordHash" = ${newPasswordHash}, "updatedAt" = NOW()
      WHERE id = ${session.userId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error changing password:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to change password' },
      { status: 500 }
    );
  }
}

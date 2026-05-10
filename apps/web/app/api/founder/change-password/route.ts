import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { requireFounderAuth, verifyPassword, hashPassword } from '@/lib/founder-auth';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const session = await requireFounderAuth();

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    console.log('🔐 Change password request for user:', session.userId);

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

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

    console.log('👤 User found:', {
      email: user.email,
      hasPasswordHash: !!user.passwordHash,
      authProvider: user.authProvider,
      hashPrefix: user.passwordHash?.substring(0, 10)
    });

    if (!user.passwordHash) {
      return NextResponse.json(
        { success: false, error: 'User is using OAuth login' },
        { status: 400 }
      );
    }

    // Verify current password using the same function as login
    console.log('🔍 Comparing password...');
    console.log('   Password length:', currentPassword.length);
    console.log('   Password (first 3 chars):', currentPassword.substring(0, 3));
    console.log('   Hash (first 20 chars):', user.passwordHash.substring(0, 20));
    
    const isValidPassword = await verifyPassword(currentPassword, user.passwordHash);
    console.log('✅ Password comparison result:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ Password verification failed');
      console.log('   Tip: Check for whitespace or special characters');
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

    console.log('✅ Password updated successfully');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error changing password:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to change password' },
      { status: 500 }
    );
  }
}

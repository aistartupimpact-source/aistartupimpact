import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { requireFounderAuth } from '@/lib/founder-auth';
import { verifyTOTPToken, decryptSecret } from '@/lib/two-factor';

const sql = neon(process.env.DATABASE_URL!);

/**
 * POST /api/founder/2fa-disable
 * Disable 2FA (requires current 2FA code for security)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireFounderAuth();
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification code is required' },
        { status: 400 }
      );
    }

    // Get user
    const users = await sql`
      SELECT id, email, "twoFactorEnabled", "twoFactorSecret"
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

    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { success: false, error: '2FA is not enabled' },
        { status: 400 }
      );
    }

    if (!user.twoFactorSecret) {
      return NextResponse.json(
        { success: false, error: '2FA secret not found' },
        { status: 400 }
      );
    }

    // Decrypt and verify token
    const secret = decryptSecret(user.twoFactorSecret);
    const isValid = verifyTOTPToken(token, secret);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Disable 2FA and clear secret/backup codes
    await sql`
      UPDATE "FounderUser"
      SET 
        "twoFactorEnabled" = false,
        "twoFactorSecret" = NULL,
        "twoFactorBackupCodes" = NULL,
        "updatedAt" = NOW()
      WHERE id = ${session.userId}
    `;

    return NextResponse.json({
      success: true,
      message: '2FA disabled successfully',
    });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to disable 2FA' },
      { status: 500 }
    );
  }
}

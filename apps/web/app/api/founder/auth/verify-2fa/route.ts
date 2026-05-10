import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { setFounderSession } from '@/lib/founder-auth';
import { verifyTOTPToken, decryptSecret, verifyBackupCode } from '@/lib/two-factor';

const sql = neon(process.env.DATABASE_URL!);

/**
 * POST /api/founder/auth/verify-2fa
 * Verify 2FA code during login
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, token, isBackupCode } = body;

    if (!userId || !token) {
      return NextResponse.json(
        { error: 'User ID and token are required' },
        { status: 400 }
      );
    }

    // Get user
    const users = await sql`
      SELECT id, email, name, company, "twoFactorEnabled", "twoFactorSecret", "twoFactorBackupCodes"
      FROM "FounderUser"
      WHERE id = ${userId}
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];

    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is not enabled for this account' },
        { status: 400 }
      );
    }

    let isValid = false;

    // Check if using backup code
    if (isBackupCode) {
      if (!user.twoFactorBackupCodes || user.twoFactorBackupCodes.length === 0) {
        return NextResponse.json(
          { error: 'No backup codes available' },
          { status: 400 }
        );
      }

      // Verify backup code
      const codeIndex = await verifyBackupCode(token, user.twoFactorBackupCodes);
      
      if (codeIndex >= 0) {
        isValid = true;
        
        // Remove used backup code
        const updatedCodes = [...user.twoFactorBackupCodes];
        updatedCodes.splice(codeIndex, 1);
        
        await sql`
          UPDATE "FounderUser"
          SET "twoFactorBackupCodes" = ${updatedCodes}, "updatedAt" = NOW()
          WHERE id = ${userId}
        `;
      }
    } else {
      // Verify TOTP token
      if (!user.twoFactorSecret) {
        return NextResponse.json(
          { error: '2FA secret not found' },
          { status: 400 }
        );
      }

      const secret = decryptSecret(user.twoFactorSecret);
      isValid = verifyTOTPToken(token, secret);
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Update last login
    await sql`
      UPDATE "FounderUser"
      SET "lastLoginAt" = NOW(), "updatedAt" = NOW()
      WHERE id = ${userId}
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
      },
    });
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    return NextResponse.json(
      { error: 'Failed to verify 2FA code' },
      { status: 500 }
    );
  }
}

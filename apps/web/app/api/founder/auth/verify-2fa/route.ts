import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { sql } from '@/lib/db';
import { setFounderSession } from '@/lib/founder-auth';
import { verifyTOTPToken, decryptSecret, verifyBackupCode } from '@/lib/two-factor';

export const dynamic = 'force-dynamic';

const CHALLENGE_SECRET = new TextEncoder().encode(process.env.FOUNDER_JWT_SECRET!);

/**
 * POST /api/founder/auth/verify-2fa
 * Verify 2FA code during login
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { challengeToken, userId: legacyUserId, token, isBackupCode } = body;

    if ((!challengeToken && !legacyUserId) || !token) {
      return NextResponse.json(
        { error: 'Challenge token and verification code are required' },
        { status: 400 }
      );
    }

    let userId: string;

    if (challengeToken) {
      try {
        const { payload } = await jwtVerify(challengeToken, CHALLENGE_SECRET);
        if (payload.purpose !== '2fa-challenge') {
          return NextResponse.json({ error: 'Invalid challenge token' }, { status: 400 });
        }
        userId = payload.userId as string;
      } catch {
        return NextResponse.json({ error: 'Challenge expired. Please log in again.' }, { status: 401 });
      }
    } else {
      userId = legacyUserId;
    }

    const users = await sql`
      SELECT id, email, name, company, "twoFactorEnabled", "twoFactorSecret", "twoFactorBackupCodes", "onboardingCompleted"
      FROM "FounderUser"
      WHERE id = ${userId}
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid challenge' },
        { status: 400 }
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

    if (isBackupCode) {
      if (!user.twoFactorBackupCodes || user.twoFactorBackupCodes.length === 0) {
        return NextResponse.json(
          { error: 'No backup codes available' },
          { status: 400 }
        );
      }

      const codeIndex = await verifyBackupCode(token, user.twoFactorBackupCodes);

      if (codeIndex >= 0) {
        isValid = true;

        const updatedCodes = [...user.twoFactorBackupCodes];
        updatedCodes.splice(codeIndex, 1);

        await sql`
          UPDATE "FounderUser"
          SET "twoFactorBackupCodes" = ${updatedCodes}, "updatedAt" = NOW()
          WHERE id = ${userId}
        `;
      }
    } else {
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

    await sql`
      UPDATE "FounderUser"
      SET "lastLoginAt" = NOW(), "updatedAt" = NOW()
      WHERE id = ${userId}
    `;

    await setFounderSession(user.id, user.email, user.name, !!user.onboardingCompleted);

    return NextResponse.json({
      success: true,
      user: {
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

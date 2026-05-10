import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { requireFounderAuth } from '@/lib/founder-auth';
import {
  generateTOTPSecret,
  generateQRCode,
  generateBackupCodes,
  hashBackupCodes,
  encryptSecret,
  verifyTOTPToken,
} from '@/lib/two-factor';

const sql = neon(process.env.DATABASE_URL!);

/**
 * POST /api/founder/2fa-setup
 * Step 1: Generate secret and QR code
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireFounderAuth();
    const body = await request.json();
    const { action, token } = body;

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

    // Action: generate (Step 1 - Generate QR code)
    if (action === 'generate') {
      // Generate TOTP secret
      const { secret, otpauthUrl } = generateTOTPSecret(user.email);

      // Generate QR code
      const qrCodeDataUrl = await generateQRCode(otpauthUrl);

      // Store secret temporarily (not enabled yet)
      const encryptedSecret = encryptSecret(secret);
      
      await sql`
        UPDATE "FounderUser"
        SET "twoFactorSecret" = ${encryptedSecret}, "updatedAt" = NOW()
        WHERE id = ${session.userId}
      `;

      return NextResponse.json({
        success: true,
        qrCode: qrCodeDataUrl,
        secret: secret, // Show to user for manual entry
      });
    }

    // Action: verify (Step 2 - Verify token and enable 2FA)
    if (action === 'verify') {
      if (!token) {
        return NextResponse.json(
          { success: false, error: 'Token is required' },
          { status: 400 }
        );
      }

      if (!user.twoFactorSecret) {
        return NextResponse.json(
          { success: false, error: 'No 2FA setup in progress' },
          { status: 400 }
        );
      }

      // Decrypt secret
      const { decryptSecret } = await import('@/lib/two-factor');
      const secret = decryptSecret(user.twoFactorSecret);

      // Verify token
      const isValid = verifyTOTPToken(token, secret);

      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid verification code' },
          { status: 400 }
        );
      }

      // Generate backup codes
      const backupCodes = generateBackupCodes(10);
      const hashedBackupCodes = await hashBackupCodes(backupCodes);

      // Enable 2FA
      await sql`
        UPDATE "FounderUser"
        SET 
          "twoFactorEnabled" = true,
          "twoFactorBackupCodes" = ${hashedBackupCodes},
          "updatedAt" = NOW()
        WHERE id = ${session.userId}
      `;

      return NextResponse.json({
        success: true,
        backupCodes: backupCodes, // Return once, user must save them
        message: '2FA enabled successfully',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in 2FA setup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to setup 2FA' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';
import { getOrganizerSession } from '@/lib/organizer-auth';
import {
  generateTOTPSecret, generateQRCode, generateBackupCodes,
  hashBackupCodes, encryptSecret, verifyTOTPToken, decryptSecret,
} from '@/lib/two-factor';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getOrganizerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { action, token } = await request.json();

    const organizer = await prisma.eventOrganizer.findUnique({
      where: { id: session.id },
      select: { id: true, email: true, twoFactorEnabled: true, twoFactorSecret: true },
    });

    if (!organizer) {
      return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });
    }

    if (action === 'generate') {
      const { secret, otpauthUrl } = generateTOTPSecret(organizer.email);
      const qrCodeDataUrl = await generateQRCode(otpauthUrl);
      const encryptedSecret = encryptSecret(secret);

      await prisma.eventOrganizer.update({
        where: { id: organizer.id },
        data: { twoFactorSecret: encryptedSecret },
      });

      return NextResponse.json({ success: true, qrCode: qrCodeDataUrl, secret });
    }

    if (action === 'verify') {
      if (!token || token.length !== 6) {
        return NextResponse.json({ success: false, error: 'Enter a 6-digit code' }, { status: 400 });
      }
      if (!organizer.twoFactorSecret) {
        return NextResponse.json({ success: false, error: 'No 2FA setup in progress' }, { status: 400 });
      }

      const secret = decryptSecret(organizer.twoFactorSecret);
      if (!verifyTOTPToken(token, secret)) {
        return NextResponse.json({ success: false, error: 'Invalid verification code' }, { status: 400 });
      }

      const backupCodes = generateBackupCodes(10);
      const hashedBackupCodes = await hashBackupCodes(backupCodes);

      await prisma.eventOrganizer.update({
        where: { id: organizer.id },
        data: { twoFactorEnabled: true, twoFactorBackupCodes: hashedBackupCodes },
      });

      return NextResponse.json({ success: true, backupCodes, message: '2FA enabled successfully' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Organizer 2FA setup error:', error);
    return NextResponse.json({ success: false, error: 'Failed to setup 2FA' }, { status: 500 });
  }
}

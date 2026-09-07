import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';
import { getOrganizerSession } from '@/lib/organizer-auth';
import { verifyTOTPToken, decryptSecret } from '@/lib/two-factor';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getOrganizerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ success: false, error: 'Verification code is required' }, { status: 400 });
    }

    const organizer = await prisma.eventOrganizer.findUnique({
      where: { id: session.id },
      select: { twoFactorEnabled: true, twoFactorSecret: true },
    });

    if (!organizer || !organizer.twoFactorEnabled || !organizer.twoFactorSecret) {
      return NextResponse.json({ success: false, error: '2FA is not enabled' }, { status: 400 });
    }

    const secret = decryptSecret(organizer.twoFactorSecret);
    if (!verifyTOTPToken(token, secret)) {
      return NextResponse.json({ success: false, error: 'Invalid verification code' }, { status: 400 });
    }

    await prisma.eventOrganizer.update({
      where: { id: session.id },
      data: { twoFactorEnabled: false, twoFactorSecret: null, twoFactorBackupCodes: [] },
    });

    return NextResponse.json({ success: true, message: '2FA disabled successfully' });
  } catch (error) {
    console.error('Organizer 2FA disable error:', error);
    return NextResponse.json({ success: false, error: 'Failed to disable 2FA' }, { status: 500 });
  }
}

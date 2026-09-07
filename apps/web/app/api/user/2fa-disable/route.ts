import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';
import { getUserSession } from '@/lib/user-session';
import { verifyTOTPToken, decryptSecret } from '@/lib/two-factor';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ success: false, error: 'Verification code is required' }, { status: 400 });
    }

    const user = await prisma.webUser.findUnique({
      where: { id: session.id },
      select: { twoFactorEnabled: true, twoFactorSecret: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ success: false, error: '2FA is not enabled' }, { status: 400 });
    }

    const secret = decryptSecret(user.twoFactorSecret);
    if (!verifyTOTPToken(token, secret)) {
      return NextResponse.json({ success: false, error: 'Invalid verification code' }, { status: 400 });
    }

    await prisma.webUser.update({
      where: { id: session.id },
      data: { twoFactorEnabled: false, twoFactorSecret: null, twoFactorBackupCodes: [] },
    });

    return NextResponse.json({ success: true, message: '2FA disabled successfully' });
  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json({ success: false, error: 'Failed to disable 2FA' }, { status: 500 });
  }
}

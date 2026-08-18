import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';
import { getUserSession } from '@/lib/user-session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const user = await prisma.webUser.findUnique({
      where: { id: session.id },
      select: { twoFactorEnabled: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, enabled: user.twoFactorEnabled });
  } catch (error) {
    console.error('2FA status error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch 2FA status' }, { status: 500 });
  }
}

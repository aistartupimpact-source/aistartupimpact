import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';
import { getOrganizerSession } from '@/lib/organizer-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getOrganizerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const organizer = await prisma.eventOrganizer.findUnique({
      where: { id: session.id },
      select: { twoFactorEnabled: true },
    });

    if (!organizer) {
      return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, enabled: organizer.twoFactorEnabled });
  } catch (error) {
    console.error('Organizer 2FA status error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch 2FA status' }, { status: 500 });
  }
}

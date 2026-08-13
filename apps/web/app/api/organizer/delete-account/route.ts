import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';
import { getOrganizerSession, destroyOrganizerSession, verifyPassword } from '@/lib/organizer-auth';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getOrganizerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { password } = body as { password?: string };
    if (!password) {
      return NextResponse.json({ success: false, error: 'Password is required to delete your account' }, { status: 400 });
    }

    const organizer = await prisma.eventOrganizer.findUnique({
      where: { id: session.id },
      select: { id: true, email: true, passwordHash: true },
    });

    if (!organizer) {
      return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });
    }

    if (organizer.passwordHash) {
      const valid = await verifyPassword(password, organizer.passwordHash);
      if (!valid) {
        return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.newsletterSubscriber.updateMany({
        where: { email: organizer.email },
        data: { isActive: false, unsubscribedAt: new Date() },
      });

      await tx.eventOrganizerSession.deleteMany({
        where: { organizerId: organizer.id },
      });

      await tx.eventOrganizer.delete({ where: { id: organizer.id } });
    });

    await destroyOrganizerSession();

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting organizer account:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete account' }, { status: 500 });
  }
}

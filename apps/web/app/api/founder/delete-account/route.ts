import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';
import bcrypt from 'bcryptjs';
import { requireFounderAuth } from '@/lib/founder-auth';
import { clearFounderSession } from '@/lib/founder-auth';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireFounderAuth();

    const body = await request.json().catch(() => ({}));
    const { password } = body as { password?: string };
    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required to delete your account' },
        { status: 400 }
      );
    }

    // Verify user exists and check password
    const user = await prisma.founderUser.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, passwordHash: true },
    });

    if (user?.passwordHash) {
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return NextResponse.json(
          { success: false, error: 'Incorrect password' },
          { status: 401 }
        );
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete all related data using Prisma transactions
    // Prisma will handle cascade deletes based on schema relations
    await prisma.$transaction(async (tx) => {
      await tx.newsletterSubscriber.updateMany({
        where: { email: user.email },
        data: { isActive: false, unsubscribedAt: new Date() },
      });

      await tx.founderAnalytics.deleteMany({
        where: { userId: session.userId },
      });

      // Delete founder's notifications
      await tx.founderNotification.deleteMany({
        where: { userId: session.userId },
      });

      // Delete founder's sessions
      await tx.founderSession.deleteMany({
        where: { userId: session.userId },
      });

      // Delete verification logs
      await tx.startupVerificationLog.deleteMany({
        where: { userId: session.userId },
      });

      // Delete startups (this will cascade to funding rounds, jobs, etc.)
      await tx.startup.deleteMany({
        where: { ownerId: session.userId },
      });

      // Delete tools (this will cascade to reviews, pros, cons, etc.)
      await tx.aiTool.deleteMany({
        where: { ownerId: session.userId },
      });

      // Finally, delete the founder user account
      await tx.founderUser.delete({
        where: { id: session.userId },
      });
    });

    // Clear the session cookie
    await clearFounderSession();

    return NextResponse.json({ 
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}

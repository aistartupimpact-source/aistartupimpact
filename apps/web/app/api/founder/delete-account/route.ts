import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';
import { requireFounderAuth } from '@/lib/founder-auth';
import { clearFounderSession } from '@/lib/founder-auth';

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireFounderAuth();

    // Verify user exists
    const user = await prisma.founderUser.findUnique({
      where: { id: session.userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete all related data using Prisma transactions
    // Prisma will handle cascade deletes based on schema relations
    await prisma.$transaction(async (tx) => {
      // Delete founder's analytics
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

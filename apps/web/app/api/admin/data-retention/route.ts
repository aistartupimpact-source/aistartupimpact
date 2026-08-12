import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const results: Record<string, number> = {};

    // Email logs older than 90 days
    const emailLogCutoff = new Date(now);
    emailLogCutoff.setDate(emailLogCutoff.getDate() - 90);
    const emailLogs = await prisma.emailLog.deleteMany({
      where: { sentAt: { lt: emailLogCutoff } },
    });
    results.emailLogsDeleted = emailLogs.count;

    // Soft-deleted event registrations older than 30 days
    const softDeleteCutoff = new Date(now);
    softDeleteCutoff.setDate(softDeleteCutoff.getDate() - 30);
    const softDeletedRegs = await prisma.eventRegistration.findMany({
      where: { deletedAt: { lt: softDeleteCutoff } },
      select: { id: true },
    });
    if (softDeletedRegs.length > 0) {
      const regIds = softDeletedRegs.map(r => r.id);
      await prisma.eventRegistrationAnswer.deleteMany({
        where: { registrationId: { in: regIds } },
      });
      const deleted = await prisma.eventRegistration.deleteMany({
        where: { id: { in: regIds } },
      });
      results.softDeletedRegistrationsHardDeleted = deleted.count;
    }

    // Expired founder sessions older than 30 days
    const sessionCutoff = new Date(now);
    sessionCutoff.setDate(sessionCutoff.getDate() - 30);
    const sessions = await prisma.founderSession.deleteMany({
      where: { expiresAt: { lt: sessionCutoff } },
    });
    results.expiredSessionsDeleted = sessions.count;

    // Unsubscribe records older than 1 year (keep audit trail for 12 months)
    const unsubCutoff = new Date(now);
    unsubCutoff.setFullYear(unsubCutoff.getFullYear() - 1);
    const unsubs = await prisma.newsletterUnsubscribe.deleteMany({
      where: { unsubscribedAt: { lt: unsubCutoff } },
    });
    results.oldUnsubscribeRecordsDeleted = unsubs.count;

    // Unverified newsletter subscribers older than 7 days (never confirmed)
    const unverifiedCutoff = new Date(now);
    unverifiedCutoff.setDate(unverifiedCutoff.getDate() - 7);
    const unverified = await prisma.newsletterSubscriber.deleteMany({
      where: {
        emailVerified: false,
        isActive: false,
        subscribedAt: { lt: unverifiedCutoff },
      },
    });
    results.unverifiedSubscribersDeleted = unverified.count;

    return NextResponse.json({
      success: true,
      message: 'Data retention cleanup completed',
      results,
      executedAt: now.toISOString(),
    });
  } catch (error) {
    console.error('Data retention cleanup error:', error);
    return NextResponse.json(
      { success: false, error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}

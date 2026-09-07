import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';
import { requireFounderAuth } from '@/lib/founder-auth';
import { checkRateLimit, getClientIdentifier, strictRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const identifier = getClientIdentifier(request);
    const { success } = await checkRateLimit(strictRateLimit, identifier);
    if (!success) return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });

    const session = await requireFounderAuth();

    const user = await prisma.founderUser.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        company: true,
        role: true,
        bio: true,
        avatar: true,
        linkedin: true,
        twitter: true,
        website: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const [startups, tools, analytics, notifications, newsletterSubscription, emailLogs] = await Promise.all([
      prisma.startup.findMany({
        where: { ownerId: session.userId },
        select: {
          id: true, name: true, slug: true, tagline: true, description: true,
          websiteUrl: true, stage: true, foundedYear: true,
          headquartersCity: true, employeeCount: true,
          createdAt: true, updatedAt: true,
        },
      }),
      prisma.aiTool.findMany({
        where: { ownerId: session.userId },
        select: {
          id: true, name: true, slug: true, tagline: true, description: true,
          pricingModel: true, status: true, listingTier: true,
          createdAt: true, updatedAt: true,
        },
      }),
      prisma.founderAnalytics.findMany({
        where: { userId: session.userId },
        select: {
          id: true, entityType: true, entityId: true, date: true,
          views: true, clicks: true, inquiries: true,
        },
        orderBy: { date: 'desc' },
        take: 500,
      }),
      prisma.founderNotification.findMany({
        where: { userId: session.userId },
        select: {
          id: true, type: true, title: true, message: true,
          read: true, createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
      prisma.newsletterSubscriber.findUnique({
        where: { email: user.email },
        select: {
          email: true, isActive: true, emailVerified: true,
          subscribedAt: true, unsubscribedAt: true, source: true, tags: true,
        },
      }),
      prisma.emailLog.findMany({
        where: { to: user.email },
        select: { type: true, subject: true, status: true, sentAt: true },
        orderBy: { sentAt: 'desc' },
        take: 200,
      }),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      profile: user,
      startups,
      tools,
      analytics,
      notifications,
      newsletterSubscription,
      emailsReceived: emailLogs,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="aistartupimpact-data-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

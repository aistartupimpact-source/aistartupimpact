"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@aistartupimpact/database";

const ALLOWED = ["SUPER_ADMIN", "EDITOR_IN_CHIEF", "AD_MANAGER"];

export async function getAnalyticsDataAction(period: string = '7 days') {
  const session: any = await getServerSession(authOptions);
  console.log('Analytics session check:', { 
    hasSession: !!session, 
    hasUser: !!session?.user, 
    email: session?.user?.email,
    role: session?.user?.role 
  });
  
  if (!session?.user || !ALLOWED.includes(session.user.role)) {
    console.log('Analytics access denied:', { user: session?.user, role: session?.user?.role, allowed: ALLOWED });
    return { success: false, error: `Unauthorized - Role: ${session?.user?.role || 'none'}` };
  }

  try {
    // Calculate date range based on period
    let daysBack = 7;
    switch (period) {
      case '30 days': daysBack = 30; break;
      case '90 days': daysBack = 90; break;
      case 'This year': daysBack = 365; break;
    }

    const [
      articleStats,
      topArticles,
      placementStats,
      subscriberStats,
      userStats,
    ] = await Promise.all([
      // Article view counts and metrics
      prisma.$queryRawUnsafe(`
        SELECT 
          COALESCE(SUM("viewCount"), 0) as total_views,
          COUNT(*) as total_articles,
          AVG("readTimeMinutes") as avg_read_time
        FROM "Article" 
        WHERE "publishedAt" >= NOW() - INTERVAL '${daysBack} days'
          AND status = 'PUBLISHED' 
          AND "deletedAt" IS NULL
      `),
      
      // Top performing articles
      prisma.$queryRawUnsafe(`
        SELECT 
          a.title, a.slug, a."viewCount", a.type,
          u.name as author_name,
          c.name as category_name
        FROM "Article" a
        LEFT JOIN "User" u ON u.id = a."authorId"
        LEFT JOIN "Category" c ON c.id = a."categoryId"
        WHERE a."publishedAt" >= NOW() - INTERVAL '${daysBack} days'
          AND a.status = 'PUBLISHED' 
          AND a."deletedAt" IS NULL
        ORDER BY a."viewCount" DESC
        LIMIT 10
      `),
      
      // Placement performance
      prisma.$queryRaw<any[]>`
        SELECT 
          COALESCE(SUM(cr."impressionCount"), 0) as total_impressions,
          COALESCE(SUM(cr."clickCount"), 0) as total_clicks,
          COUNT(DISTINCT c.id) as active_campaigns
        FROM "AdCampaign" c
        JOIN "AdCreative" cr ON cr."campaignId" = c.id
        WHERE c.status = 'ACTIVE'
          AND c."startDate" <= NOW()
          AND c."endDate" >= NOW()
      `,
      
      // Newsletter subscriber growth
      prisma.$queryRawUnsafe(`
        SELECT 
          COUNT(*) as total_subscribers,
          COUNT(*) FILTER (WHERE "subscribedAt" >= NOW() - INTERVAL '${daysBack} days') as new_subscribers
        FROM "NewsletterSubscriber"
        WHERE "isActive" = true
      `),
      
      // User activity
      prisma.$queryRawUnsafe(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(*) FILTER (WHERE "lastLoginAt" >= NOW() - INTERVAL '${daysBack} days') as active_users
        FROM "User"
        WHERE "isActive" = true
      `),
    ]);

    const stats = (articleStats as any[])[0] || {};
    const placements = (placementStats as any[])[0] || {};
    const subscribers = (subscriberStats as any[])[0] || {};
    const users = (userStats as any[])[0] || {};

    // Calculate CTR
    const totalImpressions = Number(placements.total_impressions || 0);
    const totalClicks = Number(placements.total_clicks || 0);
    const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

    // Mock some additional metrics that would come from analytics service
    const mockMetrics = {
      uniqueVisitors: Math.floor(Number(stats.total_views || 0) * 0.65),
      avgSession: '4m 12s',
      bounceRate: '38%',
      // Traffic sources (would come from analytics service)
      referrers: [
        { source: 'Google Search', visits: Math.floor(Number(stats.total_views || 0) * 0.45), pct: 45 },
        { source: 'Twitter / X', visits: Math.floor(Number(stats.total_views || 0) * 0.20), pct: 20 },
        { source: 'LinkedIn', visits: Math.floor(Number(stats.total_views || 0) * 0.16), pct: 16 },
        { source: 'Direct', visits: Math.floor(Number(stats.total_views || 0) * 0.12), pct: 12 },
        { source: 'Newsletter', visits: Math.floor(Number(stats.total_views || 0) * 0.07), pct: 7 },
      ],
      devices: [
        { type: 'Desktop', pct: 58 },
        { type: 'Mobile', pct: 38 },
        { type: 'Other', pct: 4 },
      ],
    };

    return {
      success: true,
      data: {
        metrics: {
          pageviews: Number(stats.total_views || 0),
          uniqueVisitors: mockMetrics.uniqueVisitors,
          avgSession: mockMetrics.avgSession,
          bounceRate: mockMetrics.bounceRate,
          totalArticles: Number(stats.total_articles || 0),
          avgReadTime: Number(stats.avg_read_time || 0).toFixed(1),
          totalImpressions,
          totalClicks,
          ctr: ctr + '%',
          activeCampaigns: Number(placements.active_campaigns || 0),
          totalSubscribers: Number(subscribers.total_subscribers || 0),
          newSubscribers: Number(subscribers.new_subscribers || 0),
          totalUsers: Number(users.total_users || 0),
          activeUsers: Number(users.active_users || 0),
        },
        topArticles: (topArticles as any[]).map((a: any) => ({
          title: a.title,
          slug: a.slug,
          views: Number(a.viewCount || 0),
          type: a.type,
          author: a.author_name,
          category: a.category_name,
        })),
        referrers: mockMetrics.referrers,
        devices: mockMetrics.devices,
      },
    };
  } catch (e: any) {
    console.error('Analytics query error:', e);
    return { success: false, error: e.message };
  }
}
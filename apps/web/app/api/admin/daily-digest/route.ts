import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_DIGEST_EMAIL || 'admin@aistartupimpact.com';
const FROM_EMAIL = process.env.RESEND_NEWSLETTER_EMAIL || 'newsletter-noreply@aistartupimpact.com';

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sets this automatically for cron jobs)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Calculate yesterday's date range
    const now = new Date();
    const yesterdayStart = new Date(now);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0);

    const yesterdayEnd = new Date(now);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const dayBeforeStart = new Date(yesterdayStart);
    dayBeforeStart.setDate(dayBeforeStart.getDate() - 1);

    // Run all queries in parallel
    const [
      pageViews,
      pageViewsPrev,
      uniqueVisitors,
      topPages,
      newSubscribers,
      totalSubscribers,
      newWebUsers,
      totalWebUsers,
      newFounders,
      totalFounders,
      toolClicks,
      topToolClicks,
      clickSources,
      articlesPublished,
      articleViews,
    ] = await Promise.all([
      // Page views yesterday
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM "PageView"
        WHERE "createdAt" >= ${yesterdayStart} AND "createdAt" <= ${yesterdayEnd}
      `,
      // Page views day before (for comparison)
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM "PageView"
        WHERE "createdAt" >= ${dayBeforeStart} AND "createdAt" < ${yesterdayStart}
      `,
      // Unique visitors yesterday
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(DISTINCT "sessionHash") as count FROM "PageView"
        WHERE "createdAt" >= ${yesterdayStart} AND "createdAt" <= ${yesterdayEnd}
      `,
      // Top pages yesterday
      prisma.$queryRaw<Array<{ pathname: string; count: bigint }>>`
        SELECT pathname, COUNT(*) as count FROM "PageView"
        WHERE "createdAt" >= ${yesterdayStart} AND "createdAt" <= ${yesterdayEnd}
        GROUP BY pathname ORDER BY count DESC LIMIT 5
      `,
      // New newsletter subscribers yesterday
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM "NewsletterSubscriber"
        WHERE "subscribedAt" >= ${yesterdayStart} AND "subscribedAt" <= ${yesterdayEnd}
      `,
      // Total subscribers
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM "NewsletterSubscriber" WHERE "isActive" = true
      `,
      // New web users yesterday
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM "User"
        WHERE "createdAt" >= ${yesterdayStart} AND "createdAt" <= ${yesterdayEnd}
      `,
      // Total web users
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM "User"
      `,
      // New founder signups yesterday
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM "FounderUser"
        WHERE "createdAt" >= ${yesterdayStart} AND "createdAt" <= ${yesterdayEnd}
      `,
      // Total founders
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM "FounderUser"
      `,
      // Tool clicks yesterday
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM "AffiliateClick"
        WHERE "createdAt" >= ${yesterdayStart} AND "createdAt" <= ${yesterdayEnd}
      `,
      // Top tool clicks
      prisma.$queryRaw<Array<{ name: string; count: bigint }>>`
        SELECT t.name, COUNT(*) as count
        FROM "AffiliateClick" ac
        JOIN "AiTool" t ON t.id = ac."toolId"
        WHERE ac."createdAt" >= ${yesterdayStart} AND ac."createdAt" <= ${yesterdayEnd}
        GROUP BY t.name ORDER BY count DESC LIMIT 3
      `,
      // Click sources
      prisma.$queryRaw<Array<{ sourcePage: string; count: bigint }>>`
        SELECT "sourcePage", COUNT(*) as count
        FROM "AffiliateClick"
        WHERE "createdAt" >= ${yesterdayStart} AND "createdAt" <= ${yesterdayEnd}
        GROUP BY "sourcePage" ORDER BY count DESC
      `,
      // Articles published yesterday
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM "Article"
        WHERE "publishedAt" >= ${yesterdayStart} AND "publishedAt" <= ${yesterdayEnd}
        AND status = 'PUBLISHED'
      `,
      // Article views yesterday
      prisma.$queryRaw<[{ total: bigint }]>`
        SELECT COALESCE(SUM("viewCount"), 0) as total FROM "Article"
        WHERE "publishedAt" >= ${yesterdayStart} AND "publishedAt" <= ${yesterdayEnd}
        AND status = 'PUBLISHED'
      `,
    ]);

    // Extract values
    const pvCount = Number(pageViews[0]?.count || 0);
    const pvPrev = Number(pageViewsPrev[0]?.count || 0);
    const pvChange = pvPrev > 0 ? Math.round(((pvCount - pvPrev) / pvPrev) * 100) : 0;
    const uvCount = Number(uniqueVisitors[0]?.count || 0);
    const subNew = Number(newSubscribers[0]?.count || 0);
    const subTotal = Number(totalSubscribers[0]?.count || 0);
    const usersNew = Number(newWebUsers[0]?.count || 0);
    const usersTotal = Number(totalWebUsers[0]?.count || 0);
    const foundersNew = Number(newFounders[0]?.count || 0);
    const foundersTotal = Number(totalFounders[0]?.count || 0);
    const clicksTotal = Number(toolClicks[0]?.count || 0);
    const pubCount = Number(articlesPublished[0]?.count || 0);
    const viewsTotal = Number(articleViews[0]?.total || 0);

    // Format date
    const dateStr = yesterdayStart.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // Build email HTML
    const html = buildDigestEmail({
      date: dateStr,
      pageViews: pvCount,
      pageViewsChange: pvChange,
      uniqueVisitors: uvCount,
      topPages: topPages.map(p => ({ path: p.pathname, views: Number(p.count) })),
      newSubscribers: subNew,
      totalSubscribers: subTotal,
      newWebUsers: usersNew,
      totalWebUsers: usersTotal,
      newFounders: foundersNew,
      totalFounders: foundersTotal,
      toolClicks: clicksTotal,
      topTools: topToolClicks.map(t => ({ name: t.name, clicks: Number(t.count) })),
      clickSources: clickSources.map(s => ({ source: s.sourcePage, count: Number(s.count) })),
      articlesPublished: pubCount,
      articleViews: viewsTotal,
    });

    // Send email
    await resend.emails.send({
      from: `AI Startup Impact <${FROM_EMAIL}>`,
      to: [ADMIN_EMAIL],
      subject: `Daily Digest — ${yesterdayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      html,
    });

    return NextResponse.json({ success: true, date: dateStr });
  } catch (error: any) {
    console.error('[daily-digest] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ─── Email Template ───────────────────────────────────────────────────────────

interface DigestData {
  date: string;
  pageViews: number;
  pageViewsChange: number;
  uniqueVisitors: number;
  topPages: Array<{ path: string; views: number }>;
  newSubscribers: number;
  totalSubscribers: number;
  newWebUsers: number;
  totalWebUsers: number;
  newFounders: number;
  totalFounders: number;
  toolClicks: number;
  topTools: Array<{ name: string; clicks: number }>;
  clickSources: Array<{ source: string; count: number }>;
  articlesPublished: number;
  articleViews: number;
}

function buildDigestEmail(data: DigestData): string {
  const changeIcon = data.pageViewsChange >= 0 ? '&#9650;' : '&#9660;';
  const changeColor = data.pageViewsChange >= 0 ? '#16a34a' : '#dc2626';

  const topPagesHtml = data.topPages.map(p =>
    `<tr><td style="padding:4px 0;color:#475569;font-size:14px">${p.path}</td><td style="padding:4px 0;color:#0f172a;font-size:14px;font-weight:600;text-align:right">${p.views}</td></tr>`
  ).join('');

  const topToolsHtml = data.topTools.map(t =>
    `<tr><td style="padding:4px 0;color:#475569;font-size:14px">${t.name}</td><td style="padding:4px 0;color:#0f172a;font-size:14px;font-weight:600;text-align:right">${t.clicks}</td></tr>`
  ).join('');

  const sourcesHtml = data.clickSources.map(s =>
    `<span style="display:inline-block;background:#f1f5f9;padding:4px 10px;border-radius:12px;font-size:12px;font-weight:600;color:#475569;margin:2px 4px 2px 0">${s.source} (${s.count})</span>`
  ).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table role="presentation" width="100%" style="background:#f8fafc;padding:24px 0"><tr><td align="center" style="padding:0 12px">
<table role="presentation" width="600" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">

<!-- Header -->
<tr><td style="background:#0f172a;padding:24px 24px 20px">
<h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 4px">Daily Digest</h1>
<p style="color:#94a3b8;font-size:13px;margin:0">${data.date}</p>
</td></tr>

<!-- Traffic Section -->
<tr><td style="padding:24px 24px 0">
<h2 style="color:#0f172a;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #e2e8f0">Traffic</h2>
<table role="presentation" width="100%">
<tr>
<td style="padding:8px 0"><span style="color:#64748b;font-size:13px">Page Views</span></td>
<td style="text-align:right;padding:8px 0"><span style="color:#0f172a;font-size:18px;font-weight:700">${data.pageViews.toLocaleString()}</span> <span style="color:${changeColor};font-size:12px;font-weight:600">${changeIcon} ${Math.abs(data.pageViewsChange)}%</span></td>
</tr>
<tr>
<td style="padding:8px 0"><span style="color:#64748b;font-size:13px">Unique Visitors</span></td>
<td style="text-align:right;padding:8px 0"><span style="color:#0f172a;font-size:18px;font-weight:700">${data.uniqueVisitors.toLocaleString()}</span></td>
</tr>
</table>
${data.topPages.length > 0 ? `<p style="color:#64748b;font-size:12px;font-weight:600;margin:12px 0 4px">TOP PAGES</p><table role="presentation" width="100%">${topPagesHtml}</table>` : ''}
</td></tr>

<!-- Growth Section -->
<tr><td style="padding:24px 24px 0">
<h2 style="color:#0f172a;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #e2e8f0">Growth</h2>
<table role="presentation" width="100%">
<tr><td style="padding:6px 0;color:#64748b;font-size:13px">New Subscribers</td><td style="text-align:right;padding:6px 0"><span style="color:#0f172a;font-weight:700">${data.newSubscribers}</span> <span style="color:#94a3b8;font-size:12px">(Total: ${data.totalSubscribers.toLocaleString()})</span></td></tr>
<tr><td style="padding:6px 0;color:#64748b;font-size:13px">New Web Users</td><td style="text-align:right;padding:6px 0"><span style="color:#0f172a;font-weight:700">${data.newWebUsers}</span> <span style="color:#94a3b8;font-size:12px">(Total: ${data.totalWebUsers.toLocaleString()})</span></td></tr>
<tr><td style="padding:6px 0;color:#64748b;font-size:13px">New Founders</td><td style="text-align:right;padding:6px 0"><span style="color:#0f172a;font-weight:700">${data.newFounders}</span> <span style="color:#94a3b8;font-size:12px">(Total: ${data.totalFounders.toLocaleString()})</span></td></tr>
</table>
</td></tr>

<!-- Tool Clicks Section -->
<tr><td style="padding:24px 24px 0">
<h2 style="color:#0f172a;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #e2e8f0">Tool Clicks</h2>
<table role="presentation" width="100%">
<tr><td style="padding:6px 0;color:#64748b;font-size:13px">Total Clicks</td><td style="text-align:right;padding:6px 0;color:#0f172a;font-size:18px;font-weight:700">${data.toolClicks}</td></tr>
</table>
${data.topTools.length > 0 ? `<p style="color:#64748b;font-size:12px;font-weight:600;margin:12px 0 4px">TOP TOOLS</p><table role="presentation" width="100%">${topToolsHtml}</table>` : ''}
${data.clickSources.length > 0 ? `<p style="color:#64748b;font-size:12px;font-weight:600;margin:12px 0 6px">SOURCES</p><div>${sourcesHtml}</div>` : ''}
</td></tr>

<!-- Content Section -->
<tr><td style="padding:24px 24px 24px">
<h2 style="color:#0f172a;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #e2e8f0">Content</h2>
<table role="presentation" width="100%">
<tr><td style="padding:6px 0;color:#64748b;font-size:13px">Articles Published</td><td style="text-align:right;padding:6px 0;color:#0f172a;font-weight:700">${data.articlesPublished}</td></tr>
<tr><td style="padding:6px 0;color:#64748b;font-size:13px">Article Views</td><td style="text-align:right;padding:6px 0;color:#0f172a;font-weight:700">${data.articleViews.toLocaleString()}</td></tr>
</table>
</td></tr>

<!-- Footer -->
<tr><td style="padding:16px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center">
<p style="color:#94a3b8;font-size:11px;margin:0">AI Startup Impact - Daily Admin Digest</p>
<p style="color:#94a3b8;font-size:11px;margin:4px 0 0"><a href="https://aistartupimpact.com/admin/analytics" style="color:#6366f1;text-decoration:none">View Full Dashboard</a></p>
</td></tr>

</table>
</td></tr></table></body></html>`;
}

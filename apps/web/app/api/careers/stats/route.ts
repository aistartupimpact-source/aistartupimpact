import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export async function GET() {
  try {
    const [tools, startups, articles, subscribers] = await Promise.all([
      sql`SELECT COUNT(*)::int AS c FROM "AiTool" WHERE status = 'APPROVED' AND "deletedAt" IS NULL`,
      sql`SELECT COUNT(*)::int AS c FROM "Startup" WHERE "isApproved" = true AND "deletedAt" IS NULL`,
      sql`SELECT COUNT(*)::int AS c FROM "Article" WHERE status = 'PUBLISHED' AND "deletedAt" IS NULL`,
      sql`SELECT COUNT(*)::int AS c FROM "NewsletterSubscriber" WHERE "isActive" = true`,
    ]);

    return NextResponse.json({
      toolCount: tools[0]?.c || 0,
      startupCount: startups[0]?.c || 0,
      articleCount: articles[0]?.c || 0,
      subscriberCount: subscribers[0]?.c || 0,
    });
  } catch (e) {
    console.error('Career stats error:', e);
    return NextResponse.json({
      toolCount: 0,
      startupCount: 0,
      articleCount: 0,
      subscriberCount: 0,
    });
  }
}

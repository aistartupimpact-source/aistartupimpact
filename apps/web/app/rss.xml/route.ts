import { neon } from '@neondatabase/serverless';

export const revalidate = 3600;

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const articles: any[] = await sql`
      SELECT title, slug, excerpt, type, "publishedAt"
      FROM "Article"
      WHERE status = 'PUBLISHED' AND "deletedAt" IS NULL
      ORDER BY "publishedAt" DESC
      LIMIT 50
    `;

    const siteUrl = 'https://aistartupimpact.com';
    const rssItems = articles.map(a => `
      <item>
        <title><![CDATA[${a.title}]]></title>
        <link>${siteUrl}/${a.type?.toLowerCase() === 'story' ? 'stories' : 'news'}/${a.slug}</link>
        <description><![CDATA[${a.excerpt || ''}]]></description>
        <pubDate>${a.publishedAt ? new Date(a.publishedAt).toUTCString() : new Date().toUTCString()}</pubDate>
        <guid>${siteUrl}/${a.type?.toLowerCase() === 'story' ? 'stories' : 'news'}/${a.slug}</guid>
      </item>
    `).join('');

    const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>AIStartupImpact - Latest News &amp; Stories</title>
    <link>${siteUrl}</link>
    <description>India's source for AI startup news, tools, funding, and profiles.</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${rssItems}
  </channel>
</rss>`;

    return new Response(rssFeed, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('RSS Feed Error:', error);
    return new Response('Error generating feed', { status: 500 });
  }
}

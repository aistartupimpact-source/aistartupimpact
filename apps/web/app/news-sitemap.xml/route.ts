import { sql } from '@/lib/db';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toISODate(val: any): string {
  if (!val) return new Date().toISOString();
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

export const revalidate = 3600;

export async function GET() {
  try {
    // Fetch news articles published in the last 7 days (extended from 2 to ensure results)
    const articles = await sql`
      SELECT slug, title, "publishedAt"::text AS "publishedAt"
      FROM "Article"
      WHERE status = 'PUBLISHED'
        AND "deletedAt" IS NULL
        AND UPPER(type) = 'NEWS'
        AND "publishedAt" > NOW() - INTERVAL '7 days'
      ORDER BY "publishedAt" DESC
      LIMIT 1000
    `;

    // Always include the main news page as fallback
    const newsPageUrl = `  <url>
    <loc>https://aistartupimpact.com/news</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

    const articleUrls = articles.map(a => `  <url>
    <loc>https://aistartupimpact.com/news/${a.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>AI Startup Impact</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${toISODate(a.publishedAt)}</news:publication_date>
      <news:title>${escapeXml(a.title)}</news:title>
    </news:news>
  </url>`).join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${newsPageUrl}
${articleUrls}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('News sitemap error:', error);
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <url>
    <loc>https://aistartupimpact.com/news</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;
    return new Response(fallback, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}

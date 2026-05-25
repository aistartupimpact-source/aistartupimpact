import { sql } from '@/lib/db';

function toISODate(val: any): string {
  if (!val) return new Date().toISOString();
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

export const revalidate = 86400;

export async function GET() {
  try {
    const stories = await sql`
      SELECT slug, "updatedAt"::text AS "updatedAt", "publishedAt"::text AS "publishedAt", "createdAt"::text AS "createdAt"
      FROM "Article"
      WHERE status = 'PUBLISHED'
        AND "deletedAt" IS NULL
        AND UPPER(type) = 'STORY'
      ORDER BY "publishedAt" DESC
      LIMIT 1000
    `;

    // Always include the main stories page
    const storiesPageUrl = `  <url>
    <loc>https://aistartupimpact.com/stories</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;

    const storyUrls = stories.map(s => `  <url>
    <loc>https://aistartupimpact.com/stories/${s.slug}</loc>
    <lastmod>${toISODate(s.updatedAt || s.publishedAt || s.createdAt).split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${storiesPageUrl}
${storyUrls}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Stories sitemap error:', error);
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://aistartupimpact.com/stories</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
    return new Response(fallback, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}

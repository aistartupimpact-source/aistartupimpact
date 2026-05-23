import { sql } from '@/lib/db';

/**
 * Stories Sitemap Route Handler
 * Generates XML sitemap for founder stories with weekly change frequency
 */

export const revalidate = 86400; // Regenerate daily

export async function GET() {
  try {
    // Fetch published stories
    // Use UPPER() for case-insensitive comparison
    const stories = await sql`
      SELECT slug, "updatedAt", "publishedAt", "createdAt"
      FROM "Article"
      WHERE status = 'PUBLISHED' 
        AND "deletedAt" IS NULL
        AND UPPER(type) = 'STORY'
      ORDER BY "publishedAt" DESC
      LIMIT 1000
    `;

    // Generate standard sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${stories.map(s => `  <url>
    <loc>https://aistartupimpact.com/stories/${s.slug}</loc>
    <lastmod>${new Date(s.updatedAt || s.publishedAt || s.createdAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Stories sitemap generation error:', error);
    
    // Return empty but valid sitemap on error
    const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

    return new Response(emptySitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300',
      },
    });
  }
}

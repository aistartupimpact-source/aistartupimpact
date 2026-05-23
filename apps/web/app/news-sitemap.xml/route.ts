import { sql } from '@/lib/db';

/**
 * Google News Sitemap Route Handler
 * Generates XML sitemap in Google News format with news:news namespace
 * Only includes articles published in the last 2 days (Google News requirement)
 */

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const revalidate = 3600; // Regenerate every hour

export async function GET() {
  try {
    // Fetch news articles published in the last 48 hours
    // Use UPPER() for case-insensitive comparison
    const articles = await sql`
      SELECT slug, title, "publishedAt"
      FROM "Article"
      WHERE status = 'PUBLISHED' 
        AND "deletedAt" IS NULL
        AND UPPER(type) = 'NEWS'
        AND "publishedAt" > NOW() - INTERVAL '2 days'
      ORDER BY "publishedAt" DESC
      LIMIT 1000
    `;

    // Generate Google News sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${articles.map(a => `  <url>
    <loc>https://aistartupimpact.com/news/${a.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>AI Startup Impact</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(a.publishedAt).toISOString()}</news:publication_date>
      <news:title>${escapeXml(a.title)}</news:title>
    </news:news>
  </url>`).join('\n')}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Google News sitemap generation error:', error);
    
    // Return empty but valid sitemap on error
    const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
</urlset>`;

    return new Response(emptySitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300',
      },
    });
  }
}

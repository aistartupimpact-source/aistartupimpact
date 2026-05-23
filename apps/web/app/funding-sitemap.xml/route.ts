import { sql } from '@/lib/db';

/**
 * Funding Sitemap Route Handler
 * Generates XML sitemap for funding dashboard and individual round pages
 */

export const revalidate = 86400; // Regenerate daily

export async function GET() {
  try {
    // Fetch all funding rounds with slugs
    const rounds = await sql`
      SELECT fr.slug, fr."announcedAt"::text AS "announcedAt"
      FROM "FundingRound" fr
      JOIN "Startup" s ON s.id = fr."startupId"
      WHERE s."deletedAt" IS NULL AND fr.slug IS NOT NULL
      ORDER BY fr."announcedAt" DESC
    `;

    // Get the most recent funding round date for the main dashboard page
    const latestRoundDate = rounds[0]?.announcedAt || new Date().toISOString();

    // Generate standard sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://aistartupimpact.com/funding</loc>
    <lastmod>${latestRoundDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
${rounds.map(r => `  <url>
    <loc>https://aistartupimpact.com/funding/${r.slug}</loc>
    <lastmod>${r.announcedAt}</lastmod>
    <changefreq>monthly</changefreq>
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
    console.error('Funding sitemap generation error:', error);
    
    // Return empty but valid sitemap on error
    const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://aistartupimpact.com/funding</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

    return new Response(emptySitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300',
      },
    });
  }
}

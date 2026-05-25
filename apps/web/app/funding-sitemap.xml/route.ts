import { sql } from '@/lib/db';

export const revalidate = 86400;

function toSitemapDate(dateVal: any): string {
  if (!dateVal) return new Date().toISOString().split('T')[0];
  // Handle Date objects, ISO strings, and date-only strings
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
    return d.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

export async function GET() {
  try {
    const rounds = await sql`
      SELECT fr.slug, fr."announcedAt"::text AS "announcedAt"
      FROM "FundingRound" fr
      JOIN "Startup" s ON s.id = fr."startupId"
      WHERE s."deletedAt" IS NULL AND fr.slug IS NOT NULL
      ORDER BY fr."announcedAt" DESC
    `;

    const latestDate = toSitemapDate(rounds[0]?.announcedAt);

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://aistartupimpact.com/funding</loc>
    <lastmod>${latestDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
${rounds.map(r => `  <url>
    <loc>https://aistartupimpact.com/funding/${r.slug}</loc>
    <lastmod>${toSitemapDate(r.announcedAt)}</lastmod>
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
    console.error('Funding sitemap error:', error);
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://aistartupimpact.com/funding</loc>
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

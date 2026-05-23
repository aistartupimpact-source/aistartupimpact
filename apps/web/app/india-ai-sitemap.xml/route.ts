/**
 * IndiaAI Sitemap Route Handler
 * Generates XML sitemap for IndiaAI pages with monthly change frequency
 */

export const revalidate = 2592000; // Regenerate monthly

export async function GET() {
  try {
    // Static IndiaAI pages
    const pages = [
      {
        url: 'https://aistartupimpact.com/india-ai',
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.9
      },
      {
        url: 'https://aistartupimpact.com/india-ai/schemes/indiaai-mission',
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8
      },
      {
        url: 'https://aistartupimpact.com/india-ai/schemes/startup-india-seed-fund',
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8
      },
      {
        url: 'https://aistartupimpact.com/india-ai/schemes/meity-grants',
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8
      }
    ];

    // Generate standard sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${p.url}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=2592000, s-maxage=2592000',
      },
    });
  } catch (error) {
    console.error('IndiaAI sitemap generation error:', error);
    
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

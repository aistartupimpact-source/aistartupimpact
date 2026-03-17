import { MetadataRoute } from 'next';
import { neon } from '@neondatabase/serverless';

export const revalidate = 3600; // regenerate every hour

const SITE_URL = 'https://aistartupimpact.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/news`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/stories`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/tools`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/funding`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/newsletter`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/advertise`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Fetch published articles directly from DB
    const articles: any[] = await sql`
      SELECT slug, type, "updatedAt", "publishedAt"
      FROM "Article"
      WHERE status = 'PUBLISHED' AND "deletedAt" IS NULL
      ORDER BY "publishedAt" DESC
      LIMIT 1000
    `;

    const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
      url: `${SITE_URL}/${a.type?.toLowerCase() === 'story' ? 'stories' : 'news'}/${a.slug}`,
      lastModified: new Date(a.updatedAt || a.publishedAt || new Date()),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticRoutes, ...articleRoutes];
  } catch (e) {
    console.error('Sitemap DB error:', e);
    return staticRoutes;
  }
}

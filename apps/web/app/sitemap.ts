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

    // Fetch published articles
    const articles: any[] = await sql`
      SELECT slug, type, "updatedAt", "publishedAt"
      FROM "Article"
      WHERE status = 'PUBLISHED' AND "deletedAt" IS NULL
      ORDER BY "publishedAt" DESC
      LIMIT 1000
    `;

    // Fetch tools
    const tools: any[] = await sql`
      SELECT slug, "updatedAt", "createdAt" 
      FROM "AiTool" 
      WHERE (status = 'APPROVED' OR status = 'FEATURED') AND "deletedAt" IS NULL
      LIMIT 1000
    `;

    // Fetch startups
    const startups: any[] = await sql`
      SELECT slug, "updatedAt", "createdAt" 
      FROM "Startup" 
      WHERE "deletedAt" IS NULL
      LIMIT 1000
    `;

    const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
      url: `${SITE_URL}/${a.type?.toLowerCase() === 'story' ? 'stories' : 'news'}/${a.slug}`,
      lastModified: new Date(a.updatedAt || a.publishedAt || new Date()),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    const toolRoutes: MetadataRoute.Sitemap = tools.map((t) => ({
      url: `${SITE_URL}/tools/${t.slug}`,
      lastModified: new Date(t.updatedAt || t.createdAt || new Date()),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

    const startupRoutes: MetadataRoute.Sitemap = startups.map((s) => ({
      url: `${SITE_URL}/startups/${s.slug}`,
      lastModified: new Date(s.updatedAt || s.createdAt || new Date()),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

    return [...staticRoutes, ...articleRoutes, ...toolRoutes, ...startupRoutes];
  } catch (e) {
    console.error('Sitemap DB error:', e);
    return staticRoutes;
  }
}

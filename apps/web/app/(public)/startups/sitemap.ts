import { MetadataRoute } from 'next';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const SITE_URL = 'https://aistartupimpact.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listingPage: MetadataRoute.Sitemap[0] = {
    url: `${SITE_URL}/startups`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  };

  try {
    const sql = neon(process.env.DATABASE_URL!);

    const startups = await sql`
      SELECT slug, "updatedAt"
      FROM "Startup"
      WHERE "isApproved" = true AND "deletedAt" IS NULL
      ORDER BY "updatedAt" DESC
    `;

    const startupRoutes: MetadataRoute.Sitemap = (startups as any[]).map((startup) => ({
      url: `${SITE_URL}/startups/${startup.slug}`,
      lastModified: new Date(startup.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [listingPage, ...startupRoutes];
  } catch (error) {
    console.error('Error generating startup sitemap:', error);
    return [listingPage];
  }
}

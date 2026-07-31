import { MetadataRoute } from 'next';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const SITE_URL = 'https://aistartupimpact.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listingPage: MetadataRoute.Sitemap[0] = {
    url: `${SITE_URL}/events`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  };

  try {
    const sql = neon(process.env.DATABASE_URL!);

    const events = await sql`
      SELECT slug, "updatedAt", "createdAt"
      FROM "Event"
      WHERE "deletedAt" IS NULL AND status != 'CANCELLED'
      ORDER BY "createdAt" DESC
      LIMIT 1000
    `;

    const eventRoutes: MetadataRoute.Sitemap = (events as any[]).map((e) => ({
      url: `${SITE_URL}/events/${e.slug}`,
      lastModified: new Date(e.updatedAt || e.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [listingPage, ...eventRoutes];
  } catch (error) {
    console.error('Error generating events sitemap:', error);
    return [listingPage];
  }
}

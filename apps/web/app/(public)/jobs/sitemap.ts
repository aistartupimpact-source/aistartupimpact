import { MetadataRoute } from 'next';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const SITE_URL = 'https://aistartupimpact.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listingPage: MetadataRoute.Sitemap[0] = {
    url: `${SITE_URL}/jobs`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  };

  try {

    const jobs = await sql`
      SELECT slug, "updatedAt", "createdAt"
      FROM "JobBoardListing"
      WHERE "isActive" = true AND "deletedAt" IS NULL
        AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
      ORDER BY "publishedAt" DESC
      LIMIT 1000
    `;

    const jobRoutes: MetadataRoute.Sitemap = (jobs as any[]).map((j) => ({
      url: `${SITE_URL}/jobs/${j.slug}`,
      lastModified: new Date(j.updatedAt || j.createdAt),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    return [listingPage, ...jobRoutes];
  } catch (error) {
    console.error('Error generating jobs sitemap:', error);
    return [listingPage];
  }
}

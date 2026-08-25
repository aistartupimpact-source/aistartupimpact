import { MetadataRoute } from 'next';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const SITE_URL = 'https://aistartupimpact.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listingPage: MetadataRoute.Sitemap[0] = {
    url: `${SITE_URL}/funding`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  };

  try {
    const rounds = await sql`
      SELECT slug, "updatedAt", "announcedAt"
      FROM "FundingRound"
      WHERE "deletedAt" IS NULL AND slug IS NOT NULL
      ORDER BY "announcedAt" DESC
      LIMIT 5000
    `;

    const roundRoutes: MetadataRoute.Sitemap = (rounds as any[]).map((r) => ({
      url: `${SITE_URL}/funding/${r.slug}`,
      lastModified: new Date(r.updatedAt || r.announcedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    return [listingPage, ...roundRoutes];
  } catch (error) {
    console.error('Error generating funding sitemap:', error);
    return [listingPage];
  }
}

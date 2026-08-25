import { MetadataRoute } from 'next';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const SITE_URL = 'https://aistartupimpact.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listingPage: MetadataRoute.Sitemap[0] = {
    url: `${SITE_URL}/india-ai`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  };

  try {

    const cities = await sql`
      SELECT slug, "updatedAt"
      FROM "IndiaAICity"
      WHERE "isActive" = true
      ORDER BY "displayOrder" ASC
    `;

    const cityRoutes: MetadataRoute.Sitemap = (cities as any[]).map((c) => ({
      url: `${SITE_URL}/india-ai/cities/${c.slug}`,
      lastModified: new Date(c.updatedAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    const schemePages: MetadataRoute.Sitemap = [
      { url: `${SITE_URL}/india-ai/schemes`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
      { url: `${SITE_URL}/india-ai/schemes/indiaai-mission`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
      { url: `${SITE_URL}/india-ai/schemes/meity-grants`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
      { url: `${SITE_URL}/india-ai/schemes/startup-india-seed-fund`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    ];

    return [listingPage, ...schemePages, ...cityRoutes];
  } catch (error) {
    console.error('Error generating india-ai sitemap:', error);
    return [listingPage];
  }
}

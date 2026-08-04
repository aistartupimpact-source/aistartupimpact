import { MetadataRoute } from 'next';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const SITE_URL = 'https://aistartupimpact.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listingPage: MetadataRoute.Sitemap[0] = {
    url: `${SITE_URL}/tools`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  };

  try {

    const tools = await sql`
      SELECT slug, "updatedAt"
      FROM "AiTool"
      WHERE (status = 'APPROVED' OR status = 'FEATURED') AND "deletedAt" IS NULL
      ORDER BY "updatedAt" DESC
    `;

    const toolRoutes: MetadataRoute.Sitemap = (tools as any[]).map((tool) => ({
      url: `${SITE_URL}/tools/${tool.slug}`,
      lastModified: new Date(tool.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [listingPage, ...toolRoutes];
  } catch (error) {
    console.error('Error generating tools sitemap:', error);
    return [listingPage];
  }
}

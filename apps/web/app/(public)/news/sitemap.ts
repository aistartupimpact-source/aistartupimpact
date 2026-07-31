import { MetadataRoute } from 'next';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const SITE_URL = 'https://aistartupimpact.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listingPage: MetadataRoute.Sitemap[0] = {
    url: `${SITE_URL}/news`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
    priority: 0.9,
  };

  try {
    const sql = neon(process.env.DATABASE_URL!);

    const news = await sql`
      SELECT slug, "updatedAt", "publishedAt"
      FROM "Article"
      WHERE status = 'PUBLISHED' AND "deletedAt" IS NULL
        AND type = 'NEWS'
      ORDER BY "publishedAt" DESC
      LIMIT 5000
    `;

    const newsRoutes: MetadataRoute.Sitemap = (news as any[]).map((n) => ({
      url: `${SITE_URL}/news/${n.slug}`,
      lastModified: new Date(n.updatedAt || n.publishedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [listingPage, ...newsRoutes];
  } catch (error) {
    console.error('Error generating news sitemap:', error);
    return [listingPage];
  }
}

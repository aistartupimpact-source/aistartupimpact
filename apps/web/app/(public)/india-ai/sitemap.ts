import { MetadataRoute } from 'next';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const SITE_URL = 'https://aistartupimpact.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const cities = await sql`
      SELECT slug, "updatedAt"
      FROM "IndiaAICity"
      WHERE "isActive" = true
      ORDER BY "displayOrder" ASC
    `;

    return (cities as any[]).map((c) => ({
      url: `${SITE_URL}/india-ai/cities/${c.slug}`,
      lastModified: new Date(c.updatedAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Error generating india-ai sitemap:', error);
    return [];
  }
}

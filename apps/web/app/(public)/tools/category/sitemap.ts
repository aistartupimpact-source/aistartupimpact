import { MetadataRoute } from 'next';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const SITE_URL = 'https://aistartupimpact.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const categories = await sql`
      SELECT slug, "updatedAt", "createdAt"
      FROM "ToolCategory"
      WHERE "isActive" = true
      ORDER BY level ASC, "sortOrder" ASC
    `;

    return (categories as any[]).map((cat) => ({
      url: `${SITE_URL}/tools/category/${cat.slug}`,
      lastModified: new Date(cat.updatedAt || cat.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Error generating category sitemap:', error);
    return [];
  }
}

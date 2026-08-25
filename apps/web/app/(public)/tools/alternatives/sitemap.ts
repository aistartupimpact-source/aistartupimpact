import { MetadataRoute } from 'next';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const SITE_URL = 'https://aistartupimpact.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const tools = await sql`
      SELECT t.slug, t."updatedAt"
      FROM "AiTool" t
      WHERE (t.status = 'APPROVED' OR t.status = 'FEATURED') AND t."deletedAt" IS NULL
        AND EXISTS (
          SELECT 1 FROM "AiTool" alt
          WHERE alt.id != t.id
            AND (alt.status = 'APPROVED' OR alt.status = 'FEATURED')
            AND alt."deletedAt" IS NULL
            AND alt."categoryId" = t."categoryId"
        )
      ORDER BY t."updatedAt" DESC
    `;

    return (tools as any[]).map((t) => ({
      url: `${SITE_URL}/tools/alternatives/${t.slug}`,
      lastModified: new Date(t.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Error generating alternatives sitemap:', error);
    return [];
  }
}

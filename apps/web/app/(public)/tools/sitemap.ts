/**
 * AI Tools Sitemap Generator
 * Generates XML sitemap for all approved tools
 */

import { MetadataRoute } from 'next';
import { sql } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const tools = await sql`
      SELECT slug, "updatedAt"
      FROM "AiTool"
      WHERE status = 'APPROVED' AND "deletedAt" IS NULL
      ORDER BY "updatedAt" DESC
    `;

    return tools.map((tool: any) => ({
      url: `https://aistartupimpact.com/tools/${tool.slug}`,
      lastModified: new Date(tool.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error generating tools sitemap:', error);
    return [];
  }
}

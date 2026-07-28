/**
 * Tool Categories Sitemap Generator
 * Generates XML sitemap for all active category landing pages
 */

import { MetadataRoute } from 'next';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const categories = await sql`
      SELECT slug, "createdAt"
      FROM "ToolCategory"
      WHERE "isActive" = true
      ORDER BY level ASC, "sortOrder" ASC
    `;

    return categories.map((cat: any) => ({
      url: `https://aistartupimpact.com/tools/category/${cat.slug}`,
      lastModified: new Date(cat.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error generating category sitemap:', error);
    return [];
  }
}

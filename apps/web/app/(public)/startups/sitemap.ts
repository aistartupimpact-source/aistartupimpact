/**
 * Startup Sitemap Generator
 * Generates XML sitemap for all non-deleted startups
 */

import { MetadataRoute } from 'next';
import { sql } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const startups = await sql`
      SELECT slug, "updatedAt"
      FROM "Startup"
      WHERE "deletedAt" IS NULL
      ORDER BY "updatedAt" DESC
    `;

    return startups.map((startup: any) => ({
      url: `https://aistartupimpact.com/startups/${startup.slug}`,
      lastModified: new Date(startup.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error generating startup sitemap:', error);
    return [];
  }
}

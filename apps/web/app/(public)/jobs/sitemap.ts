import { MetadataRoute } from 'next';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const SITE_URL = 'https://aistartupimpact.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const jobs = await sql`
      SELECT slug, "updatedAt", "createdAt"
      FROM "JobBoardListing"
      WHERE "isActive" = true AND "deletedAt" IS NULL
        AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
      ORDER BY "publishedAt" DESC
      LIMIT 1000
    `;

    return (jobs as any[]).map((j) => ({
      url: `${SITE_URL}/jobs/${j.slug}`,
      lastModified: new Date(j.updatedAt || j.createdAt),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error generating jobs sitemap:', error);
    return [];
  }
}

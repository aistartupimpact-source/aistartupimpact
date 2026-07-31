import { MetadataRoute } from 'next';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const SITE_URL = 'https://aistartupimpact.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const events = await sql`
      SELECT slug, "updatedAt", "createdAt"
      FROM "Event"
      WHERE "deletedAt" IS NULL AND status != 'CANCELLED'
      ORDER BY "createdAt" DESC
      LIMIT 1000
    `;

    return (events as any[]).map((e) => ({
      url: `${SITE_URL}/events/${e.slug}`,
      lastModified: new Date(e.updatedAt || e.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error generating events sitemap:', error);
    return [];
  }
}

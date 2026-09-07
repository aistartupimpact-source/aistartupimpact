'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function getJobsAction() {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const jobs = await sql`
      SELECT jl.id, jl.slug, jl.title, jl.category, jl."workType", jl."listingTier",
             jl."isActive", jl."isFeatured", jl."applicationsCount", jl."viewsCount",
             jl."publishedAt"::text, jl."createdAt"::text,
             e."companyName"
      FROM "JobBoardListing" jl
      JOIN "JobBoardEmployer" e ON e.id = jl."employerId"
      WHERE jl."deletedAt" IS NULL
      ORDER BY jl."createdAt" DESC
      LIMIT 200
    `;
    return { success: true, data: jobs };
  } catch (error: any) {
    console.error('[Admin Jobs Board]', error);
    return { success: false, error: 'Failed to load jobs' };
  }
}

export async function toggleJobActiveAction(id: string, isActive: boolean) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    await sql`UPDATE "JobBoardListing" SET "isActive" = ${isActive}, "updatedAt" = NOW() WHERE id = ${id}`;
    return { success: true };
  } catch (error: any) {
    console.error('[Admin Jobs Board Toggle]', error);
    return { success: false, error: 'Failed to update' };
  }
}

export async function deleteJobAction(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: 'Unauthorized' };
  if ((session.user as any).role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Only Super Admins can delete job listings.' };
  }

  try {
    await sql`UPDATE "JobBoardListing" SET "deletedAt" = NOW(), "isActive" = false WHERE id = ${id}`;
    return { success: true };
  } catch (error: any) {
    console.error('[Admin Jobs Board Delete]', error);
    return { success: false, error: 'Failed to delete' };
  }
}

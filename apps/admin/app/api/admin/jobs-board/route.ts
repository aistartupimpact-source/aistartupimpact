import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
    return NextResponse.json({ jobs });
  } catch (error: any) {
    console.error('[Admin Jobs Board]', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

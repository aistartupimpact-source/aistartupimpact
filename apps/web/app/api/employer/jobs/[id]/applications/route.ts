import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getEmployerSession } from '@/lib/employer-auth';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getEmployerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;

    // Verify this job belongs to the employer
    const jobCheck = await sql`
      SELECT id, title FROM "JobBoardListing"
      WHERE id = ${id} AND "employerId" = ${session.id}
      LIMIT 1
    `;

    if (jobCheck.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const applications = await sql`
      SELECT id, "fullName", email, phone, "linkedinUrl", "portfolioUrl",
             "githubUrl", "resumeUrl", "coverLetter", status, notes, rating,
             "appliedAt"::text, "reviewedAt"::text, "statusChangedAt"::text
      FROM "JobBoardApplication"
      WHERE "listingId" = ${id}
      ORDER BY "appliedAt" DESC
    `;

    return NextResponse.json({
      jobTitle: (jobCheck[0] as any).title,
      applications,
    });
  } catch (error: any) {
    console.error('[GET /api/employer/jobs/[id]/applications]', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

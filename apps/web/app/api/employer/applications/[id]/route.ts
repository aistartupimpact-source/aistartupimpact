import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getEmployerSession } from '@/lib/employer-auth';

export const dynamic = 'force-dynamic';

const sql = neon(process.env.DATABASE_URL!);

// PUT: Update application status/notes/rating
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getEmployerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;
    const body = await request.json();

    // Verify the application belongs to one of the employer's jobs
    const appCheck = await sql`
      SELECT a.id, a.status FROM "JobBoardApplication" a
      JOIN "JobBoardListing" l ON l.id = a."listingId"
      WHERE a.id = ${id} AND l."employerId" = ${session.id}
      LIMIT 1
    `;

    if (appCheck.length === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Update fields
    const validStatuses = ['APPLIED', 'REVIEWED', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await sql`
      UPDATE "JobBoardApplication"
      SET
        "status" = COALESCE(${body.status || null}::"JobBoardAppStatus", status),
        "notes" = COALESCE(${body.notes !== undefined ? body.notes : null}, notes),
        "rating" = COALESCE(${body.rating || null}, rating),
        "reviewedAt" = CASE WHEN ${body.status || null} IS NOT NULL AND "reviewedAt" IS NULL THEN NOW() ELSE "reviewedAt" END,
        "statusChangedAt" = CASE WHEN ${body.status || null} IS NOT NULL THEN NOW() ELSE "statusChangedAt" END
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[PUT /api/employer/applications]', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}

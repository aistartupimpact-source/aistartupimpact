import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getEmployerSession } from '@/lib/employer-auth';

export const dynamic = 'force-dynamic';
// GET: Fetch a single job for editing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getEmployerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const jobs = await sql`
      SELECT id, slug, title, description, "shortDescription",
             "workType", location, city, country, "visaSponsorship",
             "salaryMin", "salaryMax", "salaryCurrency", "salaryPeriod", "showSalary",
             category, "experienceMin", "experienceMax", skills, department,
             "applicationType", "applicationUrl", "applicationEmail",
             "isActive", "isFeatured", "listingTier"
      FROM "JobBoardListing"
      WHERE id = ${params.id} AND "employerId" = ${session.id} AND "deletedAt" IS NULL
      LIMIT 1
    `;

    if (jobs.length === 0) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    return NextResponse.json({ job: jobs[0] });
  } catch (error: any) {
    console.error('[GET /api/employer/jobs/[id]]', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// PUT: Update a job listing
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getEmployerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify ownership
    const check = await sql`
      SELECT id FROM "JobBoardListing"
      WHERE id = ${params.id} AND "employerId" = ${session.id} AND "deletedAt" IS NULL
      LIMIT 1
    `;
    if (check.length === 0) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const body = await request.json();

    await sql`
      UPDATE "JobBoardListing"
      SET
        "title" = COALESCE(${body.title || null}, title),
        "description" = COALESCE(${body.description || null}, description),
        "shortDescription" = ${body.shortDescription !== undefined ? body.shortDescription : null},
        "salaryMin" = ${body.salaryMin !== undefined ? body.salaryMin : null},
        "salaryMax" = ${body.salaryMax !== undefined ? body.salaryMax : null},
        "skills" = COALESCE(${body.skills || null}, skills),
        "isActive" = COALESCE(${body.isActive !== undefined ? body.isActive : null}, "isActive"),
        "updatedAt" = NOW()
      WHERE id = ${params.id}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[PUT /api/employer/jobs/[id]]', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE: Soft-delete a job
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getEmployerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await sql`
      UPDATE "JobBoardListing"
      SET "deletedAt" = NOW(), "isActive" = false, "updatedAt" = NOW()
      WHERE id = ${params.id} AND "employerId" = ${session.id}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[DELETE /api/employer/jobs/[id]]', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

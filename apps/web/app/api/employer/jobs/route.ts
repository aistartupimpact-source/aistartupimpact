import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getEmployerSession } from '@/lib/employer-auth';

const sql = neon(process.env.DATABASE_URL!);

// GET: List employer's own jobs
export async function GET() {
  try {
    const session = await getEmployerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const jobs = await sql`
      SELECT id, slug, title, category, "workType", "listingTier",
             "isActive", "isFeatured", "applicationsCount", "viewsCount",
             "salaryMin", "salaryMax", "salaryCurrency", "showSalary",
             "publishedAt"::text, "createdAt"::text, "expiresAt"::text
      FROM "JobBoardListing"
      WHERE "employerId" = ${session.id} AND "deletedAt" IS NULL
      ORDER BY "createdAt" DESC
    `;

    return NextResponse.json({ jobs });
  } catch (error: any) {
    console.error('[GET /api/employer/jobs]', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

// POST: Create a new job listing
export async function POST(request: NextRequest) {
  try {
    const session = await getEmployerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check email verified
    const verifyCheck = await sql`SELECT "emailVerified" FROM "JobBoardEmployer" WHERE id = ${session.id}`;
    if (!(verifyCheck[0] as any)?.emailVerified) {
      return NextResponse.json({ error: 'Please verify your email before posting jobs.' }, { status: 403 });
    }

    // Check active job limit
    const countResult = await sql`
      SELECT COUNT(*)::int AS count FROM "JobBoardListing"
      WHERE "employerId" = ${session.id} AND "isActive" = true AND "deletedAt" IS NULL
    `;
    const activeCount = (countResult[0] as any)?.count || 0;

    // Get max active jobs from employer plan
    const employerData = await sql`
      SELECT "maxActiveJobs" FROM "JobBoardEmployer" WHERE id = ${session.id}
    `;
    const maxJobs = (employerData[0] as any)?.maxActiveJobs || 1;

    if (activeCount >= maxJobs) {
      return NextResponse.json({
        error: `You've reached your active job limit (${maxJobs}). Upgrade your plan to post more jobs.`
      }, { status: 403 });
    }

    const body = await request.json();

    // Validation
    if (!body.title?.trim()) return NextResponse.json({ error: 'Job title is required' }, { status: 400 });
    if (!body.description?.trim()) return NextResponse.json({ error: 'Description is required' }, { status: 400 });

    // Generate slug
    const baseSlug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80);
    const slugCheck = await sql`SELECT id FROM "JobBoardListing" WHERE slug = ${baseSlug} LIMIT 1`;
    const slug = slugCheck.length > 0 ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

    // Get employer's linked startup
    const employerInfo = await sql`SELECT "startupId" FROM "JobBoardEmployer" WHERE id = ${session.id}`;
    const startupId = (employerInfo[0] as any)?.startupId || null;

    // Calculate expiry (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const result = await sql`
      INSERT INTO "JobBoardListing" (
        "id", "slug", "title", "description", "shortDescription",
        "workType", "location", "city", "country", "visaSponsorship",
        "salaryMin", "salaryMax", "salaryCurrency", "salaryPeriod", "showSalary",
        "category", "experienceMin", "experienceMax", "skills", "department",
        "applicationType", "applicationUrl", "applicationEmail",
        "employerId", "startupId", "isActive", "publishedAt", "expiresAt",
        "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text, ${slug}, ${body.title.trim()}, ${body.description.trim()}, ${body.shortDescription || null},
        ${body.workType || 'REMOTE'}::"JobBoardWorkType", ${body.location || null}, ${body.city || null}, ${body.country || null}, ${body.visaSponsorship || false},
        ${body.salaryMin || null}, ${body.salaryMax || null}, ${body.salaryCurrency || 'USD'}, ${body.salaryPeriod || 'yearly'}, ${body.showSalary !== false},
        ${body.category || 'AI_ENGINEER'}::"JobBoardCategory", ${body.experienceMin || null}, ${body.experienceMax || null}, ${body.skills || []}, ${body.department || null},
        ${body.applicationType || 'INTERNAL'}::"JobBoardApplyType", ${body.applicationUrl || null}, ${body.applicationEmail || null},
        ${session.id}, ${startupId}, false, NOW(), ${expiresAt.toISOString()}::timestamp,
        NOW(), NOW()
      )
      RETURNING id, slug, title
    `;

    return NextResponse.json({ success: true, job: result[0] }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/employer/jobs]', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}

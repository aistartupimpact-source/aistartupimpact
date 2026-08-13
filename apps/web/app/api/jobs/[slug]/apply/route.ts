import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { apiRateLimit, checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const identifier = getClientIdentifier(request);
    const { success: allowed } = await checkRateLimit(apiRateLimit, identifier);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { slug } = params;
    const body = await request.json();

    if (!body.consent) return NextResponse.json({ error: 'You must agree to the privacy policy to apply' }, { status: 400 });
    if (!body.fullName?.trim()) return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    if (!body.email?.trim() || !body.email.includes('@')) return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    if (!body.resumeUrl?.trim()) return NextResponse.json({ error: 'Resume URL is required' }, { status: 400 });

    // Find the job listing
    const jobs = await sql`
      SELECT id, "employerId", "applicationType"
      FROM "JobBoardListing"
      WHERE slug = ${slug} AND "isActive" = true AND "deletedAt" IS NULL
      LIMIT 1
    `;

    if (jobs.length === 0) {
      return NextResponse.json({ error: 'Job not found or no longer active' }, { status: 404 });
    }

    const job = jobs[0] as any;

    // Check if external (shouldn't be applying internally)
    if (job.applicationType === 'EXTERNAL') {
      return NextResponse.json({ error: 'This job accepts applications externally' }, { status: 400 });
    }

    // Check for duplicate application
    const existing = await sql`
      SELECT id FROM "JobBoardApplication"
      WHERE "listingId" = ${job.id} AND email = ${body.email.toLowerCase().trim()}
      LIMIT 1
    `;
    if (existing.length > 0) {
      return NextResponse.json({ error: 'You have already applied for this position' }, { status: 409 });
    }

    // Create application
    await sql`
      INSERT INTO "JobBoardApplication" (
        "id", "listingId", "fullName", "email", "phone",
        "linkedinUrl", "portfolioUrl", "githubUrl", "resumeUrl", "coverLetter",
        "status", "appliedAt"
      ) VALUES (
        gen_random_uuid()::text,
        ${job.id},
        ${body.fullName.trim()},
        ${body.email.toLowerCase().trim()},
        ${body.phone || null},
        ${body.linkedinUrl || null},
        ${body.portfolioUrl || null},
        ${body.githubUrl || null},
        ${body.resumeUrl.trim()},
        ${body.coverLetter || null},
        'APPLIED',
        NOW()
      )
    `;

    // Increment application count
    await sql`
      UPDATE "JobBoardListing"
      SET "applicationsCount" = "applicationsCount" + 1
      WHERE id = ${job.id}
    `;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/jobs/apply]', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}

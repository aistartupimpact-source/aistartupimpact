import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getEmployerSession } from '@/lib/employer-auth';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const session = await getEmployerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await sql`
      SELECT e."companyName", e.description, e."websiteUrl", e.industry, e."companySize",
             e.location, e.country, e."linkedinUrl", e."twitterUrl", e."logoUrl", e."startupId",
             s.name AS "startupName", s.slug AS "startupSlug", s."logoUrl" AS "startupLogo",
             s."headquartersCity" AS "startupCity", s.stage AS "startupStage", s."websiteUrl" AS "startupWebsite"
      FROM "JobBoardEmployer" e
      LEFT JOIN "Startup" s ON s.id = e."startupId"
      WHERE e.id = ${session.id}
    `;

    return NextResponse.json({ company: result[0] || null });
  } catch (error: any) {
    console.error('[GET /api/employer/company]', error);
    return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getEmployerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    // Handle startup connect
    if (body.action === 'connect_startup' && body.startupId) {
      const startup = await sql`
        SELECT id FROM "Startup" WHERE id = ${body.startupId} AND "deletedAt" IS NULL AND "isApproved" = true LIMIT 1
      `;
      if (startup.length === 0) return NextResponse.json({ error: 'Startup not found' }, { status: 404 });

      const existing = await sql`
        SELECT id FROM "JobBoardEmployer" WHERE "startupId" = ${body.startupId} AND id != ${session.id} LIMIT 1
      `;
      if (existing.length > 0) return NextResponse.json({ error: 'This startup is already linked to another employer account' }, { status: 409 });

      await sql`UPDATE "JobBoardEmployer" SET "startupId" = ${body.startupId}, "updatedAt" = NOW() WHERE id = ${session.id}`;
      await sql`UPDATE "JobBoardListing" SET "startupId" = ${body.startupId} WHERE "employerId" = ${session.id} AND "deletedAt" IS NULL`;
      return NextResponse.json({ success: true, connected: true });
    }

    // Handle startup disconnect
    if (body.action === 'disconnect_startup') {
      await sql`UPDATE "JobBoardEmployer" SET "startupId" = NULL, "updatedAt" = NOW() WHERE id = ${session.id}`;
      await sql`UPDATE "JobBoardListing" SET "startupId" = NULL WHERE "employerId" = ${session.id}`;
      return NextResponse.json({ success: true, connected: false });
    }

    // Regular profile update
    await sql`
      UPDATE "JobBoardEmployer"
      SET
        "companyName" = ${body.companyName || session.companyName},
        "description" = ${body.description || null},
        "websiteUrl" = ${body.websiteUrl || null},
        "industry" = ${body.industry || null},
        "companySize" = ${body.companySize || null},
        "location" = ${body.location || null},
        "country" = ${body.country || null},
        "linkedinUrl" = ${body.linkedinUrl || null},
        "twitterUrl" = ${body.twitterUrl || null},
        "updatedAt" = NOW()
      WHERE id = ${session.id}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[PUT /api/employer/company]', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

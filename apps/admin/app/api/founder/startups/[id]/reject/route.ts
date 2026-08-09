import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@aistartupimpact/database';
import { neon } from '@neondatabase/serverless';
import { startupRejectionHtml } from '@aistartupimpact/utils/src/email-templates';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const reason = body.reason || 'No specific reason provided.';

    const startups = await sql`
      SELECT s.id, s.name, s.slug, s.tagline, s.description, s."websiteUrl", s."ownerId", s.stage,
             fu.email AS "founderEmail", fu.name AS "founderName"
      FROM "Startup" s
      LEFT JOIN "FounderUser" fu ON fu.id = s."ownerId"
      WHERE s.id = ${params.id}
      LIMIT 1
    `;

    if (startups.length === 0) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    const startup = startups[0] as any;

    await prisma.$executeRaw`
      UPDATE "Startup"
      SET "claimStatus" = 'REJECTED'::"ClaimStatus",
          "isApproved" = false,
          "approvedAt" = NULL,
          "updatedAt" = NOW()
      WHERE id = ${params.id}
    `;

    if (startup.founderEmail) {
      try {
        const { Resend } = await import('resend');
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey) {
          const resend = new Resend(resendKey);
          await resend.emails.send({
            from: `${process.env.RESEND_FROM_NAME || 'AI Startup Impact'} <${process.env.RESEND_FROM_EMAIL || 'no-reply@aistartupimpact.com'}>`,
            to: startup.founderEmail,
            subject: `Action Required: Your startup "${startup.name}" requires changes`,
            html: startupRejectionHtml(startup.name, startup.founderName || 'there', reason, {
              tagline: startup.tagline,
              description: startup.description,
              stage: startup.stage,
              websiteUrl: startup.websiteUrl,
            }),
          });
        }
      } catch (emailErr) {
        console.error('Failed to send rejection email:', emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Reject startup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reject startup' },
      { status: 500 }
    );
  }
}

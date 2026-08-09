import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@aistartupimpact/database';
import { neon } from '@neondatabase/serverless';
import { calculateImpactScore } from '@/lib/impact-score';
import { startupApprovalHtml } from '@aistartupimpact/utils/src/email-templates';

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

    const startups = await sql`
      SELECT s.id, s.name, s.slug, s."ownerId", s.stage, s."employeeCount", s."foundedYear",
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

    const fundingResult = await sql`
      SELECT COALESCE(SUM("amountUsd"), 0)::bigint AS total FROM "FundingRound" WHERE "startupId" = ${params.id}
    `;
    const totalFundingUsdCents = Number(fundingResult[0]?.total || 0);

    const { total: impactScore } = calculateImpactScore({
      totalFundingUsdCents,
      employeeCount: startup.employeeCount ?? null,
      stage: startup.stage,
      foundedYear: startup.foundedYear ?? null,
    });

    await prisma.$executeRaw`
      UPDATE "Startup"
      SET "claimStatus" = 'CLAIMED'::"ClaimStatus",
          "isApproved" = true,
          "approvedAt" = NOW(),
          "impactScore" = ${impactScore},
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
            subject: `Your startup "${startup.name}" is now live on AI Startup Impact`,
            html: startupApprovalHtml(startup.name, startup.founderName || 'there', startup.slug),
          });
        }
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Approve startup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to approve startup' },
      { status: 500 }
    );
  }
}

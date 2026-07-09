import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@aistartupimpact/database';
import { neon } from '@neondatabase/serverless';
import { calculateImpactScore } from '@/lib/impact-score';

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

    // Get startup details and owner email
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

    // Fetch total funding
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

    // Update startup status to CLAIMED and isApproved to true
    await prisma.$executeRaw`
      UPDATE "Startup"
      SET "claimStatus" = 'CLAIMED'::"ClaimStatus",
          "isApproved" = true,
          "approvedAt" = NOW(),
          "impactScore" = ${impactScore},
          "updatedAt" = NOW()
      WHERE id = ${params.id}
    `;

    // Send approval email to founder if they have an email
    if (startup.founderEmail) {
      try {
        const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost'))
          ? process.env.NEXT_PUBLIC_SITE_URL
          : 'https://aistartupimpact.com';
        const liveUrl = `${siteUrl}/startups/${startup.slug}`;
        const dashboardUrl = `${siteUrl}/founder/dashboard`;

        const { Resend } = await import('resend');
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey) {
          const resend = new Resend(resendKey);
          await resend.emails.send({
            from: `${process.env.RESEND_FROM_NAME || 'AI Startup Impact'} <${process.env.RESEND_FROM_EMAIL || 'no-reply@aistartupimpact.com'}>`,
            to: startup.founderEmail,
            subject: `Your startup "${startup.name}" is now live on AI Startup Impact`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px;">
                  <h1 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0;">AI Startup Impact</h1>
                </div>
                
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 8px;">Hi ${startup.founderName || 'there'},</p>
                
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                  Your startup <strong>"${startup.name}"</strong> has been reviewed and approved by our editorial team. Your listing is now live and visible to investors, enterprise buyers, and the broader AI ecosystem.
                </p>

                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <p style="color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0; font-weight: 600;">Your Live Listing</p>
                  <a href="${liveUrl}" style="color: #6366f1; font-size: 15px; font-weight: 600; text-decoration: none;">${liveUrl}</a>
                </div>

                <div style="margin: 32px 0;">
                  <a href="${liveUrl}" style="background: #111827; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 14px; font-weight: 600;">View Your Listing</a>
                  <a href="${dashboardUrl}" style="background: #ffffff; color: #374151; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 14px; font-weight: 600; border: 1px solid #d1d5db; margin-left: 12px;">Founder Dashboard</a>
                </div>

                <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <p style="color: #4338ca; font-size: 14px; font-weight: 700; margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Get Your Verified Badge</p>
                  <p style="color: #374151; font-size: 14px; line-height: 1.5; margin: 0;">
                    Verifying your startup through the DNS will help you get a verified badge and increase trust with investors and enterprise buyers. You can configure this easily from your <a href="${dashboardUrl}" style="color: #6366f1; font-weight: 600; text-decoration: none;">Founder Dashboard</a>.
                  </p>
                </div>

                <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 8px;">
                  To increase visibility, we recommend sharing your listing on LinkedIn and with your network.
                </p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
                
                <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0;">
                  Best regards,<br/>
                  The AI Startup Impact Team<br/>
                  <a href="${siteUrl}" style="color: #6366f1; text-decoration: none;">${siteUrl}</a>
                </p>
              </div>
            `
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

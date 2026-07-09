import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@aistartupimpact/database';
import { neon } from '@neondatabase/serverless';

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

    // Parse rejection reason
    const body = await request.json();
    const reason = body.reason || 'No specific reason provided.';

    // Fetch startup and founder details
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

    // Update startup status to REJECTED
    await prisma.$executeRaw`
      UPDATE "Startup"
      SET "claimStatus" = 'REJECTED'::"ClaimStatus",
          "isApproved" = false,
          "approvedAt" = NULL,
          "updatedAt" = NOW()
      WHERE id = ${params.id}
    `;

    // Send rejection email to founder
    if (startup.founderEmail) {
      try {
        const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost'))
          ? process.env.NEXT_PUBLIC_SITE_URL
          : 'https://aistartupimpact.com';
        const dashboardUrl = `${siteUrl}/founder/dashboard`;

        const { Resend } = await import('resend');
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey) {
          const resend = new Resend(resendKey);
          await resend.emails.send({
            from: `${process.env.RESEND_FROM_NAME || 'AI Startup Impact'} <${process.env.RESEND_FROM_EMAIL || 'no-reply@aistartupimpact.com'}>`,
            to: startup.founderEmail,
            subject: `Action Required: Your startup "${startup.name}" requires changes`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="border-bottom: 3px solid #ef4444; padding-bottom: 20px; margin-bottom: 30px;">
                  <h1 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0;">AI Startup Impact</h1>
                </div>
                
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 8px;">Hi ${startup.founderName || 'there'},</p>
                
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                  Thank you for submitting <strong>"${startup.name}"</strong> to AI Startup Impact. We appreciate your patience while our editorial team reviewed your application.
                </p>

                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                  After careful review, we unfortunately cannot approve your listing in its current state. Please see the details of our review feedback below:
                </p>

                <!-- Rejection Reason Box -->
                <div style="background: #fdf2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <p style="color: #b91c1c; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0; font-weight: 600;">Feedback from Editorial Team</p>
                  <p style="color: #7f1d1d; font-size: 15px; line-height: 1.6; margin: 0; font-style: italic;">
                    "${reason}"
                  </p>
                </div>

                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
                  For your reference, here are the details that were submitted:
                </p>

                <!-- Submitted Details List -->
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <p style="margin: 0 0 12px 0; color: #111827; font-weight: 600; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Submitted Profile Details</p>
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                      <td style="padding: 6px 0; color: #6b7280; width: 35%; font-weight: 500;">Startup Name</td>
                      <td style="padding: 6px 0; color: #111827; font-weight: 600;">${startup.name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #6b7280; font-weight: 500;">Tagline</td>
                      <td style="padding: 6px 0; color: #374151;">${startup.tagline || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #6b7280; vertical-align: top; font-weight: 500;">Description</td>
                      <td style="padding: 6px 0; color: #374151; line-height: 1.4;">${startup.description || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #6b7280; font-weight: 500;">Stage</td>
                      <td style="padding: 6px 0; color: #374151;">${startup.stage || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #6b7280; font-weight: 500;">Website</td>
                      <td style="padding: 6px 0; color: #374151;">
                        ${startup.websiteUrl ? `<a href="${startup.websiteUrl}" style="color: #6366f1; text-decoration: none;">${startup.websiteUrl}</a>` : 'N/A'}
                      </td>
                    </tr>
                  </table>
                </div>

                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                  Please verify the fields once, update any incorrect details or add missing information, and submit again for approval.
                </p>

                <div style="margin: 32px 0;">
                  <a href="${dashboardUrl}" style="background: #111827; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 14px; font-weight: 600;">Edit & Re-submit Listing</a>
                </div>

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

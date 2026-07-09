import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get tool details and owner email
    const tools = await sql`
      SELECT t.id, t.name, t.slug, t."ownerId",
             fu.email AS "founderEmail", fu.name AS "founderName"
      FROM "AiTool" t
      LEFT JOIN "FounderUser" fu ON fu.id = t."ownerId"
      WHERE t.id = ${id}
      LIMIT 1
    `;

    // Update tool status to APPROVED and claimStatus to CLAIMED
    await sql`
      UPDATE "AiTool"
      SET
        status = 'APPROVED'::"ToolApprovalStatus",
        "claimStatus" = 'CLAIMED',
        "approvedAt" = NOW(),
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;

    // Send approval email to founder
    const tool = tools[0] as any;
    if (tool?.founderEmail) {
      try {
        const { Resend } = await import('resend');
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey) {
          const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost'))
            ? process.env.NEXT_PUBLIC_SITE_URL
            : 'https://aistartupimpact.com';
          const liveUrl = `${siteUrl}/tools/${tool.slug}`;
          const dashboardUrl = `${siteUrl}/founder/dashboard`;

          const resend = new Resend(resendKey);
          await resend.emails.send({
            from: `${process.env.RESEND_FROM_NAME || 'AI Startup Impact'} <${process.env.RESEND_FROM_EMAIL || 'no-reply@aistartupimpact.com'}>`,
            to: tool.founderEmail,
            subject: `Your tool "${tool.name}" is now live on AI Startup Impact`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px;">
                  <h1 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0;">AI Startup Impact</h1>
                </div>
                
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 8px;">Hi ${tool.founderName || 'there'},</p>
                
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                  Your AI tool <strong>"${tool.name}"</strong> has been reviewed and approved by our editorial team. Your listing is now live and discoverable by developers, enterprise buyers, and the broader AI community.
                </p>

                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <p style="color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0; font-weight: 600;">Your Live Listing</p>
                  <a href="${liveUrl}" style="color: #6366f1; font-size: 15px; font-weight: 600; text-decoration: none;">${liveUrl}</a>
                </div>

                <div style="margin: 32px 0;">
                  <a href="${liveUrl}" style="background: #111827; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 14px; font-weight: 600;">View Your Listing</a>
                  <a href="${dashboardUrl}" style="background: #ffffff; color: #374151; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 14px; font-weight: 600; border: 1px solid #d1d5db; margin-left: 12px;">Founder Dashboard</a>
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
        console.error('Failed to send tool approval email:', emailError);
      }
    }

    return NextResponse.json({ success: true, message: 'Tool approved successfully' });
  } catch (error: any) {
    console.error('Error approving tool:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to approve tool' },
      { status: 500 }
    );
  }
}

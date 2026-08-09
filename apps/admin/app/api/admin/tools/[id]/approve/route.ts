import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { toolApprovalHtml } from '@aistartupimpact/utils/src/email-templates';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const tools = await sql`
      SELECT t.id, t.name, t.slug, t."ownerId",
             fu.email AS "founderEmail", fu.name AS "founderName"
      FROM "AiTool" t
      LEFT JOIN "FounderUser" fu ON fu.id = t."ownerId"
      WHERE t.id = ${id}
      LIMIT 1
    `;

    await sql`
      UPDATE "AiTool"
      SET
        status = 'APPROVED'::"ToolApprovalStatus",
        "claimStatus" = 'CLAIMED',
        "approvedAt" = NOW(),
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;

    const tool = tools[0] as any;
    if (tool?.founderEmail) {
      try {
        const { Resend } = await import('resend');
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey) {
          const resend = new Resend(resendKey);
          await resend.emails.send({
            from: `${process.env.RESEND_FROM_NAME || 'AI Startup Impact'} <${process.env.RESEND_FROM_EMAIL || 'no-reply@aistartupimpact.com'}>`,
            to: tool.founderEmail,
            subject: `Your tool "${tool.name}" is now live on AI Startup Impact`,
            html: toolApprovalHtml(tool.name, tool.founderName || 'there', tool.slug),
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

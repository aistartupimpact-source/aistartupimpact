import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { toolApprovalHtml } from '@aistartupimpact/utils';
import { sendEmailFireAndForget } from '@/lib/email-send';
import { requireApiAuth } from '@/lib/api-auth';
import { logAuditEvent } from '@/lib/audit-log';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireApiAuth(['SUPER_ADMIN', 'EDITOR_IN_CHIEF']);
  if (error) return error;
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
      sendEmailFireAndForget({
        to: tool.founderEmail,
        subject: `Your tool "${tool.name}" is now live on AI Startup Impact`,
        html: toolApprovalHtml(tool.name, tool.founderName || 'there', tool.slug),
        type: 'approval',
      });
    }

    logAuditEvent({ action: 'APPROVE', resourceType: 'AI_TOOL', resourceId: id, resourceName: tool?.name });

    return NextResponse.json({ success: true, message: 'Tool approved successfully' });
  } catch (error: any) {
    console.error('Error approving tool:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to approve tool' },
      { status: 500 }
    );
  }
}

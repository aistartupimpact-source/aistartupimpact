import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
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

    // Update tool status to ARCHIVED and claimStatus to REJECTED
    await sql`
      UPDATE "AiTool"
      SET
        status = 'ARCHIVED'::"ToolApprovalStatus",
        "claimStatus" = 'REJECTED',
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;

    logAuditEvent({ action: 'REJECT', resourceType: 'AI_TOOL', resourceId: id });

    return NextResponse.json({ success: true, message: 'Tool rejected successfully' });
  } catch (error: any) {
    console.error('Error rejecting tool:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reject tool' },
      { status: 500 }
    );
  }
}

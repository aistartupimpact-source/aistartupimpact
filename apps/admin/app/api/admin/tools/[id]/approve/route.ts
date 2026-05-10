import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Update tool status to APPROVED and claimStatus to CLAIMED
    await sql`
      UPDATE "AiTool"
      SET
        status = 'APPROVED'::"ToolApprovalStatus",
        "claimStatus" = 'CLAIMED',
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true, message: 'Tool approved successfully' });
  } catch (error: any) {
    console.error('Error approving tool:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to approve tool' },
      { status: 500 }
    );
  }
}

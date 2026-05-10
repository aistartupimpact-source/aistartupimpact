import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    return NextResponse.json({ success: true, message: 'Tool rejected successfully' });
  } catch (error: any) {
    console.error('Error rejecting tool:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reject tool' },
      { status: 500 }
    );
  }
}

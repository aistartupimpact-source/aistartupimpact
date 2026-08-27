import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@aistartupimpact/database';
import { requireApiAuth } from '@/lib/api-auth';
import { logAuditEvent } from '@/lib/audit-log';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireApiAuth(['SUPER_ADMIN']);
  if (error) return error;
  try {
    await prisma.indiaAIMissionTracker.delete({
      where: { id: params.id }
    });

    logAuditEvent({ action: 'DELETE', resourceType: 'INDIAAI_MISSION_TRACKER', resourceId: params.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting mission pillar:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete mission pillar' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@aistartupimpact/database';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update startup status to REJECTED
    await prisma.$executeRaw`
      UPDATE "Startup"
      SET "claimStatus" = 'REJECTED'::"ClaimStatus",
          "updatedAt" = NOW()
      WHERE id = ${params.id}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Reject startup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reject startup' },
      { status: 500 }
    );
  }
}

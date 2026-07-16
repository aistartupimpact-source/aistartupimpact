import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@aistartupimpact/database';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.indiaAIStats.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting statistic:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete statistic' },
      { status: 500 }
    );
  }
}

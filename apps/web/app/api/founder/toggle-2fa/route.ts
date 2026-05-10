import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';
import { requireFounderAuth } from '@/lib/founder-auth';

export async function POST(request: NextRequest) {
  try {
    const session = await requireFounderAuth();

    const body = await request.json();
    const { enable } = body;

    // Update 2FA status
    await prisma.founderUser.update({
      where: { id: session.userId },
      data: { twoFactorEnabled: enable },
    });

    return NextResponse.json({ 
      success: true, 
      enabled: enable,
      message: enable ? '2FA enabled successfully' : '2FA disabled successfully'
    });
  } catch (error) {
    console.error('Error toggling 2FA:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle 2FA' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';
import { requireFounderAuth } from '@/lib/founder-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await requireFounderAuth();

    // Get user's 2FA status
    const user = await prisma.founderUser.findUnique({
      where: { id: session.userId },
      select: { twoFactorEnabled: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      enabled: user.twoFactorEnabled 
    });
  } catch (error) {
    console.error('Error fetching 2FA status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch 2FA status' },
      { status: 500 }
    );
  }
}

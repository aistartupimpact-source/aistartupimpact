import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';
import bcrypt from 'bcryptjs';
import { requireFounderAuth, clearFounderSession } from '@/lib/founder-auth';
import { checkRateLimit, getClientIdentifier, strictRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const identifier = getClientIdentifier(request);
    const { success } = await checkRateLimit(strictRateLimit, identifier);
    if (!success) return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });

    const session = await requireFounderAuth();

    const body = await request.json().catch(() => ({}));
    const { password } = body as { password?: string };
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const user = await prisma.founderUser.findUnique({
      where: { id: session.userId },
      select: { passwordHash: true, deactivatedAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.deactivatedAt) {
      return NextResponse.json({ error: 'Account is already deactivated' }, { status: 400 });
    }

    if (user.passwordHash) {
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.founderUser.update({
        where: { id: session.userId },
        data: { deactivatedAt: new Date() },
      });

      await tx.startup.updateMany({
        where: { ownerId: session.userId },
        data: { isApproved: false },
      });

      await tx.founderSession.deleteMany({
        where: { userId: session.userId },
      });
    });

    await clearFounderSession();

    return NextResponse.json({ success: true, message: 'Account deactivated' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized - Please login') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Founder deactivation error:', error);
    return NextResponse.json({ error: 'Failed to deactivate account' }, { status: 500 });
  }
}

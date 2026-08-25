import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';
import bcrypt from 'bcryptjs';
import { setFounderSession } from '@/lib/founder-auth';
import { checkRateLimit, getClientIdentifier, strictRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const identifier = getClientIdentifier(request);
    const { success } = await checkRateLimit(strictRateLimit, identifier);
    if (!success) return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.founderUser.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true, passwordHash: true, deactivatedAt: true, onboardingCompleted: true, status: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json({ error: 'Account is suspended. Contact support.' }, { status: 403 });
    }

    if (!user.deactivatedAt) {
      return NextResponse.json({ error: 'Account is not deactivated' }, { status: 400 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await prisma.founderUser.update({
      where: { id: user.id },
      data: { deactivatedAt: null, lastLoginAt: new Date() },
    });

    await setFounderSession(user.id, user.email, user.name, user.onboardingCompleted);

    return NextResponse.json({
      success: true,
      message: 'Account reactivated. Your previously published content remains hidden — you can republish from your dashboard.',
    });
  } catch (error) {
    console.error('Founder reactivation error:', error);
    return NextResponse.json({ error: 'Reactivation failed' }, { status: 500 });
  }
}

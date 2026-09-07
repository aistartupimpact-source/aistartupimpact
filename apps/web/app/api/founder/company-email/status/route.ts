import { NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';
import { requireFounderAuth } from '@/lib/founder-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await requireFounderAuth();

    const founder = await prisma.founderUser.findUnique({
      where: { id: session.userId },
      select: { companyEmail: true, companyEmailVerified: true, companyEmailVerifiedAt: true, companyDomain: true },
    });

    if (!founder) {
      return NextResponse.json({ success: false, error: 'Account not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      companyEmail: founder.companyEmail,
      companyEmailVerified: founder.companyEmailVerified,
      companyEmailVerifiedAt: founder.companyEmailVerifiedAt,
      companyDomain: founder.companyDomain,
    });
  } catch (err: any) {
    if (err.message === 'Unauthorized - Please login') {
      return NextResponse.json({ success: false, error: 'Please sign in.' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Something went wrong.' }, { status: 500 });
  }
}

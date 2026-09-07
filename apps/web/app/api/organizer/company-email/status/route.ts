import { NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';
import { getOrganizerSession } from '@/lib/organizer-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getOrganizerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Please sign in.' }, { status: 401 });
    }

    const organizer = await prisma.eventOrganizer.findUnique({
      where: { id: session.id },
      select: { companyEmail: true, companyEmailVerified: true, companyEmailVerifiedAt: true, companyDomain: true },
    });

    if (!organizer) {
      return NextResponse.json({ success: false, error: 'Account not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      companyEmail: organizer.companyEmail,
      companyEmailVerified: organizer.companyEmailVerified,
      companyEmailVerifiedAt: organizer.companyEmailVerifiedAt,
      companyDomain: organizer.companyDomain,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Something went wrong.' }, { status: 500 });
  }
}

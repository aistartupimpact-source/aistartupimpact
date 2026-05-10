import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const startup = await prisma.startup.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        tagline: true,
        description: true,
        logoUrl: true,
        websiteUrl: true,
        linkedinUrl: true,
        twitterUrl: true,
        stage: true,
        foundedYear: true,
        headquartersCity: true,
        totalFundingInr: true,
        employeeCount: true,
        impactScore: true,
        isVerified: true,
        verifiedAt: true,
        verificationToken: true,
        verifiedDomain: true,
        claimedBy: true,
        claimedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!startup) {
      return NextResponse.json(
        { error: 'Startup not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(startup);
  } catch (error) {
    console.error('Error fetching startup:', error);
    return NextResponse.json(
      { error: 'Failed to fetch startup' },
      { status: 500 }
    );
  }
}

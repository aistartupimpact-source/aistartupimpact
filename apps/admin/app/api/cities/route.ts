import { NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cities = await prisma.indiaAICity.findMany({
      where: { isActive: true },
      orderBy: [
        { displayOrder: 'asc' },
        { totalStartups: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: cities,
    });
  } catch (error) {
    console.error('Error fetching admin cities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}

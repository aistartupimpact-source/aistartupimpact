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

    // Serialize BigInt/Decimal fields to JSON-safe values
    const serialized = cities.map(city => ({
      id: city.id,
      cityName: city.cityName,
      slug: city.slug,
      state: city.state,
      latitude: city.latitude ? Number(city.latitude) : null,
      longitude: city.longitude ? Number(city.longitude) : null,
      totalStartups: city.totalStartups,
      totalFunding: city.totalFunding ? Number(city.totalFunding) : 0,
      aliases: city.aliases,
      isActive: city.isActive,
      source: city.source || 'standard',
    }));

    return NextResponse.json({
      success: true,
      data: serialized,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      }
    });
  } catch (error) {
    console.error('Error fetching admin cities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}

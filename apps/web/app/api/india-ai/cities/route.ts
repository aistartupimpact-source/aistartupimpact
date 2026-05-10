import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const runtime = 'edge';
export const revalidate = 600; // Revalidate every 10 minutes

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    const cities = await sql`
      SELECT 
        id,
        "cityName",
        slug,
        state,
        latitude,
        longitude,
        "totalStartups",
        "totalFunding",
        "topSectors",
        "recentFundings",
        "keyAccelerators",
        "notableCompanies",
        "averageTeamSize",
        "averageFunding",
        description,
        "featuredImage",
        "isFeatured",
        "premiumPlacement",
        "displayOrder"
      FROM "IndiaAICity"
      WHERE "isActive" = true
      ORDER BY "displayOrder" ASC, "totalStartups" DESC
    `;

    return NextResponse.json({
      success: true,
      data: cities,
      count: cities.length,
    });
  } catch (error) {
    console.error('Error fetching India AI cities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const runtime = 'edge';
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    const hubs = await sql`
      SELECT 
        id,
        name,
        slug,
        type,
        city,
        description,
        "focusAreas",
        "phdPrograms",
        "researchPapers",
        "notableProjects",
        website,
        latitude,
        longitude,
        "displayOrder"
      FROM "ResearchHub"
      WHERE "isActive" = true
      ORDER BY "displayOrder" ASC, "phdPrograms" DESC NULLS LAST
    `;

    // Group by type
    const grouped = hubs.reduce((acc: any, hub: any) => {
      const type = hub.type || 'Other';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(hub);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        all: hubs,
        byType: grouped,
      },
      count: hubs.length,
    });
  } catch (error) {
    console.error('Error fetching research hubs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch research hubs' },
      { status: 500 }
    );
  }
}

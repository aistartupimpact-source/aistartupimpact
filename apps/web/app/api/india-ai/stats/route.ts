import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const runtime = 'edge';
export const revalidate = 300; // Revalidate every 5 minutes

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    const stats = await sql`
      SELECT 
        "metricKey",
        "metricLabel",
        "metricValue",
        "metricChange",
        "metricIcon",
        "displayOrder",
        "lastUpdated"
      FROM "IndiaAIStats"
      WHERE "isActive" = true
      ORDER BY "displayOrder" ASC
    `;

    return NextResponse.json({
      success: true,
      data: stats,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching India AI stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

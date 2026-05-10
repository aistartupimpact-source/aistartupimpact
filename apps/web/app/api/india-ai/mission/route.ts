import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const runtime = 'edge';
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    const mission = await sql`
      SELECT 
        id,
        component,
        "budgetAllocated",
        "budgetDisbursed",
        description,
        "keyInitiatives",
        "displayOrder"
      FROM "IndiaAIMissionTracker"
      WHERE "isActive" = true
      ORDER BY "displayOrder" ASC
    `;

    // Calculate totals
    const totalBudget = mission.reduce((sum, item) => sum + Number(item.budgetAllocated), 0);
    const totalDisbursed = mission.reduce((sum, item) => sum + Number(item.budgetDisbursed), 0);
    const disbursementPercentage = totalBudget > 0 ? (totalDisbursed / totalBudget) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        components: mission,
        summary: {
          totalBudget,
          totalDisbursed,
          disbursementPercentage: disbursementPercentage.toFixed(1),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching IndiaAI Mission data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mission data' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const runtime = 'edge';
export const revalidate = 3600; // Revalidate every hour

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const spotlight = searchParams.get('spotlight') === 'true';
    
    const sql = neon(process.env.DATABASE_URL!);
    
    let researchers;
    if (spotlight) {
      researchers = await sql`
        SELECT 
          id,
          name,
          slug,
          "profileImage",
          university,
          "researchHub",
          "researchAreas",
          bio,
          "hIndex",
          "citationCount",
          "notablePapers",
          "linkedinUrl",
          "googleScholarUrl",
          "twitterUrl",
          "displayOrder"
        FROM "AIResearcher"
        WHERE "isActive" = true AND "isSpotlight" = true
        ORDER BY "displayOrder" ASC, "citationCount" DESC NULLS LAST
        LIMIT 20
      `;
    } else {
      researchers = await sql`
        SELECT 
          id,
          name,
          slug,
          "profileImage",
          university,
          "researchHub",
          "researchAreas",
          bio,
          "hIndex",
          "citationCount",
          "displayOrder"
        FROM "AIResearcher"
        WHERE "isActive" = true
        ORDER BY "displayOrder" ASC, "citationCount" DESC NULLS LAST
        LIMIT 50
      `;
    }

    return NextResponse.json({
      success: true,
      data: researchers,
      count: researchers.length,
    });
  } catch (error) {
    console.error('Error fetching AI researchers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch researchers' },
      { status: 500 }
    );
  }
}

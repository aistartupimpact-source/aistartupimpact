import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get popular searches from the last N days
    const popularSearches = await sql`
      SELECT 
        "normalizedQuery" as query,
        COUNT(*) as "searchCount",
        COUNT(DISTINCT "sessionId") as "uniqueUsers",
        MAX("createdAt") as "lastSearchedAt"
      FROM "SearchQuery"
      WHERE "createdAt" >= NOW() - INTERVAL '${days} days'
      GROUP BY "normalizedQuery"
      HAVING COUNT(*) >= 2
      ORDER BY "searchCount" DESC, "uniqueUsers" DESC
      LIMIT ${limit}
    `;

    return NextResponse.json({
      popular: popularSearches.map((s: any) => ({
        query: s.query,
        searchCount: parseInt(s.searchCount),
        uniqueUsers: parseInt(s.uniqueUsers),
        lastSearchedAt: s.lastSearchedAt,
      })),
      period: `${days} days`,
    });

  } catch (error) {
    console.error('Popular searches API error:', error);
    return NextResponse.json(
      { popular: [], error: 'Failed to fetch popular searches' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() || '';
  
  if (q.length < 2) {
    return NextResponse.json({ cities: [] });
  }

  try {
    const searchTerm = `%${q.toLowerCase()}%`;
    const cities = await sql`
      SELECT id, slug, name, state, country
      FROM "City"
      WHERE LOWER(name) LIKE ${searchTerm}
        OR ${q.toLowerCase()} = ANY(aliases)
        OR LOWER(state) LIKE ${searchTerm}
      ORDER BY
        CASE WHEN LOWER(name) = ${q.toLowerCase()} THEN 0
             WHEN LOWER(name) LIKE ${q.toLowerCase() + '%'} THEN 1
             ELSE 2 END,
        name ASC
      LIMIT 10
    `;

    return NextResponse.json({ cities });
  } catch (error) {
    console.error('City search error:', error);
    return NextResponse.json({ cities: [] });
  }
}

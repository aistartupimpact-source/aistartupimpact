import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const pattern = `%${q}%`;
  const cities = await sql`
    SELECT id, name, state, country
    FROM "City"
    WHERE name ILIKE ${pattern}
       OR ${q} = ANY(aliases)
    ORDER BY
      CASE WHEN name ILIKE ${q + '%'} THEN 0 ELSE 1 END,
      name
    LIMIT 10
  `;

  return NextResponse.json(cities);
}

import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const rows = await sql`
      SELECT text, "mobileText", emoji, link
      FROM "SiteAnnouncement"
      WHERE "isActive" = true
        AND ("startsAt" IS NULL OR "startsAt" <= NOW())
        AND ("endsAt" IS NULL OR "endsAt" > NOW())
      ORDER BY "sortOrder"
      LIMIT 10
    `;

    return NextResponse.json(
      { announcements: rows },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch {
    return NextResponse.json({ announcements: [] }, { status: 500 });
  }
}

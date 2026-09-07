import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const highlights = await sql`
      SELECT id, title, description, date, link
      FROM newsletter_highlights
      WHERE is_active = true
      ORDER BY display_order ASC, created_at DESC
      LIMIT 3
    `;

    return NextResponse.json(
      { success: true, highlights },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching newsletter highlights:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch highlights' },
      { status: 500 }
    );
  }
}

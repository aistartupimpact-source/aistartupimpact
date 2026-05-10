import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const testimonials = await sql`
      SELECT id, name, role, company, avatar, quote, subscribed_duration
      FROM newsletter_testimonials
      WHERE is_active = true
      ORDER BY display_order ASC, created_at DESC
    `;

    return NextResponse.json(
      { success: true, testimonials },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

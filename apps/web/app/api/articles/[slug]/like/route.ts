import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const rows = await sql`
      UPDATE "Article" SET "likeCount" = COALESCE("likeCount", 0) + 1
      WHERE slug = ${params.slug} AND status = 'PUBLISHED'
      RETURNING "likeCount"
    `;
    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ likeCount: rows[0].likeCount });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

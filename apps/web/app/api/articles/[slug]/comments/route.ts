import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const rows = await sql`
      SELECT c.id, c.name, c.body, c."createdAt"::text AS "createdAt"
      FROM "Comment" c
      JOIN "Article" a ON a.id = c."articleId"
      WHERE a.slug = ${params.slug} AND c.status = 'APPROVED'
      ORDER BY c."createdAt" DESC
      LIMIT 50
    `;
    return NextResponse.json({ comments: rows });
  } catch (e) {
    return NextResponse.json({ comments: [] });
  }
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { name, body } = await req.json();
    if (!name?.trim() || !body?.trim()) {
      return NextResponse.json({ error: 'Name and comment are required' }, { status: 400 });
    }
    if (body.length > 1000) {
      return NextResponse.json({ error: 'Comment too long (max 1000 chars)' }, { status: 400 });
    }

    const article = await sql`SELECT id FROM "Article" WHERE slug = ${params.slug} AND status = 'PUBLISHED' LIMIT 1`;
    if (!article.length) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

    await sql`
      INSERT INTO "Comment" (id, "articleId", name, body, status, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${article[0].id}, ${name.trim().slice(0, 100)}, ${body.trim()}, 'PENDING', NOW(), NOW())
    `;
    return NextResponse.json({ success: true, message: 'Comment submitted for review' });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to submit comment' }, { status: 500 });
  }
}

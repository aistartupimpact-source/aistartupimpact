import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { apiRateLimit, checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { getUserSession } from '@/lib/user-session';

const COMMENT_MAX_LENGTH = 500;

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const rows = await sql`
      SELECT c.id, c.name, c.body, c."createdAt"::text AS "createdAt",
             wu.avatar
      FROM "Comment" c
      JOIN "Article" a ON a.id = c."articleId"
      LEFT JOIN "WebUser" wu ON wu.id = c."userId"
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
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Sign in to comment' }, { status: 401 });
    }

    const identifier = getClientIdentifier(req);
    const { success: allowed } = await checkRateLimit(apiRateLimit, identifier);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { body } = await req.json();
    if (!body?.trim()) {
      return NextResponse.json({ error: 'Comment is required' }, { status: 400 });
    }
    if (body.length > COMMENT_MAX_LENGTH) {
      return NextResponse.json({ error: `Comment must be ${COMMENT_MAX_LENGTH} characters or less` }, { status: 400 });
    }

    const article = await sql`SELECT id FROM "Article" WHERE slug = ${params.slug} AND status = 'PUBLISHED' LIMIT 1`;
    if (!article.length) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

    await sql`
      INSERT INTO "Comment" (id, "articleId", "userId", name, body, status, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${article[0].id}, ${session.id}, ${session.name.slice(0, 100)}, ${body.trim().slice(0, COMMENT_MAX_LENGTH)}, 'PENDING', NOW(), NOW())
    `;
    return NextResponse.json({ success: true, message: 'Comment submitted for review' });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to submit comment' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { createHash } from 'crypto';
import { sql } from '@/lib/db';
import { apiRateLimit, getClientIdentifier, checkRateLimit } from '@/lib/rate-limit';

const VOTE_SALT = process.env.VOTE_SALT || 'asi-opinion-vote-2026';

let redis: Redis | null = null;
function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

function hashIP(ip: string): string {
  return createHash('sha256').update(ip + VOTE_SALT).digest('hex');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const ip = getClientIdentifier(request);
  const rateCheck = await checkRateLimit(apiRateLimit, ip);
  if (!rateCheck.success) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  }

  let body: { action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const action = body.action;
  if (action !== 'agree' && action !== 'disagree') {
    return NextResponse.json({ error: 'action must be "agree" or "disagree"' }, { status: 400 });
  }

  const { slug } = params;

  // Verify article exists and is an opinion
  const articles: any[] = await sql`
    SELECT id FROM "Article"
    WHERE slug = ${slug} AND type = 'OPINION' AND status = 'PUBLISHED' AND "deletedAt" IS NULL
    LIMIT 1
  `;
  if (!articles.length) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }
  const articleId = articles[0].id;

  // Server-enforced vote restriction via Redis SET NX
  const client = getRedis();
  const hashedIP = hashIP(ip);
  const voteKey = `opinion-vote:${articleId}:${hashedIP}`;

  if (client) {
    const isNew = await client.set(voteKey, action, { nx: true, ex: 86400 });
    if (!isNew) {
      return NextResponse.json(
        { error: 'Already voted on this article', voted: true },
        { status: 429 }
      );
    }
  }

  // Atomic increment — column name is safe (derived from validated action, not user input)
  try {
    let updated: any[];
    if (action === 'agree') {
      updated = await sql`
        UPDATE "Article" SET "agreeCount" = "agreeCount" + 1
        WHERE id = ${articleId}
        RETURNING "agreeCount", "disagreeCount"
      `;
    } else {
      updated = await sql`
        UPDATE "Article" SET "disagreeCount" = "disagreeCount" + 1
        WHERE id = ${articleId}
        RETURNING "agreeCount", "disagreeCount"
      `;
    }

    if (!updated.length) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({
      agreeCount: updated[0].agreeCount,
      disagreeCount: updated[0].disagreeCount,
      voted: action,
    });
  } catch (e) {
    // Rollback Redis key on DB failure
    if (client) await client.del(voteKey).catch(() => {});
    console.error('Vote update error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

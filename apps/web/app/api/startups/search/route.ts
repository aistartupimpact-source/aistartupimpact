import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() || '';
  const stage = searchParams.get('stage') || '';
  const category = searchParams.get('category') || '';
  const businessType = searchParams.get('businessType') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = 12;
  const offset = (page - 1) * limit;

  try {
    let rows: any[];
    let countRows: any[];

    if (q) {
      // Full-text search using tsvector — handles millions of rows via GIN index
      const tsQuery = q.split(/\s+/).filter(Boolean).map(w => w + ':*').join(' & ');

      rows = await sql`
        SELECT s.id, s.name, s.slug, s.tagline, s."logoUrl", s.stage,
               s."headquartersCity", s."isFeatured", s."isVerified",
               s."employeeCount", s."foundedYear", s.category, s."businessType", s.founders,
               COALESCE(SUM(fr."amountUsd") / 100, 0) AS "totalUsd",
               ts_rank(s."searchVector", to_tsquery('english', ${tsQuery})) AS rank
        FROM "Startup" s
        LEFT JOIN "FundingRound" fr ON fr."startupId" = s.id
        WHERE s."deletedAt" IS NULL
          AND s."searchVector" @@ to_tsquery('english', ${tsQuery})
          ${stage ? sql`AND s.stage = ${stage}::"StartupStage"` : sql``}
          ${category ? sql`AND s.category = ${category}` : sql``}
          ${businessType ? sql`AND s."businessType" = ${businessType}` : sql``}
        GROUP BY s.id
        ORDER BY rank DESC, s."isFeatured" DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countRows = await sql`
        SELECT COUNT(*) FROM "Startup" s
        WHERE s."deletedAt" IS NULL
          AND s."searchVector" @@ to_tsquery('english', ${tsQuery})
          ${stage ? sql`AND s.stage = ${stage}::"StartupStage"` : sql``}
          ${category ? sql`AND s.category = ${category}` : sql``}
          ${businessType ? sql`AND s."businessType" = ${businessType}` : sql``}
      `;
    } else {
      rows = await sql`
        SELECT s.id, s.name, s.slug, s.tagline, s."logoUrl", s.stage,
               s."headquartersCity", s."isFeatured", s."isVerified",
               s."employeeCount", s."foundedYear", s.category, s."businessType", s.founders,
               COALESCE(SUM(fr."amountUsd") / 100, 0) AS "totalUsd"
        FROM "Startup" s
        LEFT JOIN "FundingRound" fr ON fr."startupId" = s.id
        WHERE s."deletedAt" IS NULL
          ${stage ? sql`AND s.stage = ${stage}::"StartupStage"` : sql``}
          ${category ? sql`AND s.category = ${category}` : sql``}
          ${businessType ? sql`AND s."businessType" = ${businessType}` : sql``}
        GROUP BY s.id
        ORDER BY s."isFeatured" DESC, s."createdAt" DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countRows = await sql`
        SELECT COUNT(*) FROM "Startup" s
        WHERE s."deletedAt" IS NULL
          ${stage ? sql`AND s.stage = ${stage}::"StartupStage"` : sql``}
          ${category ? sql`AND s.category = ${category}` : sql``}
          ${businessType ? sql`AND s."businessType" = ${businessType}` : sql``}
      `;
    }

    const total = parseInt((countRows[0] as any).count || '0');
    return NextResponse.json({ startups: rows, total, page, pages: Math.ceil(total / limit) });
  } catch (e: any) {
    console.error('startup search error:', e);
    return NextResponse.json({ startups: [], total: 0, page: 1, pages: 0 });
  }
}

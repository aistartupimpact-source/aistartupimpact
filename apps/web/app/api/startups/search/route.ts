import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() || '';
  const stage = searchParams.get('stage') || '';
  const category = searchParams.get('category') || '';
  const businessType = searchParams.get('businessType') || '';
  const status = searchParams.get('status') || '';
  const city = searchParams.get('city') || '';
  const country = searchParams.get('country') || '';
  const employeeRange = searchParams.get('employeeRange') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(500, Math.max(1, parseInt(searchParams.get('limit') || '12')));
  const offset = (page - 1) * limit;

  try {
    let rows: any[];
    let countRows: any[];

    // Construct SQL clauses for new filters
    const statusFilter = status ? sql`AND s.status = ${status}::"CompanyStatus"` : sql``;
    const cityFilter = city ? sql`AND s."headquartersCity" = ${city}` : sql``;
    const countryFilter = country === 'India' 
      ? sql`AND s."isIndian" = true` 
      : country === 'International' 
      ? sql`AND s."isIndian" = false` 
      : sql``;
    
    let employeeFilter = sql``;
    if (employeeRange === '1-10') {
      employeeFilter = sql`AND (s."employeeCount" >= 1 AND s."employeeCount" <= 10 OR s."employeeCount" IS NULL)`;
    } else if (employeeRange === '11-50') {
      employeeFilter = sql`AND s."employeeCount" >= 11 AND s."employeeCount" <= 50`;
    } else if (employeeRange === '51-200') {
      employeeFilter = sql`AND s."employeeCount" >= 51 AND s."employeeCount" <= 200`;
    } else if (employeeRange === '201-500') {
      employeeFilter = sql`AND s."employeeCount" >= 201 AND s."employeeCount" <= 500`;
    } else if (employeeRange === '500+') {
      employeeFilter = sql`AND s."employeeCount" > 500`;
    }

    if (q) {
      // Full-text search using tsvector — handles millions of rows via GIN index
      const tsQuery = q.split(/\s+/).filter(Boolean).map(w => w + ':*').join(' & ');

      rows = await sql`
        SELECT s.id, s.name, s.slug, s.tagline, s."logoUrl", s.stage, s.status,
               s."headquartersCity", s."isFeatured", s."isVerified",
               s."employeeCount", s."foundedYear", s.category, s."businessType", s.founders,
               COALESCE(SUM(fr."amountUsd") / 100, 0) AS "totalUsd",
               ts_rank(s."searchVector", to_tsquery('english', ${tsQuery})) AS rank
        FROM "Startup" s
        LEFT JOIN "FundingRound" fr ON fr."startupId" = s.id
        WHERE s."deletedAt" IS NULL
          AND s."isApproved" = true
          AND s."searchVector" @@ to_tsquery('english', ${tsQuery})
          ${stage ? sql`AND s.stage = ${stage}::"StartupStage"` : sql``}
          ${category ? sql`AND s.category = ${category}` : sql``}
          ${businessType ? sql`AND s."businessType" = ${businessType}` : sql``}
          ${statusFilter}
          ${cityFilter}
          ${countryFilter}
          ${employeeFilter}
        GROUP BY s.id
        ORDER BY rank DESC, s."isFeatured" DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countRows = await sql`
        SELECT COUNT(*) FROM "Startup" s
        WHERE s."deletedAt" IS NULL
          AND s."isApproved" = true
          AND s."searchVector" @@ to_tsquery('english', ${tsQuery})
          ${stage ? sql`AND s.stage = ${stage}::"StartupStage"` : sql``}
          ${category ? sql`AND s.category = ${category}` : sql``}
          ${businessType ? sql`AND s."businessType" = ${businessType}` : sql``}
          ${statusFilter}
          ${cityFilter}
          ${countryFilter}
          ${employeeFilter}
      `;
    } else {
      rows = await sql`
        SELECT s.id, s.name, s.slug, s.tagline, s."logoUrl", s.stage, s.status,
               s."headquartersCity", s."isFeatured", s."isVerified",
               s."employeeCount", s."foundedYear", s.category, s."businessType", s.founders,
               COALESCE(SUM(fr."amountUsd") / 100, 0) AS "totalUsd",
               CASE WHEN fc.id IS NOT NULL THEN true ELSE false END AS "isCurrentlyFeatured",
               fc.tier AS "featuredTier"
        FROM "Startup" s
        LEFT JOIN "FundingRound" fr ON fr."startupId" = s.id
        LEFT JOIN "FeaturedCampaign" fc ON fc."startupId" = s.id
          AND fc."cancelledAt" IS NULL
          AND fc."startDate" <= NOW() AND fc."endDate" >= NOW()
        WHERE s."deletedAt" IS NULL
          AND s."isApproved" = true
          ${stage ? sql`AND s.stage = ${stage}::"StartupStage"` : sql``}
          ${category ? sql`AND s.category = ${category}` : sql``}
          ${businessType ? sql`AND s."businessType" = ${businessType}` : sql``}
          ${statusFilter}
          ${cityFilter}
          ${countryFilter}
          ${employeeFilter}
        GROUP BY s.id, fc.id, fc.tier
        ORDER BY
          CASE WHEN fc.tier = 'PREMIUM' THEN 1
               WHEN fc.tier = 'STANDARD' THEN 2
               WHEN fc.tier = 'BASIC' THEN 3
               WHEN s."isFeatured" = true THEN 3
               ELSE 4 END ASC,
          s."createdAt" DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countRows = await sql`
        SELECT COUNT(*) FROM "Startup" s
        WHERE s."deletedAt" IS NULL
          AND s."isApproved" = true
          ${stage ? sql`AND s.stage = ${stage}::"StartupStage"` : sql``}
          ${category ? sql`AND s.category = ${category}` : sql``}
          ${businessType ? sql`AND s."businessType" = ${businessType}` : sql``}
          ${statusFilter}
          ${cityFilter}
          ${countryFilter}
          ${employeeFilter}
      `;
    }

    const total = parseInt((countRows[0] as any).count || '0');
    return NextResponse.json({ startups: rows, total, page, pages: Math.ceil(total / limit) });
  } catch (e: any) {
    console.error('startup search error:', e);
    return NextResponse.json({ startups: [], total: 0, page: 1, pages: 0 });
  }
}

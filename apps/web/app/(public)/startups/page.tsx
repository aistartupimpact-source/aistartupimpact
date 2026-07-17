import Link from 'next/link';
import { Metadata } from 'next';
import { sql } from '@/lib/db';
import { Suspense } from 'react';
import StartupSearch from '@/components/StartupSearch';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Indian AI Startup Directory — Browse & Discover',
  description: 'Browse 1000+ Indian AI startups. Filter by stage, search by name, tagline or city.',
  alternates: { canonical: 'https://aistartupimpact.com/startups' },
};

async function getUniqueCities() {
  try {
    const rows = await sql`
      SELECT "headquartersCity" AS city, COUNT(*) as count
      FROM "Startup"
      WHERE "deletedAt" IS NULL 
        AND "isApproved" = true 
        AND "headquartersCity" IS NOT NULL 
        AND "headquartersCity" != ''
      GROUP BY "headquartersCity"
      ORDER BY count DESC
      LIMIT 20
    `;
    return rows.map((r: any) => r.city);
  } catch (e) {
    console.error('getUniqueCities error:', e);
    return ['Bengaluru', 'Mumbai', 'Delhi', 'Gurugram', 'Noida', 'Hyderabad', 'Pune', 'Chennai'];
  }
}

async function getInitialStartups(
  q?: string,
  stage?: string,
  category?: string,
  businessType?: string,
  status?: string,
  city?: string,
  country?: string,
  employeeRange?: string
) {
  try {
    const limit = 500;
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
      const tsQuery = q.split(/\s+/).filter(Boolean).map((w: string) => w + ':*').join(' & ');
      
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
        LIMIT ${limit}
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
        LIMIT ${limit}
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

    return { startups: rows, total: parseInt((countRows[0] as any).count || '0') };
  } catch (e) {
    console.error('getInitialStartups error:', e);
    return { startups: [], total: 0 };
  }
}

export default async function StartupsPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    stage?: string;
    category?: string;
    businessType?: string;
    status?: string;
    city?: string;
    country?: string;
    employeeRange?: string;
  };
}) {
  const [cities, { startups, total }] = await Promise.all([
    getUniqueCities(),
    getInitialStartups(
      searchParams.q,
      searchParams.stage,
      searchParams.category,
      searchParams.businessType,
      searchParams.status,
      searchParams.city,
      searchParams.country,
      searchParams.employeeRange
    ),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="mb-5 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-sora font-extrabold text-xl sm:text-3xl md:text-4xl text-navy dark:text-white leading-tight tracking-tight">
            Discover AI startups.{' '}
            <span className="text-brand">Before everyone else.</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-jakarta text-xs sm:text-sm max-w-2xl mt-1.5 sm:mt-2">
            Browse {total}+ startups by sector, stage, and city — from bootstrapped to Series C, across the globe.
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
        <StartupSearch
          initialStartups={startups as any}
          initialTotal={total}
          cities={cities}
        />
      </Suspense>
    </div>
  );
}

import Link from 'next/link';
import { Metadata } from 'next';
import { Plus } from 'lucide-react';
import { sql } from '@/lib/db';
import { Suspense } from 'react';
import StartupSearch from '@/components/StartupSearch';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Indian AI Startup Directory — Browse & Discover',
  description: 'Browse 1000+ Indian AI startups. Filter by stage, search by name, tagline or city.',
  alternates: { canonical: 'https://aistartupimpact.com/startups' },
};

async function getInitialStartups(q?: string, stage?: string, category?: string, businessType?: string) {
  try {
    const limit = 12;
    let rows: any[];
    let countRows: any[];

    if (q) {
      const tsQuery = q.split(/\s+/).filter(Boolean).map((w: string) => w + ':*').join(' & ');
      
      // Build query with optional filters
      let queryConditions = `s."deletedAt" IS NULL AND s."searchVector" @@ to_tsquery('english', '${tsQuery}')`;
      if (stage) queryConditions += ` AND s.stage = '${stage}'::"StartupStage"`;
      if (category) queryConditions += ` AND s.category = '${category}'`;
      if (businessType) queryConditions += ` AND s."businessType" = '${businessType}'`;
      
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
        LIMIT ${limit}
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
        LIMIT ${limit}
      `;
      
      countRows = await sql`
        SELECT COUNT(*) FROM "Startup" s
        WHERE s."deletedAt" IS NULL
          ${stage ? sql`AND s.stage = ${stage}::"StartupStage"` : sql``}
          ${category ? sql`AND s.category = ${category}` : sql``}
          ${businessType ? sql`AND s."businessType" = ${businessType}` : sql``}
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
  searchParams: { q?: string; stage?: string; category?: string; businessType?: string };
}) {
  const { startups, total } = await getInitialStartups(
    searchParams.q, 
    searchParams.stage,
    searchParams.category,
    searchParams.businessType
  );

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
        <Link href="/startups/submit"
          className="flex items-center gap-2 bg-brand text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold font-jakarta text-xs sm:text-sm hover:scale-105 transition-transform shadow-lg shadow-brand/20 whitespace-nowrap shrink-0">
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> List Your Startup
        </Link>
      </div>

      <Suspense fallback={<div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
        <StartupSearch initialStartups={startups as any} initialTotal={total} />
      </Suspense>
    </div>
  );
}

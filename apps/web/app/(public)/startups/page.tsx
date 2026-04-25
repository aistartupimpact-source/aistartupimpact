import Link from 'next/link';
import { Metadata } from 'next';
import { Building2, Plus } from 'lucide-react';
import { sql } from '@/lib/db';
import { Suspense } from 'react';
import StartupSearch from '@/components/StartupSearch';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Indian AI Startup Directory — Browse & Discover',
  description: 'Browse 1000+ Indian AI startups. Filter by stage, search by name, tagline or city.',
  alternates: { canonical: 'https://aistartupimpact.com/startups' },
};

async function getInitialStartups(q?: string, stage?: string) {
  try {
    const limit = 12;
    let rows: any[];
    let countRows: any[];

    if (q) {
      const tsQuery = q.split(/\s+/).filter(Boolean).map((w: string) => w + ':*').join(' & ');
      rows = await sql`
        SELECT s.id, s.name, s.slug, s.tagline, s."logoUrl", s.stage,
               s."headquartersCity", s."isFeatured",
               COALESCE(SUM(fr."amountUsd") / 100, 0) AS "totalUsd",
               ts_rank(s.search_vector, to_tsquery('english', ${tsQuery})) AS rank
        FROM "Startup" s
        LEFT JOIN "FundingRound" fr ON fr."startupId" = s.id
        WHERE s."deletedAt" IS NULL
          AND s.search_vector @@ to_tsquery('english', ${tsQuery})
          ${stage ? sql`AND s.stage = ${stage}::"StartupStage"` : sql``}
        GROUP BY s.id
        ORDER BY rank DESC, s."isFeatured" DESC
        LIMIT ${limit}
      `;
      countRows = await sql`
        SELECT COUNT(*) FROM "Startup"
        WHERE "deletedAt" IS NULL
          AND search_vector @@ to_tsquery('english', ${tsQuery})
          ${stage ? sql`AND stage = ${stage}::"StartupStage"` : sql``}
      `;
    } else if (stage) {
      rows = await sql`
        SELECT s.id, s.name, s.slug, s.tagline, s."logoUrl", s.stage,
               s."headquartersCity", s."isFeatured",
               COALESCE(SUM(fr."amountUsd") / 100, 0) AS "totalUsd"
        FROM "Startup" s
        LEFT JOIN "FundingRound" fr ON fr."startupId" = s.id
        WHERE s."deletedAt" IS NULL AND s.stage = ${stage}::"StartupStage"
        GROUP BY s.id
        ORDER BY s."isFeatured" DESC, s."createdAt" DESC
        LIMIT ${limit}
      `;
      countRows = await sql`SELECT COUNT(*) FROM "Startup" WHERE "deletedAt" IS NULL AND stage = ${stage}::"StartupStage"`;
    } else {
      rows = await sql`
        SELECT s.id, s.name, s.slug, s.tagline, s."logoUrl", s.stage,
               s."headquartersCity", s."isFeatured",
               COALESCE(SUM(fr."amountUsd") / 100, 0) AS "totalUsd"
        FROM "Startup" s
        LEFT JOIN "FundingRound" fr ON fr."startupId" = s.id
        WHERE s."deletedAt" IS NULL
        GROUP BY s.id
        ORDER BY s."isFeatured" DESC, s."createdAt" DESC
        LIMIT ${limit}
      `;
      countRows = await sql`SELECT COUNT(*) FROM "Startup" WHERE "deletedAt" IS NULL`;
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
  searchParams: { q?: string; stage?: string };
}) {
  const { startups, total } = await getInitialStartups(searchParams.q, searchParams.stage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Building2 className="w-6 h-6 text-brand" />
            <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-navy dark:text-white">
              Startup Directory
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm">
            Indian AI startups — search by name, tagline, city or filter by stage.
          </p>
        </div>
        <Link href="/startups/submit"
          className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl font-bold font-jakarta text-sm hover:scale-105 transition-transform shadow-lg shadow-brand/20 whitespace-nowrap">
          <Plus className="w-4 h-4" /> List Your Startup
        </Link>
      </div>

      <Suspense fallback={<div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
        <StartupSearch initialStartups={startups as any} initialTotal={total} />
      </Suspense>
    </div>
  );
}

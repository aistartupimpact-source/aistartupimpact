import { requireFounderAuth } from '@/lib/founder-auth';
import { prisma } from '@aistartupimpact/database';
import { notFound, redirect } from 'next/navigation';
import StartupEditForm from '@/components/founder/StartupEditForm';
import FundingRoundsManager from '@/components/founder/FundingRoundsManager';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function EditStartupPage({ params }: PageProps) {
  const session = await requireFounderAuth();

  // Fetch startup using raw query to avoid serialization issues
  // Try with category column, fallback if it doesn't exist
  let startups;
  try {
    startups = await prisma.$queryRaw<any[]>`
      SELECT 
        id, name, slug, tagline, description, "websiteUrl", "logoUrl",
        stage, "totalFundingInr", "foundedYear",
        "linkedinUrl", "twitterUrl", "claimStatus",
        "headquartersCity", "employeeCount", founders, "ownerId", category
      FROM "Startup"
      WHERE slug = ${params.slug}
      LIMIT 1
    `;
  } catch (error: any) {
    // If category column doesn't exist, fetch without it
    if (error.message?.includes('category') || error.message?.includes('column')) {
      startups = await prisma.$queryRaw<any[]>`
        SELECT 
          id, name, slug, tagline, description, "websiteUrl", "logoUrl",
          stage, "totalFundingInr", "foundedYear",
          "linkedinUrl", "twitterUrl", "claimStatus",
          "headquartersCity", "employeeCount", founders, "ownerId"
        FROM "Startup"
        WHERE slug = ${params.slug}
        LIMIT 1
      `;
    } else {
      throw error;
    }
  }

  const startup = startups[0];

  // Check if startup exists
  if (!startup) {
    notFound();
  }

  // Check if user owns this startup
  if (startup.ownerId !== session.userId) {
    redirect('/founder/startups');
  }

  // Fetch funding rounds
  const fundingRounds = await sql`
    SELECT 
      id, "roundType", "amountInr", "amountUsd",
      "announcedAt"::text AS "announcedAt",
      "leadInvestors", "allInvestors"
    FROM "FundingRound"
    WHERE "startupId" = ${startup.id}
    ORDER BY "announcedAt" DESC
  `;

  // Serialize the startup data for client component
  const serializedStartup = {
    id: startup.id,
    name: startup.name,
    slug: startup.slug,
    tagline: startup.tagline,
    description: startup.description,
    websiteUrl: startup.websiteUrl,
    logoUrl: startup.logoUrl,
    stage: startup.stage,
    totalFundingInr: startup.totalFundingInr,
    foundedYear: startup.foundedYear,
    linkedinUrl: startup.linkedinUrl,
    twitterUrl: startup.twitterUrl,
    claimStatus: startup.claimStatus,
    headquartersCity: startup.headquartersCity,
    employeeCount: startup.employeeCount,
    founders: startup.founders || [],
    category: startup.category,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Edit Startup
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Update your startup information. Changes will be reviewed by our team before going live.
        </p>
      </div>

      {/* Status Badge */}
      {startup.claimStatus === 'PENDING' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-400">
            ⏳ This startup is currently under review. You can still make changes.
          </p>
        </div>
      )}

      {startup.claimStatus === 'REJECTED' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-400">
            ❌ This startup was rejected. Please review the feedback and resubmit.
          </p>
        </div>
      )}

      {startup.claimStatus === 'CLAIMED' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-400">
            ℹ️ This startup is live. Any changes will require re-approval.
          </p>
        </div>
      )}

      {/* Form */}
      <StartupEditForm startup={serializedStartup} />

      {/* Funding Rounds Manager */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <FundingRoundsManager 
          startupId={startup.id} 
          existingRounds={fundingRounds}
        />
      </div>
    </div>
  );
}

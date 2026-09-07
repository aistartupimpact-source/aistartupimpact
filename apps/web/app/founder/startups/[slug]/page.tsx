import { requireFounderAuth } from '@/lib/founder-auth';
import { prisma } from '@aistartupimpact/database';
import { notFound, redirect } from 'next/navigation';
import StartupEditForm from '@/components/founder/StartupEditForm';
import SlugEditor from '@/components/shared/SlugEditor';
import { sql } from '@/lib/db';
interface PageProps {
  params: {
    slug: string;
  };
}

export default async function EditStartupPage({ params }: PageProps) {
  const session = await requireFounderAuth();

  // Fetch startup with all fields including foundersData
  let startups;
  try {
    startups = await prisma.$queryRaw<any[]>`
      SELECT 
        id, name, slug, tagline, description, "websiteUrl", "logoUrl",
        stage, "totalFundingInr", "foundedYear",
        "linkedinUrl", "twitterUrl", "claimStatus",
        "headquartersCity", "employeeCount", founders, "foundersData", "ownerId", category, "businessType",
        "slugChangedAt"::text AS "slugChangedAt"
      FROM "Startup"
      WHERE slug = ${params.slug}
      LIMIT 1
    `;
  } catch (error: any) {
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
  }

  const startup = startups[0];
  if (!startup) notFound();
  if (startup.ownerId !== session.userId) redirect('/founder/startups');

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

  // Fetch FAQs
  const faqs = await sql`
    SELECT id, "startupId", question, answer, "order"
    FROM "StartupFAQ"
    WHERE "startupId" = ${startup.id}
    ORDER BY "order" ASC
  `;

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
    foundersData: startup.foundersData || [],
    category: startup.category || '',
    businessType: startup.businessType || '',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Startup</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Update your startup information. Changes will be reviewed by our team before going live.
        </p>
      </div>

      {startup.claimStatus === 'PENDING' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-400">⏳ This startup is under review. You can still make changes.</p>
        </div>
      )}
      {startup.claimStatus === 'REJECTED' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-400">❌ This startup was rejected. Please review and resubmit.</p>
        </div>
      )}
      {startup.claimStatus === 'CLAIMED' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-400">ℹ️ This startup is live. Any changes will require re-approval.</p>
        </div>
      )}

      <StartupEditForm
        startup={serializedStartup}
        existingFaqs={faqs}
        existingFundingRounds={fundingRounds}
      />

      {/* Profile URL Editor — LinkedIn-style, 45-day cooldown */}
      <div className="card p-5 sm:p-6">
        <h2 className="font-sora font-bold text-sm text-navy dark:text-white mb-4">Profile URL</h2>
        <SlugEditor
          currentSlug={startup.slug}
          slugChangedAt={startup.slugChangedAt}
          entityType="startup"
          entityId={startup.id}
          baseUrl="https://aistartupimpact.com/startups"
          isAdmin={false}
        />
      </div>
    </div>
  );
}

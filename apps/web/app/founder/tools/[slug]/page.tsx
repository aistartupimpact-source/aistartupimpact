import { requireFounderAuth } from '@/lib/founder-auth';
import { prisma } from '@aistartupimpact/database';
import { notFound, redirect } from 'next/navigation';
import ToolEditForm from '@/components/founder/ToolEditForm';

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function EditToolPage({ params }: PageProps) {
  const session = await requireFounderAuth();

  // Fetch tool using raw query to avoid serialization issues
  const tools = await prisma.$queryRaw<any[]>`
    SELECT 
      id, name, slug, tagline, description, "websiteUrl", "logoUrl",
      "pricingModel", "startingPrice", "pricingUrl", "affiliateUrl",
      "categoryId", status, "claimStatus", "ownerId",
      "hasApi", "hasMobileApp", "launchYear", "founderNames", "headquartersCountry",
      "screenshotUrls"
    FROM "AiTool"
    WHERE slug = ${params.slug}
    LIMIT 1
  `;

  const tool = tools[0];

  // Check if tool exists
  if (!tool) {
    notFound();
  }

  // Check if user owns this tool
  if (tool.ownerId !== session.userId) {
    redirect('/founder/tools');
  }

  // Fetch use cases separately
  const useCases = await prisma.$queryRaw<any[]>`
    SELECT id, text
    FROM "ToolUseCase"
    WHERE "toolId" = ${tool.id}
  `;

  // Fetch FAQs separately
  const faqs = await prisma.$queryRaw<any[]>`
    SELECT id, question, answer, "order"
    FROM "ToolFAQ"
    WHERE "toolId" = ${tool.id}
    ORDER BY "order" ASC
  `;

  // Serialize the tool data for client component
  const serializedTool = {
    id: tool.id,
    name: tool.name,
    slug: tool.slug,
    tagline: tool.tagline,
    description: tool.description,
    websiteUrl: tool.websiteUrl,
    logoUrl: tool.logoUrl,
    pricingModel: tool.pricingModel,
    pricingUrl: tool.pricingUrl,
    affiliateUrl: tool.affiliateUrl,
    startingPrice: tool.startingPrice,
    categoryId: tool.categoryId,
    status: tool.status,
    claimStatus: tool.claimStatus,
    hasApi: tool.hasApi,
    hasMobileApp: tool.hasMobileApp,
    launchYear: tool.launchYear,
    founderNames: tool.founderNames,
    headquartersCountry: tool.headquartersCountry,
    screenshotUrls: tool.screenshotUrls,
    useCases: useCases.map(uc => ({
      id: uc.id,
      text: uc.text,
    })),
    faqs: faqs.map(faq => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      order: faq.order,
    })),
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Edit Tool
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Update your tool information. Changes will be reviewed by our team before going live.
        </p>
      </div>

      {/* Status Badge */}
      {tool.claimStatus === 'PENDING' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-400">
            ⏳ This tool is currently under review. You can still make changes.
          </p>
        </div>
      )}

      {tool.claimStatus === 'REJECTED' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-400">
            ❌ This tool was rejected. Please review the feedback and resubmit.
          </p>
        </div>
      )}

      {tool.claimStatus === 'CLAIMED' && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm text-green-800 dark:text-green-400">
            ✅ This tool is live. You can edit anytime without needing re-approval.
          </p>
        </div>
      )}

      {/* Form */}
      <ToolEditForm tool={serializedTool} />
    </div>
  );
}

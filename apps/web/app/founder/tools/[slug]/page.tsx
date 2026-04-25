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

  // Fetch tool with use cases
  const tool = await prisma.aiTool.findUnique({
    where: { id: params.slug },
    include: {
      useCases: true,
    },
  });

  // Check if tool exists
  if (!tool) {
    notFound();
  }

  // Check if user owns this tool
  if (tool.ownerId !== session.userId) {
    redirect('/founder/tools');
  }

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
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-400">
            ℹ️ This tool is live. Any changes will require re-approval.
          </p>
        </div>
      )}

      {/* Form */}
      <ToolEditForm tool={tool} />
    </div>
  );
}

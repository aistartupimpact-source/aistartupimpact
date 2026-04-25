import { requireFounderAuth } from '@/lib/founder-auth';
import { prisma } from '@aistartupimpact/database';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import ListingCard from '@/components/founder/ListingCard';

export default async function ToolsPage() {
  const session = await requireFounderAuth();

  // Fetch all tools owned by this founder
  const tools = await prisma.aiTool.findMany({
    where: { ownerId: session.userId },
    orderBy: { createdAt: 'desc' },
  });

  // Group by status
  const pending = tools.filter(t => t.claimStatus === 'PENDING');
  const live = tools.filter(t => t.claimStatus === 'CLAIMED' || t.claimStatus === 'VERIFIED');
  const rejected = tools.filter(t => t.claimStatus === 'REJECTED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Tools
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your AI tool listings
          </p>
        </div>
        <Link
          href="/founder/tools/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand/90 text-white font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Submit Tool
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{tools.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Live</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{live.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pending.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rejected</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{rejected.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tools..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <Filter className="w-5 h-5" />
          Filter
        </button>
      </div>

      {/* Listings */}
      {tools.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400 dark:text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No tools yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Submit your first AI tool to get featured on AI Startup Impact
          </p>
          <Link
            href="/founder/tools/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand/90 text-white font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Submit Your First Tool
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tools.map((tool) => (
            <ListingCard
              key={tool.id}
              id={tool.id}
              name={tool.name}
              tagline={tool.tagline}
              logoUrl={tool.logoUrl}
              status={tool.claimStatus}
              type="tool"
            />
          ))}
        </div>
      )}
    </div>
  );
}

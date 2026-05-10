import { requireFounderAuth } from '@/lib/founder-auth';
import { prisma } from '@aistartupimpact/database';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import ListingCard from '@/components/founder/ListingCard';

// Revalidate every 10 seconds to show fresh data
export const revalidate = 10;

export default async function StartupsPage() {
  const session = await requireFounderAuth();

  // Fetch all startups owned by this founder using raw query
  const startups = await prisma.$queryRaw<any[]>`
    SELECT 
      id, name, slug, tagline, "logoUrl", "claimStatus", "isVerified"
    FROM "Startup"
    WHERE "ownerId" = ${session.userId}
      AND "deletedAt" IS NULL
    ORDER BY "createdAt" DESC
  `;

  // Group by status
  const pending = startups.filter(s => s.claimStatus === 'PENDING');
  const live = startups.filter(s => s.claimStatus === 'CLAIMED' || s.claimStatus === 'VERIFIED');
  const rejected = startups.filter(s => s.claimStatus === 'REJECTED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            My Startups
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your startup listings
          </p>
        </div>
        <Link
          href="/founder/startups/new"
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Submit Startup
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Total</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{startups.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Live</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{live.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Pending</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{pending.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Rejected</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{rejected.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search startups..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-700 focus:border-gray-300 dark:focus:border-gray-700"
          />
        </div>
        <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Listings */}
      {startups.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <Plus className="w-6 h-6 text-gray-400 dark:text-gray-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            No startups yet
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Submit your first startup to get featured on AI Startup Impact
          </p>
          <Link
            href="/founder/startups/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Submit Your First Startup
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {startups.map((startup) => (
            <ListingCard
              key={startup.id}
              id={startup.id}
              slug={startup.slug}
              name={startup.name}
              tagline={startup.tagline}
              logoUrl={startup.logoUrl}
              status={startup.claimStatus}
              type="startup"
              isVerified={startup.isVerified || false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

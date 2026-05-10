import { requireFounderAuth } from '@/lib/founder-auth';
import { neon } from '@neondatabase/serverless';
import { Rocket, Wrench, Eye, MousePointerClick, Plus, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import StatCard from '@/components/founder/StatCard';
import ListingCard from '@/components/founder/ListingCard';

const sql = neon(process.env.DATABASE_URL!);

// Revalidate every 10 seconds to show fresh data
export const revalidate = 10;

export default async function DashboardPage() {
  const session = await requireFounderAuth();

  // Fetch founder's data with raw SQL
  const [startups, tools, currentMonth, lastMonth] = await Promise.all([
    // Get startups
    sql`
      SELECT id, name, slug, tagline, "logoUrl", "claimStatus", "isVerified", "createdAt"
      FROM "Startup"
      WHERE "ownerId" = ${session.userId}
        AND "deletedAt" IS NULL
      ORDER BY "createdAt" DESC
      LIMIT 5
    `,
    
    // Get tools
    sql`
      SELECT id, name, slug, tagline, "logoUrl", status AS "claimStatus", "createdAt"
      FROM "AiTool"
      WHERE "ownerId" = ${session.userId}
        AND "deletedAt" IS NULL
      ORDER BY "createdAt" DESC
      LIMIT 5
    `,
    
    // Get current month analytics
    sql`
      SELECT 
        COALESCE(SUM(views), 0) AS "totalViews",
        COALESCE(SUM(clicks), 0) AS "totalClicks"
      FROM "FounderAnalytics"
      WHERE "userId" = ${session.userId}
        AND date >= DATE_TRUNC('month', CURRENT_DATE)
    `,
    
    // Get last month analytics for comparison
    sql`
      SELECT 
        COALESCE(SUM(views), 0) AS "totalViews",
        COALESCE(SUM(clicks), 0) AS "totalClicks"
      FROM "FounderAnalytics"
      WHERE "userId" = ${session.userId}
        AND date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        AND date < DATE_TRUNC('month', CURRENT_DATE)
    `,
  ]);

  const currentViews = Number(currentMonth[0]?.totalViews || 0);
  const currentClicks = Number(currentMonth[0]?.totalClicks || 0);
  const lastViews = Number(lastMonth[0]?.totalViews || 0);
  const lastClicks = Number(lastMonth[0]?.totalClicks || 0);
  
  const ctr = currentViews > 0 ? ((currentClicks / currentViews) * 100).toFixed(1) : '0.0';
  const lastCtr = lastViews > 0 ? ((lastClicks / lastViews) * 100).toFixed(1) : '0.0';
  
  // Calculate real trends
  const viewsTrend = lastViews > 0 ? (((currentViews - lastViews) / lastViews) * 100).toFixed(0) : '0';
  const ctrTrend = lastCtr !== '0.0' ? (((Number(ctr) - Number(lastCtr)) / Number(lastCtr)) * 100).toFixed(0) : '0';
  
  const viewsTrendText = Number(viewsTrend) > 0 ? `+${viewsTrend}%` : Number(viewsTrend) < 0 ? `${viewsTrend}%` : undefined;
  const ctrTrendText = Number(ctrTrend) > 0 ? `+${ctrTrend}%` : Number(ctrTrend) < 0 ? `${ctrTrend}%` : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Overview of your listings and performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Startups"
          value={startups.length}
          icon={Rocket}
          href="/founder/startups"
        />
        <StatCard
          title="Tools"
          value={tools.length}
          icon={Wrench}
          href="/founder/tools"
        />
        <StatCard
          title="Total Views"
          value={currentViews.toLocaleString()}
          icon={Eye}
          trend={viewsTrendText}
        />
        <StatCard
          title="Click Rate"
          value={`${ctr}%`}
          icon={MousePointerClick}
          trend={ctrTrendText}
        />
      </div>

      {/* Recent Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Startups */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Recent Startups
            </h2>
            <Link
              href="/founder/startups"
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium"
            >
              View all
            </Link>
          </div>
          
          {startups.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 text-center">
              <Rocket className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                No startups yet
              </p>
              <Link
                href="/founder/startups/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Submit Startup
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {startups.map((startup: any) => (
                <ListingCard
                  key={startup.id}
                  id={startup.id}
                  slug={startup.slug}
                  name={startup.name}
                  tagline={startup.tagline}
                  logoUrl={startup.logoUrl}
                  status={startup.claimStatus}
                  type="startup"
                  isVerified={startup.isVerified}
                />
              ))}
            </div>
          )}
        </div>

        {/* Tools */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Recent Tools
            </h2>
            <Link
              href="/founder/tools"
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium"
            >
              View all
            </Link>
          </div>
          
          {tools.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 text-center">
              <Wrench className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                No tools yet
              </p>
              <Link
                href="/founder/tools/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Submit Tool
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {tools.map((tool: any) => (
                <ListingCard
                  key={tool.id}
                  id={tool.id}
                  slug={tool.slug}
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
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Performance Overview
            </h2>
            {viewsTrendText && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{viewsTrendText} this month</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="h-48 flex items-center justify-center text-sm text-gray-400 dark:text-gray-600">
          <p>Analytics chart coming soon...</p>
        </div>
      </div>
    </div>
  );
}

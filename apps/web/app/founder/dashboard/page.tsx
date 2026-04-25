import { requireFounderAuth } from '@/lib/founder-auth';
import { neon } from '@neondatabase/serverless';
import { Rocket, Wrench, Eye, MousePointerClick, Plus, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import StatCard from '@/components/founder/StatCard';
import ListingCard from '@/components/founder/ListingCard';

const sql = neon(process.env.DATABASE_URL!);

export default async function DashboardPage() {
  const session = await requireFounderAuth();

  // Fetch founder's data with raw SQL
  const [startups, tools, analytics] = await Promise.all([
    // Get startups
    sql`
      SELECT id, name, slug, tagline, "logoUrl", "claimStatus", "createdAt"
      FROM "Startup"
      WHERE "ownerId" = ${session.userId}
      ORDER BY "createdAt" DESC
      LIMIT 5
    `,
    
    // Get tools
    sql`
      SELECT id, name, slug, tagline, "logoUrl", status AS "claimStatus", "createdAt"
      FROM "AiTool"
      WHERE "ownerId" = ${session.userId}
      ORDER BY "createdAt" DESC
      LIMIT 5
    `,
    
    // Get analytics summary
    sql`
      SELECT 
        COALESCE(SUM(views), 0) AS "totalViews",
        COALESCE(SUM(clicks), 0) AS "totalClicks"
      FROM "FounderAnalytics"
      WHERE "userId" = ${session.userId}
        AND date >= NOW() - INTERVAL '30 days'
    `,
  ]);

  const totalViews = Number(analytics[0]?.totalViews || 0);
  const totalClicks = Number(analytics[0]?.totalClicks || 0);
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {session.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Here's what's happening with your listings
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Startups"
          value={startups.length}
          icon={Rocket}
          color="blue"
          href="/founder/startups"
        />
        <StatCard
          title="Tools"
          value={tools.length}
          icon={Wrench}
          color="purple"
          href="/founder/tools"
        />
        <StatCard
          title="Total Views"
          value={totalViews.toLocaleString()}
          icon={Eye}
          color="green"
          trend="+12%"
        />
        <StatCard
          title="Click Rate"
          value={`${ctr}%`}
          icon={MousePointerClick}
          color="orange"
          trend="+5%"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/founder/startups/new"
          className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white hover:shadow-xl transition-all"
        >
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Submit Your Startup</h3>
            <p className="text-blue-100">
              Get your startup featured on AI Startup Impact
            </p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
        </Link>

        <Link
          href="/founder/tools/new"
          className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white hover:shadow-xl transition-all"
        >
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Submit Your Tool</h3>
            <p className="text-purple-100">
              Showcase your AI tool to thousands of users
            </p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
        </Link>
      </div>

      {/* Recent Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Startups */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Startups
            </h2>
            <Link
              href="/founder/startups"
              className="text-sm text-brand hover:underline font-medium"
            >
              View all
            </Link>
          </div>
          
          {startups.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
              <Rocket className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No startups yet
              </p>
              <Link
                href="/founder/startups/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Submit Your First Startup
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {startups.map((startup: any) => (
                <ListingCard
                  key={startup.id}
                  id={startup.id}
                  name={startup.name}
                  tagline={startup.tagline}
                  logoUrl={startup.logoUrl}
                  status={startup.claimStatus}
                  type="startup"
                />
              ))}
            </div>
          )}
        </div>

        {/* Tools */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Tools
            </h2>
            <Link
              href="/founder/tools"
              className="text-sm text-brand hover:underline font-medium"
            >
              View all
            </Link>
          </div>
          
          {tools.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
              <Wrench className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No tools yet
              </p>
              <Link
                href="/founder/tools/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Submit Your First Tool
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {tools.map((tool: any) => (
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
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Performance Overview
          </h2>
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">+12% this month</span>
          </div>
        </div>
        
        <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-600">
          <p>Analytics chart coming soon...</p>
        </div>
      </div>
    </div>
  );
}

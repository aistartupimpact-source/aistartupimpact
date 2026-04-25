import { requireFounderAuth } from '@/lib/founder-auth';
import { neon } from '@neondatabase/serverless';
import { 
  TrendingUp, 
  Eye, 
  MousePointerClick, 
  Users, 
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  BarChart3
} from 'lucide-react';

const sql = neon(process.env.DATABASE_URL!);

export default async function AnalyticsPage() {
  const session = await requireFounderAuth();

  // Fetch analytics data
  const [currentMonth, lastMonth, allTime, topItems] = await Promise.all([
    // Current month stats
    sql`
      SELECT 
        COALESCE(SUM(views), 0) AS views,
        COALESCE(SUM(clicks), 0) AS clicks
      FROM "FounderAnalytics"
      WHERE "userId" = ${session.userId}
        AND date >= DATE_TRUNC('month', CURRENT_DATE)
    `,
    
    // Last month stats
    sql`
      SELECT 
        COALESCE(SUM(views), 0) AS views,
        COALESCE(SUM(clicks), 0) AS clicks
      FROM "FounderAnalytics"
      WHERE "userId" = ${session.userId}
        AND date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        AND date < DATE_TRUNC('month', CURRENT_DATE)
    `,
    
    // All time stats
    sql`
      SELECT 
        COALESCE(SUM(views), 0) AS views,
        COALESCE(SUM(clicks), 0) AS clicks
      FROM "FounderAnalytics"
      WHERE "userId" = ${session.userId}
    `,
    
    // Top performing items
    sql`
      SELECT 
        fa."entityType",
        fa."entityId",
        COALESCE(s.name, t.name) AS name,
        COALESCE(s.slug, t.slug) AS slug,
        SUM(fa.views) AS "totalViews",
        SUM(fa.clicks) AS "totalClicks"
      FROM "FounderAnalytics" fa
      LEFT JOIN "Startup" s ON fa."entityId" = s.id AND fa."entityType" = 'STARTUP'
      LEFT JOIN "AiTool" t ON fa."entityId" = t.id AND fa."entityType" = 'TOOL'
      WHERE fa."userId" = ${session.userId}
      GROUP BY fa."entityType", fa."entityId", s.name, t.name, s.slug, t.slug
      ORDER BY SUM(fa.views) DESC
      LIMIT 5
    `,
  ]);

  const currentViews = Number(currentMonth[0]?.views || 0);
  const currentClicks = Number(currentMonth[0]?.clicks || 0);
  const lastViews = Number(lastMonth[0]?.views || 0);
  const lastClicks = Number(lastMonth[0]?.clicks || 0);
  const totalViews = Number(allTime[0]?.views || 0);
  const totalClicks = Number(allTime[0]?.clicks || 0);

  // Calculate changes
  const viewsChange = lastViews > 0 ? ((currentViews - lastViews) / lastViews * 100).toFixed(1) : '0';
  const clicksChange = lastClicks > 0 ? ((currentClicks - lastClicks) / lastClicks * 100).toFixed(1) : '0';
  const ctr = currentViews > 0 ? ((currentClicks / currentViews) * 100).toFixed(1) : '0.0';
  const lastCtr = lastViews > 0 ? ((lastClicks / lastViews) * 100).toFixed(1) : '0.0';
  const ctrChange = lastCtr !== '0.0' ? ((Number(ctr) - Number(lastCtr)) / Number(lastCtr) * 100).toFixed(1) : '0';

  const getTrendIcon = (change: string) => {
    const num = Number(change);
    if (num > 0) return <ArrowUp className="w-4 h-4" />;
    if (num < 0) return <ArrowDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = (change: string) => {
    const num = Number(change);
    if (num > 0) return 'text-green-600 dark:text-green-400';
    if (num < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your listings' performance and engagement
        </p>
      </div>

      {/* Current Month Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          This Month
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Views */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor(viewsChange)}`}>
                {getTrendIcon(viewsChange)}
                <span>{Math.abs(Number(viewsChange))}%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {currentViews.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              vs {lastViews.toLocaleString()} last month
            </p>
          </div>

          {/* Clicks */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <MousePointerClick className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor(clicksChange)}`}>
                {getTrendIcon(clicksChange)}
                <span>{Math.abs(Number(clicksChange))}%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Clicks</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {currentClicks.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              vs {lastClicks.toLocaleString()} last month
            </p>
          </div>

          {/* CTR */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor(ctrChange)}`}>
                {getTrendIcon(ctrChange)}
                <span>{Math.abs(Number(ctrChange))}%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Click Rate</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {ctr}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              vs {lastCtr}% last month
            </p>
          </div>
        </div>
      </div>

      {/* All Time Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          All Time Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-brand to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm opacity-90">Total Views</p>
                <p className="text-3xl font-bold">{totalViews.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-sm opacity-75">
              Across all your listings since you joined
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <MousePointerClick className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm opacity-90">Total Clicks</p>
                <p className="text-3xl font-bold">{totalClicks.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-sm opacity-75">
              Total engagement from your audience
            </p>
          </div>
        </div>
      </div>

      {/* Top Performing Items */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top Performing Listings
        </h2>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {topItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      CTR
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {topItems.map((item: any, index: number) => {
                    const itemViews = Number(item.totalViews || 0);
                    const itemClicks = Number(item.totalClicks || 0);
                    const itemCtr = itemViews > 0 ? ((itemClicks / itemViews) * 100).toFixed(1) : '0.0';
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.name || 'Unnamed'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.entityType === 'STARTUP'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                              : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                          }`}>
                            {item.entityType === 'STARTUP' ? 'Startup' : 'Tool'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-900 dark:text-white font-medium">
                          {itemViews.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-900 dark:text-white font-medium">
                          {itemClicks.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-900 dark:text-white font-medium">
                          {itemCtr}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                No analytics data yet. Submit your first listing to start tracking!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
              About Analytics
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Analytics are updated daily. Views are counted when users visit your listing page, 
              and clicks are tracked when they interact with your links. Data is retained for 12 months.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

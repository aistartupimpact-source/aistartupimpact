import { getEmployerSession } from '@/lib/employer-auth';
import { redirect } from 'next/navigation';
import { BarChart3, Eye, Users, Briefcase, BookmarkCheck, MousePointerClick, TrendingUp } from 'lucide-react';
import { sql } from '@/lib/db';
export default async function EmployerAnalyticsPage() {
  const session = await getEmployerSession();
  if (!session) redirect('/employer/login');

  // Fetch analytics
  let overview: any = {};
  let jobStats: any[] = [];
  let pipeline: any[] = [];

  try {
    const statsResult = await sql`
      SELECT
        COUNT(*) FILTER (WHERE "isActive" = true AND "deletedAt" IS NULL) AS "activeJobs",
        COALESCE(SUM("viewsCount"), 0) AS "totalViews",
        COALESCE(SUM("applicationsCount"), 0) AS "totalApplications",
        COALESCE(SUM("savedCount"), 0) AS "totalSaved",
        COALESCE(SUM("clicksCount"), 0) AS "totalClicks"
      FROM "JobBoardListing"
      WHERE "employerId" = ${session.id}
    `;
    const raw = statsResult[0] as any;
    const totalViews = parseInt(raw?.totalViews || '0');
    const totalApps = parseInt(raw?.totalApplications || '0');
    overview = {
      activeJobs: parseInt(raw?.activeJobs || '0'),
      totalViews,
      totalApplications: totalApps,
      totalSaved: parseInt(raw?.totalSaved || '0'),
      totalClicks: parseInt(raw?.totalClicks || '0'),
      ctr: totalViews > 0 ? ((totalApps / totalViews) * 100).toFixed(1) + '%' : '—',
    };

    jobStats = await sql`
      SELECT title, "viewsCount", "applicationsCount", "savedCount"
      FROM "JobBoardListing"
      WHERE "employerId" = ${session.id} AND "deletedAt" IS NULL
      ORDER BY "viewsCount" DESC LIMIT 10
    `;

    pipeline = await sql`
      SELECT a.status, COUNT(*)::int AS count
      FROM "JobBoardApplication" a
      JOIN "JobBoardListing" l ON l.id = a."listingId"
      WHERE l."employerId" = ${session.id}
      GROUP BY a.status ORDER BY count DESC
    `;
  } catch {}

  const statCards = [
    { label: 'Active Jobs', value: overview.activeJobs || 0, icon: Briefcase, color: 'text-brand' },
    { label: 'Total Views', value: overview.totalViews || 0, icon: Eye, color: 'text-blue-500' },
    { label: 'Applications', value: overview.totalApplications || 0, icon: Users, color: 'text-green-500' },
    { label: 'Saved', value: overview.totalSaved || 0, icon: BookmarkCheck, color: 'text-amber-500' },
    { label: 'Clicks', value: overview.totalClicks || 0, icon: MousePointerClick, color: 'text-purple-500' },
    { label: 'CTR', value: overview.ctr || '—', icon: TrendingUp, color: 'text-emerald-500' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="font-sora font-extrabold text-xl text-navy dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-brand" />
          Hiring Analytics
        </h1>
        <p className="text-xs text-gray-500 font-jakarta mt-0.5">Track your job listing performance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
            <p className="font-sora font-extrabold text-lg text-navy dark:text-white">{s.value}</p>
            <p className="text-xs text-gray-400 font-jakarta">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per-Job Stats */}
        <div className="card p-5">
          <h2 className="font-sora font-bold text-sm text-navy dark:text-white mb-4">Performance by Job</h2>
          {jobStats.length === 0 ? (
            <p className="text-xs text-gray-400 font-jakarta">No data yet. Post a job to see analytics.</p>
          ) : (
            <div className="space-y-3">
              {jobStats.map((j: any, i) => (
                <div key={i} className="flex items-center justify-between">
                  <p className="text-xs font-jakarta text-gray-700 dark:text-gray-300 truncate flex-1 mr-3">{j.title}</p>
                  <div className="flex gap-3 text-xs text-gray-400 font-jakarta shrink-0">
                    <span>{j.viewsCount} views</span>
                    <span>{j.applicationsCount} apps</span>
                    <span>{j.savedCount} saved</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pipeline */}
        <div className="card p-5">
          <h2 className="font-sora font-bold text-sm text-navy dark:text-white mb-4">Application Pipeline</h2>
          {pipeline.length === 0 ? (
            <p className="text-xs text-gray-400 font-jakarta">No applications yet.</p>
          ) : (
            <div className="space-y-2">
              {pipeline.map((p: any) => (
                <div key={p.status} className="flex items-center justify-between">
                  <span className="text-xs font-jakarta text-gray-600 dark:text-gray-400">
                    {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                  </span>
                  <span className="font-sora font-bold text-sm text-navy dark:text-white">{p.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { sql } from '@/lib/db';
import { getEmployerSession } from '@/lib/employer-auth';
import { redirect } from 'next/navigation';
import { Briefcase, Eye, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
export default async function EmployerDashboardPage() {
  const session = await getEmployerSession();
  if (!session) redirect('/employer/login');

  // Fetch stats
  let activeJobs = 0;
  let totalApplications = 0;
  let totalViews = 0;

  try {
    const jobStats = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE "isActive" = true AND "deletedAt" IS NULL) AS "activeJobs",
        COALESCE(SUM("applicationsCount"), 0) AS "totalApplications",
        COALESCE(SUM("viewsCount"), 0) AS "totalViews"
      FROM "JobBoardListing"
      WHERE "employerId" = ${session.id}
    `;
    if (jobStats[0]) {
      activeJobs = parseInt((jobStats[0] as any).activeJobs || '0');
      totalApplications = parseInt((jobStats[0] as any).totalApplications || '0');
      totalViews = parseInt((jobStats[0] as any).totalViews || '0');
    }
  } catch {}

  // Fetch recent jobs
  let recentJobs: any[] = [];
  try {
    recentJobs = await sql`
      SELECT id, slug, title, category, "workType", "isActive", "applicationsCount", "viewsCount", "publishedAt"::text
      FROM "JobBoardListing"
      WHERE "employerId" = ${session.id} AND "deletedAt" IS NULL
      ORDER BY "createdAt" DESC
      LIMIT 5
    `;
  } catch {}

  const stats = [
    { label: 'Active Jobs', value: activeJobs, icon: Briefcase, color: 'text-brand' },
    { label: 'Total Views', value: totalViews, icon: Eye, color: 'text-blue-500' },
    { label: 'Applications', value: totalApplications, icon: Users, color: 'text-green-500' },
    { label: 'CTR', value: totalViews > 0 ? `${((totalApplications / totalViews) * 100).toFixed(1)}%` : '—', icon: TrendingUp, color: 'text-purple-500' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-sora font-extrabold text-xl sm:text-2xl text-navy dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 font-jakarta mt-0.5">
            Welcome back, {session.companyName}
          </p>
        </div>
        <Link href="/employer/jobs/new" className="btn-brand text-sm flex items-center gap-2 px-4 py-2.5">
          <Briefcase className="w-4 h-4" />
          Post a Job
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-sora font-extrabold text-xl text-navy dark:text-white">
                  {stat.value}
                </p>
                <p className="text-[11px] text-gray-400 font-jakarta">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Jobs */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sora font-bold text-base text-navy dark:text-white">Recent Jobs</h2>
          <Link href="/employer/jobs" className="text-brand text-xs font-semibold font-jakarta hover:underline">
            View All →
          </Link>
        </div>

        {recentJobs.length === 0 ? (
          <div className="text-center py-10">
            <Briefcase className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-jakarta mb-3">No jobs posted yet</p>
            <Link href="/employer/jobs/new" className="btn-brand text-sm px-4 py-2">
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentJobs.map((job: any) => (
              <div key={job.id} className="py-3 flex items-center justify-between">
                <div>
                  <Link href={`/employer/jobs/${job.id}/edit`} className="text-sm font-semibold text-navy dark:text-white hover:text-brand font-jakarta">
                    {job.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-gray-400 font-jakarta">{job.category?.replace(/_/g, ' ')}</span>
                    <span className="text-[11px] text-gray-300">•</span>
                    <span className="text-[11px] text-gray-400 font-jakarta">{job.workType}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-3 text-[11px] text-gray-400 font-jakarta">
                    <span>{job.viewsCount} views</span>
                    <span>{job.applicationsCount} apps</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase ${job.isActive ? 'text-green-500' : 'text-gray-400'}`}>
                    {job.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

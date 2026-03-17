import { prisma } from '@aistartupimpact/database';
import Link from 'next/link';
import {
  Eye,
  FileText,
  Users,
  IndianRupee,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  Clock,
  Edit3,
  CheckCircle,
} from 'lucide-react';

export default async function DashboardPage() {
  const [
    totalUsers,
    totalArticles,
    pendingReviews,
    publishedCount,
    adCampaigns
  ] = await Promise.all([
    prisma.user.count(),
    prisma.article.count(),
    prisma.article.count({ where: { status: 'IN_REVIEW' } }),
    prisma.article.count({ where: { status: 'PUBLISHED' } }),
    prisma.adCampaign.findMany({ select: { totalBudgetPaise: true } })
  ]);

  // Aggregate dummy revenue from active campaigns (or placeholder if zero)
  const totalRevenuePaise = adCampaigns.reduce((acc, curr) => acc + Number(curr.totalBudgetPaise), 0);
  const displayRevenue = totalRevenuePaise > 0 ? `₹${(totalRevenuePaise / 100).toLocaleString()}` : "₹0";

  const metrics = [
    {
      label: "Today's Pageviews",
      value: 'Analytics Pending',
      icon: Eye,
    },
    {
      label: 'Articles Drafted & Published',
      value: totalArticles.toString(),
      badge: `${publishedCount} Published`,
      icon: FileText,
    },
    {
      label: 'Team Members',
      value: totalUsers.toString(),
      change: 'Active',
      positive: true,
      icon: Users,
    },
    {
      label: 'Est. Ad Revenue',
      value: displayRevenue,
      icon: IndianRupee,
    },
    {
      label: 'Top Article Today',
      value: 'Pending Analytics',
      icon: TrendingUp,
    },
    {
      label: 'Pending Reviews',
      value: pendingReviews.toString(),
      urgent: pendingReviews > 0,
      icon: AlertCircle,
    },
  ];

  // Fetch recent articles (as a proxy for activity)
  const recentArticles = await prisma.article.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }, // Using createdAt just for sorting
    select: {
      id: true,
      title: true,
      status: true,
      author: {
        select: { name: true }
      }
    }
  });

  const recentActivity = recentArticles.map((a: any) => ({
    user: a.author?.name || 'Unknown',
    action: a.status === 'PUBLISHED' ? 'Published' : a.status === 'IN_REVIEW' ? 'Submitted for review' : 'Updated',
    item: a.title,
    time: "Recently", // Bypass Date parsing object entirely for safety
    type: a.status === 'PUBLISHED' ? 'publish' : a.status === 'IN_REVIEW' ? 'submit' : 'draft'
  }));

  // Fetch upcoming scheduled articles
  const scheduledArticlesRaw = await prisma.article.findMany({
    where: { status: 'SCHEDULED' },
    take: 5,
    select: {
      id: true,
      title: true,
      status: true
    }
  });

  const scheduledArticles = scheduledArticlesRaw.map(a => ({
    title: a.title,
    date: 'Upcoming',
    status: 'scheduled'
  }));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Dashboard</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">
            Welcome back. Here&apos;s your live platform activity.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/articles/new"
            className="btn-brand text-sm flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            New Article
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((metric, i) => (
          <div
            key={i}
            className={`bg-white dark:bg-gray-900 rounded-xl border p-5 ${'urgent' in metric && metric.urgent
              ? 'border-brand/30 bg-brand-50/30 dark:bg-brand-900/10'
              : 'border-gray-100 dark:border-gray-800'
              }`}
          >
            <div className="flex items-center justify-between mb-3">
              <metric.icon
                className={`w-5 h-5 ${'urgent' in metric && metric.urgent ? 'text-brand' : 'text-gray-400 dark:text-gray-500'
                  }`}
              />
              {'change' in metric && metric.change && (
                <span
                  className={`text-xs font-semibold flex items-center gap-0.5 ${metric.positive ? 'text-green-600 dark:text-green-400' : 'text-red-500'
                    }`}
                >
                  {metric.change}
                </span>
              )}
            </div>
            <p className="font-sora font-extrabold text-xl text-navy dark:text-white">{metric.value}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-jakarta mt-1">{metric.label}</p>
            {'badge' in metric && metric.badge && (
              <span className="inline-block mt-2 text-[10px] font-semibold bg-brand/10 text-brand px-2 py-0.5 rounded-full">
                {metric.badge}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="font-sora font-bold text-lg text-navy dark:text-white mb-4">Recent Article Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta">No recent activity found.</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.type === 'publish'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : item.type === 'approve'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : item.type === 'submit'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                      }`}
                  >
                    {item.type === 'publish' || item.type === 'approve' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Edit3 className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-jakarta">
                      <span className="font-semibold text-navy dark:text-white">{item.user}</span>{' '}
                      <span className="text-gray-500 dark:text-gray-400">{item.action}</span>{' '}
                      <span className="font-medium text-navy dark:text-white">{item.item}</span>
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scheduled Articles */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="font-sora font-bold text-lg text-navy dark:text-white mb-4">Upcoming Schedule</h2>
          {scheduledArticles.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta">No articles scheduled yet.</p>
          ) : (
            <div className="space-y-3">
              {scheduledArticles.map((article, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-colors cursor-pointer"
                >
                  <h4 className="font-sora font-semibold text-sm text-navy dark:text-white">{article.title}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-jakarta flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.date}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${article.status === 'scheduled'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        }`}
                    >
                      {article.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <h3 className="font-sora font-semibold text-sm text-navy dark:text-white mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/articles/new"
                className="p-3 rounded-lg bg-brand/5 dark:bg-brand/10 hover:bg-brand/10 dark:hover:bg-brand/20 text-center transition-colors"
              >
                <Edit3 className="w-4 h-4 text-brand mx-auto mb-1" />
                <span className="text-xs font-medium text-navy dark:text-white">New Article</span>
              </Link>
              <Link
                href="/tools-dir"
                className="p-3 rounded-lg bg-brand/5 dark:bg-brand/10 hover:bg-brand/10 dark:hover:bg-brand/20 text-center transition-colors"
              >
                <FileText className="w-4 h-4 text-brand mx-auto mb-1" />
                <span className="text-xs font-medium text-navy dark:text-white">Add Tool</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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

const metrics = [
  {
    label: "Today's Pageviews",
    value: '12,847',
    change: '+18%',
    positive: true,
    icon: Eye,
  },
  {
    label: 'Articles This Month',
    value: '24',
    badge: '3 pending',
    icon: FileText,
  },
  {
    label: 'Newsletter Subscribers',
    value: '5,247',
    change: '+12%',
    positive: true,
    icon: Users,
  },
  {
    label: 'Est. Ad Revenue',
    value: '₹45,000',
    change: '+25%',
    positive: true,
    icon: IndianRupee,
  },
  {
    label: 'Top Article Today',
    value: 'GPT-5 Launch',
    badge: '2.5K views',
    icon: TrendingUp,
  },
  {
    label: 'Pending Reviews',
    value: '7',
    urgent: true,
    icon: AlertCircle,
  },
];

const recentActivity = [
  { user: 'Priya S.', action: 'Published', item: 'India AI Revolution 2025', time: '5 min ago', type: 'publish' },
  { user: 'Rahul K.', action: 'Submitted for review', item: 'AI Tools Comparison Guide', time: '15 min ago', type: 'submit' },
  { user: 'Anjali N.', action: 'Uploaded 3 images', item: 'Media Library', time: '30 min ago', type: 'upload' },
  { user: 'Admin', action: 'Approved', item: 'Sarvam AI Startup Profile', time: '1 hour ago', type: 'approve' },
  { user: 'Vikram P.', action: 'Created draft', item: 'Edge AI in Manufacturing', time: '2 hours ago', type: 'draft' },
];

const scheduledArticles = [
  { title: 'Weekly AI Funding Roundup', date: 'Mar 8, 7:00 AM', status: 'scheduled' },
  { title: 'Interview: Krutrim AI CTO', date: 'Mar 9, 10:00 AM', status: 'scheduled' },
  { title: 'AI Tools for Designers 2025', date: 'Mar 10, 8:00 AM', status: 'approved' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Dashboard</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">
            Welcome back. Here&apos;s what&apos;s happening today.
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
                  <ArrowUpRight className="w-3 h-3" />
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
          <h2 className="font-sora font-bold text-lg text-navy dark:text-white mb-4">Recent Activity</h2>
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
        </div>

        {/* Scheduled Articles */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="font-sora font-bold text-lg text-navy dark:text-white mb-4">Upcoming Schedule</h2>
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

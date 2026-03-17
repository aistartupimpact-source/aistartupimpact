import Link from 'next/link';
import {
  Eye, FileText, Crown, Zap, TrendingUp, ArrowUpRight,
  IndianRupee, Calendar, Clock, CheckCircle, AlertCircle,
  FileEdit, BarChart3, Megaphone, Building2,
} from 'lucide-react';
import { getClientPortalDataAction } from './actions';

const ZONE_LABELS: Record<string, string> = {
  H1_HERO_FEATURE: 'Hero Cover Story', H2_TRENDING_STRIP: 'Breaking Ticker',
  H3_SECTION_SPONSOR: 'Section Sponsor', H4_NEWSLETTER_CTA: 'Newsletter CTA',
  A1_IN_ARTICLE: 'In-Article Ad', A2_SIDEBAR_STICKY: 'Sidebar Sticky',
  A3_END_OF_ARTICLE: 'End of Article', D1_TOOL_FEATURED: 'Tool Featured',
  D2_STARTUP_BOOST: 'Startup Boost', N1_NEWSLETTER_PRIMARY: 'Newsletter Primary',
  N2_NEWSLETTER_FOOTER: 'Newsletter Footer',
};

const statusColors: Record<string, string> = {
  PUBLISHED: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  ACTIVE: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  IN_REVIEW: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  PENDING_REVIEW: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  PAUSED: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  COMPLETED: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
  CANCELLED: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
};

const fmt = (d: string) =>
  d ? new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtBudget = (p: number) => p ? `₹${(Number(p) / 100).toLocaleString('en-IN')}` : '₹0';

export default async function ClientPortalPage() {
  const res = await getClientPortalDataAction();
  const data = res.data;

  const stats = data?.stats || { totalBudget: 0, totalImpressions: 0, totalClicks: 0, activeCampaigns: 0, totalCampaigns: 0, avgCTR: '0%' };
  const campaigns = data?.campaigns || [];
  const activeCampaigns = data?.activeCampaigns || [];
  const creatives = data?.creatives || [];
  const articles = data?.articles || [];

  const companyName = activeCampaigns[0]?.companyName || campaigns[0]?.companyName || 'Client';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Welcome back, {companyName}</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">Here&apos;s your content performance at a glance</p>
        </div>
        <Link href="/submit-content" className="btn-brand text-sm flex items-center gap-2">
          <FileEdit className="w-4 h-4" /> Submit New Content
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Active Campaigns', value: stats.activeCampaigns.toString(), icon: Crown, color: 'text-brand' },
          { label: 'Total Campaigns', value: stats.totalCampaigns.toString(), icon: FileText, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Total Impressions', value: Number(stats.totalImpressions).toLocaleString(), icon: TrendingUp, color: 'text-purple-600 dark:text-purple-400' },
          { label: 'Total Clicks', value: Number(stats.totalClicks).toLocaleString(), icon: Eye, color: 'text-green-600 dark:text-green-400' },
          { label: 'Avg. CTR', value: stats.avgCTR, icon: BarChart3, color: 'text-orange-600 dark:text-orange-400' },
        ].map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
            <card.icon className={`w-5 h-5 mb-2 ${card.color}`} />
            <p className="font-sora font-extrabold text-lg text-navy dark:text-white">{card.value}</p>
            <p className="text-[11px] text-gray-400 font-jakarta mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Submit Content', description: 'Write & submit a new article or story', href: '/submit-content', icon: FileEdit, color: 'bg-brand/10 text-brand' },
          { label: 'View Analytics', description: 'See engagement & performance data', href: '/my-analytics', icon: BarChart3, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
          { label: 'My Placements', description: 'View active placement zones', href: '/my-placements', icon: Megaphone, color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
        ].map((action) => (
          <Link key={action.label} href={action.href} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 hover:border-brand/30 transition-colors group">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${action.color}`}>
                <action.icon className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-300 dark:text-gray-600 ml-auto group-hover:text-brand transition-colors" />
            </div>
            <h3 className="font-sora font-bold text-sm text-navy dark:text-white">{action.label}</h3>
            <p className="text-xs text-gray-400 font-jakarta mt-1">{action.description}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Articles */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sora font-bold text-base text-navy dark:text-white">Recent Articles</h2>
          </div>
          {articles.length === 0 ? (
            <p className="text-sm text-gray-400 font-jakarta text-center py-6">No articles yet.</p>
          ) : (
            <div className="space-y-3">
              {articles.map((a: any) => (
                <div key={a.id} className="flex items-start justify-between gap-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-sora font-semibold text-sm text-navy dark:text-white truncate">{a.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400 font-jakarta">{fmt(a.publishedAt)}</span>
                      {a.viewCount > 0 && (
                        <span className="text-xs text-gray-400 font-jakarta flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {Number(a.viewCount).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold shrink-0 ${statusColors[a.status] || statusColors.DRAFT}`}>
                    {a.status.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Placements */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sora font-bold text-base text-navy dark:text-white">Active Placements</h2>
            <Link href="/my-placements" className="text-xs text-brand font-semibold hover:underline">View all</Link>
          </div>
          {creatives.length === 0 ? (
            <div className="text-center py-6">
              <Building2 className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-400 font-jakarta">No active placements.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {creatives.map((cr: any, i: number) => (
                <div key={i} className="border border-gray-100 dark:border-gray-800 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-brand" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-sora font-bold text-sm text-navy dark:text-white">{ZONE_LABELS[cr.zone] || cr.zone}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">LIVE</span>
                      </div>
                      <p className="text-xs text-gray-400 font-jakarta mt-0.5 line-clamp-1">{cr.headline}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 text-center">
                      <p className="font-sora font-bold text-sm text-navy dark:text-white">{Number(cr.impressionCount).toLocaleString()}</p>
                      <p className="text-[9px] text-gray-400 font-jakarta">Impressions</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 text-center">
                      <p className="font-sora font-bold text-sm text-navy dark:text-white">{Number(cr.clickCount).toLocaleString()}</p>
                      <p className="text-[9px] text-gray-400 font-jakarta">Clicks</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 text-center">
                      <p className="font-sora font-bold text-sm text-navy dark:text-white flex items-center justify-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />{fmt(cr.endDate)}
                      </p>
                      <p className="text-[9px] text-gray-400 font-jakarta">Ends</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All Campaigns Table */}
      {campaigns.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sora font-bold text-base text-navy dark:text-white">All Campaigns</h2>
            <Link href="/my-placements" className="text-xs text-brand font-semibold hover:underline">View details</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-jakarta">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase pb-3 pr-4">Company</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase pb-3 pr-4">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase pb-3 pr-4">Period</th>
                  <th className="text-right text-xs font-semibold text-gray-400 uppercase pb-3">Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {campaigns.map((c: any) => (
                  <tr key={c.id}>
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-navy dark:text-white">{c.companyName}</p>
                      <p className="text-xs text-gray-400">{c.clientName}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[c.status] || statusColors.DRAFT}`}>
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-400">{fmt(c.startDate)} → {fmt(c.endDate)}</td>
                    <td className="py-3 text-right font-semibold text-brand">{fmtBudget(c.totalBudgetPaise)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

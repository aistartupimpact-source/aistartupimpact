'use client';

import { useState } from 'react';
import {
  Eye, MousePointerClick, TrendingUp, IndianRupee, Crown, Zap,
  Newspaper, ArrowUpRight, Calendar, Clock,
  FileText, Download,
} from 'lucide-react';

/* ─── Mock Data ─── */
const overview = {
  totalSpend: '₹2,25,000', totalViews: '24,620', totalImpressions: '1,48,500', avgCTR: '4.8%',
};

interface PlacementMetrics {
  zone: string; tier: string; icon: typeof Crown;
  headline: string; startDate: string; endDate: string;
  paidAmount: string; impressions: number; clicks: number;
  ctr: string; avgTimeOnPage: string; conversions: number;
}

interface ArticleMetrics {
  title: string; type: string; publishDate: string;
  views: number; uniqueReaders: number; avgReadTime: string;
  scrollDepth: string; shares: number; newsletterClicks: number;
}

const placements: PlacementMetrics[] = [
  { zone: 'Hero Cover Story', tier: 'Premium', icon: Crown, headline: 'Sarvam AI — Series A Deep Dive: Building India\'s Language AI', startDate: 'Mar 1, 2025', endDate: 'Mar 31, 2025', paidAmount: '₹75,000', impressions: 98200, clicks: 5410, ctr: '5.5%', avgTimeOnPage: '6m 42s', conversions: 245 },
  { zone: 'Breaking Ticker', tier: 'Premium', icon: Zap, headline: 'Sarvam AI raises $41M to build India-first LLMs', startDate: 'Mar 1, 2025', endDate: 'Mar 7, 2025', paidAmount: '₹75,000', impressions: 50300, clicks: 1680, ctr: '3.3%', avgTimeOnPage: '2m 15s', conversions: 89 },
];

const articles: ArticleMetrics[] = [
  { title: 'Inside Sarvam AI: How Vivek Raghavan is Building India\'s Language AI', type: 'Founder Story', publishDate: 'Mar 5, 2025', views: 15420, uniqueReaders: 12100, avgReadTime: '8m 30s', scrollDepth: '82%', shares: 342, newsletterClicks: 1240 },
  { title: 'Sarvam AI\'s $41M Series A: What It Means for India\'s AI Stack', type: 'Funding Analysis', publishDate: 'Mar 2, 2025', views: 9200, uniqueReaders: 7800, avgReadTime: '5m 15s', scrollDepth: '74%', shares: 198, newsletterClicks: 890 },
];

const dailyViews = [
  { date: 'Mar 1', views: 4200, clicks: 310 }, { date: 'Mar 2', views: 8900, clicks: 520 },
  { date: 'Mar 3', views: 7800, clicks: 480 }, { date: 'Mar 4', views: 6500, clicks: 395 },
  { date: 'Mar 5', views: 12400, clicks: 890 }, { date: 'Mar 6', views: 9100, clicks: 610 },
  { date: 'Mar 7', views: 8600, clicks: 540 },
];

const periods = ['7 days', '30 days', 'All Time'];

export default function MyAnalyticsPage() {
  const [period, setPeriod] = useState('7 days');
  const maxViews = Math.max(...dailyViews.map(d => d.views));
  const totalClicks = placements.reduce((sum, p) => sum + p.clicks, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">My Analytics</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">Track your content performance and placement ROI</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1">
            {periods.map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${p === period ? 'bg-brand text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{p}</button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Spend', value: overview.totalSpend, icon: IndianRupee, color: 'text-brand' },
          { label: 'Total Views', value: overview.totalViews, icon: Eye, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Total Impressions', value: overview.totalImpressions, icon: TrendingUp, color: 'text-purple-600 dark:text-purple-400' },
          { label: 'Avg. CTR', value: overview.avgCTR, icon: MousePointerClick, color: 'text-green-600 dark:text-green-400' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
            <s.icon className={`w-5 h-5 mb-3 ${s.color}`} />
            <p className="font-sora font-extrabold text-xl text-navy dark:text-white">{s.value}</p>
            <p className="text-xs text-gray-400 font-jakarta mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Daily Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sora font-bold text-base text-navy dark:text-white">Daily Engagement</h2>
          <div className="flex items-center gap-4 text-xs font-jakarta">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand/30" />Views</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand" />Clicks</span>
          </div>
        </div>
        <div className="flex items-end gap-2 h-40">
          {dailyViews.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col items-center gap-0.5" style={{ height: '120px' }}>
                <div className="w-full rounded-t-md bg-brand/15 dark:bg-brand/20 transition-all duration-500" style={{ height: `${(d.views / maxViews) * 100}%`, minHeight: '4px' }} />
                <div className="w-3/5 rounded-md bg-brand transition-all duration-500" style={{ height: `${(d.clicks / maxViews) * 100}%`, minHeight: '2px' }} />
              </div>
              <span className="text-[10px] text-gray-400 font-jakarta">{d.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Placement Performance */}
      <div>
        <h2 className="font-sora font-bold text-base text-navy dark:text-white mb-3">Placement Performance</h2>
        <div className="space-y-4">
          {placements.map((p, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center"><p.icon className="w-5 h-5 text-brand" /></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-sora font-bold text-sm text-navy dark:text-white">{p.zone}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-red-50 dark:bg-red-900/20 text-brand">{p.tier}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta mt-1 line-clamp-1">{p.headline}</p>
                    <span className="text-xs text-gray-400 font-jakarta flex items-center gap-1 mt-1"><Calendar className="w-3 h-3" /> {p.startDate} → {p.endDate}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-sora font-extrabold text-lg text-brand">{p.paidAmount}</p>
                  <p className="text-[10px] text-gray-400 font-jakarta">Paid</p>
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {[
                  { label: 'Impressions', value: p.impressions.toLocaleString() },
                  { label: 'Clicks', value: p.clicks.toLocaleString() },
                  { label: 'CTR', value: p.ctr },
                  { label: 'Avg. Time', value: p.avgTimeOnPage },
                  { label: 'Conversions', value: p.conversions.toString() },
                ].map(m => (
                  <div key={m.label} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                    <p className="font-sora font-bold text-sm text-navy dark:text-white">{m.value}</p>
                    <p className="text-[9px] text-gray-400 font-jakarta mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Article Performance */}
      <div>
        <h2 className="font-sora font-bold text-base text-navy dark:text-white mb-3">Article Performance</h2>
        <div className="space-y-4">
          {articles.map((a, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center shrink-0"><FileText className="w-4 h-4 text-brand" /></div>
                <div>
                  <h3 className="font-sora font-bold text-sm text-navy dark:text-white">{a.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="badge-category text-[10px]">{a.type}</span>
                    <span className="text-xs text-gray-400 font-jakarta flex items-center gap-1"><Calendar className="w-3 h-3" /> {a.publishDate}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[
                  { label: 'Views', value: a.views.toLocaleString() },
                  { label: 'Unique Readers', value: a.uniqueReaders.toLocaleString() },
                  { label: 'Avg. Read Time', value: a.avgReadTime },
                  { label: 'Scroll Depth', value: a.scrollDepth },
                  { label: 'Shares', value: a.shares.toString() },
                  { label: 'Newsletter Clicks', value: a.newsletterClicks.toLocaleString() },
                ].map(m => (
                  <div key={m.label} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                    <p className="font-sora font-bold text-sm text-navy dark:text-white">{m.value}</p>
                    <p className="text-[9px] text-gray-400 font-jakarta mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ROI Summary */}
      <div className="bg-gradient-to-r from-brand/5 to-brand/10 dark:from-brand/10 dark:to-brand/20 rounded-xl border border-brand/20 p-6">
        <h2 className="font-sora font-bold text-base text-navy dark:text-white mb-4">ROI Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="font-sora font-extrabold text-xl text-brand">{overview.totalSpend}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta mt-1">Total Investment</p>
          </div>
          <div className="text-center">
            <p className="font-sora font-extrabold text-xl text-navy dark:text-white">{overview.totalImpressions}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta mt-1">Total Impressions</p>
          </div>
          <div className="text-center">
            <p className="font-sora font-extrabold text-xl text-green-600 dark:text-green-400">{totalClicks.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta mt-1">Total Clicks</p>
          </div>
          <div className="text-center">
            <p className="font-sora font-extrabold text-xl text-purple-600 dark:text-purple-400">
              ₹{(225000 / totalClicks).toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta mt-1">Cost per Click</p>
          </div>
        </div>
      </div>
    </div>
  );
}

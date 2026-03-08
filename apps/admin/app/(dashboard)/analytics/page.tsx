'use client';

import { useState } from 'react';
import { Eye, ArrowUpRight, Clock, TrendingUp, Globe, Monitor, Smartphone, Users, Calendar } from 'lucide-react';

const periods = ['7 days', '30 days', '90 days', 'This year'];

const metricsData: Record<string, { label: string; value: string; change: string; icon: typeof Eye }[]> = {
  '7 days': [
    { label: 'Pageviews', value: '89,420', change: '+22%', icon: Eye },
    { label: 'Unique Visitors', value: '32,100', change: '+18%', icon: Users },
    { label: 'Avg. Session', value: '4m 12s', change: '+8%', icon: Clock },
    { label: 'Bounce Rate', value: '38%', change: '-5%', icon: TrendingUp },
  ],
  '30 days': [
    { label: 'Pageviews', value: '342,800', change: '+15%', icon: Eye },
    { label: 'Unique Visitors', value: '118,200', change: '+12%', icon: Users },
    { label: 'Avg. Session', value: '3m 48s', change: '+5%', icon: Clock },
    { label: 'Bounce Rate', value: '41%', change: '-2%', icon: TrendingUp },
  ],
  '90 days': [
    { label: 'Pageviews', value: '1,024,500', change: '+28%', icon: Eye },
    { label: 'Unique Visitors', value: '385,000', change: '+22%', icon: Users },
    { label: 'Avg. Session', value: '4m 01s', change: '+10%', icon: Clock },
    { label: 'Bounce Rate', value: '39%', change: '-7%', icon: TrendingUp },
  ],
  'This year': [
    { label: 'Pageviews', value: '2,450,000', change: '+35%', icon: Eye },
    { label: 'Unique Visitors', value: '820,000', change: '+30%', icon: Users },
    { label: 'Avg. Session', value: '4m 22s', change: '+12%', icon: Clock },
    { label: 'Bounce Rate', value: '37%', change: '-8%', icon: TrendingUp },
  ],
};

const topPages = [
  { page: '/', title: 'Homepage', views: 28400 },
  { page: '/news/india-ai-revolution-2025', title: 'India AI Revolution 2025', views: 15420 },
  { page: '/news/gpt5-launch', title: 'GPT-5 Launch Coverage', views: 12300 },
  { page: '/tools', title: 'Editor\'s Picks: AI Tools', views: 8200 },
  { page: '/funding', title: 'Funding Digest', views: 5600 },
  { page: '/stories/sarvam-ai-story', title: 'Sarvam AI Founder Story', views: 4800 },
];

const referrers = [
  { source: 'Google Search', visits: 18200, pct: 45 },
  { source: 'Twitter / X', visits: 8100, pct: 20 },
  { source: 'LinkedIn', visits: 6400, pct: 16 },
  { source: 'Direct', visits: 4800, pct: 12 },
  { source: 'Newsletter', visits: 2900, pct: 7 },
];

const devices = [
  { type: 'Desktop', pct: 58, icon: Monitor },
  { type: 'Mobile', pct: 38, icon: Smartphone },
  { type: 'Other', pct: 4, icon: Globe },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7 days');
  const metrics = metricsData[period];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Analytics</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">Traffic and engagement overview</p>
        </div>
        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1">
          {periods.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${p === period ? 'bg-brand text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
            <m.icon className="w-5 h-5 text-gray-400 dark:text-gray-500 mb-3" />
            <p className="font-sora font-extrabold text-xl text-navy dark:text-white">{m.value}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400 font-jakarta">{m.label}</span>
              <span className={`text-xs font-semibold flex items-center gap-0.5 ${m.change.startsWith('+') || m.change.startsWith('-') ? (m.label === 'Bounce Rate' ? (m.change.startsWith('-') ? 'text-green-600 dark:text-green-400' : 'text-brand') : (m.change.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-brand')) : 'text-gray-400'}`}>
                <ArrowUpRight className="w-3 h-3" /> {m.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="font-sora font-bold text-base text-navy dark:text-white mb-4">Top Pages</h2>
          <div className="space-y-3">
            {topPages.map((p, i) => (
              <div key={p.page} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-xs text-gray-300 dark:text-gray-600 font-sora font-bold text-right">{i + 1}</span>
                  <div>
                    <p className="text-sm font-semibold text-navy dark:text-white font-jakarta line-clamp-1">{p.title}</p>
                    <p className="text-[11px] text-gray-400 font-jakarta">{p.page}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-navy dark:text-white font-sora">{p.views.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="font-sora font-bold text-base text-navy dark:text-white mb-4">Traffic Sources</h2>
            <div className="space-y-3">
              {referrers.map((r) => (
                <div key={r.source}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-jakarta text-gray-700 dark:text-gray-300">{r.source}</span>
                    <span className="text-sm font-sora font-bold text-brand">{r.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand rounded-full transition-all duration-500" style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="font-sora font-bold text-base text-navy dark:text-white mb-4">Devices</h2>
            <div className="space-y-3">
              {devices.map((d) => (
                <div key={d.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <d.icon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-jakarta text-gray-700 dark:text-gray-300">{d.type}</span>
                  </div>
                  <span className="text-sm font-sora font-bold text-navy dark:text-white">{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

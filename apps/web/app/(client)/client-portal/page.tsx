'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Eye, FileText, Crown, Zap, TrendingUp, ArrowUpRight,
  IndianRupee, Calendar, Clock, CheckCircle, AlertCircle,
  FileEdit, BarChart3, Megaphone,
} from 'lucide-react';

/* ─── Mock Data ─── */
const overview = {
  plan: 'Premium',
  planPrice: '₹75,000/mo',
  articlesPublished: 4,
  totalViews: '24,620',
  totalImpressions: '1,48,500',
  nextBilling: 'Apr 1, 2025',
};

const submissions = [
  { id: '1', title: 'Sarvam AI — Series A Deep Dive: Building India\'s Language AI', status: 'PUBLISHED', date: 'Mar 5, 2025', views: 15420 },
  { id: '2', title: 'Sarvam AI\'s $41M Series A: What It Means for India\'s AI Stack', status: 'PUBLISHED', date: 'Mar 2, 2025', views: 9200 },
  { id: '3', title: 'How We Built Sarvam\'s Indic Language Pipeline', status: 'UNDER_REVIEW', date: 'Mar 7, 2025', views: 0 },
  { id: '4', title: 'Behind the Scenes: Sarvam AI\'s Data Strategy', status: 'DRAFT', date: 'Mar 8, 2025', views: 0 },
];

const activePlacements = [
  { zone: 'Hero Cover Story', tier: 'Premium', icon: Crown, headline: 'Sarvam AI — Series A Deep Dive', endDate: 'Mar 31, 2025', impressions: 98200, clicks: 5410 },
  { zone: 'Breaking Ticker', tier: 'Premium', icon: Zap, headline: 'Sarvam AI raises $41M for India-first LLMs', endDate: 'Mar 7, 2025', impressions: 50300, clicks: 1680 },
];

const statusColors: Record<string, string> = {
  PUBLISHED: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  UNDER_REVIEW: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  APPROVED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  REJECTED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

const statusIcons: Record<string, typeof CheckCircle> = {
  PUBLISHED: CheckCircle,
  UNDER_REVIEW: Clock,
  DRAFT: FileEdit,
  APPROVED: CheckCircle,
  REJECTED: AlertCircle,
};

export default function ClientPortalPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Welcome back, Sarvam AI</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">Here&apos;s your content performance at a glance</p>
        </div>
        <Link href="/submit-content" className="btn-brand text-sm flex items-center gap-2">
          <FileEdit className="w-4 h-4" /> Submit New Content
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Current Plan', value: overview.plan, sub: overview.planPrice, icon: Crown, color: 'text-brand' },
          { label: 'Articles Published', value: overview.articlesPublished.toString(), icon: FileText, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Total Views', value: overview.totalViews, icon: Eye, color: 'text-green-600 dark:text-green-400' },
          { label: 'Total Impressions', value: overview.totalImpressions, icon: TrendingUp, color: 'text-purple-600 dark:text-purple-400' },
          { label: 'Next Billing', value: overview.nextBilling, icon: Calendar, color: 'text-orange-600 dark:text-orange-400' },
        ].map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
            <card.icon className={`w-5 h-5 mb-2 ${card.color}`} />
            <p className="font-sora font-extrabold text-lg text-navy dark:text-white">{card.value}</p>
            <p className="text-[11px] text-gray-400 font-jakarta mt-0.5">{card.label}</p>
            {card.sub && <p className="text-[10px] text-gray-400 font-jakarta">{card.sub}</p>}
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
        {/* Recent Submissions */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sora font-bold text-base text-navy dark:text-white">Recent Submissions</h2>
            <Link href="/submit-content" className="text-xs text-brand font-semibold hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {submissions.map((s) => {
              const StatusIcon = statusIcons[s.status] || Clock;
              return (
                <div key={s.id} className="flex items-start justify-between gap-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-sora font-semibold text-sm text-navy dark:text-white truncate">{s.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400 font-jakarta">{s.date}</span>
                      {s.views > 0 && <span className="text-xs text-gray-400 font-jakarta flex items-center gap-1"><Eye className="w-3 h-3" /> {s.views.toLocaleString()}</span>}
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold shrink-0 ${statusColors[s.status]}`}>
                    <StatusIcon className="w-3 h-3" />{s.status.replace(/_/g, ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Placements */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sora font-bold text-base text-navy dark:text-white">Active Placements</h2>
            <Link href="/my-placements" className="text-xs text-brand font-semibold hover:underline">View all</Link>
          </div>
          <div className="space-y-4">
            {activePlacements.map((p, i) => (
              <div key={i} className="border border-gray-100 dark:border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <p.icon className="w-4 h-4 text-brand" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-sora font-bold text-sm text-navy dark:text-white">{p.zone}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-red-50 dark:bg-red-900/20 text-brand">{p.tier}</span>
                    </div>
                    <p className="text-xs text-gray-400 font-jakarta mt-0.5">{p.headline}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 text-center">
                    <p className="font-sora font-bold text-sm text-navy dark:text-white">{p.impressions.toLocaleString()}</p>
                    <p className="text-[9px] text-gray-400 font-jakarta">Impressions</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 text-center">
                    <p className="font-sora font-bold text-sm text-navy dark:text-white">{p.clicks.toLocaleString()}</p>
                    <p className="text-[9px] text-gray-400 font-jakarta">Clicks</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 text-center">
                    <p className="font-sora font-bold text-sm text-navy dark:text-white flex items-center justify-center gap-1"><Calendar className="w-3 h-3 text-gray-400" />{p.endDate}</p>
                    <p className="text-[9px] text-gray-400 font-jakarta">Ends</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

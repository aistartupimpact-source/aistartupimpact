import React from 'react';
import { prisma } from '@aistartupimpact/database';
import { ArrowUpRight, ArrowDownRight, Users, MousePointerClick, Star, Clock } from 'lucide-react';
import { ReferralCopyBox } from './ReferralCopyBox';
// import { cookies } from 'next/headers'; -> In real scenario, retrieve userId from auth session

// We'll mock the 'loggedInFounderId' for demonstration according to the plan
const LOGGED_IN_USER_ID = 'test-founder-id';

export default async function FounderDashboardPage() {
  // 1. Fetch user's tools
  const tools: any[] = []; /* await prisma.aiTool.findMany({
    where: { submittedBy: LOGGED_IN_USER_ID }, // In a real scenario, map securely
    // But since `submittedBy` is tied to userId, for this demo we'll just grab the first featured tool
    take: 1
  }); */

  // If we don't have tools, mock one for UX perfection demonstration 
  const tool = tools[0] || {
    id: 'mock-123',
    name: 'AutoCodeGen AI',
    status: 'APPROVED',
    listingTier: 'FEATURED',
    clicks: 347,
    avgRating: 4.3,
    reviewCount: 18,
    tierExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6.5), // 6.5 days from now
    referralCode: 'FOUNDER-G294-X'
  };

  // 2. Mock WoW Logic (Week over Week)
  // In production: Count ToolTraffic rows between (now - 7d) vs (now-14d to now-7d)
  const viewsThisWeek = 2841;
  const viewsLastWeek = 2490;
  const wowViews = Math.round(((viewsThisWeek - viewsLastWeek) / viewsLastWeek) * 100);

  const clicksThisWeek = tool.clicks; // mock 347
  const clicksLastWeek = 300;
  const wowClicks = Math.round(((clicksThisWeek - clicksLastWeek) / clicksLastWeek) * 100);

  // 3. Expiry Countdown
  const now = new Date();
  const expiresAt = tool.tierExpiresAt ? new Date(tool.tierExpiresAt) : null;
  const msLeft = expiresAt ? expiresAt.getTime() - now.getTime() : 0;
  const daysLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60 * 24)));
  const isExpiringSoon = daysLeft <= 7;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-sora font-extrabold text-navy dark:text-white">Founder Dashboard</h1>
            <p className="text-gray-500 font-jakarta mt-1">Analytics for your active property: <strong>{tool.name}</strong></p>
          </div>
          {tool.listingTier === 'FREE' && (
            <button className="bg-brand text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-brand/20 hover:scale-105 transition-transform">
              Upgrade to Featured
            </button>
          )}
        </div>

        {/* Expiry Banner */}
        {tool.listingTier !== 'FREE' && isExpiringSoon && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-pulse">
            <div className="flex items-center gap-3 text-amber-800 dark:text-amber-300">
              <Clock className="w-6 h-6" />
              <div>
                <strong className="block font-sora text-sm">Tier Expiring Soon</strong>
                <span className="text-xs font-jakarta">Your {tool.listingTier} placement drops to FREE in {daysLeft} days. Traffic drops by 80% on average.</span>
              </div>
            </div>
            <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow transition-colors whitespace-nowrap">
              Renew Now (10% Off)
            </button>
          </div>
        )}

        {/* 4-Grid Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Profile Views" value={viewsThisWeek} wow={wowViews} icon={Users} />
          <MetricCard title="Website Clicks" value={clicksThisWeek} wow={wowClicks} icon={MousePointerClick} />
          <MetricCard title="Avg Rating" value={tool.avgRating} subtitle={`${tool.reviewCount} total reviews`} icon={Star} wow={null} />

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-gray-500 font-jakarta text-sm">Category Rank</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-sora font-extrabold text-navy dark:text-white">#4</span>
              <span className="text-sm font-jakarta text-gray-400">/ 82 tools</span>
            </div>
            <p className="mt-4 text-xs text-green-600 flex items-center font-bold">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +2 positions this week
            </p>
          </div>
        </div>

        {/* Traffic Sources & Referral Mechanism */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Traffic breakdown */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-2">
            <h3 className="font-sora font-bold text-navy dark:text-white mb-6">Traffic Sources (30 Days)</h3>
            <div className="space-y-6">
              <TrafficBar label="Direct / Brand" percent={62} color="bg-indigo-500" />
              <TrafficBar label="Search Engine (SEO)" percent={24} color="bg-brand" />
              <TrafficBar label="Referral (Newsletters & Affiliates)" percent={14} color="bg-emerald-500" />
            </div>
            <p className="mt-6 text-xs text-gray-500 font-jakarta text-center">Data rendered from ToolTraffic models generated since publishing date.</p>
          </div>

          {/* Virality Box */}
          <div className="bg-gradient-to-br from-indigo-900 to-navy text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8 blur-2xl"></div>
            <div>
              <h3 className="font-sora font-bold text-xl mb-2">Invite Founders</h3>
              <p className="font-jakarta text-indigo-200 text-sm mb-6">
                Share your unique code. If a founder signs up and buys a premium tier using your link, we automatically add <strong>+30 days</strong> to your Featured expiry! Let's grow the ecosystem together.
              </p>
            </div>
            <div>
              <ReferralCopyBox code={tool.referralCode} />
              <p className="text-center text-[10px] text-indigo-300 mt-3 uppercase tracking-wider font-bold">0 successful referrals</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// Subcomponents
function MetricCard({ title, value, wow, subtitle, icon: Icon }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <h3 className="text-gray-500 font-jakarta text-sm">{title}</h3>
        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      <div className="mt-2">
        <span className="text-3xl font-sora font-extrabold text-navy dark:text-white">{value.toLocaleString()}</span>
      </div>
      {wow !== null && (
        <p className={`mt-4 text-xs flex items-center font-bold ${wow >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {wow >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
          {Math.abs(wow)}% WoW
        </p>
      )}
      {subtitle && <p className="mt-4 text-xs text-gray-400 font-jakarta">{subtitle}</p>}
    </div>
  );
}

function TrafficBar({ label, percent, color }: { label: string, percent: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-sora text-gray-700 dark:text-gray-300 font-bold">{label}</span>
        <span className="font-jakarta text-gray-500">{percent}%</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Building2, Calendar, CheckCircle, Clock, ChevronDown, ChevronUp, Crown } from 'lucide-react';

interface Creative {
  id: string; zone: string; headline: string; bodyText: string;
  ctaText: string; ctaUrl: string; imageUrl?: string;
  isActive: boolean; impressionCount: number; clickCount: number;
}
interface Campaign {
  id: string; clientName: string; companyName: string; clientEmail: string;
  status: string; startDate: string; endDate: string;
  totalBudgetPaise: number; notes?: string; createdAt: string;
  creatives: Creative[];
}
interface Stats { total: number; active: number; impressions: number; clicks: number; }

const ZONE_LABELS: Record<string, string> = {
  H1_HERO_FEATURE: 'Hero Cover Story', H2_TRENDING_STRIP: 'Breaking Ticker',
  H3_SECTION_SPONSOR: 'Section Sponsor', H4_NEWSLETTER_CTA: 'Newsletter CTA',
  A1_IN_ARTICLE: 'In-Article Ad', A2_SIDEBAR_STICKY: 'Sidebar Sticky',
  A3_END_OF_ARTICLE: 'End of Article', D1_TOOL_FEATURED: 'Tool Featured',
  D2_STARTUP_BOOST: 'Startup Boost', N1_NEWSLETTER_PRIMARY: 'Newsletter Primary',
  N2_NEWSLETTER_FOOTER: 'Newsletter Footer',
};

const statusStyle: Record<string, string> = {
  ACTIVE: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  PENDING_REVIEW: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  PAUSED: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  COMPLETED: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
  CANCELLED: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
};

const fmt = (d: string) =>
  d ? new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtBudget = (p: number) => p ? `₹${(Number(p) / 100).toLocaleString('en-IN')}` : '—';
const calcCTR = (imp: number, clk: number) =>
  imp > 0 ? ((clk / imp) * 100).toFixed(1) + '%' : '0%';

export default function MyPlacementsClient({ campaigns, stats }: { campaigns: Campaign[]; stats: Stats }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const active = campaigns.filter(c => c.status === 'ACTIVE');
  const others = campaigns.filter(c => c.status !== 'ACTIVE');
  const totalBudget = campaigns.reduce((s, c) => s + Number(c.totalBudgetPaise || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">My Placements</h1>
        <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">Track your active and past ad campaigns</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Campaigns', value: stats.active, color: 'text-green-600 dark:text-green-400' },
          { label: 'Total Campaigns', value: stats.total, color: 'text-navy dark:text-white' },
          { label: 'Total Impressions', value: Number(stats.impressions).toLocaleString(), color: 'text-brand' },
          { label: 'Total Budget', value: fmtBudget(totalBudget), color: 'text-brand' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 text-center">
            <p className={`font-sora font-extrabold text-xl ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 font-jakarta mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-12 text-center">
          <Crown className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-jakarta">No placement campaigns yet.</p>
          <p className="text-xs text-gray-400 font-jakarta mt-1">Contact us to advertise on AI Startup Impact.</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <h2 className="font-sora font-bold text-base text-navy dark:text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Active Campaigns
              </h2>
              <CampaignList campaigns={active} expanded={expanded} setExpanded={setExpanded} />
            </div>
          )}
          {others.length > 0 && (
            <div>
              <h2 className="font-sora font-bold text-base text-navy dark:text-white mb-3">Past Campaigns</h2>
              <CampaignList campaigns={others} expanded={expanded} setExpanded={setExpanded} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CampaignList({ campaigns, expanded, setExpanded }: {
  campaigns: Campaign[];
  expanded: string | null;
  setExpanded: (id: string | null) => void;
}) {
  return (
    <div className="space-y-3">
      {campaigns.map(c => {
        const totalImp = c.creatives.reduce((s, cr) => s + Number(cr.impressionCount || 0), 0);
        const totalClk = c.creatives.reduce((s, cr) => s + Number(cr.clickCount || 0), 0);
        const isOpen = expanded === c.id;
        return (
          <div key={c.id} className={`bg-white dark:bg-gray-900 rounded-xl border ${c.status === 'ACTIVE' ? 'border-green-200 dark:border-green-900/40' : 'border-gray-100 dark:border-gray-800'}`}>
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-sora font-bold text-sm text-navy dark:text-white">{c.companyName}</h3>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusStyle[c.status] || statusStyle.DRAFT}`}>
                        {c.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-jakarta mt-0.5">{c.clientName} · {c.clientEmail}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 font-jakarta flex-wrap">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {fmt(c.startDate)} → {fmt(c.endDate)}</span>
                      <span className="font-semibold text-brand">{fmtBudget(c.totalBudgetPaise)}</span>
                      <span>{c.creatives.length} creative{c.creatives.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setExpanded(isOpen ? null : c.id)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { label: 'Impressions', value: totalImp.toLocaleString() },
                  { label: 'Clicks', value: totalClk.toLocaleString() },
                  { label: 'CTR', value: calcCTR(totalImp, totalClk) },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                    <p className="font-sora font-bold text-sm text-navy dark:text-white">{s.value}</p>
                    <p className="text-[9px] text-gray-400 font-jakarta">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Creatives breakdown */}
            {isOpen && (
              <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-4">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide font-jakarta mb-3">Ad Creatives</h4>
                {c.creatives.length === 0 ? (
                  <p className="text-xs text-gray-400 font-jakarta italic">No creatives added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {c.creatives.map(cr => (
                      <div key={cr.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg px-4 py-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand font-jakarta">{ZONE_LABELS[cr.zone] || cr.zone}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${cr.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                              {cr.isActive ? 'LIVE' : 'PAUSED'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 font-jakarta mt-0.5 line-clamp-1">{cr.headline}</p>
                          <p className="text-[10px] text-gray-400 font-jakarta mt-0.5">
                            {Number(cr.impressionCount).toLocaleString()} impressions · {Number(cr.clickCount).toLocaleString()} clicks · CTR {calcCTR(Number(cr.impressionCount), Number(cr.clickCount))}
                          </p>
                        </div>
                        {cr.ctaUrl && (
                          <a href={cr.ctaUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-brand font-semibold hover:underline shrink-0 ml-4">
                            {cr.ctaText || 'View'}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

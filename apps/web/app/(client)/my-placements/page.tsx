'use client';

import { useState } from 'react';
import {
  Crown, Zap, Newspaper, Calendar, CheckCircle, Clock,
  IndianRupee, ArrowUpRight, RefreshCcw,
} from 'lucide-react';

interface Placement {
  id: string; zone: string; tier: string; icon: typeof Crown;
  headline: string; startDate: string; endDate: string;
  paidAmount: string; status: string;
  impressions: number; clicks: number; ctr: string;
}

const placements: Placement[] = [
  { id: '1', zone: 'Hero Cover Story', tier: 'Premium', icon: Crown, headline: 'Sarvam AI — Series A Deep Dive: Building India\'s Language AI', startDate: 'Mar 1, 2025', endDate: 'Mar 31, 2025', paidAmount: '₹75,000', status: 'ACTIVE', impressions: 98200, clicks: 5410, ctr: '5.5%' },
  { id: '2', zone: 'Breaking Ticker', tier: 'Premium', icon: Zap, headline: 'Sarvam AI raises $41M to build India-first LLMs', startDate: 'Mar 1, 2025', endDate: 'Mar 7, 2025', paidAmount: '₹75,000', status: 'ACTIVE', impressions: 50300, clicks: 1680, ctr: '3.3%' },
  { id: '3', zone: 'Newsletter Featured', tier: 'Premium', icon: Crown, headline: 'Inside Sarvam AI\'s Indic Language Pipeline', startDate: 'Feb 15, 2025', endDate: 'Feb 22, 2025', paidAmount: '₹75,000', status: 'COMPLETED', impressions: 42100, clicks: 1520, ctr: '3.6%' },
  { id: '4', zone: 'Latest Stories — Card #1', tier: 'Growth', icon: Newspaper, headline: 'Our mission to democratize AI in Indian languages', startDate: 'Feb 1, 2025', endDate: 'Feb 8, 2025', paidAmount: '₹35,000', status: 'COMPLETED', impressions: 28900, clicks: 890, ctr: '3.1%' },
];

const tierColors: Record<string, string> = {
  Premium: 'bg-red-50 dark:bg-red-900/20 text-brand',
  Growth: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  Starter: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
};

export default function MyPlacementsPage() {
  const active = placements.filter(p => p.status === 'ACTIVE');
  const completed = placements.filter(p => p.status === 'COMPLETED');
  const totalSpent = placements.reduce((s, p) => s + parseInt(p.paidAmount.replace(/[₹,]/g, '')), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">My Placements</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">Track active and past placement zones</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 text-center">
          <p className="font-sora font-extrabold text-2xl text-brand">{active.length}</p>
          <p className="text-xs text-gray-400 font-jakarta mt-1">Active Now</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 text-center">
          <p className="font-sora font-extrabold text-2xl text-gray-500 dark:text-gray-300">{completed.length}</p>
          <p className="text-xs text-gray-400 font-jakarta mt-1">Completed</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 text-center">
          <p className="font-sora font-extrabold text-2xl text-brand">₹{totalSpent.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-400 font-jakarta mt-1">Total Spent</p>
        </div>
      </div>

      {/* Active Placements */}
      {active.length > 0 && (
        <div>
          <h2 className="font-sora font-bold text-base text-navy dark:text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Active Placements
          </h2>
          <div className="space-y-4">
            {active.map((p) => (
              <div key={p.id} className="bg-white dark:bg-gray-900 rounded-xl border-2 border-green-200 dark:border-green-900/40 p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center"><p.icon className="w-5 h-5 text-brand" /></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-sora font-bold text-sm text-navy dark:text-white">{p.zone}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${tierColors[p.tier]}`}>{p.tier}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          <CheckCircle className="w-3 h-3" /> LIVE
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta mt-1">{p.headline}</p>
                      <span className="text-xs text-gray-400 font-jakarta flex items-center gap-1 mt-1"><Calendar className="w-3 h-3" /> {p.startDate} → {p.endDate}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-sora font-extrabold text-lg text-brand">{p.paidAmount}</p>
                    <p className="text-[10px] text-gray-400 font-jakarta">Paid</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                    <p className="font-sora font-bold text-sm text-navy dark:text-white">{p.impressions.toLocaleString()}</p>
                    <p className="text-[9px] text-gray-400 font-jakarta">Impressions</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                    <p className="font-sora font-bold text-sm text-navy dark:text-white">{p.clicks.toLocaleString()}</p>
                    <p className="text-[9px] text-gray-400 font-jakarta">Clicks</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                    <p className="font-sora font-bold text-sm text-navy dark:text-white">{p.ctr}</p>
                    <p className="text-[9px] text-gray-400 font-jakarta">CTR</p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button className="text-xs text-brand font-semibold hover:underline flex items-center gap-1"><RefreshCcw className="w-3 h-3" /> Renew Placement</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Placements */}
      {completed.length > 0 && (
        <div>
          <h2 className="font-sora font-bold text-base text-navy dark:text-white mb-3">Past Placements</h2>
          <div className="space-y-3">
            {completed.map((p) => (
              <div key={p.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 opacity-80">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><p.icon className="w-5 h-5 text-gray-400" /></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-sora font-bold text-sm text-navy dark:text-white">{p.zone}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${tierColors[p.tier]}`}>{p.tier}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" /> COMPLETED
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 font-jakarta mt-1">{p.headline}</p>
                      <div className="flex items-center gap-4 mt-1.5">
                        <span className="text-xs text-gray-400 font-jakarta flex items-center gap-1"><Calendar className="w-3 h-3" /> {p.startDate} → {p.endDate}</span>
                        <span className="text-xs text-gray-400 font-jakarta">{p.impressions.toLocaleString()} impressions · {p.clicks.toLocaleString()} clicks</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-sora font-bold text-sm text-gray-500 dark:text-gray-400">{p.paidAmount}</p>
                    <button className="text-xs text-brand font-semibold hover:underline mt-1 flex items-center gap-1 ml-auto"><ArrowUpRight className="w-3 h-3" /> Rebook</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

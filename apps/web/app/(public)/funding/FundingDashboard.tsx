"use client";

import React, { useState, useMemo } from 'react';
import { IndianRupee, MapPin, Building2, Calendar, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface FundingRound {
  id: string;
  roundType: string;
  amountInr: number | null;
  amountUsd: number | null;
  announcedAt: string;
  leadInvestors: string[];
  allInvestors: string[];
  startupName: string;
  startupSlug: string;
  headquartersCity: string | null;
}

export default function FundingDashboard({ data }: { data: FundingRound[] }) {
  const [filterStage, setFilterStage] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [filterInvestor, setFilterInvestor] = useState('All');

  // Format amount — prefer USD (more accurate for 2026 rounds), fallback to INR
  const formatAmount = (row: FundingRound) => {
    if (row.amountUsd && Number(row.amountUsd) > 0) {
      const usd = Number(row.amountUsd) / 100;
      if (usd >= 1e9) return `$${(usd / 1e9).toFixed(1)}B`;
      if (usd >= 1e6) return `$${(usd / 1e6).toFixed(0)}M`;
      return `$${(usd / 1e3).toFixed(0)}K`;
    }
    if (row.amountInr && Number(row.amountInr) > 0) {
      return `₹${(Number(row.amountInr) / 10000000).toFixed(1)}Cr`;
    }
    return 'Undisclosed';
  };

  // For sorting/highlighting — use USD cents or INR paise
  const getAmountForSort = (row: FundingRound) => {
    if (row.amountUsd) return Number(row.amountUsd) * 83; // rough paise equiv
    return Number(row.amountInr || 0);
  };

  // Compute Total Capital Raised
  const totalRaisedUsd = useMemo(() => {
    return data.reduce((acc, curr) => acc + (Number(curr.amountUsd || 0) / 100), 0);
  }, [data]);

  const totalDisplay = totalRaisedUsd >= 1e9
    ? `$${(totalRaisedUsd / 1e9).toFixed(1)}B`
    : `$${(totalRaisedUsd / 1e6).toFixed(0)}M`;

  const filteredData = useMemo(() => {
    const matched = data.filter(d => {
      const matchStage = filterStage === 'All' || d.roundType.toLowerCase().includes(filterStage.toLowerCase());
      const matchYear = filterYear === 'All' || new Date(d.announcedAt).getFullYear().toString() === filterYear;
      const matchInvestor = filterInvestor === 'All' || (d.leadInvestors && d.leadInvestors.some(inv => inv === filterInvestor));
      return matchStage && matchYear && matchInvestor;
    });

    return matched.sort((a, b) => {
      const aF = a.amountInr > 1000000000;
      const bF = b.amountInr > 1000000000;
      if (aF && !bF) return -1;
      if (!aF && bF) return 1;
      return new Date(b.announcedAt).getTime() - new Date(a.announcedAt).getTime();
    });
  }, [data, filterStage, filterYear, filterInvestor]);

  // Chart Data: Deal Size Distribution
  const stageData = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(d => {
      let stage = 'Other';
      const lr = d.roundType.toLowerCase();
      if (lr.includes('seed')) stage = 'Seed';
      else if (lr.includes('series a')) stage = 'Series A';
      else if (lr.includes('series b')) stage = 'Series B';
      else if (lr.includes('series c') || lr.includes('series d')) stage = 'Late Stage';
      map.set(stage, (map.get(stage) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).filter(v => v.value > 0);
  }, [data]);
  const PIE_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#6b7280'];

  // Chart Data: Momentum (Sum by Month/Year)
  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    const sorted = [...data].sort((a, b) => new Date(a.announcedAt).getTime() - new Date(b.announcedAt).getTime());

    sorted.forEach((row) => {
      const d = new Date(row.announcedAt);
      const monthYear = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      const currentSum = map.get(monthYear) || 0;
      // Convert to Crores for the chart
      map.set(monthYear, currentSum + Number(row.amountInr || 0) / 10000000);
    });

    return Array.from(map.entries()).map(([month, amount]) => ({
      name: month,
      amount: Math.round(amount)
    })).slice(-12); // Show last 12 months momentum
  }, [data]);

  return (
    <div className="space-y-8">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-6 bg-gradient-to-br from-brand-50 to-white dark:from-brand-900/20 dark:to-gray-900">
          <div className="flex items-center gap-3 mb-2 text-gray-500 font-jakarta text-sm">
            <TrendingUp className="w-4 h-4 text-brand" /> Total Ecosystem Capital
          </div>
          <div className="font-sora font-extrabold text-3xl text-navy dark:text-white">
            {totalDisplay}+
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2 text-gray-500 font-jakarta text-sm">
            <Building2 className="w-4 h-4 text-brand" /> Total Deals Logged
          </div>
          <div className="font-sora font-extrabold text-3xl text-navy dark:text-white">
            {data.length}
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2 text-gray-500 font-jakarta text-sm">
            <Calendar className="w-4 h-4 text-brand" /> YTD Period
          </div>
          <div className="font-sora font-extrabold text-3xl text-navy dark:text-white mt-1">
            2024-2025
          </div>
        </div>
      </div>

      {/* Embedded Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card p-6 lg:col-span-2">
          <h3 className="section-title mb-6">Funding Momentum (Last 12 Months)</h3>
          <div className="h-64 sm:h-80 w-full ml-[-10px] sm:ml-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}Cr`} width={65} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(79, 70, 229, 0.05)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${value} Cr`, 'Amount']}
                />
                <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="section-title mb-6">Dist. by Stage</h3>
          <div className="h-56 sm:h-64 w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stageData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => [value, 'Deals']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-4">
            {stageData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-gray-500 font-jakarta whitespace-nowrap">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                {entry.name} <span className="text-gray-400 font-medium">({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filterable Table */}
      <div className="card overflow-hidden">



        {/* Filters Top Bar */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/30">

          {/* Title & Filters Area - Left */}
          <div className="flex-1 flex flex-wrap items-center justify-center md:justify-start gap-4 w-full md:w-auto">
            <h3 className="font-sora font-bold text-lg mr-2">All Rounds</h3>
            {filterInvestor !== 'All' && (
              <button
                onClick={() => setFilterInvestor('All')}
                className="text-sm bg-brand/10 text-brand px-16 py-1.5 rounded-full hover:bg-brand/20 flex items-center justify-center gap-6 transition-colors min-w-[350px] shadow-sm font-medium"
              >
                Filtering: <span className="font-extrabold truncate max-w-[280px]">{filterInvestor}</span> ✕
              </button>
            )}

            <div className="flex gap-3">
              <select className="input-field py-2.5 px-5 shadow-sm text-base min-w-[180px] cursor-pointer" value={filterStage} onChange={(e) => setFilterStage(e.target.value)}>
                <option value="All">All Stages</option>
                <option value="Seed">Pre-Seed & Seed</option>
                <option value="Series A">Series A</option>
                <option value="Series B">Series B</option>
              </select>
              <select className="input-field py-2.5 px-5 shadow-sm text-base min-w-[150px] cursor-pointer" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                <option value="All">All Years</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          </div>

          {/* Submit Area - Right */}
          <div className="flex-none flex items-center justify-end w-full md:w-auto mt-2 md:mt-0">
            <a href="/submit-tool" className="text-sm font-semibold bg-brand text-white px-6 py-2 rounded-full hover:bg-brand-600 transition-colors shadow-md w-full md:w-auto text-center whitespace-nowrap">
              + Submit Round
            </a>
          </div>

        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-jakarta">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4">Startup</th>
                <th className="px-6 py-4">Round</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 hidden sm:table-cell">Lead Investors</th>
                <th className="px-6 py-4 hidden lg:table-cell">Other Investors</th>
                <th className="px-6 py-4 hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredData.map((row) => (
                <tr key={row.id} className={`transition-colors ${getAmountForSort(row) > 1000000000 ? 'bg-amber-50/30 hover:bg-amber-50/60 dark:bg-amber-900/5 dark:hover:bg-amber-900/10' : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/20'}`}>
                  <td className="px-6 py-4">
                    <a href={`/startups/${row.startupSlug}`} className="font-sora font-bold text-sm text-navy dark:text-white hover:text-brand transition-colors block">
                      {row.startupName}
                      {getAmountForSort(row) > 1000000000 && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 align-middle">FEATURED</span>
                      )}
                    </a>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full inline-block font-semibold">
                        AI Startup
                      </span>
                      {row.headquartersCity && (
                        <span className="text-xs text-gray-400 flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />{row.headquartersCity}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-full uppercase">{row.roundType}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-sora font-extrabold text-sm text-brand block">
                      {formatAmount(row)}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell text-xs text-gray-500">
                    <div className="max-w-[150px] flex flex-wrap gap-1">
                      {row.leadInvestors && row.leadInvestors.length > 0 ? row.leadInvestors.map((inv: string, i: number) => (
                        <React.Fragment key={inv}>
                          <button onClick={() => setFilterInvestor(inv)} className="hover:text-brand hover:underline text-left truncate max-w-full">
                            {inv}
                          </button>
                          {i < row.leadInvestors.length - 1 && <span className="opacity-50">,</span>}
                        </React.Fragment>
                      )) : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-xs text-gray-400">
                    <div className="max-w-[160px]">
                      {row.allInvestors && row.allInvestors.length > 0
                        ? row.allInvestors
                            .filter(inv => !row.leadInvestors.includes(inv))
                            .join(', ') || '—'
                        : '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-xs text-gray-500 whitespace-nowrap">
                    {new Date(row.announcedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredData.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm">No funding rounds matched your filters.</div>
        )}
      </div>
    </div>
  );
}

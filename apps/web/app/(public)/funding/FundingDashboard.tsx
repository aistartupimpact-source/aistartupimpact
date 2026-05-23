"use client";

import React, { useState, useMemo } from 'react';
import { IndianRupee, MapPin, Building2, Calendar, TrendingUp, Download, Users, Map as MapIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

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
  const [filterSector, setFilterSector] = useState('All');
  const [filterCity, setFilterCity] = useState('All');
  const [filterAmountMin, setFilterAmountMin] = useState(0);
  const [filterAmountMax, setFilterAmountMax] = useState(Infinity);
  const [showEmailModal, setShowEmailModal] = useState(false);

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

  // Determine if row should be featured (top 3-4 deals only)
  const topDeals = useMemo(() => {
    const sorted = [...data].sort((a, b) => getAmountForSort(b) - getAmountForSort(a));
    return new Set(sorted.slice(0, 3).map(d => d.id));
  }, [data]);

  // Format chart Y-axis values to be readable (₹2,000 Cr instead of ₹2000000Cr)
  const formatChartValue = (value: number) => {
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K Cr`;
    return `₹${value} Cr`;
  };

  // Calculate YTD period dynamically based on actual data
  const ytdPeriod = useMemo(() => {
    if (data.length === 0) return '2026';
    const dates = data.map(d => new Date(d.announcedAt).getFullYear());
    const minYear = Math.min(...dates);
    const maxYear = Math.max(...dates);
    return minYear === maxYear ? `${maxYear}` : `${minYear}–${maxYear}`;
  }, [data]);

  // Calculate largest single round
  const largestRound = useMemo(() => {
    if (data.length === 0) return null;
    const sorted = [...data].sort((a, b) => getAmountForSort(b) - getAmountForSort(a));
    const largest = sorted[0];
    const amount = Number(largest.amountUsd || 0) / 100;
    const displayAmount = amount >= 1e9 ? `$${(amount / 1e9).toFixed(1)}B` : `$${(amount / 1e6).toFixed(0)}M`;
    const date = new Date(largest.announcedAt);
    const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return {
      startup: largest.startupName,
      amount: displayAmount,
      date: monthYear
    };
  }, [data]);

  // Calculate deal count growth YoY
  const dealCountGrowth = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentYearDeals = data.filter(d => new Date(d.announcedAt).getFullYear() === currentYear).length;
    const lastYearDeals = data.filter(d => new Date(d.announcedAt).getFullYear() === currentYear - 1).length;
    
    if (lastYearDeals === 0) return null;
    return ((currentYearDeals - lastYearDeals) / lastYearDeals * 100).toFixed(0);
  }, [data]);

  // Compute Total Capital Raised
  const totalRaisedUsd = useMemo(() => {
    return data.reduce((acc, curr) => acc + (Number(curr.amountUsd || 0) / 100), 0);
  }, [data]);

  const totalDisplay = totalRaisedUsd >= 1e9
    ? `$${(totalRaisedUsd / 1e9).toFixed(1)}B`
    : `$${(totalRaisedUsd / 1e6).toFixed(0)}M`;

  // Calculate YoY growth
  const yoyGrowth = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentYearData = data.filter(d => new Date(d.announcedAt).getFullYear() === currentYear);
    const lastYearData = data.filter(d => new Date(d.announcedAt).getFullYear() === currentYear - 1);
    
    const currentTotal = currentYearData.reduce((acc, curr) => acc + (Number(curr.amountUsd || 0) / 100), 0);
    const lastTotal = lastYearData.reduce((acc, curr) => acc + (Number(curr.amountUsd || 0) / 100), 0);
    
    if (lastTotal === 0) return null;
    return ((currentTotal - lastTotal) / lastTotal * 100).toFixed(0);
  }, [data]);

  // Helper to categorize sector - updated with more specific AI categories
  const getSector = (startupName: string) => {
    const name = startupName.toLowerCase();
    
    // LLM & Foundation Models
    if (name.includes('sarvam') || name.includes('llm') || name.includes('language model') || name.includes('gpt')) return 'LLM';
    
    // Infrastructure AI (compute, cloud, chips)
    if (name.includes('neysa') || name.includes('infra') || name.includes('cloud') || name.includes('compute') || name.includes('chip')) return 'Infra AI';
    
    // Data & Analytics AI
    if (name.includes('deccan') || name.includes('data') || name.includes('analytics') || name.includes('insight') || name.includes('intelligence')) return 'Data AI';
    
    // Sales & Marketing AI
    if (name.includes('orbit') || name.includes('sales') || name.includes('crm') || name.includes('marketing') || name.includes('outreach')) return 'Sales AI';
    
    // Healthcare AI
    if (name.includes('health') || name.includes('med') || name.includes('bio') || name.includes('pharma')) return 'Health AI';
    
    // FinTech AI
    if (name.includes('fin') || name.includes('pay') || name.includes('bank') || name.includes('lending')) return 'FinTech AI';
    
    // EdTech AI
    if (name.includes('edu') || name.includes('learn') || name.includes('tutor')) return 'EdTech AI';
    
    // DevTools AI
    if (name.includes('dev') || name.includes('code') || name.includes('engineer')) return 'DevTools AI';
    
    return 'Other AI';
  };

  // Helper to determine trend signal based on amount, recency, and deal characteristics
  const getTrendSignal = (row: FundingRound) => {
    const amount = Number(row.amountUsd || 0) / 100;
    const daysAgo = Math.floor((Date.now() - new Date(row.announcedAt).getTime()) / (1000 * 60 * 60 * 24));
    
    // Hot: Large deals (>$100M) announced in last 60 days
    if (amount >= 100e6 && daysAgo <= 60) {
      return { label: 'Hot', color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' };
    }
    
    // Rising: Medium-large deals ($10M-$100M) in last 90 days
    if (amount >= 10e6 && amount < 100e6 && daysAgo <= 90) {
      return { label: 'Rising', color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' };
    }
    
    // New: Any deal in last 30 days
    if (daysAgo <= 30) {
      return { label: 'New', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' };
    }
    
    // Watch: Everything else
    return { label: 'Watch', color: 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400' };
  };

  const filteredData = useMemo(() => {
    const matched = data.filter(d => {
      const matchStage = filterStage === 'All' || d.roundType.toLowerCase().includes(filterStage.toLowerCase());
      const matchYear = filterYear === 'All' || new Date(d.announcedAt).getFullYear().toString() === filterYear;
      const matchInvestor = filterInvestor === 'All' || (d.leadInvestors && d.leadInvestors.some(inv => inv === filterInvestor));
      const matchSector = filterSector === 'All' || getSector(d.startupName) === filterSector;
      const matchCity = filterCity === 'All' || d.headquartersCity === filterCity;
      
      const amount = Number(d.amountUsd || 0) / 100;
      const matchAmount = amount >= filterAmountMin && amount <= filterAmountMax;
      
      return matchStage && matchYear && matchInvestor && matchSector && matchCity && matchAmount;
    });

    return matched.sort((a, b) => {
      const aF = getAmountForSort(a) > 1000000000;
      const bF = getAmountForSort(b) > 1000000000;
      if (aF && !bF) return -1;
      if (!aF && bF) return 1;
      return new Date(b.announcedAt).getTime() - new Date(a.announcedAt).getTime();
    });
  }, [data, filterStage, filterYear, filterInvestor, filterSector, filterCity, filterAmountMin, filterAmountMax]);

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

  // Sector Breakdown Analysis (using consistent AI sector categorization)
  const sectorData = useMemo(() => {
    const sectorMap = new Map<string, { count: number; amount: number }>();
    
    data.forEach(d => {
      const sector = getSector(d.startupName);
      
      const current = sectorMap.get(sector) || { count: 0, amount: 0 };
      sectorMap.set(sector, {
        count: current.count + 1,
        amount: current.amount + (Number(d.amountUsd || 0) / 100)
      });
    });
    
    return Array.from(sectorMap.entries())
      .map(([name, data]) => ({ name, count: data.count, amount: data.amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);
  }, [data]);

  // Top Investors Analysis - Enhanced for the new section
  const topInvestors = useMemo(() => {
    const investorMap = new Map<string, { deals: number; totalAmount: number; companies: string[] }>();
    
    data.forEach(d => {
      d.leadInvestors?.forEach(inv => {
        const current = investorMap.get(inv) || { deals: 0, totalAmount: 0, companies: [] };
        investorMap.set(inv, {
          deals: current.deals + 1,
          totalAmount: current.totalAmount + (Number(d.amountUsd || 0) / 100),
          companies: [...current.companies, d.startupName].slice(0, 3) // Keep top 3 companies
        });
      });
    });
    
    return Array.from(investorMap.entries())
      .map(([name, data]) => ({ 
        name, 
        deals: data.deals, 
        totalAmount: data.totalAmount,
        companies: data.companies
      }))
      .sort((a, b) => b.deals - a.deals)
      .slice(0, 8);
  }, [data]);

  // City Distribution Analysis
  const cityData = useMemo(() => {
    const cityMap = new Map<string, { count: number; amount: number }>();
    
    data.forEach(d => {
      if (d.headquartersCity) {
        const current = cityMap.get(d.headquartersCity) || { count: 0, amount: 0 };
        cityMap.set(d.headquartersCity, {
          count: current.count + 1,
          amount: current.amount + (Number(d.amountUsd || 0) / 100)
        });
      }
    });
    
    return Array.from(cityMap.entries())
      .map(([name, data]) => ({ name, count: data.count, amount: data.amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [data]);

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

  // Handle PDF download with email gate
  const handleDownloadReport = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowEmailModal(true);
  };

  const handleEmailSubmit = async (email: string) => {
    try {
      const response = await fetch('/api/funding-report/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setShowEmailModal(false);
        // Show success message
        alert('Thank you! Your download will start shortly. Check your email for the full report.');
        // TODO: Trigger actual PDF download when ready
        // window.open(result.data.downloadUrl, '_blank');
      } else {
        alert('Failed to process your request. Please try again.');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Email Gate Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="font-sora font-bold text-2xl mb-2">Download AI Startups Funding Report 2026</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              Get the complete analysis with sector breakdowns, investor profiles, and city-wise funding distribution.
            </p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const email = (e.target as any).email.value;
              handleEmailSubmit(email);
            }}>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                className="input-field w-full mb-4"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-brand text-white rounded-lg hover:bg-brand-600 transition-colors font-semibold"
                >
                  Download PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hero CTA Banner */}
      <div className="card p-8 bg-gradient-to-br from-brand-50 via-purple-50 to-pink-50 dark:from-brand-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-2 border-brand/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="font-sora font-extrabold text-3xl mb-2 text-navy dark:text-white">
              AI Startups Funding Tracker
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Complete analysis of {data.length} funding rounds • Sector breakdowns • Investor profiles • City distribution
            </p>
          </div>
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-3 px-8 py-4 bg-brand text-white rounded-xl hover:bg-brand-600 transition-all shadow-lg hover:shadow-xl font-semibold text-lg whitespace-nowrap"
          >
            <Download className="w-5 h-5" />
            Download Free PDF
          </button>
        </div>
      </div>

      {/* Top Stats Cards - Redesigned with Trend Deltas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Capital Raised */}
        <div className="card p-4 sm:p-6 bg-gradient-to-br from-brand-50 to-white dark:from-brand-900/20 dark:to-gray-900">
          <div className="text-[10px] sm:text-xs uppercase tracking-wide text-gray-500 font-jakarta font-semibold mb-2 sm:mb-3">
            Total Capital Raised
          </div>
          <div className="font-sora font-extrabold text-2xl sm:text-4xl text-navy dark:text-white mb-1 sm:mb-2">
            {totalDisplay}+
          </div>
          {yoyGrowth && (
            <div className={`text-xs sm:text-sm font-semibold ${Number(yoyGrowth) > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Number(yoyGrowth) > 0 ? '↑' : '↓'} {Math.abs(Number(yoyGrowth))}% vs {new Date().getFullYear() - 1}
            </div>
          )}
        </div>

        {/* Total Deals */}
        <div className="card p-4 sm:p-6">
          <div className="text-[10px] sm:text-xs uppercase tracking-wide text-gray-500 font-jakarta font-semibold mb-2 sm:mb-3">
            AI-only deals tracked
          </div>
          <div className="font-sora font-extrabold text-2xl sm:text-4xl text-navy dark:text-white mb-1 sm:mb-2">
            {data.length}
          </div>
          {dealCountGrowth && (
            <div className={`text-xs sm:text-sm font-semibold ${Number(dealCountGrowth) > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Number(dealCountGrowth) > 0 ? '↑' : '↓'} {Math.abs(Number(dealCountGrowth))}% YoY
            </div>
          )}
          {!dealCountGrowth && (
            <div className="text-xs sm:text-sm text-gray-500">
              <a href="/submit-tool" className="text-brand hover:underline font-medium">Submit yours →</a>
            </div>
          )}
        </div>

        {/* Largest Single Round */}
        {largestRound && (
          <div className="card p-4 sm:p-6 bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-900">
            <div className="text-[10px] sm:text-xs uppercase tracking-wide text-gray-500 font-jakarta font-semibold mb-2 sm:mb-3">
              Largest Round
            </div>
            <div className="font-sora font-extrabold text-2xl sm:text-4xl text-navy dark:text-white mb-1 sm:mb-2">
              {largestRound.amount}
            </div>
            <div className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400 truncate">
              {largestRound.startup} · {largestRound.date}
            </div>
          </div>
        )}

        {/* YTD Period */}
        <div className="card p-4 sm:p-6">
          <div className="text-[10px] sm:text-xs uppercase tracking-wide text-gray-500 font-jakarta font-semibold mb-2 sm:mb-3">
            {ytdPeriod.includes('–') ? 'Jan–Apr' : 'YTD'} {new Date().getFullYear()}
          </div>
          <div className="font-sora font-extrabold text-2xl sm:text-4xl text-navy dark:text-white mb-1 sm:mb-2">
            {ytdPeriod}
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            Updated daily
          </div>
        </div>
      </div>

      {/* Sector Breakdown - NEW FEATURE */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-5 h-5 text-brand" />
          <h3 className="section-title">AI Sector Breakdown</h3>
        </div>
        <div className="space-y-3">
          {sectorData.map((sector, idx) => {
            const maxAmount = sectorData[0]?.amount || 1;
            const percentage = (sector.amount / maxAmount) * 100;
            return (
              <div key={sector.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{sector.name}</span>
                  <span className="text-xs text-gray-500">{sector.count} deals • ${(sector.amount / 1e6).toFixed(1)}M</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-brand to-purple-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>



      {/* City Distribution - NEW FEATURE */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <MapIcon className="w-5 h-5 text-brand" />
          <h3 className="section-title">Funding by City</h3>
        </div>
        <div className="space-y-3">
          {cityData.slice(0, 5).map((city, idx) => {
            const maxAmount = cityData[0]?.amount || 1;
            const percentage = (city.amount / maxAmount) * 100;
            return (
              <div key={city.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-brand" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{city.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{city.count} startups • ${(city.amount / 1e6).toFixed(1)}M</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
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
                <YAxis tickLine={false} axisLine={false} tickFormatter={formatChartValue} width={80} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(79, 70, 229, 0.05)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')} Cr`, 'Amount']}
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
                <Pie 
                  data={stageData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={50} 
                  outerRadius={70} 
                  paddingAngle={4} 
                  dataKey="value"
                  label={({ name, percent }) => percent ? `${(percent * 100).toFixed(0)}%` : ''}
                  labelLine={false}
                >
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  formatter={(value: any, name: any, props: any) => {
                    const total = stageData.reduce((sum, entry) => sum + entry.value, 0);
                    const percent = ((value / total) * 100).toFixed(1);
                    return [`${value} deals (${percent}%)`, props.payload.name];
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-4">
            {stageData.map((entry, index) => {
              const total = stageData.reduce((sum, e) => sum + e.value, 0);
              const percent = ((entry.value / total) * 100).toFixed(0);
              return (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs text-gray-500 font-jakarta whitespace-nowrap">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                  {entry.name} <span className="text-gray-400 font-medium">({entry.value} • {percent}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filterable Table */}
      <div className="card overflow-hidden">



        {/* Filters Top Bar */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          
          {/* Active Investor Filter Badge */}
          {filterInvestor !== 'All' && (
            <div className="mb-3">
              <button
                onClick={() => setFilterInvestor('All')}
                className="text-sm bg-brand/10 text-brand px-4 py-1.5 rounded-full hover:bg-brand/20 flex items-center gap-2 transition-colors shadow-sm font-medium"
              >
                Filtering: <span className="font-semibold">{filterInvestor}</span> ✕
              </button>
            </div>
          )}

          {/* Title & All Filters in One Row */}
          <div className="flex items-center gap-3 overflow-x-auto">
            <h3 className="font-sora font-bold text-lg whitespace-nowrap">All Rounds</h3>
            
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            
            <select className="input-field py-2 px-3 shadow-sm text-sm w-[130px] cursor-pointer flex-shrink-0" value={filterStage} onChange={(e) => setFilterStage(e.target.value)}>
              <option value="All">All Stages</option>
              <option value="Seed">Pre-Seed & Seed</option>
              <option value="Series A">Series A</option>
              <option value="Series B">Series B</option>
            </select>
            
            <select className="input-field py-2 px-3 shadow-sm text-sm w-[110px] cursor-pointer flex-shrink-0" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
              <option value="All">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
            
            <select className="input-field py-2 px-3 shadow-sm text-sm w-[130px] cursor-pointer flex-shrink-0" value={filterSector} onChange={(e) => setFilterSector(e.target.value)}>
              <option value="All">All Sectors</option>
              {sectorData.map(s => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
            
            <select className="input-field py-2 px-3 shadow-sm text-sm w-[110px] cursor-pointer flex-shrink-0" value={filterCity} onChange={(e) => setFilterCity(e.target.value)}>
              <option value="All">All Cities</option>
              {cityData.slice(0, 10).map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
            
            <select 
              className="input-field py-2 px-3 shadow-sm text-sm w-[130px] cursor-pointer flex-shrink-0" 
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'All') {
                  setFilterAmountMin(0);
                  setFilterAmountMax(Infinity);
                } else if (val === '0-1M') {
                  setFilterAmountMin(0);
                  setFilterAmountMax(1e6);
                } else if (val === '1M-10M') {
                  setFilterAmountMin(1e6);
                  setFilterAmountMax(10e6);
                } else if (val === '10M-50M') {
                  setFilterAmountMin(10e6);
                  setFilterAmountMax(50e6);
                } else if (val === '50M+') {
                  setFilterAmountMin(50e6);
                  setFilterAmountMax(Infinity);
                }
              }}
            >
              <option value="All">All Amounts</option>
              <option value="0-1M">$0 - $1M</option>
              <option value="1M-10M">$1M - $10M</option>
              <option value="10M-50M">$10M - $50M</option>
              <option value="50M+">$50M+</option>
            </select>

            <div className="ml-auto flex-shrink-0">
              <a href="/submit-tool" className="text-sm font-semibold bg-brand text-white px-5 py-2 rounded-full hover:bg-brand-600 transition-colors shadow-md whitespace-nowrap inline-block">
                + Submit Round
              </a>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left font-jakarta">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4">Startup</th>
                <th className="px-6 py-4">Round</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 hidden xl:table-cell">Sector</th>
                <th className="px-6 py-4 hidden sm:table-cell">Lead Investors</th>
                <th className="px-6 py-4 hidden lg:table-cell">Other Investors</th>
                <th className="px-6 py-4 hidden xl:table-cell">Trend</th>
                <th className="px-6 py-4 hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredData.map((row) => {
                const sector = getSector(row.startupName);
                const trend = getTrendSignal(row);
                
                return (
                  <tr key={row.id} className={`transition-colors ${topDeals.has(row.id) ? 'bg-amber-50/30 hover:bg-amber-50/60 dark:bg-amber-900/5 dark:hover:bg-amber-900/10' : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/20'}`}>
                    <td className="px-6 py-4">
                      <a href={`/startups/${row.startupSlug}`} className="font-sora font-bold text-sm text-navy dark:text-white hover:text-brand transition-colors block">
                        {row.startupName}
                        {topDeals.has(row.id) && (
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
                    <td className="px-6 py-4 hidden xl:table-cell">
                      <span className="text-[10px] font-bold bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-2 py-1 rounded-full uppercase whitespace-nowrap">
                        {sector}
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
                    <td className="px-6 py-4 hidden xl:table-cell">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase whitespace-nowrap ${trend.color}`}>
                        ↑ {trend.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-xs text-gray-500 whitespace-nowrap">
                      {new Date(row.announcedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredData.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm">No funding rounds matched your filters.</div>
        )}
      </div>

      {/* Most Active Investors in Indian AI - NEW SECTION */}
      <div className="card p-8">
        <h2 className="font-sora font-bold text-2xl mb-8 text-navy dark:text-white">
          Most active investors in 2026
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topInvestors.slice(0, 4).map((investor, idx) => {
            // Get portfolio companies and their deal info for this investor
            const investorDeals = data
              .filter(d => d.leadInvestors?.includes(investor.name))
              .sort((a, b) => getAmountForSort(b) - getAmountForSort(a))
              .slice(0, 2);
            
            // Format total amount for display
            const totalAmount = investor.totalAmount;
            const displayAmount = totalAmount >= 1e9 
              ? `$${(totalAmount / 1e9).toFixed(1)}B` 
              : totalAmount >= 1e6 
                ? `$${Math.round(totalAmount / 1e6)}M`
                : `$${Math.round(totalAmount / 1e3)}K`;
            
            return (
              <div key={investor.name} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700">
                <div className="mb-4">
                  <h3 className="font-sora font-bold text-lg text-navy dark:text-white mb-2">
                    {investor.name}
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span className="font-semibold text-brand">{investor.deals}</span> AI deals · 2026
                  </div>
                  {totalAmount >= 1e6 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {displayAmount} total
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <div className="space-y-1.5">
                    {investorDeals.length > 0 ? (
                      investorDeals.map((deal, dealIdx) => (
                        <div key={dealIdx} className="text-sm">
                          <div className="font-medium text-gray-700 dark:text-gray-300">
                            {deal.startupName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {deal.roundType} · {formatAmount(deal)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Portfolio companies
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => setFilterInvestor(investor.name)}
                  className="text-sm font-semibold text-brand hover:text-brand-600 transition-colors flex items-center gap-1 w-full justify-center py-2 px-3 rounded-lg border border-brand/20 hover:border-brand/40 hover:bg-brand/5"
                >
                  View all deals →
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { 
  MousePointerClick, TrendingUp, Users, Zap, Monitor, Smartphone, 
  Globe, Download, Loader2, BarChart3, PieChart, MapPin, Chrome,
  ExternalLink, Calendar
} from 'lucide-react';
import { getToolClickAnalyticsAction, exportToolClicksAction } from './actions';
import Link from 'next/link';

const periods = ['7 days', '30 days', '90 days', 'This year'];

interface AnalyticsData {
  overview: {
    totalClicks: number;
    uniqueSessions: number;
    uniqueTools: number;
    avgClicksPerSession: string;
  };
  topTools: Array<{
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    category: string;
    clicks: number;
  }>;
  sourcePerformance: Array<{
    source: string;
    clicks: number;
    percentage: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    clicks: number;
    percentage: number;
  }>;
  browserBreakdown: Array<{
    browser: string;
    clicks: number;
    percentage: number;
  }>;
  countryBreakdown: Array<{
    country: string;
    clicks: number;
    percentage: number;
  }>;
  dailyTrend: Array<{
    date: string;
    clicks: number;
  }>;
}

export default function ToolAnalyticsPage() {
  const [period, setPeriod] = useState('7 days');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getToolClickAnalyticsAction(period);
      if (res.success) {
        setData(res.data as AnalyticsData);
      } else {
        setError(res.error || 'Failed to load analytics');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    }
    setLoading(false);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportToolClicksAction(period);
      if (res.success && res.data) {
        // Convert to CSV
        const headers = ['Date', 'Tool', 'Category', 'Source', 'Device', 'Browser', 'OS', 'Country'];
        const rows = res.data.map((row: any) => [
          row.date,
          row.tool,
          row.category,
          row.source,
          row.device,
          row.browser,
          row.os,
          row.country
        ]);
        
        const csv = [
          headers.join(','),
          ...rows.map((row: any[]) => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tool-clicks-${period.replace(' ', '-')}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export error:', err);
    }
    setExporting(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-brand" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Failed to load analytics</p>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    );
  }

  const sourceIcons: Record<string, any> = {
    TOOL_DETAIL: ExternalLink,
    DIRECTORY: BarChart3,
    HOMEPAGE: Globe,
    SEARCH: Globe,
    RELATED: Zap,
    COMPARISON: PieChart,
    OTHER: Globe
  };

  const deviceIcons: Record<string, any> = {
    DESKTOP: Monitor,
    MOBILE: Smartphone,
    TABLET: Smartphone,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Tool Click Analytics</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">
            Track tool clicks across all sources
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={exporting || data.overview.totalClicks === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export CSV
          </button>

          {/* Period Selector */}
          <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1">
            {periods.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  p === period
                    ? 'bg-brand text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Clicks',
            value: data.overview.totalClicks.toLocaleString(),
            icon: MousePointerClick,
            color: 'text-blue-600 dark:text-blue-400'
          },
          {
            label: 'Unique Sessions',
            value: data.overview.uniqueSessions.toLocaleString(),
            icon: Users,
            color: 'text-green-600 dark:text-green-400'
          },
          {
            label: 'Tools Clicked',
            value: data.overview.uniqueTools.toLocaleString(),
            icon: Zap,
            color: 'text-purple-600 dark:text-purple-400'
          },
          {
            label: 'Avg. Clicks/Session',
            value: data.overview.avgClicksPerSession,
            icon: TrendingUp,
            color: 'text-orange-600 dark:text-orange-400'
          },
        ].map((metric) => (
          <div
            key={metric.label}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5"
          >
            <metric.icon className={`w-5 h-5 mb-3 ${metric.color}`} />
            <p className="font-sora font-extrabold text-xl text-navy dark:text-white">
              {metric.value}
            </p>
            <p className="text-xs text-gray-400 font-jakarta mt-1">{metric.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Tools */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="font-sora font-bold text-base text-navy dark:text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-brand" />
            Top Performing Tools
          </h2>
          {data.topTools.length === 0 ? (
            <p className="text-sm text-gray-400 font-jakarta text-center py-6">
              No clicks recorded in this period
            </p>
          ) : (
            <div className="space-y-3">
              {data.topTools.map((tool, i) => (
                <div key={tool.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="w-6 text-xs text-gray-300 dark:text-gray-600 font-sora font-bold text-right">
                      {i + 1}
                    </span>
                    <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100 dark:border-gray-700">
                      {tool.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={tool.logoUrl}
                          alt={tool.name}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <Zap className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/tools-dir/${tool.id}/edit`}
                        className="text-sm font-semibold text-navy dark:text-white font-jakarta line-clamp-1 hover:text-brand transition-colors"
                      >
                        {tool.name}
                      </Link>
                      <p className="text-[11px] text-gray-400 font-jakarta">{tool.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-navy dark:text-white font-sora">
                      {tool.clicks.toLocaleString()}
                    </span>
                    <Link
                      href={`/tools/${tool.slug}`}
                      target="_blank"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-400 hover:text-brand" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Click Sources */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="font-sora font-bold text-base text-navy dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand" />
            Click Sources
          </h2>
          <div className="space-y-3">
            {data.sourcePerformance.map((source) => {
              const Icon = sourceIcons[source.source] || Globe;
              return (
                <div key={source.source}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-jakarta text-gray-700 dark:text-gray-300">
                        {source.source.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-sm font-sora font-bold text-brand">
                      {source.percentage}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full transition-all duration-500"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {source.clicks.toLocaleString()} clicks
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Device, Browser, Country Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Devices */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="font-sora font-bold text-base text-navy dark:text-white mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-brand" />
            Devices
          </h2>
          <div className="space-y-3">
            {data.deviceBreakdown.map((device) => {
              const Icon = deviceIcons[device.device] || Monitor;
              return (
                <div key={device.device} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-jakarta text-gray-700 dark:text-gray-300">
                      {device.device}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-sora font-bold text-navy dark:text-white">
                      {device.percentage}%
                    </span>
                    <p className="text-xs text-gray-400">{device.clicks}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Browsers */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="font-sora font-bold text-base text-navy dark:text-white mb-4 flex items-center gap-2">
            <Chrome className="w-5 h-5 text-brand" />
            Browsers
          </h2>
          <div className="space-y-3">
            {data.browserBreakdown.map((browser) => (
              <div key={browser.browser} className="flex items-center justify-between">
                <span className="text-sm font-jakarta text-gray-700 dark:text-gray-300">
                  {browser.browser}
                </span>
                <div className="text-right">
                  <span className="text-sm font-sora font-bold text-navy dark:text-white">
                    {browser.percentage}%
                  </span>
                  <p className="text-xs text-gray-400">{browser.clicks}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Countries */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="font-sora font-bold text-base text-navy dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand" />
            Top Countries
          </h2>
          <div className="space-y-3">
            {data.countryBreakdown.slice(0, 5).map((country) => (
              <div key={country.country} className="flex items-center justify-between">
                <span className="text-sm font-jakarta text-gray-700 dark:text-gray-300">
                  {country.country}
                </span>
                <div className="text-right">
                  <span className="text-sm font-sora font-bold text-navy dark:text-white">
                    {country.percentage}%
                  </span>
                  <p className="text-xs text-gray-400">{country.clicks}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Trend */}
      {data.dailyTrend.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="font-sora font-bold text-base text-navy dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand" />
            Daily Trend
          </h2>
          <div className="space-y-2">
            {data.dailyTrend.map((day) => (
              <div key={day.date} className="flex items-center justify-between">
                <span className="text-sm font-jakarta text-gray-700 dark:text-gray-300">
                  {new Date(day.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                <div className="flex items-center gap-3 flex-1 mx-4">
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (day.clicks / Math.max(...data.dailyTrend.map(d => d.clicks))) * 100
                        )}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-sora font-bold text-navy dark:text-white w-12 text-right">
                    {day.clicks}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Users, 
  TrendingUp, 
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface ConsentLog {
  id: number;
  consent_id: string;
  timestamp: string;
  categories: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  method: string;
  policy_version: string;
  schema_version: string;
  ip_hash: string;
  user_agent: string;
  country: string | null;
  created_at: string;
}

interface ConsentStats {
  total: number;
  acceptedAll: number;
  rejectedAll: number;
  customized: number;
  analyticsAccepted: number;
  marketingAccepted: number;
  byMethod: {
    banner: number;
    preferences: number;
    link: number;
  };
}

export default function ConsentLogsClient() {
  const [logs, setLogs] = useState<ConsentLog[]>([]);
  const [stats, setStats] = useState<ConsentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'accepted' | 'rejected' | 'customized'>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');

  useEffect(() => {
    fetchConsentLogs();
  }, [filter, dateRange]);

  const fetchConsentLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('filter', filter);
      if (dateRange !== 'all') params.append('dateRange', dateRange);

      const response = await fetch(`/api/admin/consent-logs?${params}`);
      const data = await response.json();
      
      setLogs(data.logs || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Failed to fetch consent logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Consent ID', 'Timestamp', 'Necessary', 'Analytics', 'Marketing', 'Method', 'Policy Version', 'IP Hash', 'User Agent', 'Country'];
    const rows = logs.map(log => [
      log.id,
      log.consent_id,
      log.timestamp,
      log.categories.necessary,
      log.categories.analytics,
      log.categories.marketing,
      log.method,
      log.policy_version,
      log.ip_hash,
      log.user_agent,
      log.country || 'N/A'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consent-logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  const getConsentType = (log: ConsentLog) => {
    const { analytics, marketing } = log.categories;
    if (analytics && marketing) return 'Accepted All';
    if (!analytics && !marketing) return 'Rejected All';
    return 'Customized';
  };

  const getConsentBadge = (log: ConsentLog) => {
    const type = getConsentType(log);
    if (type === 'Accepted All') {
      return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Accepted All</span>;
    }
    if (type === 'Rejected All') {
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Rejected All</span>;
    }
    return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Customized</span>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cookie Consent Logs</h1>
          <p className="text-gray-600 mt-1">Monitor and analyze user consent decisions</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchConsentLogs}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Consents</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted All</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.acceptedAll}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.total > 0 ? Math.round((stats.acceptedAll / stats.total) * 100) : 0}% acceptance rate
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected All</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{stats.rejectedAll}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.total > 0 ? Math.round((stats.rejectedAll / stats.total) * 100) : 0}% rejection rate
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Customized</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.customized}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.total > 0 ? Math.round((stats.customized / stats.total) * 100) : 0}% customization rate
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Analytics Consent</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.analyticsAccepted}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.total > 0 ? Math.round((stats.analyticsAccepted / stats.total) * 100) : 0}% accepted
                </p>
              </div>
              <div className="w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="3"
                    strokeDasharray={`${stats.total > 0 ? (stats.analyticsAccepted / stats.total) * 100 : 0}, 100`}
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Marketing Consent</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.marketingAccepted}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.total > 0 ? Math.round((stats.marketingAccepted / stats.total) * 100) : 0}% accepted
                </p>
              </div>
              <div className="w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="3"
                    strokeDasharray={`${stats.total > 0 ? (stats.marketingAccepted / stats.total) * 100 : 0}, 100`}
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Consent Method</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Banner</span>
                <span className="text-sm font-semibold text-gray-900">{stats.byMethod.banner}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Preferences</span>
                <span className="text-sm font-semibold text-gray-900">{stats.byMethod.preferences}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Link</span>
                <span className="text-sm font-semibold text-gray-900">{stats.byMethod.link}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('accepted')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'accepted'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Accepted
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected
            </button>
            <button
              onClick={() => setFilter('customized')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'customized'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Customized
            </button>
          </div>

          <div className="h-6 w-px bg-gray-300" />

          <Calendar className="w-5 h-5 text-gray-400" />
          
          <div className="flex gap-2">
            <button
              onClick={() => setDateRange('today')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === 'today'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateRange('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === 'week'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === 'month'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setDateRange('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consent Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categories
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Policy Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Hash
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Loading consent logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No consent logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getConsentBadge(log)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        {log.categories.analytics && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                            Analytics
                          </span>
                        )}
                        {log.categories.marketing && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                            Marketing
                          </span>
                        )}
                        {!log.categories.analytics && !log.categories.marketing && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                            Necessary Only
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {log.method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.policy_version}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {log.ip_hash.substring(0, 16)}...
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

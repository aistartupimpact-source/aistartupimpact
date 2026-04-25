'use client';

import { useState, useEffect } from 'react';
import { Users, Building2, Mail, Calendar, CheckCircle, XCircle, Clock, Eye, Search, Filter } from 'lucide-react';
import { getFoundersAction } from './actions';
import Link from 'next/link';

interface Founder {
  id: string;
  name: string;
  email: string;
  company: string | null;
  companyDomain: string | null;
  role: string | null;
  phone: string | null;
  authProvider: string;
  emailVerified: boolean;
  status: string;
  onboardingCompleted: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  _count: {
    startups: number;
    tools: number;
  };
}

export default function FoundersPage() {
  const [founders, setFounders] = useState<Founder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadFounders();
  }, []);

  const loadFounders = async () => {
    setLoading(true);
    const result = await getFoundersAction();
    if (result.success) {
      setFounders(result.data as Founder[]);
    }
    setLoading(false);
  };

  const filteredFounders = founders.filter(f => {
    const matchesSearch = 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: founders.length,
    active: founders.filter(f => f.status === 'ACTIVE').length,
    pending: founders.filter(f => f.status === 'PENDING_VERIFICATION').length,
    withSubmissions: founders.filter(f => f._count.startups > 0 || f._count.tools > 0).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Founder Management</h1>
        <p className="text-gray-400 text-sm font-jakarta mt-1">
          View and manage all registered founders and their submissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta">Total Founders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-brand" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta">Active</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.active}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta">Pending</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta">With Submissions</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.withSubmissions}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING_VERIFICATION">Pending</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Founders Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide font-jakarta">Founder</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide font-jakarta hidden md:table-cell">Company</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide font-jakarta hidden lg:table-cell">Auth</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide font-jakarta">Submissions</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide font-jakarta">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide font-jakarta hidden xl:table-cell">Joined</th>
                <th className="px-6 py-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {filteredFounders.map((founder) => (
                <tr key={founder.id} className="border-t border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-sora font-semibold text-sm text-navy dark:text-white">{founder.name}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        <Mail className="w-3 h-3" />
                        {founder.email}
                      </div>
                      {founder.role && (
                        <span className="inline-block mt-1 text-xs text-gray-500 dark:text-gray-400">{founder.role}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    {founder.company ? (
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{founder.company}</p>
                        {founder.companyDomain && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{founder.companyDomain}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      {founder.authProvider === 'google' ? (
                        <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold px-2 py-1 rounded-full">
                          <svg className="w-3 h-3" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          </svg>
                          Google
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 text-xs font-semibold px-2 py-1 rounded-full">
                          <Mail className="w-3 h-3" />
                          Email
                        </span>
                      )}
                      {founder.emailVerified && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-lg font-bold text-brand">{founder._count.startups}</p>
                        <p className="text-xs text-gray-500">Startups</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{founder._count.tools}</p>
                        <p className="text-xs text-gray-500">Tools</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {founder.status === 'ACTIVE' ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    ) : founder.status === 'PENDING_VERIFICATION' ? (
                      <span className="inline-flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-semibold px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold px-2 py-1 rounded-full">
                        <XCircle className="w-3 h-3" />
                        {founder.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden xl:table-cell">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(founder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    {founder.lastLoginAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        Last: {new Date(founder.lastLoginAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/founders/${founder.id}`}
                      className="inline-flex items-center gap-1 text-brand hover:underline text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredFounders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-jakarta text-sm">
                    No founders found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

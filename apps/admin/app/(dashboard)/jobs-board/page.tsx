'use client';

import { useState, useEffect } from 'react';
import { Briefcase, Eye, Users, Trash2, ExternalLink, CheckCircle, XCircle } from 'lucide-react';

export default function AdminJobsBoardPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/admin/jobs-board');
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch {}
    setLoading(false);
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/jobs-board/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      setJobs(prev => prev.map(j => j.id === id ? { ...j, isActive: !isActive } : j));
    } catch {}
  };

  const deleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job listing?')) return;
    try {
      await fetch(`/api/admin/jobs-board/${id}`, { method: 'DELETE' });
      setJobs(prev => prev.filter(j => j.id !== id));
    } catch {}
  };

  const filtered = jobs.filter(j => {
    if (filter === 'active') return j.isActive;
    if (filter === 'inactive') return !j.isActive;
    return true;
  });

  if (loading) return <div className="p-10 text-center text-gray-500">Loading job listings...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job Board Management</h1>
          <p className="text-sm text-gray-500 mt-1">{jobs.length} total listings</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Briefcase className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p>No job listings {filter !== 'all' ? `(${filter})` : ''}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase text-gray-500">Job</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase text-gray-500">Company</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase text-gray-500">Category</th>
                <th className="text-center px-4 py-3 text-xs font-bold uppercase text-gray-500">Views</th>
                <th className="text-center px-4 py-3 text-xs font-bold uppercase text-gray-500">Apps</th>
                <th className="text-center px-4 py-3 text-xs font-bold uppercase text-gray-500">Status</th>
                <th className="text-right px-4 py-3 text-xs font-bold uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((job: any) => (
                <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900 dark:text-white">{job.title}</p>
                    <p className="text-xs text-gray-400">{job.workType} • {job.listingTier}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{job.companyName}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{job.category?.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-center text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" />{job.viewsCount}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />{job.applicationsCount}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${job.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500'}`}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <a href={`/jobs/${job.slug}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800" title="View">
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                      </a>
                      <button onClick={() => toggleActive(job.id, job.isActive)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800" title={job.isActive ? 'Deactivate' : 'Activate'}>
                        {job.isActive ? <XCircle className="w-3.5 h-3.5 text-orange-500" /> : <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                      </button>
                      <button onClick={() => deleteJob(job.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/10" title="Delete">
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

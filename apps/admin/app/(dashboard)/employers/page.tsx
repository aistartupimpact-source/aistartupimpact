'use client';

import { useState, useEffect } from 'react';
import { Building2, Globe, Briefcase, CheckCircle, XCircle, Crown } from 'lucide-react';

export default function AdminEmployersPage() {
  const [employers, setEmployers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/employers')
      .then(r => r.json())
      .then(data => setEmployers(data.employers || []))
      .finally(() => setLoading(false));
  }, []);

  const toggleVerify = async (id: string, isVerified: boolean) => {
    try {
      await fetch(`/api/admin/employers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: !isVerified }),
      });
      setEmployers(prev => prev.map(e => e.id === id ? { ...e, isVerified: !isVerified } : e));
    } catch {}
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/employers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      setEmployers(prev => prev.map(e => e.id === id ? { ...e, isActive: !isActive } : e));
    } catch {}
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading employers...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employer Accounts</h1>
          <p className="text-sm text-gray-500 mt-1">{employers.length} registered employers</p>
        </div>
      </div>

      {employers.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Building2 className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p>No employer accounts yet</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase text-gray-500">Company</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase text-gray-500">Email</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase text-gray-500">Plan</th>
                <th className="text-center px-4 py-3 text-xs font-bold uppercase text-gray-500">Jobs</th>
                <th className="text-center px-4 py-3 text-xs font-bold uppercase text-gray-500">Verified</th>
                <th className="text-center px-4 py-3 text-xs font-bold uppercase text-gray-500">Active</th>
                <th className="text-right px-4 py-3 text-xs font-bold uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {employers.map((emp: any) => (
                <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {emp.logoUrl ? (
                        <img src={emp.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{emp.companyName}</p>
                        {emp.websiteUrl && (
                          <a href={emp.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5">
                            <Globe className="w-2.5 h-2.5" /> Website
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{emp.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      emp.plan === 'PREMIUM' ? 'bg-purple-100 text-purple-700' :
                      emp.plan === 'FEATURED' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {emp.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1"><Briefcase className="w-3 h-3" />{emp.jobCount}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {emp.isVerified ? (
                      <CheckCircle className="w-4 h-4 text-blue-500 mx-auto" />
                    ) : (
                      <span className="text-[10px] text-gray-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${emp.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {emp.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggleVerify(emp.id, emp.isVerified)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800" title={emp.isVerified ? 'Remove verification' : 'Verify'}>
                        <Crown className={`w-3.5 h-3.5 ${emp.isVerified ? 'text-blue-500' : 'text-gray-300'}`} />
                      </button>
                      <button onClick={() => toggleActive(emp.id, emp.isActive)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800" title={emp.isActive ? 'Suspend' : 'Activate'}>
                        {emp.isActive ? <XCircle className="w-3.5 h-3.5 text-orange-500" /> : <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
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

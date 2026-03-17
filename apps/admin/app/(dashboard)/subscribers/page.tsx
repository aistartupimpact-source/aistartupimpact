'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mail, Search, Trash2, ShieldAlert, Loader2, Download } from 'lucide-react';
import { getSubscribersAction, deleteSubscriberAction } from './actions';

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  source: string;
  isActive: boolean;
  tags: string[];
  subscribedAt: string;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSubscribersAction(page, 20, search);
      if (res.success) {
        setSubscribers(res.data as Subscriber[]);
        setTotal(res.total);
        setTotalPages(res.pages);
      } else {
        setError(res.error || 'Failed to load subscribers');
      }
    } catch (e: any) {
      setError(e.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(fetchSubscribers, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchSubscribers]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await deleteSubscriberAction(deleteId);
    if (res.success) {
      setSubscribers(prev => prev.filter(s => s.id !== deleteId));
      setTotal(t => t - 1);
    }
    setDeleteId(null);
  };

  const exportCsv = () => {
    const headers = ['Email', 'Name', 'Source', 'Status', 'Date Subscribed'];
    const rows = subscribers.map(s => [
      s.email, s.name || '-', s.source || '-',
      s.isActive ? 'Active' : 'Unsubscribed',
      new Date(s.subscribedAt).toISOString(),
    ].join(','));
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-sora text-navy dark:text-white flex items-center gap-2">
            <Mail className="w-6 h-6 text-brand" /> Subscribers
          </h1>
          <p className="text-sm text-gray-500 font-jakarta mt-1">
            {total > 0 ? `${total.toLocaleString()} total subscribers` : 'Manage all newsletter subscribers'}
          </p>
        </div>
        <button onClick={exportCsv} className="btn-secondary text-sm flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" placeholder="Search emails or names..."
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-10 w-full"
            />
          </div>
        </div>

        {error && (
          <div className="px-6 py-3 bg-red-50 dark:bg-red-900/20 text-sm text-red-600 dark:text-red-400 font-jakarta border-b border-red-100 dark:border-red-800">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider font-jakarta">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider font-jakarta">Source</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider font-jakarta">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider font-jakarta">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider font-jakarta text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-brand mx-auto" /></td></tr>
              ) : subscribers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm font-jakarta">No subscribers found</td></tr>
              ) : subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-navy dark:text-white font-jakarta">{sub.email}</span>
                    {sub.name && <p className="text-xs text-gray-500 font-jakarta mt-0.5">{sub.name}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium capitalize">
                      {sub.source || 'direct'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${sub.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {sub.isActive ? 'Active' : 'Unsubscribed'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-jakarta">
                    {new Date(sub.subscribedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setDeleteId(sub.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm font-jakarta">
            <span className="text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50">Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm p-6 text-center border border-gray-100 dark:border-gray-800">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-sora font-bold text-navy dark:text-white text-lg">Delete Subscriber?</h3>
            <p className="font-jakarta text-sm text-gray-500 mt-2">This will permanently remove this email from your list.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteId(null)} className="flex-1 btn-secondary">Cancel</button>
              <button onClick={handleDelete} className="flex-1 btn-brand !bg-red-500 hover:!bg-red-600 !border-red-500">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

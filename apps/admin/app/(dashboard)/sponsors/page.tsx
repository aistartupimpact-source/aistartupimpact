'use client';

import { useState, useEffect, useTransition } from 'react';
import { Plus, Edit3, Trash2, ExternalLink, Eye, EyeOff, X, Save, Calendar } from 'lucide-react';
import {
  getSponsorsAction, createSponsorAction, updateSponsorAction,
  deleteSponsorAction, toggleSponsorStatusAction,
} from './actions';

interface Sponsor {
  id: string; brand: string; tagline: string; ctaUrl: string;
  logoUrl?: string; isActive: boolean; sortOrder: number;
  startDate?: string; endDate?: string; createdAt: string;
}

const empty = { brand: '', tagline: '', ctaUrl: '', logoUrl: '', isActive: true, sortOrder: 0, startDate: '', endDate: '' };

function statusLabel(s: Sponsor) {
  const now = new Date();
  if (!s.isActive) return { label: 'Inactive', cls: 'bg-gray-100 dark:bg-gray-800 text-gray-500' };
  if (s.startDate && new Date(s.startDate) > now) return { label: 'Scheduled', cls: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' };
  if (s.endDate && new Date(s.endDate) < now) return { label: 'Expired', cls: 'bg-red-100 dark:bg-red-900/30 text-red-500' };
  return { label: 'Live', cls: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' };
}

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Sponsor | null>(null);
  const [form, setForm] = useState(empty);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const r = await getSponsorsAction();
    if (r.success) setSponsors(r.data as Sponsor[]);
    setLoading(false);
  };

  const openCreate = () => { setEditing(null); setForm(empty); setError(''); setModalOpen(true); };
  const openEdit = (s: Sponsor) => {
    setEditing(s);
    setForm({
      brand: s.brand, tagline: s.tagline, ctaUrl: s.ctaUrl, logoUrl: s.logoUrl || '',
      isActive: s.isActive, sortOrder: s.sortOrder,
      startDate: s.startDate ? s.startDate.split('T')[0] : '',
      endDate: s.endDate ? s.endDate.split('T')[0] : '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.brand || !form.tagline || !form.ctaUrl) { setError('Brand, tagline and URL are required.'); return; }
    setError('');
    startTransition(async () => {
      const result = editing
        ? await updateSponsorAction(editing.id, form)
        : await createSponsorAction(form);
      if (!result.success) { setError((result as any).error || 'Save failed'); return; }
      await load();
      setModalOpen(false);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteSponsorAction(id);
      setSponsors(s => s.filter(x => x.id !== id));
      setDeleteConfirm(null);
    });
  };

  const handleToggle = (s: Sponsor) => {
    startTransition(async () => {
      await toggleSponsorStatusAction(s.id, s.isActive);
      setSponsors(prev => prev.map(x => x.id === s.id ? { ...x, isActive: !x.isActive } : x));
    });
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Powered By / Sponsors</h1>
          <p className="text-gray-400 text-sm font-jakarta mt-1">
            Manage the "Powered by" strip on the homepage. Schedule by date range.
          </p>
        </div>
        <button onClick={openCreate} className="btn-brand text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Sponsor
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide font-jakarta">Brand</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide font-jakarta hidden md:table-cell">Tagline</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide font-jakarta hidden lg:table-cell">Schedule</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide font-jakarta">Status</th>
              <th className="px-6 py-3 w-24" />
            </tr>
          </thead>
          <tbody>
            {sponsors.map(s => {
              const { label, cls } = statusLabel(s);
              return (
                <tr key={s.id} className="border-t border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {s.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.logoUrl} alt={s.brand} className="w-8 h-8 rounded object-contain" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-brand/10 flex items-center justify-center text-brand font-bold text-xs">{s.brand.charAt(0)}</div>
                      )}
                      <div>
                        <p className="font-sora font-semibold text-sm text-navy dark:text-white">{s.brand}</p>
                        <a href={s.ctaUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-brand hover:underline flex items-center gap-0.5">
                          {s.ctaUrl.replace('https://', '')} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <p className="text-sm text-gray-500 font-jakarta line-clamp-1 max-w-xs">{s.tagline}</p>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-xs text-gray-400 font-jakarta">
                      <Calendar className="w-3 h-3" />
                      {s.startDate ? new Date(s.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Any'}
                      {' → '}
                      {s.endDate ? new Date(s.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No end'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleToggle(s)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors ${cls}`}>
                      {s.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {label}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                      <button onClick={() => setDeleteConfirm(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {sponsors.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-jakarta text-sm">No sponsors yet. Add one to show on the homepage.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-sora font-bold text-lg text-navy dark:text-white">{editing ? 'Edit Sponsor' : 'Add Sponsor'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">Brand Name *</label>
                <input type="text" className="input-field text-sm" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Yotta Data Services" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">
                  Tagline * <span className="text-gray-400 normal-case font-normal">(max 60 chars)</span>
                </label>
                <input type="text" className="input-field text-sm" maxLength={60} value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} placeholder="e.g. Powering Indian AI with NVIDIA H100 GPU Cloud" />
                <p className={`text-xs mt-1 text-right font-jakarta ${form.tagline.length > 50 ? 'text-amber-500' : 'text-gray-400'}`}>{form.tagline.length}/60</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">CTA URL *</label>
                <input type="url" className="input-field text-sm" value={form.ctaUrl} onChange={e => setForm({ ...form, ctaUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">Logo URL</label>
                <input type="url" className="input-field text-sm" value={form.logoUrl} onChange={e => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">Start Date</label>
                  <input type="date" className="input-field text-sm" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                  <p className="text-[10px] text-gray-400 mt-1 font-jakarta">Leave blank = show immediately</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">End Date</label>
                  <input type="date" className="input-field text-sm" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                  <p className="text-[10px] text-gray-400 mt-1 font-jakarta">Leave blank = no expiry</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">Sort Order</label>
                  <input type="number" className="input-field text-sm" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-brand border-gray-300 focus:ring-brand" />
                    <span className="text-sm font-jakarta text-navy dark:text-white">Active</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={isPending} className="btn-brand text-sm flex items-center gap-2 disabled:opacity-50">
                <Save className="w-4 h-4" /> {isPending ? 'Saving...' : 'Save Sponsor'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-sora font-bold text-lg text-navy dark:text-white">Delete Sponsor?</h3>
            <p className="text-sm text-gray-500 font-jakarta mt-1">This will remove it from the homepage immediately.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

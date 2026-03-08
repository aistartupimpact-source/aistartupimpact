'use client';

import { useState } from 'react';
import { Plus, IndianRupee, Calendar, CheckCircle, Clock, Edit3, Trash2, X, Save, TrendingUp } from 'lucide-react';

interface Deal { startup: string; amount: string; stage: string; }
interface Digest { id: string; title: string; date: string; status: string; dealsCount: number; totalRaised: string; deals: Deal[]; }

const initialDigests: Digest[] = [
  { id: '1', title: 'Week 10: Sarvam AI raises $41M, Krutrim closes Series B', date: '2025-03-07', status: 'PUBLISHED', dealsCount: 5, totalRaised: '$98M', deals: [{ startup: 'Sarvam AI', amount: '$41M', stage: 'Series A' }, { startup: 'Krutrim', amount: '$50M', stage: 'Series B' }] },
  { id: '2', title: 'Week 9: Edge AI startups see $22M in fresh funding', date: '2025-02-28', status: 'PUBLISHED', dealsCount: 3, totalRaised: '$22M', deals: [{ startup: 'EdgeAI Co', amount: '$12M', stage: 'Seed' }] },
  { id: '3', title: 'Week 8: HealthTech AI leads the pack', date: '2025-02-21', status: 'PUBLISHED', dealsCount: 4, totalRaised: '$35M', deals: [] },
  { id: '4', title: 'Week 11: Draft — AgriAI boom continues', date: '2025-03-14', status: 'DRAFT', dealsCount: 2, totalRaised: '$12M', deals: [] },
];

const emptyDigest: Digest = { id: '', title: '', date: new Date().toISOString().split('T')[0], status: 'DRAFT', dealsCount: 0, totalRaised: '', deals: [] };

export default function FundingDirPage() {
  const [digests, setDigests] = useState<Digest[]>(initialDigests);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Digest | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openCreate = () => { setEditing({ ...emptyDigest, id: Date.now().toString() }); setModalOpen(true); };
  const openEdit = (d: Digest) => { setEditing({ ...d }); setModalOpen(true); };

  const handleSave = () => {
    if (!editing) return;
    const exists = digests.find(d => d.id === editing.id);
    if (exists) setDigests(digests.map(d => d.id === editing.id ? editing : d));
    else setDigests([editing, ...digests]);
    setModalOpen(false); setEditing(null);
  };

  const handleDelete = (id: string) => { setDigests(digests.filter(d => d.id !== id)); setDeleteConfirm(null); };
  const toggleStatus = (id: string) => {
    setDigests(digests.map(d => d.id === id ? { ...d, status: d.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' } : d));
  };

  const addDeal = () => {
    if (!editing) return;
    setEditing({ ...editing, deals: [...editing.deals, { startup: '', amount: '', stage: 'Seed' }], dealsCount: editing.deals.length + 1 });
  };

  const updateDeal = (idx: number, field: keyof Deal, value: string) => {
    if (!editing) return;
    const deals = [...editing.deals];
    deals[idx] = { ...deals[idx], [field]: value };
    setEditing({ ...editing, deals });
  };

  const removeDeal = (idx: number) => {
    if (!editing) return;
    setEditing({ ...editing, deals: editing.deals.filter((_, i) => i !== idx), dealsCount: editing.deals.length - 1 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Funding Digests</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">Manage weekly digests shown on <span className="text-brand">/funding</span></p>
        </div>
        <button onClick={openCreate} className="btn-brand text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> New Digest</button>
      </div>

      <div className="space-y-3">
        {digests.map((d) => (
          <div key={d.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 hover:border-brand/30 transition-colors group">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0"><IndianRupee className="w-5 h-5 text-brand" /></div>
                <div>
                  <h3 className="font-sora font-bold text-sm text-navy dark:text-white group-hover:text-brand transition-colors">{d.title}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-400 font-jakarta flex items-center gap-1"><Calendar className="w-3 h-3" /> {d.date}</span>
                    <span className="text-xs text-gray-400 font-jakarta flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {d.dealsCount} deals</span>
                    <span className="text-xs font-bold text-brand font-sora">{d.totalRaised}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleStatus(d.id)} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer ${d.status === 'PUBLISHED' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                  {d.status === 'PUBLISHED' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}{d.status}
                </button>
                <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><Edit3 className="w-4 h-4 text-gray-400" /></button>
                <button onClick={() => setDeleteConfirm(d.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && editing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-sora font-bold text-lg text-navy dark:text-white">{digests.find(d => d.id === editing.id) ? 'Edit Digest' : 'New Funding Digest'}</h2>
              <button onClick={() => { setModalOpen(false); setEditing(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Title *</label>
                <input type="text" className="input-field text-sm" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Week X: headline..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Date</label>
                  <input type="date" className="input-field text-sm" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Total Raised</label>
                  <input type="text" className="input-field text-sm" value={editing.totalRaised} onChange={(e) => setEditing({ ...editing, totalRaised: e.target.value })} placeholder="e.g. $98M" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase font-jakarta">Deals</label>
                  <button onClick={addDeal} className="text-xs text-brand font-semibold hover:underline">+ Add Deal</button>
                </div>
                {editing.deals.map((deal, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="text" className="input-field text-sm flex-1" placeholder="Startup" value={deal.startup} onChange={(e) => updateDeal(i, 'startup', e.target.value)} />
                    <input type="text" className="input-field text-sm w-24" placeholder="Amount" value={deal.amount} onChange={(e) => updateDeal(i, 'amount', e.target.value)} />
                    <input type="text" className="input-field text-sm w-24" placeholder="Stage" value={deal.stage} onChange={(e) => updateDeal(i, 'stage', e.target.value)} />
                    <button onClick={() => removeDeal(i)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><X className="w-3.5 h-3.5 text-red-400" /></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => { setModalOpen(false); setEditing(null); }} className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={!editing.title} className="btn-brand text-sm flex items-center gap-2 disabled:opacity-50"><Save className="w-4 h-4" /> Save Digest</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-sora font-bold text-lg text-navy dark:text-white">Delete Digest?</h3>
            <p className="text-sm text-gray-500 font-jakarta mt-1">This action cannot be undone.</p>
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

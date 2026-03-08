'use client';

import { useState } from 'react';
import { Crown, Zap, Newspaper, Calendar, Building2, CheckCircle, Clock, Edit3, Plus, X, Save, Trash2 } from 'lucide-react';

interface Placement {
  id: string; zone: string; tier: string; icon: string;
  current: string | null; client: string | null;
  startDate: string | null; endDate: string | null; status: string;
}

const iconMap: Record<string, typeof Crown> = { Crown, Zap, Newspaper };

const initialPlacements: Placement[] = [
  { id: '1', zone: 'Hero Cover Story', tier: 'Premium', icon: 'Crown', current: 'Sarvam AI — Series A Deep Dive', client: 'Sarvam AI', startDate: '2025-03-01', endDate: '2025-03-31', status: 'ACTIVE' },
  { id: '2', zone: 'Breaking Ticker', tier: 'Premium', icon: 'Zap', current: 'Krutrim raises $50M Series B', client: 'Krutrim', startDate: '2025-03-05', endDate: '2025-03-12', status: 'ACTIVE' },
  { id: '3', zone: 'Latest Stories — Card #1', tier: 'Growth', icon: 'Newspaper', current: 'Yellow.ai launches new enterprise features', client: 'Yellow.ai', startDate: '2025-03-03', endDate: '2025-03-10', status: 'ACTIVE' },
  { id: '4', zone: 'Newsletter Featured', tier: 'Premium', icon: 'Crown', current: null, client: null, startDate: null, endDate: null, status: 'OPEN' },
  { id: '5', zone: 'Latest Stories — Card #2', tier: 'Starter', icon: 'Newspaper', current: null, client: null, startDate: null, endDate: null, status: 'OPEN' },
];

const zones = ['Hero Cover Story', 'Breaking Ticker', 'Latest Stories — Card #1', 'Latest Stories — Card #2', 'Latest Stories — Card #3', 'Newsletter Featured', '#1 Editor\'s Pick'];
const tiers = ['Premium', 'Growth', 'Starter'];

const emptyPlacement: Placement = { id: '', zone: 'Hero Cover Story', tier: 'Premium', icon: 'Crown', current: '', client: '', startDate: '', endDate: '', status: 'OPEN' };

export default function PlacementsPage() {
  const [placements, setPlacements] = useState<Placement[]>(initialPlacements);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Placement | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openCreate = () => { setEditing({ ...emptyPlacement, id: Date.now().toString() }); setModalOpen(true); };
  const openEdit = (p: Placement) => { setEditing({ ...p }); setModalOpen(true); };

  const handleSave = () => {
    if (!editing) return;
    const filled = { ...editing, status: editing.client ? 'ACTIVE' : 'OPEN' };
    const exists = placements.find(p => p.id === filled.id);
    if (exists) setPlacements(placements.map(p => p.id === filled.id ? filled : p));
    else setPlacements([...placements, filled]);
    setModalOpen(false); setEditing(null);
  };

  const handleDelete = (id: string) => { setPlacements(placements.filter(p => p.id !== id)); setDeleteConfirm(null); };

  const active = placements.filter(p => p.status === 'ACTIVE').length;
  const open = placements.filter(p => p.status === 'OPEN').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Placements</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">Manage paid startup story placements across the site</p>
        </div>
        <button onClick={openCreate} className="btn-brand text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> New Placement</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 text-center">
          <p className="font-sora font-extrabold text-2xl text-brand">{active}</p>
          <p className="text-xs text-gray-400 font-jakarta mt-1">Active Placements</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 text-center">
          <p className="font-sora font-extrabold text-2xl text-green-600 dark:text-green-400">{open}</p>
          <p className="text-xs text-gray-400 font-jakarta mt-1">Open Slots</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 text-center">
          <p className="font-sora font-extrabold text-2xl text-navy dark:text-white">{placements.length}</p>
          <p className="text-xs text-gray-400 font-jakarta mt-1">Total Zones</p>
        </div>
      </div>

      <div className="space-y-3">
        {placements.map((p) => {
          const Icon = iconMap[p.icon] || Crown;
          return (
            <div key={p.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 group hover:border-brand/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.tier === 'Premium' ? 'bg-red-50 dark:bg-red-900/20' : p.tier === 'Growth' ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                    <Icon className={`w-5 h-5 ${p.tier === 'Premium' ? 'text-brand' : p.tier === 'Growth' ? 'text-orange-500' : 'text-blue-500'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-sora font-bold text-sm text-navy dark:text-white">{p.zone}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${p.tier === 'Premium' ? 'bg-red-50 dark:bg-red-900/20 text-brand' : p.tier === 'Growth' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'}`}>{p.tier}</span>
                    </div>
                    {p.current ? (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-jakarta">{p.current}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-400 font-jakarta flex items-center gap-1"><Building2 className="w-3 h-3" /> {p.client}</span>
                          <span className="text-xs text-gray-400 font-jakarta flex items-center gap-1"><Calendar className="w-3 h-3" /> {p.startDate} → {p.endDate}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 font-jakarta mt-1 italic">No active placement — slot available</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${p.status === 'ACTIVE' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                    {p.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}{p.status}
                  </span>
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><Edit3 className="w-4 h-4 text-gray-400" /></button>
                  <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && editing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-sora font-bold text-lg text-navy dark:text-white">{placements.find(p => p.id === editing.id) ? 'Edit Placement' : 'New Placement'}</h2>
              <button onClick={() => { setModalOpen(false); setEditing(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Zone</label>
                  <select className="input-field text-sm" value={editing.zone} onChange={(e) => setEditing({ ...editing, zone: e.target.value })}>{zones.map(z => <option key={z}>{z}</option>)}</select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Tier</label>
                  <select className="input-field text-sm" value={editing.tier} onChange={(e) => setEditing({ ...editing, tier: e.target.value })}>{tiers.map(t => <option key={t}>{t}</option>)}</select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Client / Startup</label>
                <input type="text" className="input-field text-sm" value={editing.client || ''} onChange={(e) => setEditing({ ...editing, client: e.target.value })} placeholder="e.g. Sarvam AI" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Story Headline</label>
                <input type="text" className="input-field text-sm" value={editing.current || ''} onChange={(e) => setEditing({ ...editing, current: e.target.value })} placeholder="Story headline..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Start Date</label>
                  <input type="date" className="input-field text-sm" value={editing.startDate || ''} onChange={(e) => setEditing({ ...editing, startDate: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">End Date</label>
                  <input type="date" className="input-field text-sm" value={editing.endDate || ''} onChange={(e) => setEditing({ ...editing, endDate: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => { setModalOpen(false); setEditing(null); }} className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={handleSave} className="btn-brand text-sm flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-sora font-bold text-lg text-navy dark:text-white">Delete Placement?</h3>
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

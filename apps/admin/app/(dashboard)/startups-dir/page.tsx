'use client';

import { useState } from 'react';
import {
  Plus, Search, Building2, MapPin, X,
  CheckCircle, Clock, Edit3, Trash2, Save, MoreHorizontal,
} from 'lucide-react';

interface Startup {
  id: string; name: string; sector: string; fundingStage: string;
  totalFunding: string; founder: string; location: string; status: string;
  description: string;
}

const initialStartups: Startup[] = [
  { id: '1', name: 'Sarvam AI', sector: 'LLM / NLP', fundingStage: 'Series A', totalFunding: '$41M', founder: 'Vivek Raghavan', location: 'Bengaluru', status: 'PUBLISHED', description: 'Building Indic language AI models' },
  { id: '2', name: 'Krutrim', sector: 'Full-stack AI', fundingStage: 'Series B', totalFunding: '$50M', founder: 'Bhavish Aggarwal', location: 'Bengaluru', status: 'PUBLISHED', description: 'India\'s first AI unicorn' },
  { id: '3', name: 'Karya', sector: 'Data Annotation', fundingStage: 'Seed', totalFunding: '$2M', founder: 'Manu Chopra', location: 'Bengaluru', status: 'PUBLISHED', description: 'Ethical data annotation platform' },
  { id: '4', name: 'Ola Maps', sector: 'GeoAI / Maps', fundingStage: 'Pre-seed', totalFunding: '$5M', founder: 'Maps Team', location: 'Bengaluru', status: 'DRAFT', description: 'AI-powered mapping for India' },
  { id: '5', name: 'Yellow.ai', sector: 'Conversational AI', fundingStage: 'Series C', totalFunding: '$102M', founder: 'Raghu Ravinutala', location: 'Bengaluru', status: 'PUBLISHED', description: 'Enterprise customer support automation' },
];

const sectors = ['LLM / NLP', 'Full-stack AI', 'Data Annotation', 'GeoAI / Maps', 'Conversational AI', 'Computer Vision', 'Healthcare AI', 'FinTech AI', 'EdTech AI', 'AgriTech AI'];
const stages = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D+', 'IPO'];
const emptyStartup: Startup = { id: '', name: '', sector: 'LLM / NLP', fundingStage: 'Seed', totalFunding: '', founder: '', location: '', status: 'DRAFT', description: '' };

export default function StartupsDirPage() {
  const [startups, setStartups] = useState<Startup[]>(initialStartups);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Startup | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = startups.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.sector.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing({ ...emptyStartup, id: Date.now().toString() }); setModalOpen(true); };
  const openEdit = (s: Startup) => { setEditing({ ...s }); setModalOpen(true); };

  const handleSave = () => {
    if (!editing) return;
    const exists = startups.find(s => s.id === editing.id);
    if (exists) setStartups(startups.map(s => s.id === editing.id ? editing : s));
    else setStartups([editing, ...startups]);
    setModalOpen(false); setEditing(null);
  };

  const handleDelete = (id: string) => { setStartups(startups.filter(s => s.id !== id)); setDeleteConfirm(null); };
  const toggleStatus = (id: string) => {
    setStartups(startups.map(s => s.id === id ? { ...s, status: s.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' } : s));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Startups</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">Manage startup profiles shown on <span className="text-brand">/startups</span></p>
        </div>
        <button onClick={openCreate} className="btn-brand text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add Startup</button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search startups..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Startup</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Sector</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden lg:table-cell">Funding</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden sm:table-cell">Stage</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
              <th className="px-6 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-t border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center"><Building2 className="w-4 h-4 text-brand" /></div>
                    <div>
                      <h4 className="font-sora font-semibold text-sm text-navy dark:text-white">{s.name}</h4>
                      <p className="text-xs text-gray-400 font-jakarta flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {s.location} · {s.founder}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell"><span className="badge-category text-[10px]">{s.sector}</span></td>
                <td className="px-6 py-4 hidden lg:table-cell"><span className="text-sm font-bold text-brand font-sora">{s.totalFunding}</span></td>
                <td className="px-6 py-4 hidden sm:table-cell"><span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta">{s.fundingStage}</span></td>
                <td className="px-6 py-4">
                  <button onClick={() => toggleStatus(s.id)} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer ${s.status === 'PUBLISHED' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>{s.status === 'PUBLISHED' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}{s.status}</button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><Edit3 className="w-3.5 h-3.5 text-gray-400" /></button>
                    <button onClick={() => setDeleteConfirm(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-jakarta text-sm">No startups found</td></tr>}
          </tbody>
        </table>
      </div>

      {/* ─── Create/Edit Modal ─── */}
      {modalOpen && editing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-sora font-bold text-lg text-navy dark:text-white">{startups.find(s => s.id === editing.id) ? 'Edit Startup' : 'Add New Startup'}</h2>
              <button onClick={() => { setModalOpen(false); setEditing(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Name *</label>
                <input type="text" className="input-field text-sm" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Sarvam AI" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Sector</label>
                  <select className="input-field text-sm" value={editing.sector} onChange={(e) => setEditing({ ...editing, sector: e.target.value })}>{sectors.map(s => <option key={s}>{s}</option>)}</select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Funding Stage</label>
                  <select className="input-field text-sm" value={editing.fundingStage} onChange={(e) => setEditing({ ...editing, fundingStage: e.target.value })}>{stages.map(s => <option key={s}>{s}</option>)}</select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Total Funding</label>
                  <input type="text" className="input-field text-sm" value={editing.totalFunding} onChange={(e) => setEditing({ ...editing, totalFunding: e.target.value })} placeholder="e.g. $41M" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Location</label>
                  <input type="text" className="input-field text-sm" value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} placeholder="e.g. Bengaluru" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Founder(s)</label>
                <input type="text" className="input-field text-sm" value={editing.founder} onChange={(e) => setEditing({ ...editing, founder: e.target.value })} placeholder="e.g. Vivek Raghavan" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Description</label>
                <textarea className="input-field text-sm" rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Brief description..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Status</label>
                <select className="input-field text-sm" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option></select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => { setModalOpen(false); setEditing(null); }} className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={!editing.name} className="btn-brand text-sm flex items-center gap-2 disabled:opacity-50"><Save className="w-4 h-4" /> Save Startup</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-sora font-bold text-lg text-navy dark:text-white">Delete Startup?</h3>
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

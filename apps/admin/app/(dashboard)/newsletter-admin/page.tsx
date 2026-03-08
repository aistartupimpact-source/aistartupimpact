'use client';

import { useState } from 'react';
import { Mail, Users, Send, Plus, Eye, Clock, CheckCircle, TrendingUp, Edit3, X, Save, Trash2 } from 'lucide-react';

const stats = [
  { label: 'Total Subscribers', value: '5,247', change: '+12%', icon: Users },
  { label: 'Avg. Open Rate', value: '42%', change: '+3%', icon: Eye },
  { label: 'Campaigns Sent', value: '18', icon: Send },
  { label: 'Click-through Rate', value: '8.5%', change: '+1.2%', icon: TrendingUp },
];

interface Campaign { id: string; subject: string; previewText: string; sentAt: string | null; status: string; opens: number; clicks: number; }

const initialCampaigns: Campaign[] = [
  { id: '1', subject: 'Weekly AI Pulse #42 — GPT-5 is here', previewText: 'Everything changes this week with GPT-5...', sentAt: 'Mar 7, 2025', status: 'SENT', opens: 2180, clicks: 445 },
  { id: '2', subject: 'Funding Digest: $98M raised this week', previewText: 'Sarvam AI and Krutrim lead the pack...', sentAt: 'Mar 7, 2025', status: 'SENT', opens: 1950, clicks: 380 },
  { id: '3', subject: 'Weekly AI Pulse #43 — Edge AI boom', previewText: 'Edge computing meets AI in India...', sentAt: null, status: 'DRAFT', opens: 0, clicks: 0 },
  { id: '4', subject: 'Special: India AI Report 2025', previewText: 'The definitive guide to India\'s AI ecosystem...', sentAt: 'Mar 14, 2025', status: 'SCHEDULED', opens: 0, clicks: 0 },
];

const emptyCampaign: Campaign = { id: '', subject: '', previewText: '', sentAt: null, status: 'DRAFT', opens: 0, clicks: 0 };

export default function NewsletterAdminPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openCreate = () => { setEditing({ ...emptyCampaign, id: Date.now().toString() }); setModalOpen(true); };
  const openEdit = (c: Campaign) => { setEditing({ ...c }); setModalOpen(true); };

  const handleSave = () => {
    if (!editing) return;
    const exists = campaigns.find(c => c.id === editing.id);
    if (exists) setCampaigns(campaigns.map(c => c.id === editing.id ? editing : c));
    else setCampaigns([editing, ...campaigns]);
    setModalOpen(false); setEditing(null);
  };

  const handleDelete = (id: string) => { setCampaigns(campaigns.filter(c => c.id !== id)); setDeleteConfirm(null); };

  const sendCampaign = (id: string) => {
    setCampaigns(campaigns.map(c => c.id === id ? { ...c, status: 'SENT', sentAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } : c));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Newsletter</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">Manage email campaigns and subscribers</p>
        </div>
        <button onClick={openCreate} className="btn-brand text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> New Campaign</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
            <s.icon className="w-5 h-5 text-gray-400 dark:text-gray-500 mb-3" />
            <p className="font-sora font-extrabold text-xl text-navy dark:text-white">{s.value}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400 font-jakarta">{s.label}</span>
              {'change' in s && s.change && <span className="text-xs text-green-600 dark:text-green-400 font-semibold">{s.change}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-sora font-bold text-base text-navy dark:text-white">Campaigns</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Subject</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Status</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden sm:table-cell">Opens</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden lg:table-cell">Clicks</th>
              <th className="px-6 py-3 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-t border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-brand shrink-0" />
                    <div>
                      <span className="font-sora font-semibold text-sm text-navy dark:text-white line-clamp-1">{c.subject}</span>
                      {c.sentAt && <p className="text-xs text-gray-400 font-jakarta mt-0.5">{c.sentAt}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${c.status === 'SENT' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : c.status === 'SCHEDULED' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>{c.status === 'SENT' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}{c.status}</span>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell"><span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta">{c.opens > 0 ? c.opens.toLocaleString() : '—'}</span></td>
                <td className="px-6 py-4 hidden lg:table-cell"><span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta">{c.clicks > 0 ? c.clicks.toLocaleString() : '—'}</span></td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    {c.status === 'DRAFT' && <button onClick={() => sendCampaign(c.id)} className="px-2.5 py-1 text-[11px] font-semibold bg-brand/10 text-brand rounded-lg hover:bg-brand/20 transition-colors">Send</button>}
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><Edit3 className="w-3.5 h-3.5 text-gray-400" /></button>
                    <button onClick={() => setDeleteConfirm(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && editing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-sora font-bold text-lg text-navy dark:text-white">{campaigns.find(c => c.id === editing.id) ? 'Edit Campaign' : 'New Campaign'}</h2>
              <button onClick={() => { setModalOpen(false); setEditing(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Subject *</label>
                <input type="text" className="input-field text-sm" value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} placeholder="Weekly AI Pulse #..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Preview Text</label>
                <textarea className="input-field text-sm" rows={2} value={editing.previewText} onChange={(e) => setEditing({ ...editing, previewText: e.target.value })} placeholder="Brief preview shown in inbox..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Status</label>
                <select className="input-field text-sm" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                  <option value="DRAFT">Draft</option><option value="SCHEDULED">Scheduled</option><option value="SENT">Sent</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => { setModalOpen(false); setEditing(null); }} className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={!editing.subject} className="btn-brand text-sm flex items-center gap-2 disabled:opacity-50"><Save className="w-4 h-4" /> Save</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-sora font-bold text-lg text-navy dark:text-white">Delete Campaign?</h3>
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

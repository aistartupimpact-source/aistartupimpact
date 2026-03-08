'use client';

import { useState } from 'react';
import {
  Plus, Search, MoreHorizontal, Star, Zap, X,
  Edit3, Trash2, CheckCircle, Clock, Save,
} from 'lucide-react';

interface Tool {
  id: string; name: string; category: string;
  pricing: string; rating: number; status: string; verdict: string;
  website: string;
}

const initialTools: Tool[] = [
  { id: '1', name: 'Cursor', category: 'Code Editor', pricing: 'Freemium', rating: 4.9, status: 'PUBLISHED', verdict: 'Best AI code editor for serious developers', website: 'https://cursor.sh' },
  { id: '2', name: 'Perplexity AI', category: 'Search', pricing: 'Freemium', rating: 4.7, status: 'PUBLISHED', verdict: 'Replaces Google for research-heavy queries', website: 'https://perplexity.ai' },
  { id: '3', name: 'Notion AI', category: 'Productivity', pricing: 'Paid Add-on', rating: 4.5, status: 'PUBLISHED', verdict: 'Great for teams already in Notion', website: 'https://notion.so' },
  { id: '4', name: 'Midjourney', category: 'Image Gen', pricing: 'Paid', rating: 4.8, status: 'PUBLISHED', verdict: 'Still the gold standard for image generation', website: 'https://midjourney.com' },
  { id: '5', name: 'Lovable', category: 'App Builder', pricing: 'Freemium', rating: 4.3, status: 'DRAFT', verdict: 'Promising but needs polish', website: 'https://lovable.dev' },
];

const categories = ['Code Editor', 'Search', 'Productivity', 'Image Gen', 'App Builder', 'Writing', 'Video', 'Data', 'DevOps'];
const pricingOptions = ['Free', 'Freemium', 'Paid', 'Paid Add-on', 'Enterprise'];

const emptyTool: Tool = { id: '', name: '', category: 'Code Editor', pricing: 'Freemium', rating: 4.0, status: 'DRAFT', verdict: '', website: '' };

export default function ToolsDirPage() {
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Tool | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = tools.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing({ ...emptyTool, id: Date.now().toString() }); setModalOpen(true); };
  const openEdit = (tool: Tool) => { setEditing({ ...tool }); setModalOpen(true); };

  const handleSave = () => {
    if (!editing) return;
    const exists = tools.find(t => t.id === editing.id);
    if (exists) {
      setTools(tools.map(t => t.id === editing.id ? editing : t));
    } else {
      setTools([editing, ...tools]);
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    setTools(tools.filter(t => t.id !== id));
    setDeleteConfirm(null);
  };

  const toggleStatus = (id: string) => {
    setTools(tools.map(t => t.id === id ? { ...t, status: t.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' } : t));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">AI Tools</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">
            Manage the Editor&apos;s Picks shown on <span className="text-brand">/tools</span>
          </p>
        </div>
        <button onClick={openCreate} className="btn-brand text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Tool
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search tools..." value={search}
          onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tool</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Category</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Rating</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden sm:table-cell">Pricing</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
              <th className="px-6 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tool) => (
              <tr key={tool.id} className="border-t border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-brand" />
                    </div>
                    <div>
                      <h4 className="font-sora font-semibold text-sm text-navy dark:text-white">{tool.name}</h4>
                      <p className="text-xs text-gray-400 font-jakarta mt-0.5 line-clamp-1">{tool.verdict}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="badge-category text-[10px]">{tool.category}</span>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-bold text-navy dark:text-white">{tool.rating}</span>
                  </div>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta">{tool.pricing}</span>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => toggleStatus(tool.id)} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors ${tool.status === 'PUBLISHED'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                    {tool.status === 'PUBLISHED' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {tool.status}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(tool)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <button onClick={() => setDeleteConfirm(tool.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-jakarta text-sm">No tools found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Create/Edit Modal ─── */}
      {modalOpen && editing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-sora font-bold text-lg text-navy dark:text-white">
                {tools.find(t => t.id === editing.id) ? 'Edit Tool' : 'Add New Tool'}
              </h2>
              <button onClick={() => { setModalOpen(false); setEditing(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Name *</label>
                <input type="text" className="input-field text-sm" value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Cursor" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Category</label>
                  <select className="input-field text-sm" value={editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Pricing</label>
                  <select className="input-field text-sm" value={editing.pricing}
                    onChange={(e) => setEditing({ ...editing, pricing: e.target.value })}>
                    {pricingOptions.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Rating (1-5)</label>
                <input type="number" className="input-field text-sm w-24" min={1} max={5} step={0.1} value={editing.rating}
                  onChange={(e) => setEditing({ ...editing, rating: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Website URL</label>
                <input type="url" className="input-field text-sm" value={editing.website}
                  onChange={(e) => setEditing({ ...editing, website: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Editorial Verdict *</label>
                <textarea className="input-field text-sm" rows={2} value={editing.verdict}
                  onChange={(e) => setEditing({ ...editing, verdict: e.target.value })} placeholder="One-line editorial opinion..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Status</label>
                <select className="input-field text-sm" value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => { setModalOpen(false); setEditing(null); }} className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={!editing.name || !editing.verdict}
                className="btn-brand text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <Save className="w-4 h-4" /> Save Tool
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation ─── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-sora font-bold text-lg text-navy dark:text-white">Delete Tool?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta mt-1">This action cannot be undone.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

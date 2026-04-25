'use client';

import { useState, useEffect, useTransition } from 'react';
import { Plus, Search, Star, Zap, X, Edit3, Trash2, Save, Crown, ArrowUp, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadLogoAction } from '../media/actions';
import {
  getToolsAction, getCategoriesAction, createToolAction,
  updateToolAction, deleteToolAction, setListingTierAction,
} from './actions';

interface Tool {
  id: string; name: string; slug: string; tagline: string; description: string;
  websiteUrl: string; logoUrl: string | null; categoryId: string; categoryName: string;
  pricingModel: string; pricingUrl: string | null; startingPrice: number | null;
  hasApi: boolean; hasMobileApp: boolean; founderNames: string[];
  headquartersCountry: string | null; avgRating: number; listingTier: string; status: string;
}
interface Category { id: string; name: string; slug: string; }

const PRICING_MODELS = ['FREE', 'FREEMIUM', 'PAID', 'SUBSCRIPTION', 'ENTERPRISE'];
const LISTING_TIERS = ['FREE', 'PRIORITY', 'FEATURED'];
const STATUSES = ['PENDING', 'APPROVED', 'ARCHIVED'];

const emptyTool: Tool = {
  id: '__new__', name: '', slug: '', tagline: '', description: '', websiteUrl: '',
  logoUrl: '', categoryId: '', categoryName: '', pricingModel: 'FREEMIUM',
  pricingUrl: null, startingPrice: null, hasApi: false, hasMobileApp: false,
  founderNames: [], headquartersCountry: null,
  avgRating: 4.5, listingTier: 'FREE', status: 'APPROVED',
};

const tierBadge: Record<string, string> = {
  FEATURED: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  PRIORITY: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  FREE: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
};

const statusBadge: Record<string, string> = {
  APPROVED: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  PENDING: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  ARCHIVED: 'bg-red-100 dark:bg-red-900/30 text-red-500',
};

export default function ToolsDirPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Tool | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadLogoAction(formData);
      if (res.success && res.url) {
        setEditing({ ...editing!, logoUrl: res.url });
      } else {
        alert(res.error || 'Logo upload failed');
      }
    } catch (err) {
      alert('Upload error');
    } finally {
      setUploadingLogo(false);
    }
  };

  useEffect(() => {
    Promise.all([getToolsAction(), getCategoriesAction()]).then(([t, c]) => {
      setTools(t as Tool[]);
      setCategories(c as Category[]);
      setLoading(false);
    });
  }, []);

  const filtered = tools.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.tagline || '').toLowerCase().includes(search.toLowerCase());
    const matchTier = tierFilter === 'ALL' || t.listingTier === tierFilter;
    return matchSearch && matchTier;
  });

  const openCreate = () => {
    setEditing({ ...emptyTool, categoryId: categories[0]?.id || '' });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (tool: Tool) => {
    setEditing({ ...tool });
    setError('');
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!editing) return;
    setError('');
    startTransition(async () => {
      const slug = editing.slug || editing.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const payload = {
        name: editing.name,
        slug,
        tagline: editing.tagline,
        description: editing.description,
        websiteUrl: editing.websiteUrl,
        logoUrl: editing.logoUrl || undefined,
        categoryId: editing.categoryId,
        pricingModel: editing.pricingModel,
        pricingUrl: (editing as any).pricingUrl || undefined,
        startingPrice: (editing as any).startingPrice ?? undefined,
        hasApi: (editing as any).hasApi ?? false,
        hasMobileApp: (editing as any).hasMobileApp ?? false,
        founderNames: (editing as any).founderNames || [],
        headquartersCountry: (editing as any).headquartersCountry || undefined,
        avgRating: editing.avgRating,
        listingTier: editing.listingTier,
        status: editing.status,
      };
      const result = editing.id === '__new__'
        ? await createToolAction(payload)
        : await updateToolAction(editing.id, payload);
      if (!result.success) { setError((result as any).error || 'Save failed'); return; }
      const updated = await getToolsAction();
      setTools(updated as Tool[]);
      setModalOpen(false);
      setEditing(null);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteToolAction(id);
      setTools(tools.filter(t => t.id !== id));
      setDeleteConfirm(null);
    });
  };

  const handleTierChange = (id: string, tier: string) => {
    startTransition(async () => {
      await setListingTierAction(id, tier);
      setTools(tools.map(t => t.id === id ? { ...t, listingTier: tier } : t));
    });
  };

  const counts = {
    FEATURED: tools.filter(t => t.listingTier === 'FEATURED').length,
    PRIORITY: tools.filter(t => t.listingTier === 'PRIORITY').length,
    FREE: tools.filter(t => t.listingTier === 'FREE').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">AI Tools Directory</h1>
          <p className="text-gray-400 text-sm font-jakarta mt-1">
            {tools.length} tools · {counts.FEATURED} Featured · {counts.PRIORITY} Priority
          </p>
        </div>
        <button onClick={openCreate} className="btn-brand text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Tool
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {(['FEATURED', 'PRIORITY', 'FREE'] as const).map(tier => (
          <button key={tier} onClick={() => setTierFilter(tierFilter === tier ? 'ALL' : tier)}
            className={`p-4 rounded-xl border text-left transition-all ${tierFilter === tier ? 'border-brand bg-brand/5' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'}`}>
            <div className="flex items-center gap-2 mb-1">
              {tier === 'FEATURED' && <Crown className="w-4 h-4 text-yellow-500" />}
              {tier === 'PRIORITY' && <ArrowUp className="w-4 h-4 text-blue-500" />}
              {tier === 'FREE' && <Zap className="w-4 h-4 text-gray-400" />}
              <span className="font-sora font-bold text-sm text-navy dark:text-white">{tier}</span>
            </div>
            <span className="text-2xl font-extrabold text-brand">{counts[tier]}</span>
            <span className="text-xs text-gray-400 font-jakarta ml-1">tools</span>
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search tools..." value={search}
          onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 font-jakarta text-sm">Loading from database...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
                <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 uppercase tracking-wide">Tool</th>
                <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 uppercase tracking-wide hidden md:table-cell">Category</th>
                <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 uppercase tracking-wide hidden md:table-cell">Rating</th>
                <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 uppercase tracking-wide">Tier</th>
                <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 uppercase tracking-wide hidden sm:table-cell">Status</th>
                <th className="px-6 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(tool => (
                <tr key={tool.id} className="border-t border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {tool.logoUrl ? (
                        <img src={tool.logoUrl} alt={tool.name} className="w-9 h-9 rounded-xl object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center">
                          <Zap className="w-4 h-4 text-brand" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-sora font-semibold text-sm text-navy dark:text-white">{tool.name}</h4>
                        <p className="text-xs text-gray-400 font-jakarta mt-0.5 line-clamp-1 max-w-xs">{tool.tagline}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-xs text-gray-500 font-jakarta">{tool.categoryName || '—'}</span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold text-navy dark:text-white">{tool.avgRating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select value={tool.listingTier} onChange={e => handleTierChange(tool.id, e.target.value)}
                      disabled={isPending}
                      className={`text-[11px] font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${tierBadge[tool.listingTier] || ''}`}>
                      {LISTING_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusBadge[tool.status] || ''}`}>
                      {tool.status}
                    </span>
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
        )}
      </div>

      {modalOpen && editing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-sora font-bold text-lg text-navy dark:text-white">
                {editing.id === '__new__' ? 'Add New Tool' : 'Edit Tool'}
              </h2>
              <button onClick={() => { setModalOpen(false); setEditing(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">Name *</label>
                <input type="text" className="input-field text-sm" value={editing.name}
                  onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Krutrim AI" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">Slug (auto if blank)</label>
                <input type="text" className="input-field text-sm" value={editing.slug}
                  onChange={e => setEditing({ ...editing, slug: e.target.value })} placeholder="e.g. krutrim-ai" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">
                  Tagline * <span className="text-gray-400 normal-case">(max 60 chars)</span>
                </label>
                <input type="text" className="input-field text-sm" value={editing.tagline} maxLength={60}
                  onChange={e => setEditing({ ...editing, tagline: e.target.value })} placeholder="One-line description" />
                <p className={`text-xs mt-1 text-right font-jakarta ${editing.tagline.length > 55 ? 'text-amber-500' : 'text-gray-400'}`}>
                  {editing.tagline.length}/60
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">
                  Description <span className="text-gray-400 normal-case">(max 300 chars)</span>
                </label>
                <textarea className="input-field text-sm" rows={3} maxLength={300} value={editing.description}
                  onChange={e => setEditing({ ...editing, description: e.target.value })} />
                <p className={`text-xs mt-1 text-right font-jakarta ${editing.description.length > 270 ? 'text-amber-500' : 'text-gray-400'}`}>
                  {editing.description.length}/300
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">Website URL *</label>
                <input type="url" className="input-field text-sm" value={editing.websiteUrl}
                  onChange={e => setEditing({ ...editing, websiteUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">Pricing Page URL</label>
                <input type="url" className="input-field text-sm" value={(editing as any).pricingUrl || ''}
                  onChange={e => setEditing({ ...editing, pricingUrl: e.target.value } as any)} placeholder="https://.../pricing" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">Logo / Icon</label>
                <div className="flex items-center gap-3">
                  {editing.logoUrl ? (
                    <img src={editing.logoUrl} className="w-12 h-12 rounded-xl object-cover shrink-0" alt="logo" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <input type="url" className="input-field text-sm" value={editing.logoUrl || ''}
                      onChange={e => setEditing({ ...editing, logoUrl: e.target.value })} placeholder="Or paste https:// URL..." />
                    
                    <input type="file" id="logo-upload" onChange={handleLogoUpload} accept="image/*" className="hidden" />
                    <label htmlFor="logo-upload" className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-lg cursor-pointer transition-colors ${uploadingLogo ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                      {uploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      {uploadingLogo ? 'Uploading...' : 'Upload Image'}
                    </label>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">Category</label>
                  <select className="input-field text-sm" value={editing.categoryId}
                    onChange={e => setEditing({ ...editing, categoryId: e.target.value })}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">Pricing Model</label>
                  <select className="input-field text-sm" value={editing.pricingModel}
                    onChange={e => setEditing({ ...editing, pricingModel: e.target.value })}>
                    {PRICING_MODELS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">Starting Price (USD)</label>
                  <input type="number" className="input-field text-sm" value={(editing as any).startingPrice ?? ''}
                    onChange={e => setEditing({ ...editing, startingPrice: e.target.value ? parseFloat(e.target.value) : null } as any)}
                    placeholder="e.g. 20" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">HQ / Country</label>
                  <input type="text" className="input-field text-sm" value={(editing as any).headquartersCountry || ''}
                    onChange={e => setEditing({ ...editing, headquartersCountry: e.target.value } as any)} placeholder="e.g. Bengaluru, India" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">Founder Names (comma separated)</label>
                <input type="text" className="input-field text-sm"
                  value={((editing as any).founderNames || []).join(', ')}
                  onChange={e => setEditing({ ...editing, founderNames: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) } as any)}
                  placeholder="e.g. Pratyush Kumar, Vivek Raghavan" />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-navy dark:text-gray-300 font-jakarta cursor-pointer">
                  <input type="checkbox" checked={!!(editing as any).hasApi}
                    onChange={e => setEditing({ ...editing, hasApi: e.target.checked } as any)}
                    className="w-4 h-4 rounded text-brand border-gray-300 focus:ring-brand" />
                  Has Developer API
                </label>
                <label className="flex items-center gap-2 text-sm text-navy dark:text-gray-300 font-jakarta cursor-pointer">
                  <input type="checkbox" checked={!!(editing as any).hasMobileApp}
                    onChange={e => setEditing({ ...editing, hasMobileApp: e.target.checked } as any)}
                    className="w-4 h-4 rounded text-brand border-gray-300 focus:ring-brand" />
                  Has Mobile App
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">Listing Tier</label>
                  <select className="input-field text-sm" value={editing.listingTier}
                    onChange={e => setEditing({ ...editing, listingTier: e.target.value })}>
                    {LISTING_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">Status</label>
                  <select className="input-field text-sm" value={editing.status}
                    onChange={e => setEditing({ ...editing, status: e.target.value })}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">Avg Rating (1–5)</label>
                <input type="number" className="input-field text-sm w-24" min={1} max={5} step={0.1}
                  value={editing.avgRating}
                  onChange={e => setEditing({ ...editing, avgRating: parseFloat(e.target.value) || 4.0 })} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => { setModalOpen(false); setEditing(null); }}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={!editing.name || !editing.websiteUrl || isPending}
                className="btn-brand text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <Save className="w-4 h-4" /> {isPending ? 'Saving...' : 'Save Tool'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-sora font-bold text-lg text-navy dark:text-white">Delete Tool?</h3>
            <p className="text-sm text-gray-500 font-jakarta mt-1">This will soft-delete the tool from the site.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Plus, Search, Building2, MapPin, X, Star, StarOff,
  Edit3, Trash2, Save, Crown, Upload, Loader2,
} from 'lucide-react';
import {
  getStartupsAction,
  createStartupAction,
  updateStartupAction,
  deleteStartupAction,
  toggleFeaturedAction,
} from './actions';
import { uploadLogoAction } from '../media/actions';

interface Startup {
  id: string;
  name: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  websiteUrl?: string;
  stage: string;
  headquartersCity?: string;
  isFeatured: boolean;
  featuredUntil?: string;
  statValue?: string;
  statLabel?: string;
  createdAt: string;
  updatedAt: string;
}

const stages = ['IDEA', 'PRE_SEED', 'SEED', 'SERIES_A', 'SERIES_B', 'SERIES_C', 'GROWTH', 'PUBLIC'];

const emptyStartup: Omit<Startup, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  tagline: '',
  description: '',
  logoUrl: '',
  websiteUrl: '',
  stage: 'SEED',
  headquartersCity: '',
  isFeatured: false,
  statValue: '',
  statLabel: '',
};

export default function StartupsDirPage() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Startup | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreviewError, setLogoPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadStartups();
  }, []);

  const loadStartups = async () => {
    setLoading(true);
    try {
      const data = await getStartupsAction();
      setStartups(data as Startup[]);
    } catch (error) {
      console.error('Error loading startups:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = startups.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.tagline.toLowerCase().includes(search.toLowerCase())
  );

  const featuredCount = startups.filter(s => s.isFeatured).length;

  const openCreate = () => {
    setEditing({ ...emptyStartup, id: '', createdAt: '', updatedAt: '' } as Startup);
    setLogoPreviewError(false);
    setModalOpen(true);
  };

  const openEdit = (startup: Startup) => {
    setEditing({ ...startup });
    setLogoPreviewError(false);
    setModalOpen(true);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setLogoUploading(true);
    setLogoPreviewError(false);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const result = await uploadLogoAction(fd);
      if (result.success && result.url) {
        setEditing((prev) => prev ? { ...prev, logoUrl: result.url } : prev);
      } else {
        alert('Upload failed: ' + (result.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Upload error: ' + err.message);
    } finally {
      setLogoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!editing) return;

    try {
      const data = {
        name: editing.name,
        tagline: editing.tagline,
        description: editing.description,
        logoUrl: editing.logoUrl,
        websiteUrl: editing.websiteUrl,
        stage: editing.stage,
        headquartersCity: editing.headquartersCity,
        isFeatured: editing.isFeatured,
        statValue: editing.statValue,
        statLabel: editing.statLabel,
      };

      if (editing.id && startups.find(s => s.id === editing.id)) {
        // Update existing
        const result = await updateStartupAction(editing.id, data);
        if (result.success) {
          await loadStartups();
        }
      } else {
        // Create new
        const result = await createStartupAction(data);
        if (result.success) {
          await loadStartups();
        }
      }
      setModalOpen(false);
      setEditing(null);
    } catch (error) {
      console.error('Error saving startup:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteStartupAction(id);
      if (result.success) {
        await loadStartups();
      }
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting startup:', error);
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const result = await toggleFeaturedAction(id, !currentFeatured);
      if (result.success) {
        await loadStartups();
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Startups Directory</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">
            Manage startup profiles • {featuredCount} featured as partners
          </p>
        </div>
        <button onClick={openCreate} className="btn-brand text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Startup
        </button>
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
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Stage</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden lg:table-cell">Location</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Featured</th>
              <th className="px-6 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((startup) => (
              <tr key={startup.id} className="border-t border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center overflow-hidden shrink-0">
                      {startup.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={startup.logoUrl} alt={startup.name} className="w-full h-full object-contain p-1" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <Building2 className="w-4 h-4 text-brand" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-sora font-semibold text-sm text-navy dark:text-white">{startup.name}</h4>
                        {startup.isFeatured && (
                          <span title="Featured Partner"><Crown className="w-3.5 h-3.5 text-yellow-500" /></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 font-jakarta mt-0.5 line-clamp-1">{startup.tagline}</p>
                      {startup.headquartersCity && (
                        <p className="text-xs text-gray-400 font-jakarta flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {startup.headquartersCity}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="badge-category text-[10px]">{startup.stage.replace('_', ' ')}</span>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta">{startup.headquartersCity || '—'}</span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleFeatured(startup.id, startup.isFeatured)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors ${
                      startup.isFeatured
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                    }`}
                  >
                    {startup.isFeatured ? (
                      <>
                        <Star className="w-3 h-3 fill-current" />
                        Featured
                      </>
                    ) : (
                      <>
                        <StarOff className="w-3 h-3" />
                        Not Featured
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(startup)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <button onClick={() => setDeleteConfirm(startup.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-jakarta text-sm">No startups found</td></tr>
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
                {editing.id && startups.find(s => s.id === editing.id) ? 'Edit Startup' : 'Add New Startup'}
              </h2>
              <button onClick={() => { setModalOpen(false); setEditing(null); setLogoPreviewError(false); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Name *</label>
                <input type="text" className="input-field text-sm" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Sarvam AI" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Tagline *</label>
                <input type="text" className="input-field text-sm" value={editing.tagline} onChange={(e) => setEditing({ ...editing, tagline: e.target.value })} placeholder="e.g. India-first foundation models" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Stage</label>
                  <select className="input-field text-sm" value={editing.stage} onChange={(e) => setEditing({ ...editing, stage: e.target.value })}>
                    {stages.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Location</label>
                  <input type="text" className="input-field text-sm" value={editing.headquartersCity || ''} onChange={(e) => setEditing({ ...editing, headquartersCity: e.target.value })} placeholder="e.g. Bengaluru" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Website URL</label>
                <input type="url" className="input-field text-sm" value={editing.websiteUrl || ''} onChange={(e) => setEditing({ ...editing, websiteUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Logo</label>
                <div className="flex gap-2 items-start">
                  {/* Upload button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={logoUploading}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-50"
                  >
                    {logoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {logoUploading ? 'Uploading…' : 'Upload'}
                  </button>
                  {/* URL input */}
                  <input
                    type="url"
                    className="input-field text-sm flex-1"
                    value={editing.logoUrl || ''}
                    onChange={(e) => { setEditing({ ...editing, logoUrl: e.target.value }); setLogoPreviewError(false); }}
                    placeholder="https://... or upload above"
                  />
                </div>
                {/* Preview */}
                {editing.logoUrl && !logoPreviewError && (
                  <div className="mt-2 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={editing.logoUrl}
                      alt="Logo preview"
                      className="w-12 h-12 rounded-lg object-contain border border-gray-200 dark:border-gray-700 p-1 bg-white"
                      onError={() => setLogoPreviewError(true)}
                    />
                    <span className="text-xs text-gray-400 font-jakarta">Preview</span>
                  </div>
                )}
                {editing.logoUrl && logoPreviewError && (
                  <p className="mt-1.5 text-xs text-red-400 font-jakarta">Could not load image — check the URL or re-upload.</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Highlight Stat (shown on homepage card)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      className="input-field text-sm"
                      value={editing.statValue || ''}
                      onChange={(e) => setEditing({ ...editing, statValue: e.target.value })}
                      placeholder="e.g. 40% or ₹10Cr or 99.9%"
                    />
                    <p className="text-[10px] text-gray-400 font-jakarta mt-1">Stat value (big number)</p>
                  </div>
                  <div>
                    <input
                      type="text"
                      className="input-field text-sm"
                      value={editing.statLabel || ''}
                      onChange={(e) => setEditing({ ...editing, statLabel: e.target.value })}
                      placeholder="e.g. Lower GPU Cost"
                    />
                    <p className="text-[10px] text-gray-400 font-jakarta mt-1">Stat label (description)</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Description</label>
                <textarea className="input-field text-sm" rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Brief description of the startup..." />
              </div>
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.isFeatured}
                    onChange={(e) => setEditing({ ...editing, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-brand bg-gray-100 border-gray-300 rounded focus:ring-brand dark:focus:ring-brand dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <div>
                    <span className="text-sm font-medium text-navy dark:text-white font-jakarta flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      Feature as Partner
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta mt-0.5">
                      Featured startups appear in the "Featured Partner" section on the homepage
                    </p>
                  </div>
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => { setModalOpen(false); setEditing(null); setLogoPreviewError(false); }} className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={!editing.name || !editing.tagline} className="btn-brand text-sm flex items-center gap-2 disabled:opacity-50">
                <Save className="w-4 h-4" /> Save Startup
              </button>
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

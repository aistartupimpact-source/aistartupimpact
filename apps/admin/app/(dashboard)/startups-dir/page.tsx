'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Search, Building2, MapPin, Star, StarOff,
  Edit3, Trash2, Crown,
} from 'lucide-react';
import {
  getStartupsAction,
  deleteStartupAction,
  toggleFeaturedAction,
  fixNullImpactScoresAction,
} from './actions';

interface Startup {
  id: string;
  name: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  stage: string;
  headquartersCity?: string;
  isFeatured: boolean;
  featuredUntil?: string;
  foundedYear?: number | null;
  employeeCount?: number | null;
  impactScore?: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function StartupsDirPage() {
  const router = useRouter();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    (s.tagline || '').toLowerCase().includes(search.toLowerCase())
  );

  const featuredCount = startups.filter(s => s.isFeatured).length;

  const openCreate = () => {
    router.push('/startups-dir/new');
  };

  const openEdit = (startup: Startup) => {
    router.push(`/startups-dir/${startup.id}/edit`);
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

  const runImpactScoreFix = async () => {
    if (!confirm('This will update all startups with null impactScore to 0. Continue?')) return;
    try {
      const result = await fixNullImpactScoresAction();
      if (result.success) {
        alert(result.message || 'Fixed successfully');
        await loadStartups();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error running fix:', error);
      alert('Error running fix');
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
            Manage startup profiles • {featuredCount} featured at top
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={runImpactScoreFix} className="px-3 py-2 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
            Fix Null Scores
          </button>
          <button onClick={openCreate} className="btn-brand text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Startup
          </button>
        </div>
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

      {/* Delete Confirmation Modal */}
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

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Search, Wrench, Edit3, Trash2, Crown, CheckCircle, XCircle,
} from 'lucide-react';
import {
  getToolsAction,
  getCategoriesAction,
  deleteToolAction,
  approveToolAction,
  rejectToolAction,
  setListingTierAction,
} from './actions';

interface Tool {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  websiteUrl: string;
  pricingModel: string;
  pricingUrl?: string;
  startingPrice?: number | null;
  avgRating: number;
  listingTier: string;
  status: string;
  claimStatus?: string;
  categoryId: string;
  categoryName?: string;
  hasApi?: boolean;
  hasMobileApp?: boolean;
  founderNames?: string[];
  headquartersCountry?: string;
  ownerName?: string;
  ownerEmail?: string;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const listingTiers = ['STANDARD', 'PRIORITY', 'FEATURED'];

export default function ToolsDirPage() {
  const router = useRouter();
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [toolsData, catsData] = await Promise.all([
        getToolsAction(),
        getCategoriesAction(),
      ]);
      setTools(toolsData as Tool[]);
      setCategories(catsData as Category[]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = tools.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.tagline || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.categoryName || '').toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = tools.filter(t => t.status === 'PENDING').length;
  const featuredCount = tools.filter(t => t.listingTier === 'FEATURED').length;

  const openCreate = () => {
    router.push('/tools-dir/new');
  };

  const openEdit = (tool: Tool) => {
    router.push(`/tools-dir/${tool.id}/edit`);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteToolAction(id);
      if (result.success) {
        await loadData();
      }
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting tool:', error);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const result = await approveToolAction(id);
      if (result.success) {
        await loadData();
      }
    } catch (error) {
      console.error('Error approving tool:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const result = await rejectToolAction(id);
      if (result.success) {
        await loadData();
      }
    } catch (error) {
      console.error('Error rejecting tool:', error);
    }
  };

  const handleTierChange = async (id: string, tier: string) => {
    try {
      const result = await setListingTierAction(id, tier);
      if (result.success) {
        await loadData();
      }
    } catch (error) {
      console.error('Error changing tier:', error);
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
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">AI Tools Directory</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">
            Manage AI tools • {pendingCount} pending • {featuredCount} featured
          </p>
        </div>
        <button onClick={openCreate} className="btn-brand text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Tool
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search tools..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tool</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Category</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden lg:table-cell">Pricing</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tier</th>
              <th className="px-6 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tool) => (
              <tr key={tool.id} className="border-t border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center overflow-hidden shrink-0">
                      {tool.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={tool.logoUrl} alt={tool.name} className="w-full h-full object-contain p-1" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <Wrench className="w-4 h-4 text-brand" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-sora font-semibold text-sm text-navy dark:text-white">{tool.name}</h4>
                        {tool.listingTier === 'FEATURED' && (
                          <Crown className="w-3.5 h-3.5 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 font-jakarta mt-0.5 line-clamp-1">{tool.tagline}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="badge-category text-[10px]">{tool.categoryName || '—'}</span>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta">{tool.pricingModel}</span>
                </td>
                <td className="px-6 py-4">
                  {tool.status === 'PENDING' ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleApprove(tool.id)}
                        className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </button>
                      <button
                        onClick={() => handleReject(tool.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4 text-red-500" />
                      </button>
                      <span className="text-xs text-orange-500 font-semibold ml-1">PENDING</span>
                    </div>
                  ) : (
                    <span className={`text-xs font-semibold ${tool.status === 'APPROVED' ? 'text-green-500' : 'text-gray-400'}`}>
                      {tool.status}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={tool.listingTier}
                    onChange={(e) => handleTierChange(tool.id, e.target.value)}
                    className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    {listingTiers.map(tier => (
                      <option key={tier} value={tier}>{tier}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(tool)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <button onClick={() => setDeleteConfirm(tool.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
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

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-sora font-bold text-lg text-navy dark:text-white">Delete Tool?</h3>
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

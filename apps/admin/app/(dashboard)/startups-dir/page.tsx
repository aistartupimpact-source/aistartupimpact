'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Search, Building2, MapPin, Star, StarOff,
  Edit3, Trash2, Crown, CheckCircle, Clock, Calendar, X,
  ShieldCheck, UserCheck, AlertCircle,
} from 'lucide-react';
import {
  getStartupsAction,
  deleteStartupAction,
  toggleFeaturedAction,
  fixNullImpactScoresAction,
  approveStartupAction,
  getFeaturedCampaignsAction,
  scheduleFeaturedCampaignAction,
  cancelFeaturedCampaignAction,
  toggleContentReviewedAction,
  bulkApproveStartupsAction,
  bulkArchiveStartupsAction,
  bulkDeleteStartupsAction,
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
  isApproved: boolean;
  contentReviewed: boolean;
  isVerified: boolean;
  claimStatus: string;
  approvedAt?: string;
  featuredUntil?: string;
  foundedYear?: number | null;
  employeeCount?: number | null;
  impactScore?: number | null;
  ownerId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function StartupsDirPage() {
  const router = useRouter();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteTyped, setDeleteTyped] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterReview, setFilterReview] = useState<'all' | 'reviewed' | 'under_review'>('all');
  const [filterClaim, setFilterClaim] = useState<'all' | 'UNCLAIMED' | 'PENDING' | 'CLAIMED'>('all');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [featureModal, setFeatureModal] = useState<Startup | null>(null);
  const [featureTier, setFeatureTier] = useState<'PREMIUM' | 'STANDARD' | 'BASIC'>('STANDARD');
  const [featureStart, setFeatureStart] = useState('');
  const [featureEnd, setFeatureEnd] = useState('');
  const [featureNotes, setFeatureNotes] = useState('');
  const [featurePrice, setFeaturePrice] = useState('');
  const [featureError, setFeatureError] = useState('');
  const [featureSubmitting, setFeatureSubmitting] = useState(false);

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
  ).filter(s => {
    if (filterReview === 'reviewed') return s.contentReviewed;
    if (filterReview === 'under_review') return !s.contentReviewed;
    return true;
  }).filter(s => {
    if (filterClaim !== 'all') return s.claimStatus === filterClaim;
    return true;
  });

  const featuredCount = startups.filter(s => s.isFeatured).length;
  const pendingCount = startups.filter(s => !s.isApproved).length;
  const underReviewCount = startups.filter(s => !s.contentReviewed).length;

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
      } else if (result.error) {
        setPermissionError(result.error);
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

  const openFeatureModal = (startup: Startup) => {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setFeatureModal(startup);
    setFeatureTier('STANDARD');
    setFeatureStart(today);
    setFeatureEnd(thirtyDaysLater);
    setFeatureNotes('');
    setFeaturePrice('');
    setFeatureError('');
  };

  const handleScheduleFeatured = async () => {
    if (!featureModal) return;
    setFeatureSubmitting(true);
    setFeatureError('');
    try {
      const result = await scheduleFeaturedCampaignAction({
        startupId: featureModal.id,
        tier: featureTier,
        startDate: featureStart,
        endDate: featureEnd,
        notes: featureNotes || undefined,
        pricePaid: featurePrice ? parseInt(featurePrice) : undefined,
      });
      if (result.success) {
        setFeatureModal(null);
        await loadStartups();
      } else {
        let errMsg = result.error || 'Failed to schedule';
        if ((result as any).nextAvailableDate) {
          errMsg += ` Next available: ${(result as any).nextAvailableDate}`;
        }
        setFeatureError(errMsg);
      }
    } catch (error) {
      setFeatureError('Unexpected error');
    } finally {
      setFeatureSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const result = await approveStartupAction(id);
      if (result.success) {
        await loadStartups();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error approving startup:', error);
    }
  };

  const handleToggleReview = async (id: string, current: boolean) => {
    try {
      const result = await toggleContentReviewedAction(id, current);
      if (result.success) {
        await loadStartups();
      }
    } catch (error) {
      console.error('Error toggling review:', error);
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
            Manage startup profiles • {featuredCount} featured • {pendingCount > 0 ? <span className="text-amber-500 font-semibold">{pendingCount} pending approval</span> : 'All approved'} • {underReviewCount > 0 ? <span className="text-orange-400 font-semibold">{underReviewCount} under review</span> : 'All reviewed'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/startups-dir/manage')} className="btn-outline text-xs flex items-center gap-1.5 px-3 py-2">
            Categories & Types
          </button>
          <button onClick={runImpactScoreFix} className="px-3 py-2 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
            Fix Null Scores
          </button>
          <button onClick={openCreate} className="btn-brand text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Startup
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search startups..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
        </div>
        {/* Review filter */}
        <select
          value={filterReview}
          onChange={(e) => setFilterReview(e.target.value as any)}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-jakarta text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="all">All Reviews</option>
          <option value="under_review">🟠 Under Review</option>
          <option value="reviewed">🟢 Reviewed</option>
        </select>
        {/* Claim filter */}
        <select
          value={filterClaim}
          onChange={(e) => setFilterClaim(e.target.value as any)}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-jakarta text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="all">All Claims</option>
          <option value="UNCLAIMED">🔵 Unclaimed</option>
          <option value="PENDING">🟡 Pending</option>
          <option value="CLAIMED">🟢 Claimed</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
              <th className="px-3 py-3 w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.size === filtered.length && filtered.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds(new Set(filtered.map((s: any) => s.id)));
                    else setSelectedIds(new Set());
                  }}
                  className="w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand"
                />
              </th>
              <th className="px-4 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Startup</th>
              <th className="px-4 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Stage</th>
              <th className="px-4 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Review</th>
              <th className="px-4 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden lg:table-cell">Claim</th>
              <th className="px-4 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden lg:table-cell">Verified</th>
              <th className="px-4 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Approval</th>
              <th className="px-4 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden xl:table-cell">Featured</th>
              <th className="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((startup) => (
              <tr key={startup.id} className="border-t border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(startup.id)}
                    onChange={(e) => {
                      const next = new Set(selectedIds);
                      if (e.target.checked) next.add(startup.id);
                      else next.delete(startup.id);
                      setSelectedIds(next);
                    }}
                    className="w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center overflow-hidden shrink-0">
                      {startup.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={startup.logoUrl} alt={startup.name} className="w-full h-full object-contain p-0.5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <Building2 className="w-3.5 h-3.5 text-brand" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-sora font-semibold text-xs text-navy dark:text-white">{startup.name}</h4>
                        {startup.isFeatured && <Crown className="w-3 h-3 text-yellow-500" />}
                      </div>
                      <p className="text-[10px] text-gray-400 font-jakarta line-clamp-1 max-w-[160px]">{startup.tagline}</p>
                    </div>
                  </div>
                </td>

                {/* Stage */}
                <td className="px-4 py-3 hidden md:table-cell whitespace-nowrap">
                  <span className="badge-category text-[9px] px-2 py-0.5">{startup.stage.replace(/_/g, ' ')}</span>
                </td>

                {/* Content Review — compact toggle */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleReview(startup.id, startup.contentReviewed)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide cursor-pointer transition-colors ${
                      startup.contentReviewed
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                    }`}
                    title={startup.contentReviewed ? 'Mark as Under Review' : 'Mark as Reviewed'}
                  >
                    {startup.contentReviewed
                      ? <><CheckCircle className="w-2.5 h-2.5" /> Reviewed</>
                      : <><Clock className="w-2.5 h-2.5" /> Under Review</>
                    }
                  </button>
                </td>

                {/* Claim Status */}
                <td className="px-4 py-3 hidden lg:table-cell whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    startup.claimStatus === 'CLAIMED'
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : startup.claimStatus === 'PENDING'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}>
                    {startup.claimStatus === 'CLAIMED' ? '●' : startup.claimStatus === 'PENDING' ? '◐' : '○'}
                    {' '}{startup.claimStatus || 'Unclaimed'}
                  </span>
                </td>

                {/* Verified */}
                <td className="px-4 py-3 hidden lg:table-cell whitespace-nowrap">
                  {startup.isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                      <ShieldCheck className="w-2.5 h-2.5" /> Verified
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-300 dark:text-gray-600">—</span>
                  )}
                </td>

                {/* Approval */}
                <td className="px-4 py-3 whitespace-nowrap">
                  {startup.isApproved ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                      <CheckCircle className="w-2.5 h-2.5" /> Approved
                    </span>
                  ) : startup.ownerId ? (
                    <span 
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400" 
                      title="Submitted by founder. Please approve from the Founder Management section."
                    >
                      <Clock className="w-2.5 h-2.5" /> Founder Submission
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApprove(startup.id)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-colors cursor-pointer"
                    >
                      <Clock className="w-2.5 h-2.5" /> Approve
                    </button>
                  )}
                </td>

                {/* Featured */}
                <td className="px-4 py-3 hidden xl:table-cell whitespace-nowrap">
                  <button
                    onClick={() => openFeatureModal(startup)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold cursor-pointer transition-colors ${
                      startup.isFeatured
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-yellow-50'
                    }`}
                  >
                    {startup.isFeatured
                      ? <><Star className="w-2.5 h-2.5 fill-current" /> Featured</>
                      : <><Calendar className="w-2.5 h-2.5" /> Schedule</>
                    }
                  </button>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
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
              <tr><td colSpan={9} className="px-6 py-12 text-center text-gray-400 font-jakarta text-sm">No startups found</td></tr>
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
            <p className="text-sm text-gray-500 font-jakarta mt-2">This action is permanent and cannot be undone.</p>
            <p className="text-xs text-gray-400 font-jakarta mt-3">Type <span className="font-bold text-red-500">DELETE</span> to confirm:</p>
            <input
              type="text"
              value={deleteTyped}
              onChange={(e) => setDeleteTyped(e.target.value)}
              placeholder="Type DELETE"
              className="w-full mt-2 px-4 py-2 text-center text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono tracking-widest"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setDeleteConfirm(null); setDeleteTyped(''); }} className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">Cancel</button>
              <button onClick={() => { handleDelete(deleteConfirm); setDeleteTyped(''); }} disabled={deleteTyped !== 'DELETE'} className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-opacity">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gray-900 dark:bg-gray-800 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-4 border border-gray-700">
          <span className="text-sm font-semibold font-jakarta">{selectedIds.size} selected</span>
          <div className="w-px h-6 bg-gray-700" />
          <button
            onClick={async () => {
              if (!confirm(`Approve ${selectedIds.size} startups?`)) return;
              await bulkApproveStartupsAction([...selectedIds]);
              setSelectedIds(new Set());
              await loadStartups();
            }}
            className="px-3 py-1.5 text-xs font-semibold bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            Approve All
          </button>
          <button
            onClick={async () => {
              if (!confirm(`Archive ${selectedIds.size} startups?`)) return;
              await bulkArchiveStartupsAction([...selectedIds]);
              setSelectedIds(new Set());
              await loadStartups();
            }}
            className="px-3 py-1.5 text-xs font-semibold bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
          >
            Archive All
          </button>
          <button
            onClick={async () => {
              if (!confirm(`Delete ${selectedIds.size} startups? Only Super Admins can do this.`)) return;
              const result = await bulkDeleteStartupsAction([...selectedIds]);
              if (!result.success) setPermissionError(result.error || 'Permission denied');
              else { setSelectedIds(new Set()); await loadStartups(); }
            }}
            className="px-3 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Delete All
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="p-1.5 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Permission Denied Modal */}
      {permissionError && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h3 className="font-sora font-bold text-lg text-navy dark:text-white">Permission Denied</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta mt-2 leading-relaxed">{permissionError}</p>
            <button
              onClick={() => setPermissionError(null)}
              className="mt-5 w-full px-4 py-2.5 text-sm font-medium bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Featured Campaign Scheduling Modal */}
      {featureModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-sora font-bold text-lg text-navy dark:text-white">Schedule Featured</h3>
                <p className="text-xs text-gray-500 font-jakarta mt-0.5">{featureModal.name}</p>
              </div>
              <button onClick={() => setFeatureModal(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Tier Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 font-jakarta mb-1.5">
                  Tier <span className="text-gray-400 font-normal">(UTC dates)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['PREMIUM', 'STANDARD', 'BASIC'] as const).map(tier => (
                    <button
                      key={tier}
                      onClick={() => setFeatureTier(tier)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold font-jakarta transition-all border ${
                        featureTier === tier
                          ? tier === 'PREMIUM'
                            ? 'bg-yellow-50 border-yellow-300 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-600 dark:text-yellow-300'
                            : tier === 'STANDARD'
                            ? 'bg-brand/10 border-brand/30 text-brand'
                            : 'bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
                          : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <div>{tier}</div>
                      <div className="text-[10px] font-normal mt-0.5 opacity-70">
                        {tier === 'PREMIUM' ? '1 slot' : tier === 'STANDARD' ? '4 slots' : '6 slots'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 font-jakarta mb-1.5">Start Date (UTC)</label>
                  <input
                    type="date"
                    value={featureStart}
                    onChange={e => setFeatureStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-jakarta text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 font-jakarta mb-1.5">End Date (UTC)</label>
                  <input
                    type="date"
                    value={featureEnd}
                    onChange={e => setFeatureEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-jakarta text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand focus:border-transparent"
                  />
                </div>
              </div>

              {/* Quick presets */}
              <div className="flex gap-2">
                {[7, 14, 30, 60].map(days => (
                  <button
                    key={days}
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      const end = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                      setFeatureStart(today);
                      setFeatureEnd(end);
                    }}
                    className="px-2.5 py-1 rounded-md text-[10px] font-semibold font-jakarta bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-brand/10 hover:text-brand transition-colors"
                  >
                    {days}d
                  </button>
                ))}
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 font-jakarta mb-1.5">Price Paid (INR)</label>
                  <input
                    type="number"
                    value={featurePrice}
                    onChange={e => setFeaturePrice(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-jakarta text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-brand focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 font-jakarta mb-1.5">Notes</label>
                  <input
                    type="text"
                    value={featureNotes}
                    onChange={e => setFeatureNotes(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-jakarta text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-brand focus:border-transparent"
                  />
                </div>
              </div>

              {/* Error */}
              {featureError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-xs text-red-700 dark:text-red-300 font-jakarta">{featureError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setFeatureModal(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleFeatured}
                  disabled={featureSubmitting || !featureStart || !featureEnd}
                  className="flex-1 px-4 py-2.5 text-sm font-bold bg-brand hover:bg-brand/90 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {featureSubmitting ? 'Scheduling...' : 'Schedule Campaign'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

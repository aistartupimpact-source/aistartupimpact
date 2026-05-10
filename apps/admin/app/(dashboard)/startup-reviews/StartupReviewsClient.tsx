"use client";

import { useState } from "react";
import { Star, CheckCircle, Clock, Flag, Trash2, ExternalLink, Image as ImageIcon, AlertCircle } from "lucide-react";
import { updateReviewStatusAction, deleteReviewAction, bulkUpdateReviewStatusAction, bulkDeleteReviewAction } from "./actions";

type ReviewData = any;

export default function StartupReviewsClient({ initialReviews }: { initialReviews: ReviewData[] }) {
  const [reviews, setReviews] = useState<ReviewData[]>(initialReviews);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleUpdateStatus = async (reviewId: string, status: 'PENDING' | 'APPROVED' | 'FLAGGED') => {
    setLoadingId(reviewId);
    try {
      const res = await updateReviewStatusAction(reviewId, status);
      if (res.success) {
        setReviews(reviews.map((r) => r.id === reviewId ? { ...r, status } : r));
      } else {
        alert(res.error || "Failed to update status");
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    setLoadingId(reviewId);
    try {
      const res = await deleteReviewAction(reviewId);
      if (res.success) {
        setReviews(reviews.filter((r) => r.id !== reviewId));
        setSelectedIds(prev => {
          const next = new Set(prev);
          next.delete(reviewId);
          return next;
        });
      } else {
        alert(res.error || "Failed to delete review");
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleBulkUpdateStatus = async (status: 'PENDING' | 'APPROVED' | 'FLAGGED') => {
    if (selectedIds.size === 0) return;
    setIsBulkLoading(true);
    try {
      const res = await bulkUpdateReviewStatusAction(Array.from(selectedIds), status);
      if (res.success) {
        setReviews(reviews.map(r => selectedIds.has(r.id) ? { ...r, status } : r));
        setSelectedIds(new Set());
      } else {
        alert(res.error || "Failed to bulk update");
      }
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to permanently delete ${selectedIds.size} reviews?`)) return;
    setIsBulkLoading(true);
    try {
      const res = await bulkDeleteReviewAction(Array.from(selectedIds));
      if (res.success) {
        setReviews(reviews.filter(r => !selectedIds.has(r.id)));
        setSelectedIds(new Set());
      } else {
        alert(res.error || "Failed to bulk delete");
      }
    } finally {
      setIsBulkLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === reviews.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(reviews.map(r => r.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (reviews.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
        <p className="text-gray-500">No startup reviews found in the system yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="bg-brand/10 border border-brand/20 p-3 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-brand ml-2">{selectedIds.size} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkUpdateStatus('APPROVED')}
              disabled={isBulkLoading}
              className="px-3 py-1.5 text-xs font-bold bg-green-50 text-green-600 border border-green-200 rounded-md hover:bg-green-100 disabled:opacity-50"
            >
              Approve All
            </button>
            <button
              onClick={() => handleBulkUpdateStatus('FLAGGED')}
              disabled={isBulkLoading}
              className="px-3 py-1.5 text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-md hover:bg-yellow-100 disabled:opacity-50"
            >
              Flag All
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isBulkLoading}
              className="px-3 py-1.5 text-xs font-bold bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-sora font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-4 w-12">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.size === reviews.length && reviews.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-brand focus:ring-brand cursor-pointer"
                  />
                </th>
                <th className="px-2 py-4">Startup</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Rating & Review</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 font-jakarta">
              {reviews.map((review: any) => (
                <tr key={review.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${selectedIds.has(review.id) ? 'bg-brand/5' : ''}`}>
                  
                  {/* Select Row */}
                  <td className="px-4 py-4 align-top">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(review.id)}
                      onChange={() => toggleSelectRow(review.id)}
                      className="rounded border-gray-300 text-brand focus:ring-brand mt-1 cursor-pointer"
                    />
                  </td>

                  {/* Linked Startup */}
                  <td className="px-2 py-4 align-top">
                    <a 
                      href={`http://localhost:3000/startups/${review.startup?.slug}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-bold text-brand flex items-center gap-1 hover:underline"
                    >
                      {review.startup?.name} <ExternalLink className="w-3 h-3" />
                    </a>
                    <div className="text-xs text-gray-400 mt-1">{new Date(review.createdAt).toLocaleDateString()}</div>
                  </td>

                  {/* Author Details */}
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-xs shrink-0">
                        {review.user?.avatar ? (
                          <img src={review.user.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          review.user?.name?.charAt(0) || 'A'
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-navy dark:text-white">{review.user?.name || 'Anonymous'}</div>
                        <div className="text-xs text-gray-500">{review.user?.email || 'N/A'}</div>
                      </div>
                    </div>
                  </td>

                  {/* Review Copy */}
                  <td className="px-6 py-4 align-top max-w-sm">
                    <div className="flex items-center gap-0.5 mb-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-700'}`} />
                      ))}
                    </div>
                    <h5 className="font-semibold text-navy dark:text-white mb-1.5 flex items-center gap-2">
                      {review.title}
                      {review.proofImageUrl && (
                        <a href={review.proofImageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[10px] text-blue-500 hover:underline shrink-0">
                          <ImageIcon className="w-3 h-3 mr-0.5" /> Proof
                        </a>
                      )}
                    </h5>
                    <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-3" title={review.body}>{review.body}</p>
                    
                    {review.helpfulCount > 0 && (
                      <div className="mt-2 text-[10px] text-brand/80 font-bold bg-brand/5 inline-block px-1.5 py-0.5 rounded">
                        +{review.helpfulCount} Helpful
                      </div>
                    )}
                  </td>

                  {/* Status Selection */}
                  <td className="px-6 py-4 align-top">
                    <select
                      value={review.status}
                      onChange={(e) => handleUpdateStatus(review.id, e.target.value as any)}
                      disabled={loadingId === review.id || isBulkLoading}
                      className={`text-xs font-bold px-2.5 py-1.5 rounded-full border outline-none bg-transparent cursor-pointer transition-colors ${
                        review.status === 'APPROVED' ? 'text-green-600 border-green-200 bg-green-50 focus:border-green-400' :
                        review.status === 'FLAGGED' ? 'text-red-500 border-red-200 bg-red-50 focus:border-red-400' :
                        'text-yellow-600 border-yellow-200 bg-yellow-50 focus:border-yellow-400'
                      }`}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="FLAGGED">FLAGGED</option>
                    </select>
                  </td>

                  {/* Destructive Action */}
                  <td className="px-4 py-4 align-top text-right">
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={loadingId === review.id || isBulkLoading}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
                      title="Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

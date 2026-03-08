'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus, Search, Filter, Edit3, Clock, CheckCircle, AlertCircle,
  Archive, Eye, Trash2, X, Send, MoreHorizontal, ArrowUp, ArrowDown,
} from 'lucide-react';

interface Article {
  id: string; title: string; slug: string; status: string; type: string;
  author: string; category: string; publishedAt: string | null; views: number;
}

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle }> = {
  DRAFT: { color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400', icon: Edit3 },
  IN_REVIEW: { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', icon: AlertCircle },
  SCHEDULED: { color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400', icon: Clock },
  PUBLISHED: { color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', icon: CheckCircle },
  ARCHIVED: { color: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400', icon: Archive },
};

const categories = ['AI News', 'Deep Dive', 'Founder Stories', 'Tools & Reviews', 'Funding', 'Opinion', 'Technology'];
const types = ['NEWS', 'STORY', 'GUIDE', 'COMPARISON', 'OPINION', 'REPORT', 'SPONSORED'];

const initialArticles: Article[] = [
  { id: '1', title: 'India\'s AI Revolution: How 50 Startups Are Reshaping the Nation', slug: 'india-ai-revolution-2025', status: 'PUBLISHED', type: 'NEWS', author: 'Priya Sharma', category: 'Deep Dive', publishedAt: 'Mar 7, 2025', views: 15420 },
  { id: '2', title: 'AI Tools Comparison Guide: Cursor vs GitHub Copilot vs Cody', slug: 'ai-tools-comparison-2025', status: 'IN_REVIEW', type: 'COMPARISON', author: 'Rahul Kumar', category: 'Tools & Reviews', publishedAt: null, views: 0 },
  { id: '3', title: 'The Rise of Edge AI: What Indian Startups Need to Know', slug: 'edge-ai-indian-startups', status: 'DRAFT', type: 'GUIDE', author: 'Anjali Nair', category: 'Technology', publishedAt: null, views: 0 },
  { id: '4', title: 'OpenAI GPT-5: Everything We Know So Far', slug: 'openai-gpt5-release', status: 'SCHEDULED', type: 'NEWS', author: 'Priya Sharma', category: 'AI News', publishedAt: 'Mar 9, 2025', views: 0 },
  { id: '5', title: 'Sarvam AI\'s $41M Series A: Building India-first LLMs', slug: 'sarvam-ai-series-a', status: 'PUBLISHED', type: 'NEWS', author: 'Priya Sharma', category: 'Funding', publishedAt: 'Mar 5, 2025', views: 9200 },
  { id: '6', title: 'How Krutrim is Challenging Big Tech with Indic AI', slug: 'krutrim-indic-ai-challenge', status: 'PUBLISHED', type: 'STORY', author: 'Rahul Kumar', category: 'Founder Stories', publishedAt: 'Mar 3, 2025', views: 7800 },
  { id: '7', title: 'Yellow.ai\'s Enterprise Conversational AI Stack Explained', slug: 'yellow-ai-conversational-stack', status: 'DRAFT', type: 'GUIDE', author: 'Anjali Nair', category: 'Deep Dive', publishedAt: null, views: 0 },
  { id: '8', title: 'The State of AI Regulation in India — 2025 Update', slug: 'ai-regulation-india-2025', status: 'ARCHIVED', type: 'REPORT', author: 'Priya Sharma', category: 'Opinion', publishedAt: 'Feb 15, 2025', views: 3210 },
];

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'views' | 'publishedAt' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Filter articles
  let filtered = articles.filter(a => {
    if (activeTab !== 'all' && a.status !== activeTab) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.author.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Sort
  if (sortField === 'views') filtered = [...filtered].sort((a, b) => sortDir === 'desc' ? b.views - a.views : a.views - b.views);

  // Tab counts
  const counts: Record<string, number> = { all: articles.length };
  articles.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });

  const statusTabs = [
    { label: 'All', value: 'all' }, { label: 'Draft', value: 'DRAFT' }, { label: 'In Review', value: 'IN_REVIEW' },
    { label: 'Published', value: 'PUBLISHED' }, { label: 'Scheduled', value: 'SCHEDULED' }, { label: 'Archived', value: 'ARCHIVED' },
  ];

  // Actions
  const changeStatus = (id: string, newStatus: string) => {
    setArticles(articles.map(a => a.id === id ? { ...a, status: newStatus, publishedAt: newStatus === 'PUBLISHED' ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : a.publishedAt } : a));
    setActionMenu(null);
  };

  const handleDelete = (id: string) => { setArticles(articles.filter(a => a.id !== id)); setDeleteConfirm(null); };



  const toggleSort = (field: 'views' | 'publishedAt') => {
    if (sortField === field) setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const duplicate = (article: Article) => {
    const dup: Article = { ...article, id: Date.now().toString(), title: article.title + ' (Copy)', slug: article.slug + '-copy', status: 'DRAFT', views: 0, publishedAt: null };
    setArticles([dup, ...articles]);
    setActionMenu(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Articles</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">Manage all editorial content across the platform.</p>
        </div>
        <Link href="/articles/new" className="btn-brand text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> New Article</Link>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto">
        {statusTabs.map((tab) => (
          <button key={tab.value} onClick={() => setActiveTab(tab.value)} className={`px-4 py-2 rounded-md text-sm font-jakarta font-medium whitespace-nowrap transition-all ${tab.value === activeTab ? 'bg-white dark:bg-gray-700 text-navy dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-navy dark:hover:text-white'}`}>
            {tab.label}<span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500">{counts[tab.value] || 0}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles by title or author..." className="input-field pl-10" />
        </div>
      </div>

      {/* Article Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Article</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Status</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden lg:table-cell">Category</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden sm:table-cell cursor-pointer select-none" onClick={() => toggleSort('views')}>
                <span className="flex items-center gap-1">Views {sortField === 'views' && (sortDir === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />)}</span>
              </th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Date</th>
              <th className="px-6 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400 font-jakarta">No articles found.</td></tr>
            )}
            {filtered.map((article) => {
              const config = statusConfig[article.status];
              const StatusIcon = config?.icon || Edit3;
              return (
                <tr key={article.id} className="border-t border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <Link href={`/articles/${article.id}`} className="group cursor-pointer block">
                    <h4 className="font-sora font-semibold text-sm text-navy dark:text-white group-hover:text-brand transition-colors line-clamp-1">{article.title}</h4>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-jakarta mt-0.5">by {article.author} · {article.type}</p>
                  </Link>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${config?.color}`}>
                      <StatusIcon className="w-3 h-3" />{article.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta">{article.category}</span>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta font-medium">{article.views > 0 ? article.views.toLocaleString() : '—'}</span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-sm text-gray-400 dark:text-gray-500 font-jakarta">{article.publishedAt || 'Not published'}</span>
                  </td>
                  <td className="px-6 py-4 relative">
                    <button onClick={() => setActionMenu(actionMenu === article.id ? null : article.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                    {actionMenu === article.id && (
                      <div className="absolute right-6 top-10 z-20 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1">
                        <Link href={`/articles/${article.id}`} className="w-full text-left px-4 py-2 text-sm font-jakarta text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"><Edit3 className="w-3.5 h-3.5" /> Edit Article</Link>
                        {article.status === 'DRAFT' && <button onClick={() => changeStatus(article.id, 'IN_REVIEW')} className="w-full text-left px-4 py-2 text-sm font-jakarta text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"><Send className="w-3.5 h-3.5" /> Submit for Review</button>}
                        {article.status === 'IN_REVIEW' && <button onClick={() => changeStatus(article.id, 'PUBLISHED')} className="w-full text-left px-4 py-2 text-sm font-jakarta text-green-600 dark:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5" /> Publish</button>}
                        {article.status === 'PUBLISHED' && <button onClick={() => changeStatus(article.id, 'ARCHIVED')} className="w-full text-left px-4 py-2 text-sm font-jakarta text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"><Archive className="w-3.5 h-3.5" /> Archive</button>}
                        {article.status === 'ARCHIVED' && <button onClick={() => changeStatus(article.id, 'DRAFT')} className="w-full text-left px-4 py-2 text-sm font-jakarta text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"><Edit3 className="w-3.5 h-3.5" /> Move to Draft</button>}
                        <button onClick={() => duplicate(article)} className="w-full text-left px-4 py-2 text-sm font-jakarta text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"><Eye className="w-3.5 h-3.5" /> Duplicate</button>
                        <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                        <button onClick={() => { setDeleteConfirm(article.id); setActionMenu(null); }} className="w-full text-left px-4 py-2 text-sm font-jakarta text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination info */}
      <div className="text-xs text-gray-400 font-jakarta text-center">Showing {filtered.length} of {articles.length} articles</div>

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-sora font-bold text-lg text-navy dark:text-white">Delete Article?</h3>
            <p className="text-sm text-gray-500 font-jakarta mt-1">This action cannot be undone. The article and all associated data will be permanently removed.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Close action menu on click outside */}
      {actionMenu && <div className="fixed inset-0 z-10" onClick={() => setActionMenu(null)} />}
    </div>
  );
}

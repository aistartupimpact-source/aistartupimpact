'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search as SearchIcon, Clock, Zap, Building2, IndianRupee, Newspaper, BookOpen, X, Loader2, Sparkles } from 'lucide-react';

const tabs = [
  { label: 'All', icon: SearchIcon },
  { label: 'Articles', icon: Newspaper },
  { label: 'Tools', icon: Zap },
  { label: 'Startups', icon: Building2 },
];

const typeIcons: Record<string, typeof Newspaper> = { 
  news: Newspaper, 
  story: BookOpen,
  tool: Zap, 
  startup: Building2,
};

interface SearchResult {
  id: string;
  type: 'news' | 'story' | 'tool' | 'startup';
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  logoUrl?: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('All');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch results when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const hasQuery = query.length > 0;

  const filtered = activeTab === 'All'
    ? results
    : results.filter(r => {
        if (activeTab === 'Articles') return r.type === 'news' || r.type === 'story';
        return r.type === activeTab.toLowerCase();
      });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-navy dark:text-white mb-6">Search</h1>

      {/* Search Input */}
      <div className="relative mb-6">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles, tools, startups..."
          className="input-field pl-12 pr-10 text-base"
          autoFocus
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand animate-spin" />
        )}
        {hasQuery && !loading && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`pill whitespace-nowrap text-xs shrink-0 flex items-center gap-1.5 ${activeTab === tab.label ? 'bg-brand text-white hover:bg-brand-600 hover:text-white' : ''}`}
          >
            <tab.icon className="w-3.5 h-3.5" />{tab.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {!hasQuery ? (
        <div className="text-center py-16 sm:py-20">
          <SearchIcon className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
          <h2 className="font-sora font-bold text-lg text-gray-400 dark:text-gray-500">Start typing to search</h2>
          <p className="text-sm text-gray-400 dark:text-gray-600 font-jakarta mt-1">Search across articles, tools, and startups</p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['GPT-5', 'Krutrim', 'AI Tools', 'Funding India', 'LLM'].map((t) => (
              <button key={t} onClick={() => setQuery(t)} className="pill text-xs">{t}</button>
            ))}
          </div>
        </div>
      ) : loading && results.length === 0 ? (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 text-brand animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Searching...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
            <SearchIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="font-sora font-bold text-lg text-gray-900 dark:text-white mb-1">No results found</h2>
          <p className="text-sm text-gray-500">Try different keywords or browse our categories</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-400 font-jakarta mb-4">{filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;</p>
          {filtered.map((r) => {
            const Icon = typeIcons[r.type] || Newspaper;
            const href = r.type === 'news' 
              ? `/news/${r.slug}` 
              : r.type === 'story'
              ? `/stories/${r.slug}`
              : r.type === 'tool'
              ? `/tools/${r.slug}`
              : `/startups/${r.slug}`;
            
            return (
              <Link key={r.id} href={href} className="group block">
                <div className="card p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
                    {r.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.logoUrl} alt="" className="w-8 h-8 object-contain" />
                    ) : (
                      <Icon className="w-5 h-5 text-brand" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{r.type}</span>
                      {r.category && <span className="badge-category text-[9px]">{r.category}</span>}
                    </div>
                    <h3 className="font-sora font-bold text-[15px] sm:text-base text-navy dark:text-white group-hover:text-brand transition-colors line-clamp-2">
                      {r.title}
                    </h3>
                    {r.excerpt && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta mt-1 line-clamp-2">
                        {r.excerpt}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, Loader2, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  type: 'news' | 'story' | 'tool' | 'startup';
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  logoUrl?: string;
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load recent searches from localStorage
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Debounced search
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

  const saveRecentSearch = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(query);
    onClose();
  };

  const handleTrendingClick = (term: string) => {
    setQuery(term);
    saveRecentSearch(term);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && query.trim()) {
      saveRecentSearch(query);
      router.push(`/search?q=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  const trendingTerms = ['GPT-5', 'AI Regulation India', 'LLM Fine-tuning', 'Cursor AI', 'Krutrim'];

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-950 w-full max-w-3xl mx-auto mt-20 sm:mt-32 rounded-2xl shadow-2xl overflow-hidden mx-4 sm:mx-auto">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search articles, tools, startups..."
            className="flex-1 text-base font-jakarta text-navy dark:text-white placeholder:text-gray-400 bg-transparent focus:outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 text-brand animate-spin" />}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Results / Suggestions */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim() && results.length > 0 ? (
            // Search Results
            <div className="p-2">
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={
                    result.type === 'news'
                      ? `/news/${result.slug}`
                      : result.type === 'story'
                      ? `/stories/${result.slug}`
                      : result.type === 'tool'
                      ? `/tools/${result.slug}`
                      : `/startups/${result.slug}`
                  }
                  onClick={() => handleResultClick(result)}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
                >
                  {/* Icon/Logo */}
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
                    {result.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={result.logoUrl} alt="" className="w-8 h-8 object-contain" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-brand" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                        {result.type}
                      </span>
                      {result.category && (
                        <>
                          <span className="text-gray-300 dark:text-gray-700">·</span>
                          <span className="text-[10px] text-gray-500">{result.category}</span>
                        </>
                      )}
                    </div>
                    <p className="font-sora font-semibold text-sm text-gray-900 dark:text-white group-hover:text-brand transition-colors line-clamp-1">
                      {result.title}
                    </p>
                    {result.excerpt && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                        {result.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : query.trim() && !loading ? (
            // No Results
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                No results found
              </p>
              <p className="text-xs text-gray-500">
                Try different keywords or browse our categories
              </p>
            </div>
          ) : (
            // Default State - Recent & Trending
            <div className="p-5 space-y-5">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold font-jakarta flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      Recent Searches
                    </p>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-gray-400 hover:text-brand transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((term, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTrendingClick(term)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-sm text-gray-700 dark:text-gray-300"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-3 font-jakarta flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Trending Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {trendingTerms.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleTrendingClick(term)}
                      className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-brand/10 dark:hover:bg-brand/20 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-brand transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-3 font-jakarta">
                  Quick Links
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/news"
                    onClick={onClose}
                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-brand dark:hover:border-brand transition-colors text-center"
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">News</p>
                    <p className="text-xs text-gray-500 mt-0.5">Latest articles</p>
                  </Link>
                  <Link
                    href="/tools"
                    onClick={onClose}
                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-brand dark:hover:border-brand transition-colors text-center"
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">AI Tools</p>
                    <p className="text-xs text-gray-500 mt-0.5">Browse directory</p>
                  </Link>
                  <Link
                    href="/startups"
                    onClick={onClose}
                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-brand dark:hover:border-brand transition-colors text-center"
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Startups</p>
                    <p className="text-xs text-gray-500 mt-0.5">Explore ecosystem</p>
                  </Link>
                  <Link
                    href="/funding"
                    onClick={onClose}
                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-brand dark:hover:border-brand transition-colors text-center"
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Funding</p>
                    <p className="text-xs text-gray-500 mt-0.5">Investment data</p>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <p className="text-xs text-gray-400 text-center font-jakarta">
            Press <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono text-[10px]">Enter</kbd> to search or <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono text-[10px]">Esc</kbd> to close
          </p>
        </div>
      </div>

      {/* Backdrop */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}

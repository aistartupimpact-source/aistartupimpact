'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search as SearchIcon, 
  Clock, 
  Zap, 
  Building2, 
  Newspaper, 
  BookOpen, 
  X, 
  Loader2, 
  TrendingUp,
  Filter,
  Star,
  DollarSign,
  Calendar
} from 'lucide-react';

const tabs = [
  { label: 'All', value: 'all', icon: SearchIcon },
  { label: 'Articles', value: 'articles', icon: Newspaper },
  { label: 'Tools', value: 'tools', icon: Zap },
  { label: 'Startups', value: 'startups', icon: Building2 },
];

const typeIcons: Record<string, typeof Newspaper> = { 
  article: Newspaper,
  news: Newspaper, 
  story: BookOpen,
  tool: Zap, 
  startup: Building2,
};

interface SearchResult {
  id: string;
  type: 'article' | 'news' | 'story' | 'tool' | 'startup';
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  logoUrl?: string;
  coverImage?: string;
  publishedAt?: string;
  readTimeMinutes?: number;
  pricingModel?: string;
  avgRating?: number;
  reviewCount?: number;
  stage?: string;
  rank?: number;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || 'all';
  
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState(initialType);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch popular searches on mount
  useEffect(() => {
    fetch('/api/search/popular?limit=8')
      .then(res => res.json())
      .then(data => {
        if (data.popular) {
          setPopularSearches(data.popular.map((p: any) => p.query));
        }
      })
      .catch(console.error);
  }, []);

  // Fetch suggestions as user types
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions(popularSearches);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (error) {
        console.error('Suggestions error:', error);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, popularSearches]);

  // Fetch search results
  const performSearch = useCallback(async (searchQuery: string, searchType: string, searchPage: number = 1) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        type: searchType,
        page: searchPage.toString(),
        limit: '20',
      });

      const response = await fetch(`/api/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setTotal(data.total || 0);
        setHasMore(data.hasMore || false);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query, activeTab, 1);
      setPage(1);
      
      // Update URL
      const params = new URLSearchParams();
      params.set('q', query);
      if (activeTab !== 'all') params.set('type', activeTab);
      router.replace(`/search?${params.toString()}`, { scroll: false });
    }, 400);

    return () => clearTimeout(timer);
  }, [query, activeTab, performSearch, router]);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
    if (query.trim()) {
      performSearch(query, tab, 1);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    performSearch(suggestion, activeTab, 1);
  };

  // Track result click
  const handleResultClick = async (result: SearchResult) => {
    try {
      await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          resultId: result.id,
          resultType: result.type,
        }),
      });
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  };

  // Load more results
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    performSearch(query, activeTab, nextPage);
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasQuery = query.length > 0;
  const hasResults = results.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-navy dark:text-white mb-6">
        Search
      </h1>

      {/* Search Input with Autocomplete */}
      <div className="relative mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search articles, tools, startups..."
            className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-navy dark:text-white placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors text-base"
          />
          {hasQuery && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                searchInputRef.current?.focus();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            </div>
          )}
        </div>

        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden"
          >
            <div className="p-2">
              {!hasQuery && (
                <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Popular Searches
                </div>
              )}
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 group"
                >
                  <SearchIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="text-sm text-navy dark:text-white">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Results Count */}
      {hasQuery && !loading && (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {hasResults ? (
            <>
              Found <span className="font-semibold text-navy dark:text-white">{total}</span> result
              {total !== 1 ? 's' : ''} for &quot;{query}&quot;
            </>
          ) : (
            <>No results found for &quot;{query}&quot;</>
          )}
        </div>
      )}

      {/* Results */}
      {hasResults && (
        <div className="space-y-4">
          {results.map((result) => {
            const Icon = typeIcons[result.type] || SearchIcon;
            const isArticle = result.type === 'article' || result.type === 'news' || result.type === 'story';
            const isTool = result.type === 'tool';
            const isStartup = result.type === 'startup';

            const href = isArticle
              ? `/news/${result.slug}`
              : isTool
              ? `/tools/${result.slug}`
              : `/startups/${result.slug}`;

            return (
              <Link
                key={result.id}
                href={href}
                onClick={() => handleResultClick(result)}
                className="block p-4 sm:p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-gray-800 transition-all hover:shadow-lg group"
              >
                <div className="flex gap-4">
                  {/* Logo/Image */}
                  {(result.logoUrl || result.coverImage) && (
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                        <Image
                          src={result.logoUrl || result.coverImage || ''}
                          alt={result.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Type Badge & Category */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium">
                        <Icon className="w-3.5 h-3.5" />
                        {result.type}
                      </span>
                      {result.category && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {result.category}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-sora font-bold text-lg text-navy dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {result.title}
                    </h3>

                    {/* Excerpt */}
                    {result.excerpt && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {result.excerpt}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                      {isArticle && result.readTimeMinutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {result.readTimeMinutes} min read
                        </span>
                      )}
                      {isArticle && result.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(result.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                      {isTool && result.avgRating && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          {result.avgRating.toFixed(1)} ({result.reviewCount} reviews)
                        </span>
                      )}
                      {isTool && result.pricingModel && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          {result.pricingModel}
                        </span>
                      )}
                      {isStartup && result.stage && (
                        <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium">
                          {result.stage}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Load More */}
      {hasMore && !loading && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            className="px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
          >
            Load More Results
          </button>
        </div>
      )}

      {/* Empty State */}
      {!hasQuery && !loading && (
        <div className="text-center py-12">
          <SearchIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="font-sora font-bold text-xl text-navy dark:text-white mb-2">
            Start Searching
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Search across thousands of articles, AI tools, and startups
          </p>
          {popularSearches.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Popular Searches:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {popularSearches.slice(0, 6).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Results State */}
      {hasQuery && !loading && !hasResults && (
        <div className="text-center py-12">
          <SearchIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="font-sora font-bold text-xl text-navy dark:text-white mb-2">
            No Results Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try different keywords or browse popular searches
          </p>
          {popularSearches.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {popularSearches.slice(0, 6).map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

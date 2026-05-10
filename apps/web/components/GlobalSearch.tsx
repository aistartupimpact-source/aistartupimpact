'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, TrendingUp, Loader2, Zap, Building2, Newspaper } from 'lucide-react';

interface QuickResult {
  id: string;
  type: string;
  title: string;
  slug: string;
  excerpt?: string;
  logoUrl?: string;
  coverImage?: string;
}

export default function GlobalSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<QuickResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut to open search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Fetch quick results and suggestions
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      // Fetch popular searches
      fetch('/api/search/suggestions?q=')
        .then(res => res.json())
        .then(data => setSuggestions(data.suggestions || []))
        .catch(() => setSuggestions([]));
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        // Fetch both results and suggestions in parallel
        const [resultsRes, suggestionsRes] = await Promise.all([
          fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`),
          fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`),
        ]);

        if (resultsRes.ok) {
          const data = await resultsRes.json();
          setResults(data.results || []);
        }

        if (suggestionsRes.ok) {
          const data = await suggestionsRes.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleResultClick(results[selectedIndex]);
      } else if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
        setIsOpen(false);
        setQuery('');
      }
    }
  };

  const handleResultClick = (result: QuickResult) => {
    const href = 
      result.type === 'article' || result.type === 'news' || result.type === 'story'
        ? `/news/${result.slug}`
        : result.type === 'tool'
        ? `/tools/${result.slug}`
        : `/startups/${result.slug}`;
    
    router.push(href);
    setIsOpen(false);
    setQuery('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    inputRef.current?.focus();
  };

  const handleViewAll = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'tool':
        return Zap;
      case 'startup':
        return Building2;
      default:
        return Newspaper;
    }
  };

  return (
    <>
      {/* Search Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm text-gray-600 dark:text-gray-400 w-full sm:w-64"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white dark:bg-gray-900 text-xs font-mono">
          <span>⌘</span>K
        </kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          {/* Search Panel */}
          <div
            ref={searchRef}
            className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Search Input */}
            <div className="relative border-b-2 border-gray-200 dark:border-gray-700">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search articles, tools, startups..."
                className="w-full pl-12 pr-12 py-4 bg-transparent text-navy dark:text-white placeholder-gray-400 focus:outline-none text-base"
                autoComplete="off"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {/* Quick Results */}
              {results.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                    Quick Results
                  </div>
                  {results.map((result, index) => {
                    const Icon = getResultIcon(result.type);
                    const isSelected = index === selectedIndex;
                    
                    return (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-900/30'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {(result.logoUrl || result.coverImage) ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0 relative">
                            <Image
                              src={result.logoUrl || result.coverImage || ''}
                              alt={result.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-navy dark:text-white truncate">
                            {result.title}
                          </div>
                          {result.excerpt && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {result.excerpt}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 capitalize flex-shrink-0">
                          {result.type}
                        </span>
                      </button>
                    );
                  })}
                  
                  {query.trim() && (
                    <button
                      onClick={handleViewAll}
                      className="w-full mt-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium text-center"
                    >
                      View all results for &quot;{query}&quot;
                    </button>
                  )}
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && results.length === 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    {query.length < 2 ? 'Popular Searches' : 'Suggestions'}
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-3"
                    >
                      <Search className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-navy dark:text-white">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* No Results */}
              {query.length >= 2 && !loading && results.length === 0 && (
                <div className="p-8 text-center">
                  <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No results found for &quot;{query}&quot;
                  </p>
                </div>
              )}

              {/* Empty State */}
              {query.length < 2 && suggestions.length === 0 && (
                <div className="p-8 text-center">
                  <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Start typing to search...
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono">esc</kbd>
                  Close
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

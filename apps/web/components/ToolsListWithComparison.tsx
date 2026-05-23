'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Star, Zap, ArrowRight, CheckSquare, Square, X, BarChart, Search, Grid3X3, List, ChevronDown } from 'lucide-react';
import BookmarkButton from './BookmarkButton';

interface ToolPick {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  categorySlug: string;
  rating: number;
  pricing: string;
  verdict: string;
  logoUrl?: string;
  hasApi?: boolean;
  hasMobileApp?: boolean;
  launchYear?: number;
  country?: string;
  founderNames?: string[];
}

type SortOption = 'rating' | 'name' | 'newest';
type ViewMode = 'grid' | 'list';

const ITEMS_PER_PAGE = 24;

export default function ToolsListWithComparison({ picks }: { picks: ToolPick[] }) {
  const [selectedTools, setSelectedTools] = useState<ToolPick[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPricing, setSelectedPricing] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Get unique categories with counts
  const categories = useMemo(() => {
    const catMap = new Map<string, { name: string; slug: string; count: number }>();
    picks.forEach(p => {
      const existing = catMap.get(p.categorySlug);
      if (existing) {
        existing.count++;
      } else {
        catMap.set(p.categorySlug, { name: p.category, slug: p.categorySlug, count: 1 });
      }
    });
    return Array.from(catMap.values()).sort((a, b) => b.count - a.count);
  }, [picks]);

  const pricingModels = useMemo(() => {
    return Array.from(new Set(picks.map(p => p.pricing))).sort();
  }, [picks]);

  // Filter and sort tools
  const filteredTools = useMemo(() => {
    let result = picks.filter(tool => {
      const matchesSearch = searchQuery === '' ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || tool.categorySlug === selectedCategory;
      const matchesPricing = selectedPricing === 'all' || tool.pricing === selectedPricing;

      return matchesSearch && matchesCategory && matchesPricing;
    });

    // Sort
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        result.sort((a, b) => (b.launchYear || 0) - (a.launchYear || 0));
        break;
    }

    return result;
  }, [picks, searchQuery, selectedCategory, selectedPricing, sortBy]);

  // Paginated tools
  const visibleTools = useMemo(() => {
    return filteredTools.slice(0, visibleCount);
  }, [filteredTools, visibleCount]);

  const hasMore = visibleCount < filteredTools.length;

  // Reset pagination when filters change
  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const toggleTool = (tool: ToolPick, e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedTools.find((t) => t.slug === tool.slug)) {
      setSelectedTools(selectedTools.filter((t) => t.slug !== tool.slug));
    } else {
      if (selectedTools.length < 3) {
        setSelectedTools([...selectedTools, tool]);
      } else {
        alert("You can only compare up to 3 tools at a time.");
      }
    }
  };

  const removeTool = (slug: string) => {
    setSelectedTools(selectedTools.filter((t) => t.slug !== slug));
    if (selectedTools.length <= 1) setShowComparison(false);
  };

  return (
    <div className="relative">
      {/* ── Sticky Category Pills ── */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold font-jakarta transition-all ${
              selectedCategory === 'all'
                ? 'bg-brand text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All ({picks.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.slug}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold font-jakarta transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-brand text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* ── Search + Filters + Sort + View Toggle ── */}
      <div className="mt-5 mb-6 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tools by name or description..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm font-jakarta"
          />
        </div>

        {/* Controls Row: Pricing Filter + Sort + View Toggle + Results Count */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Pricing Filter */}
            <select
              value={selectedPricing}
              onChange={(e) => { setSelectedPricing(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-jakarta text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
            >
              <option value="all">All Pricing</option>
              {pricingModels.map((pricing) => (
                <option key={pricing} value={pricing}>{pricing}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-jakarta text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
            >
              <option value="rating">Top Rated</option>
              <option value="newest">Newest First</option>
              <option value="name">A → Z</option>
            </select>

            {/* Clear Filters */}
            {(searchQuery || selectedCategory !== 'all' || selectedPricing !== 'all') && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedPricing('all'); setVisibleCount(ITEMS_PER_PAGE); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-brand hover:bg-brand/5 transition-colors font-jakarta"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Results Count */}
            <span className="text-xs text-gray-400 font-jakarta">
              {filteredTools.length} tools
            </span>

            {/* View Toggle */}
            <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand' : 'text-gray-400 hover:text-gray-600'}`}
                title="Grid view"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand' : 'text-gray-400 hover:text-gray-600'}`}
                title="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── GRID VIEW ── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {visibleTools.map((tool, i) => {
            const isSelected = !!selectedTools.find((t) => t.slug === tool.slug);
            const iconUrl = tool.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=random&color=fff&size=150`;

            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className={`group block rounded-2xl transition-all h-full ${isSelected ? 'ring-2 ring-brand ring-offset-2 dark:ring-offset-gray-950' : 'hover:shadow-lg hover:shadow-brand/5'}`}
              >
                <div className="card p-5 flex flex-col gap-3 relative h-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">

                  {/* Top Action Icons */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                    <BookmarkButton type="tool" itemId={tool.slug} itemName={tool.name} size="sm" />
                    <button
                      onClick={(e) => toggleTool(tool, e)}
                      className={`transition-colors ${isSelected ? 'text-brand' : 'text-gray-300 hover:text-brand'}`}
                      title="Select for comparison"
                    >
                      {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Logo & Title */}
                  <div className="flex items-start gap-3 pr-14">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={iconUrl} alt={tool.name} className="w-8 h-8 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-sora font-bold text-sm text-navy dark:text-white group-hover:text-brand transition-colors line-clamp-1">
                        {tool.name}
                      </h2>
                      <p className="text-[11px] text-gray-400 font-jakarta mt-0.5 line-clamp-1">
                        {tool.category}
                        {tool.launchYear && <span> · {tool.launchYear}</span>}
                      </p>
                    </div>
                  </div>

                  {/* Tagline */}
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-jakarta line-clamp-2 flex-1">
                    {tool.tagline}
                  </p>

                  {/* Footer: Rating + Pricing */}
                  <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{tool.rating}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      tool.pricing === 'Free' || tool.pricing === 'FREE'
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : tool.pricing === 'Freemium' || tool.pricing === 'FREEMIUM'
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      {tool.pricing}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {visibleTools.map((tool) => {
            const isSelected = !!selectedTools.find((t) => t.slug === tool.slug);
            const iconUrl = tool.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=random&color=fff&size=150`;

            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className={`group flex items-center gap-4 p-3 rounded-xl transition-all bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-brand/30 hover:shadow-sm ${isSelected ? 'ring-2 ring-brand' : ''}`}
              >
                {/* Logo */}
                <div className="w-9 h-9 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100 dark:border-gray-700/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={iconUrl} alt={tool.name} className="w-7 h-7 object-contain" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-sora font-bold text-sm text-navy dark:text-white group-hover:text-brand transition-colors truncate">
                      {tool.name}
                    </h2>
                    <span className="text-[10px] text-gray-400 font-jakarta shrink-0">{tool.category}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta truncate mt-0.5">
                    {tool.tagline}
                  </p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{tool.rating}</span>
                </div>

                {/* Pricing */}
                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  tool.pricing === 'Free' || tool.pricing === 'FREE'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : tool.pricing === 'Freemium' || tool.pricing === 'FREEMIUM'
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                  {tool.pricing}
                </span>

                {/* Compare checkbox */}
                <button
                  onClick={(e) => toggleTool(tool, e)}
                  className={`shrink-0 transition-colors ${isSelected ? 'text-brand' : 'text-gray-300 hover:text-brand'}`}
                  title="Select for comparison"
                >
                  {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                </button>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Load More / Pagination ── */}
      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold font-jakarta text-gray-700 dark:text-gray-300 hover:border-brand hover:text-brand transition-colors shadow-sm"
          >
            <ChevronDown className="w-4 h-4" />
            Show more tools ({filteredTools.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {/* No Results */}
      {filteredTools.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 font-jakarta text-base mb-2">No tools found matching your criteria.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedPricing('all'); }}
            className="text-sm text-brand font-semibold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* ── Comparison Footer Bar ── */}
      {selectedTools.length > 0 && !showComparison && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-navy text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 z-50 animate-fade-in-up border border-indigo-500/30">
          <div className="flex -space-x-2">
            <div className="font-sora font-bold text-sm mr-4 flex items-center gap-2"><BarChart className="w-4 h-4 text-brand" /> {selectedTools.length}/3 Selected</div>
          </div>
          <button
            onClick={() => setShowComparison(true)}
            disabled={selectedTools.length < 2}
            className="bg-brand text-white text-sm font-bold px-4 py-2 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 whitespace-nowrap"
          >
            {selectedTools.length < 2 ? 'Select one more' : 'Compare Now'}
          </button>
          <button onClick={() => setSelectedTools([])} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ── Comparison Modal ── */}
      {showComparison && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h2 className="font-sora font-extrabold text-xl sm:text-2xl flex items-center gap-2"><BarChart className="text-brand" /> Tool Comparison</h2>
              <button onClick={() => setShowComparison(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 sm:p-8 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 min-w-[600px] md:min-w-0">
                {/* Labels Column */}
                <div className="hidden md:flex flex-col gap-y-4 pt-[140px] text-sm font-jakarta font-bold text-gray-500 text-right pr-4 border-r border-gray-100 dark:border-gray-800">
                  <div className="h-10 flex items-center justify-end">Category</div>
                  <div className="h-10 flex items-center justify-end">Pricing</div>
                  <div className="h-10 flex items-center justify-end">Rating</div>
                  <div className="h-10 flex items-center justify-end">API Access</div>
                  <div className="h-10 flex items-center justify-end">Mobile App</div>
                  <div className="flex-1 flex items-start justify-end mt-2">Verdict</div>
                </div>

                {/* Tool Columns */}
                {selectedTools.map((t) => (
                  <div key={t.slug} className="flex flex-col gap-4 relative">
                    <button onClick={() => removeTool(t.slug)} className="absolute top-0 right-0 p-1.5 bg-gray-100 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10"><X className="w-3 h-3" /></button>
                    <div className="h-[120px] flex flex-col justify-end pb-4 border-b border-gray-100 dark:border-gray-800">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden mb-3 border border-gray-100 dark:border-gray-700/50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={t.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=random&color=fff&size=150`} alt={t.name} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="font-sora font-extrabold text-lg leading-tight">{t.name}</h3>
                    </div>
                    <div className="h-10 flex items-center font-jakarta text-sm">{t.category}</div>
                    <div className="h-10 flex items-center font-jakarta text-sm">
                      <span className="font-mono bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 text-center rounded">{t.pricing}</span>
                    </div>
                    <div className="h-10 flex items-center font-jakarta text-sm">
                      <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> {t.rating}</div>
                    </div>
                    <div className="h-10 flex items-center font-jakarta text-sm">
                      <span className={t.hasApi ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>{t.hasApi ? '✓ Yes' : '✗ No'}</span>
                    </div>
                    <div className="h-10 flex items-center font-jakarta text-sm">
                      <span className={t.hasMobileApp ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}>{t.hasMobileApp ? '✓ Yes' : '✗ No'}</span>
                    </div>
                    <div className="flex-1 font-jakarta text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-2 pt-4 border-t border-gray-100 dark:border-gray-800 border-dashed">
                      {t.verdict}
                    </div>
                    <Link href={`/tools/${t.slug}`} className="mt-4 w-full bg-gray-900 hover:bg-brand text-white py-2 rounded-lg text-center font-bold font-jakarta transition-colors text-sm">
                      Full Review
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

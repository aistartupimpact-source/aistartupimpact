'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Star, Zap, ArrowRight, CheckSquare, Square, X, BarChart, Search, Grid3X3, List, Loader2, SlidersHorizontal, ChevronDown, ChevronRight } from 'lucide-react';
import BookmarkButton from './BookmarkButton';
import UpvoteButton from './tools/UpvoteButton';

interface ToolPick {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  categorySlug: string;
  parentCategory?: string | null;
  parentCategorySlug?: string | null;
  rating: number;
  pricing: string;
  verdict: string;
  logoUrl?: string;
  hasApi?: boolean;
  hasMobileApp?: boolean;
  freeTrialDays?: number | null;
  upvoteCount?: number;
  launchYear?: number;
  country?: string;
  founderNames?: string[];
}

interface TagItem {
  id: string;
  name: string;
  slug: string;
  emoji: string | null;
  groupId: string;
  sortOrder: number;
  tagCount: number;
}

interface TagGroupItem {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  sortOrder: number;
  displayMode: string;
  maxVisibleDefault: number;
  tags: TagItem[];
}

interface ToolsListProps {
  picks: ToolPick[];
  tagGroups?: TagGroupItem[];
  toolTagMap?: Record<string, string[]>;
  initialTagId?: string | null;
}

type SortOption = 'rating' | 'upvotes' | 'name' | 'newest';
type ViewMode = 'grid' | 'list';

const ITEMS_PER_PAGE = 24;

// Primary filter groups shown expanded by default (sortOrder 1-4)
const PRIMARY_GROUP_SLUGS = ['pricing-access', 'platform-access', 'target-user', 'ai-model-technology'];

export default function ToolsListWithComparison({ picks, tagGroups = [], toolTagMap = {}, initialTagId }: ToolsListProps) {
  const [selectedTools, setSelectedTools] = useState<ToolPick[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [selectedPricing, setSelectedPricing] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialTagId ? [initialTagId] : []);
  const [freeTrialOnly, setFreeTrialOnly] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(!!initialTagId);
  const [expandedFilterGroups, setExpandedFilterGroups] = useState<Set<string>>(
    new Set(PRIMARY_GROUP_SLUGS)
  );
  const [showAllInGroup, setShowAllInGroup] = useState<Set<string>>(new Set());

  // Get parent categories with counts
  const parentCategories = useMemo(() => {
    const catMap = new Map<string, { name: string; slug: string; count: number }>();
    picks.forEach(p => {
      const slug = p.parentCategorySlug || p.categorySlug;
      const name = p.parentCategory || p.category;
      const existing = catMap.get(slug);
      if (existing) {
        existing.count++;
      } else {
        catMap.set(slug, { name, slug, count: 1 });
      }
    });
    return Array.from(catMap.values()).sort((a, b) => b.count - a.count);
  }, [picks]);

  // Get subcategories for selected parent
  const subcategories = useMemo(() => {
    if (selectedCategory === 'all') return [];
    const subMap = new Map<string, { name: string; slug: string; count: number }>();
    picks.forEach(p => {
      const parentSlug = p.parentCategorySlug || p.categorySlug;
      if (parentSlug === selectedCategory) {
        const existing = subMap.get(p.categorySlug);
        if (existing) existing.count++;
        else subMap.set(p.categorySlug, { name: p.category, slug: p.categorySlug, count: 1 });
      }
    });
    return Array.from(subMap.values()).sort((a, b) => b.count - a.count);
  }, [picks, selectedCategory]);

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

      const matchesCategory = selectedCategory === 'all' || 
        (tool.parentCategorySlug || tool.categorySlug) === selectedCategory;
      const matchesSubcategory = selectedSubcategory === 'all' || tool.categorySlug === selectedSubcategory;
      const matchesPricing = selectedPricing === 'all' || tool.pricing === selectedPricing;

      // Free Trial filter
      const matchesTrial = !freeTrialOnly || (tool.freeTrialDays && tool.freeTrialDays > 0);

      // Tag filtering: within a group → OR, across groups → AND
      let matchesTags = true;
      if (selectedTagIds.length > 0) {
        const toolTags = new Set(toolTagMap[tool.id] || []);
        // Group selected tags by their group
        const selectedByGroup = new Map<string, string[]>();
        for (const tagId of selectedTagIds) {
          // Find which group this tag belongs to
          for (const group of tagGroups) {
            const tag = group.tags.find((t: TagItem) => t.id === tagId);
            if (tag) {
              if (!selectedByGroup.has(group.id)) selectedByGroup.set(group.id, []);
              selectedByGroup.get(group.id)!.push(tagId);
              break;
            }
          }
        }
        // AND across groups: tool must match at least one tag from each group
        for (const [, groupTagIds] of selectedByGroup) {
          const hasAny = groupTagIds.some(tid => toolTags.has(tid));
          if (!hasAny) {
            matchesTags = false;
            break;
          }
        }
      }

      return matchesSearch && matchesCategory && matchesSubcategory && matchesPricing && matchesTrial && matchesTags;
    });

    // Sort
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'upvotes':
        result.sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        result.sort((a, b) => (b.launchYear || 0) - (a.launchYear || 0));
        break;
    }

    return result;
  }, [picks, searchQuery, selectedCategory, selectedSubcategory, selectedPricing, sortBy, selectedTagIds, freeTrialOnly, toolTagMap, tagGroups]);

  // Paginated tools
  const visibleTools = useMemo(() => {
    return filteredTools.slice(0, visibleCount);
  }, [filteredTools, visibleCount]);

  const hasMore = visibleCount < filteredTools.length;

  // Reset pagination when filters change
  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    setSelectedSubcategory('all'); // Reset subcategory when parent changes
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleSubcategoryChange = (slug: string) => {
    setSelectedSubcategory(slug);
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
      {/* ── Sticky Category Pills (Parent Categories) ── */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-2.5 sm:py-3 border-b border-gray-100 dark:border-gray-800">
        {/* Parent category pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`shrink-0 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold font-jakarta transition-all ${
              selectedCategory === 'all'
                ? 'bg-brand text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All ({picks.length})
          </button>
          {parentCategories.map(cat => (
            <button
              key={cat.slug}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`shrink-0 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold font-jakarta transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-brand text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>

        {/* Subcategory pills (shown when a parent is selected) */}
        {selectedCategory !== 'all' && subcategories.length > 1 && (
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => handleSubcategoryChange('all')}
              className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold font-jakarta transition-all ${
                selectedSubcategory === 'all'
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              All in {parentCategories.find(c => c.slug === selectedCategory)?.name || 'category'}
            </button>
            {subcategories.map(sub => (
              <button
                key={sub.slug}
                onClick={() => handleSubcategoryChange(sub.slug)}
                className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold font-jakarta transition-all ${
                  selectedSubcategory === sub.slug
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {sub.name} ({sub.count})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Search + Filters + Sort + View Toggle ── */}
      <div className="mt-4 sm:mt-5 mb-4 sm:mb-6 space-y-2.5 sm:space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 sm:pl-11 pr-4 py-2 sm:py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm font-jakarta"
          />
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Pricing Filter */}
            <select
              value={selectedPricing}
              onChange={(e) => { setSelectedPricing(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-jakarta text-[11px] sm:text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
            >
              <option value="all">All Pricing</option>
              {pricingModels.map((pricing) => (
                <option key={pricing} value={pricing}>{pricing}</option>
              ))}
            </select>

            {/* Free Trial Toggle */}
            <button
              onClick={() => { setFreeTrialOnly(!freeTrialOnly); setVisibleCount(ITEMS_PER_PAGE); }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg border text-[11px] sm:text-xs font-semibold font-jakarta transition-all ${
                freeTrialOnly
                  ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-400'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-teal-300'
              }`}
            >
              Free Trial
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-jakarta text-[11px] sm:text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
            >
              <option value="rating">Top Rated</option>
              <option value="upvotes">Most Upvoted</option>
              <option value="newest">Newest First</option>
              <option value="name">A → Z</option>
            </select>

            {/* Clear Filters */}
            {(searchQuery || selectedCategory !== 'all' || selectedPricing !== 'all' || selectedTagIds.length > 0 || freeTrialOnly) && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedSubcategory('all'); setSelectedPricing('all'); setSelectedTagIds([]); setFreeTrialOnly(false); setVisibleCount(ITEMS_PER_PAGE); }}
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

      {/* ── TAG FILTERS ── */}
      {tagGroups.length > 0 && (
        <div className="mb-4 sm:mb-6">
          {/* Active tag filters */}
          {selectedTagIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              <span className="text-xs text-gray-500 font-jakarta mr-1">Filters ({selectedTagIds.length}):</span>
              {selectedTagIds.map(tagId => {
                const tag = tagGroups.flatMap(g => g.tags).find((t: TagItem) => t.id === tagId);
                if (!tag) return null;
                return (
                  <button
                    key={tagId}
                    onClick={() => { setSelectedTagIds(prev => prev.filter(id => id !== tagId)); setVisibleCount(ITEMS_PER_PAGE); }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand/10 border border-brand/20 text-brand rounded-full text-[11px] font-jakarta font-semibold hover:bg-brand/20 transition-colors"
                  >
                    {tag.name}
                    <X className="w-3 h-3" />
                  </button>
                );
              })}
              <button
                onClick={() => { setSelectedTagIds([]); setVisibleCount(ITEMS_PER_PAGE); }}
                className="text-[11px] text-red-500 hover:text-red-600 font-semibold font-jakarta ml-1"
              >
                Clear tags
              </button>
            </div>
          )}

          {/* Filter toggle button */}
          <button
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-jakarta border transition-all ${
              showMoreFilters || selectedTagIds.length > 0
                ? 'bg-brand/5 border-brand/20 text-brand'
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand/30'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            All Filters ({tagGroups.length} groups)
            {selectedTagIds.length > 0 && (
              <span className="bg-brand text-white text-[10px] px-1.5 py-0.5 rounded-full ml-0.5">{selectedTagIds.length}</span>
            )}
            <ChevronDown className={`w-3 h-3 transition-transform ${showMoreFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Expanded filter panel */}
          {showMoreFilters && (
            <div className="mt-3 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl space-y-3 max-h-[400px] overflow-y-auto">
              {tagGroups.map(group => {
                const isExpanded = expandedFilterGroups.has(group.slug);
                const activeTags = group.tags.filter((t: TagItem) => t.tagCount > 0 || selectedTagIds.includes(t.id));
                const visibleTags = showAllInGroup.has(group.id)
                  ? activeTags
                  : activeTags.slice(0, group.maxVisibleDefault);
                const hasMore = activeTags.length > group.maxVisibleDefault;
                const selectedInGroup = group.tags.filter((t: TagItem) => selectedTagIds.includes(t.id)).length;

                return (
                  <div key={group.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 pb-3 last:pb-0">
                    <button
                      onClick={() => {
                        setExpandedFilterGroups(prev => {
                          const next = new Set(prev);
                          if (next.has(group.slug)) next.delete(group.slug);
                          else next.add(group.slug);
                          return next;
                        });
                      }}
                      className="w-full flex items-center justify-between py-1"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />}
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 font-jakarta">{group.name}</span>
                      </div>
                      {selectedInGroup > 0 && (
                        <span className="text-[10px] font-bold bg-brand/10 text-brand px-1.5 py-0.5 rounded-full">{selectedInGroup}</span>
                      )}
                    </button>
                    {isExpanded && (
                      <div className="flex flex-wrap gap-1.5 mt-2 pl-5">
                        {visibleTags.map((tag: TagItem) => {
                          const isSelected = selectedTagIds.includes(tag.id);
                          return (
                            <button
                              key={tag.id}
                              onClick={() => {
                                setSelectedTagIds(prev =>
                                  isSelected ? prev.filter(id => id !== tag.id) : [...prev, tag.id]
                                );
                                setVisibleCount(ITEMS_PER_PAGE);
                              }}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-jakarta transition-all border ${
                                isSelected
                                  ? 'bg-brand/10 border-brand/30 text-brand font-semibold'
                                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand/30 hover:text-brand'
                              }`}
                            >
                              {tag.name}
                              {tag.tagCount > 0 && <span className="text-[9px] text-gray-400 ml-0.5">({tag.tagCount})</span>}
                            </button>
                          );
                        })}
                        {hasMore && (
                          <button
                            onClick={() => setShowAllInGroup(prev => {
                              const next = new Set(prev);
                              if (next.has(group.id)) next.delete(group.id);
                              else next.add(group.id);
                              return next;
                            })}
                            className="text-[11px] font-jakarta font-semibold text-brand hover:underline px-2 py-1"
                          >
                            {showAllInGroup.has(group.id) ? 'Show less' : `Show all ${activeTags.length}`}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── GRID VIEW ── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {visibleTools.map((tool, i) => {
            const isSelected = !!selectedTools.find((t) => t.slug === tool.slug);
            const iconUrl = tool.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=random&color=fff&size=150`;
            // Get top 2 tag names for this tool
            const toolTagIds = toolTagMap[tool.id] || [];
            const toolTagNames = toolTagIds.slice(0, 2).map(tid => {
              for (const g of tagGroups) {
                const found = g.tags.find((t: any) => t.id === tid);
                if (found) return found.name;
              }
              return null;
            }).filter(Boolean);

            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className={`group block rounded-2xl transition-all h-full ${isSelected ? 'ring-2 ring-brand ring-offset-2 dark:ring-offset-gray-950' : 'hover:shadow-lg hover:shadow-brand/5'}`}
              >
                <div className="card p-4 sm:p-5 flex flex-col gap-2 sm:gap-2.5 relative h-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">

                  {/* Top Actions */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                    <BookmarkButton type="tool" itemId={tool.slug} itemName={tool.name} size="sm" />
                    <button
                      onClick={(e) => toggleTool(tool, e)}
                      className={`flex items-center gap-0.5 text-[10px] font-jakarta transition-colors ${isSelected ? 'text-brand font-semibold' : 'text-gray-300 hover:text-brand'}`}
                      title="Compare"
                    >
                      {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">Compare</span>
                    </button>
                  </div>

                  {/* Logo & Title */}
                  <div className="flex items-start gap-2.5 pr-20">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={iconUrl} alt={tool.name} className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-sora font-bold text-sm text-navy dark:text-white group-hover:text-brand transition-colors line-clamp-1">
                        {tool.name}
                      </h2>
                      <p className="text-[11px] text-gray-400 font-jakarta mt-0.5 line-clamp-1">
                        {tool.parentCategory || tool.category}
                      </p>
                    </div>
                  </div>

                  {/* Tagline */}
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-jakarta line-clamp-2 flex-1">
                    {tool.tagline}
                  </p>

                  {/* Tag Pills (max 2) + Badges */}
                  <div className="flex flex-wrap items-center gap-1">
                    {toolTagNames.map((name, idx) => (
                      <span key={idx} className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-jakarta">
                        {name}
                      </span>
                    ))}
                    {tool.freeTrialDays && tool.freeTrialDays > 0 && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400">Trial</span>
                    )}
                  </div>

                  {/* Footer: Rating + Upvote + Pricing */}
                  <div className="mt-auto pt-2.5 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{tool.rating}</span>
                      </div>
                      <UpvoteButton toolSlug={tool.slug} size="sm" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      tool.pricing === 'FREE' || tool.pricing === 'Free'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : tool.pricing === 'FREEMIUM' || tool.pricing === 'Freemium'
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                        : tool.pricing === 'OPEN_SOURCE' || tool.pricing === 'Open Source'
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                        : tool.pricing === 'ENTERPRISE' || tool.pricing === 'Enterprise'
                        ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      {tool.pricing === 'OPEN_SOURCE' ? 'Open Source' : tool.pricing}
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

                {/* Upvote */}
                <UpvoteButton toolSlug={tool.slug} size="sm" />

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

      {/* ── Infinite Scroll ── */}
      {filteredTools.length > 0 && hasMore && (
        <ToolsInfiniteScrollTrigger onIntersect={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)} />
      )}

      {/* No Results */}
      {filteredTools.length === 0 && (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm mb-1">No tools match these filters.</p>
          <p className="text-gray-400 dark:text-gray-500 font-jakarta text-xs mb-4">Try broadening your search or removing some filters.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedSubcategory('all'); setSelectedPricing('all'); setSelectedTagIds([]); setFreeTrialOnly(false); }}
            className="px-4 py-2 text-sm font-semibold text-brand bg-brand/5 hover:bg-brand/10 rounded-lg transition-colors"
          >
            Clear All Filters
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

function ToolsInfiniteScrollTrigger({ onIntersect }: { onIntersect: () => void }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onIntersectRef = useRef(onIntersect);
  onIntersectRef.current = onIntersect;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onIntersectRef.current();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sentinelRef} className="flex items-center justify-center py-6">
      <Loader2 className="w-5 h-5 text-brand animate-spin" />
    </div>
  );
}

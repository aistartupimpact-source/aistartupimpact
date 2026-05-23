'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Search, Building2, TrendingUp, MapPin, X, Loader2, ChevronDown } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { VerifiedBadge } from './VerifiedBadge';

interface Startup {
  id: string; name: string; slug: string; tagline: string;
  logoUrl?: string; stage: string; headquartersCity?: string;
  isFeatured: boolean; totalUsd: number; isVerified?: boolean;
  employeeCount?: number; foundedYear?: number; category?: string;
  businessType?: string; founders?: string[] | string;
}

const STAGES = [
  { value: '', label: 'All Stages' },
  { value: 'IDEA', label: 'Idea' },
  { value: 'PRE_SEED', label: 'Pre-Seed' },
  { value: 'SEED', label: 'Seed' },
  { value: 'SERIES_A', label: 'Series A' },
  { value: 'SERIES_B', label: 'Series B' },
  { value: 'SERIES_C', label: 'Series C' },
  { value: 'GROWTH', label: 'Growth' },
  { value: 'PUBLIC', label: 'Public' },
];

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'FinTech', label: 'FinTech' },
  { value: 'HealthTech', label: 'HealthTech' },
  { value: 'EdTech', label: 'EdTech' },
  { value: 'E-commerce', label: 'E-commerce' },
  { value: 'SaaS', label: 'SaaS' },
  { value: 'AI/ML', label: 'AI/ML' },
  { value: 'Enterprise Software', label: 'Enterprise' },
  { value: 'Consumer Tech', label: 'Consumer' },
  { value: 'DeepTech', label: 'DeepTech' },
  { value: 'CleanTech', label: 'CleanTech' },
  { value: 'AgriTech', label: 'AgriTech' },
  { value: 'LogisticsTech', label: 'Logistics' },
  { value: 'HRTech', label: 'HRTech' },
  { value: 'MarTech', label: 'MarTech' },
  { value: 'PropTech', label: 'PropTech' },
  { value: 'FoodTech', label: 'FoodTech' },
  { value: 'Mobility', label: 'Mobility' },
  { value: 'Gaming', label: 'Gaming' },
  { value: 'Media & Entertainment', label: 'Media' },
  { value: 'Other', label: 'Other' },
];

const BUSINESS_TYPES = [
  { value: '', label: 'All Models' },
  { value: 'B2B', label: 'B2B' },
  { value: 'B2C', label: 'B2C' },
  { value: 'B2B2C', label: 'B2B2C' },
  { value: 'B2G', label: 'B2G' },
  { value: 'D2C', label: 'D2C' },
  { value: 'Marketplace', label: 'Marketplace' },
  { value: 'Platform', label: 'Platform' },
];

const ITEMS_PER_PAGE = 24;

function formatUsd(usd: number) {
  if (!usd || usd === 0) return null;
  if (usd >= 1e9) return `$${(usd / 1e9).toFixed(1)}B`;
  if (usd >= 1e6) return `$${(usd / 1e6).toFixed(0)}M`;
  return `$${(usd / 1e3).toFixed(0)}K`;
}

function stageLabel(s: string) {
  return STAGES.find(x => x.value === s)?.label || s?.replace(/_/g, ' ') || '';
}

interface Props {
  initialStartups: Startup[];
  initialTotal: number;
}

export default function StartupSearch({ initialStartups, initialTotal }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [stage, setStage] = useState(searchParams.get('stage') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [businessType, setBusinessType] = useState(searchParams.get('businessType') || '');
  const [startups, setStartups] = useState<Startup[]>(initialStartups);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const hasUserInteracted = useRef(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  const fetchStartups = useCallback(async (q: string, s: string, c: string, bt: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (s) params.set('stage', s);
      if (c) params.set('category', c);
      if (bt) params.set('businessType', bt);
      params.set('limit', '500'); // Fetch all matching for client-side pagination
      const res = await fetch(`/api/startups/search?${params}`);
      const data = await res.json();
      setStartups(data.startups || []);
      setTotal(data.total || 0);
      setVisibleCount(ITEMS_PER_PAGE);
    } catch {
      // keep existing results
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (!hasUserInteracted.current) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchStartups(query, stage, category, businessType);
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (stage) params.set('stage', stage);
      if (category) params.set('category', category);
      if (businessType) params.set('businessType', businessType);
      const newUrl = params.toString() ? `${pathname}?${params}` : pathname;
      router.replace(newUrl, { scroll: false });
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, stage, category, businessType, fetchStartups, pathname, router]);

  const handleCategoryChange = (value: string) => {
    hasUserInteracted.current = true;
    setCategory(value);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const clearSearch = () => {
    hasUserInteracted.current = true;
    setQuery(''); setStage(''); setCategory(''); setBusinessType('');
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const visibleStartups = startups.slice(0, visibleCount);
  const hasMore = visibleCount < startups.length;

  return (
    <div className="space-y-5">
      {/* ── Sticky Category Pills ── */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-2.5 sm:py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => handleCategoryChange('')}
            className={`shrink-0 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold font-jakarta transition-all ${
              category === ''
                ? 'bg-brand text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          {CATEGORIES.filter(c => c.value !== '').map(cat => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`shrink-0 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold font-jakarta transition-all ${
                category === cat.value
                  ? 'bg-brand text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Search + Filters Row ── */}
      <div className="space-y-2.5 sm:space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => { hasUserInteracted.current = true; setQuery(e.target.value); }}
            placeholder="Search startups..."
            className="w-full pl-9 sm:pl-11 pr-9 sm:pr-10 py-2 sm:py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm font-jakarta"
          />
          {query && (
            <button onClick={() => { hasUserInteracted.current = true; setQuery(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Stage Filter */}
            <select
              value={stage}
              onChange={e => { hasUserInteracted.current = true; setStage(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-jakarta text-[11px] sm:text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
            >
              {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            {/* Business Type Filter */}
            <select
              value={businessType}
              onChange={e => { hasUserInteracted.current = true; setBusinessType(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-jakarta text-[11px] sm:text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
            >
              {BUSINESS_TYPES.map(bt => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
            </select>

            {/* Clear Filters */}
            {(query || stage || category || businessType) && (
              <button onClick={clearSearch} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-brand hover:bg-brand/5 transition-colors font-jakarta">
                Clear all
              </button>
            )}
          </div>

          {/* Results Count */}
          <span className="text-xs text-gray-400 font-jakarta">
            {loading ? (
              <span className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Searching...</span>
            ) : (
              <span><span className="font-bold text-navy dark:text-white">{total}</span> startups</span>
            )}
          </span>
        </div>
      </div>

      {/* ── Grid ── */}
      {startups.length === 0 && !loading ? (
        <div className="text-center py-16">
          <Building2 className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 font-jakarta text-sm mb-2">No startups found matching your criteria.</p>
          <button onClick={clearSearch} className="text-sm text-brand font-semibold hover:underline">Clear all filters</button>
        </div>
      ) : loading && startups.length === 0 ? (
        <div className="text-center py-16">
          <Loader2 className="w-12 h-12 text-brand mx-auto mb-3 animate-spin" />
          <p className="text-gray-500 font-jakarta text-sm">Loading startups...</p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 transition-opacity duration-200 ${loading ? 'opacity-50' : 'opacity-100'}`}>
          {visibleStartups.map(s => (
            <Link key={s.slug} href={`/startups/${s.slug}`} className="group">
              <div className="relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-5 hover:shadow-xl hover:border-brand/30 dark:hover:border-brand/30 transition-all duration-300 h-full">
                {/* Header Section */}
                <div className="flex items-start gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                  {/* Logo */}
                  <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center shrink-0 shadow-sm">
                    {s.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.logoUrl} alt={s.name} className="w-8 h-8 sm:w-11 sm:h-11 object-contain" />
                    ) : (
                      <Building2 className="w-5 h-5 sm:w-7 sm:h-7 text-brand" />
                    )}
                    {s.isVerified && <VerifiedBadge onLogo size="sm" />}
                  </div>

                  {/* Title & Meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                      <h3 className="font-sora font-extrabold text-base sm:text-lg text-navy dark:text-white group-hover:text-brand transition-colors truncate">
                        {s.name}
                      </h3>
                      {s.isVerified && <VerifiedBadge size="sm" showText={false} />}
                    </div>

                    {/* Location & Founded */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-jakarta flex-wrap">
                      {s.headquartersCity && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{s.headquartersCity}</span>
                        </div>
                      )}
                      {s.foundedYear && (
                        <div className="flex items-center gap-1">
                          <span>•</span>
                          <span>Est. {s.foundedYear}</span>
                        </div>
                      )}
                    </div>

                    {/* Founders */}
                    {(() => {
                      const foundersArray = Array.isArray(s.founders) ? s.founders : (s.founders ? [s.founders] : []);
                      return foundersArray.length > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-jakarta mt-1">
                          Founded by {foundersArray.slice(0, 2).join(' & ')}
                          {foundersArray.length > 2 && ` +${foundersArray.length - 2}`}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-jakarta leading-relaxed mb-3 sm:mb-4 line-clamp-2">
                  {s.tagline}
                </p>

                {/* Tags Row */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  {s.category && (
                    <span className="text-xs font-semibold bg-brand/10 dark:bg-brand/20 text-brand px-2.5 py-1 rounded-full">
                      {s.category}
                    </span>
                  )}
                  {s.businessType && (
                    <span className="text-xs font-semibold bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-2.5 py-1 rounded-full">
                      {s.businessType}
                    </span>
                  )}
                  <span className="text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full">
                    {stageLabel(s.stage)}
                  </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Team Size */}
                  <div className="bg-gray-900/5 dark:bg-gray-950/50 rounded-xl p-2.5 pl-5 border border-gray-200/50 dark:border-gray-700/50">
                    <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-jakarta font-semibold mb-0.5">
                      Team
                    </div>
                    <div className="font-sora font-bold text-sm text-navy dark:text-white">
                      {s.employeeCount ? `${s.employeeCount}+` : '1-10'}
                    </div>
                  </div>

                  {/* Funding Raised */}
                  <div className="bg-gray-900/5 dark:bg-gray-950/50 rounded-xl p-2.5 pl-5 border border-gray-200/50 dark:border-gray-700/50">
                    <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-jakarta font-semibold mb-0.5">
                      Raised
                    </div>
                    <div className="font-sora font-bold text-sm text-emerald-600 dark:text-emerald-400">
                      {formatUsd(Number(s.totalUsd)) || 'Undisclosed'}
                    </div>
                  </div>
                </div>

                {/* Hover Arrow Indicator */}
                <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-7 h-7 rounded-full bg-brand/10 dark:bg-brand/20 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── Load More ── */}
      {hasMore && !loading && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold font-jakarta text-gray-700 dark:text-gray-300 hover:border-brand hover:text-brand transition-colors shadow-sm"
          >
            <ChevronDown className="w-4 h-4" />
            Show more startups ({startups.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}

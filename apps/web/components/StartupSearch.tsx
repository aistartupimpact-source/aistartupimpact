'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Building2, MapPin, X, Loader2, SlidersHorizontal, ChevronDown, ChevronUp, ArrowUpDown, ChevronLeft, ChevronRight, TrendingUp, Sparkles, LayoutGrid, List } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { VerifiedBadge } from './VerifiedBadge';

interface Startup {
  id: string; name: string; slug: string; tagline: string;
  logoUrl?: string; stage: string; headquartersCity?: string;
  isFeatured: boolean; totalUsd: number; isVerified?: boolean;
  employeeCount?: number; foundedYear?: number; category?: string;
  businessType?: string; founders?: string[] | string;
  status?: string;
}

const STAGES = [
  { value: '', label: 'All Stages' },
  { value: 'BOOTSTRAPPED', label: 'Bootstrapped' },
  { value: 'IDEA', label: 'Idea' },
  { value: 'PRE_SEED', label: 'Pre-Seed' },
  { value: 'SEED', label: 'Seed' },
  { value: 'PRE_SERIES_A', label: 'Pre-Series A' },
  { value: 'SERIES_A', label: 'Series A' },
  { value: 'PRE_SERIES_B', label: 'Pre-Series B' },
  { value: 'SERIES_B', label: 'Series B' },
  { value: 'PRE_SERIES_C', label: 'Pre-Series C' },
  { value: 'SERIES_C', label: 'Series C' },
  { value: 'PRE_SERIES_D', label: 'Pre-Series D' },
  { value: 'SERIES_D', label: 'Series D' },
  { value: 'SERIES_E', label: 'Series E' },
  { value: 'SERIES_F', label: 'Series F' },
  { value: 'SERIES_G', label: 'Series G' },
  { value: 'SERIES_I', label: 'Series I' },
  { value: 'SERIES_J', label: 'Series J' },
  { value: 'GROWTH', label: 'Growth' },
  { value: 'PUBLIC', label: 'Public' },
];

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'AI Infrastructure & MLOps', label: 'AI Infrastructure' },
  { value: 'Enterprise Software & SaaS', label: 'Enterprise SaaS' },
  { value: 'Developer Tools & DevOps', label: 'Dev Tools' },
  { value: 'FinTech', label: 'FinTech' },
  { value: 'HealthTech & BioTech', label: 'HealthTech' },
  { value: 'EdTech', label: 'EdTech' },
  { value: 'Cybersecurity', label: 'Cybersecurity' },
  { value: 'MarTech & AdTech', label: 'MarTech' },
  { value: 'E-Commerce & Retail Tech', label: 'E-Commerce' },
  { value: 'AgriTech', label: 'AgriTech' },
  { value: 'CleanTech & Energy', label: 'CleanTech' },
  { value: 'Construction & InfraTech', label: 'InfraTech' },
  { value: 'PropTech (Real Estate Tech)', label: 'PropTech' },
  { value: 'LegalTech', label: 'LegalTech' },
  { value: 'HRTech', label: 'HRTech' },
  { value: 'Logistics & Supply Chain', label: 'Logistics' },
  { value: 'FoodTech', label: 'FoodTech' },
  { value: 'TravelTech & Hospitality', label: 'Travel' },
  { value: 'Mobility & Transportation', label: 'Mobility' },
  { value: 'Media & Entertainment', label: 'Media' },
  { value: 'Robotics & Industrial Automation', label: 'Robotics' },
  { value: 'DeepTech & Hardware', label: 'DeepTech' },
  { value: 'Telecom & Connectivity', label: 'Telecom' },
  { value: 'SpaceTech', label: 'SpaceTech' },
  { value: 'Defense & GovTech', label: 'GovTech' },
  { value: 'Manufacturing & Industry 4.0', label: 'Manufacturing' },
  { value: 'Data & Analytics', label: 'Data & Analytics' },
  { value: 'Blockchain & Web3', label: 'Web3' },
  { value: 'Consumer Apps & Social', label: 'Consumer' },
  { value: 'Climate & Sustainability', label: 'Climate' },
  { value: 'Pharma & Life Sciences', label: 'Pharma' },
  { value: 'Insurance & InsurTech', label: 'InsurTech' },
];

const BUSINESS_TYPES = [
  { value: '', label: 'All Models' },
  { value: 'B2B', label: 'B2B' },
  { value: 'B2C', label: 'B2C' },
  { value: 'B2B2C', label: 'B2B2C' },
  { value: 'B2G', label: 'B2G' },
  { value: 'D2C', label: 'D2C' },
  { value: 'Platform', label: 'Platform' },
  { value: 'Marketplace', label: 'Marketplace' },
  { value: 'API-First', label: 'API-First' },
  { value: 'Open Core', label: 'Open Core' },
  { value: 'Infrastructure', label: 'Infrastructure' },
];

const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PUBLIC', label: 'Public' },
  { value: 'ACQUIRED', label: 'Acquired' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const EMPLOYEE_RANGES = [
  { value: '', label: 'All Team Sizes' },
  { value: '1-10', label: '1 - 10 employees' },
  { value: '11-50', label: '11 - 50 employees' },
  { value: '51-200', label: '51 - 200 employees' },
  { value: '201-500', label: '201 - 500 employees' },
  { value: '500+', label: '500+ employees' },
];

const COUNTRIES = [
  { value: '', label: 'All Countries' },
  { value: 'India', label: 'India' },
  { value: 'International', label: 'International' },
];

const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'newest', label: 'Newest First' },
  { value: 'funded', label: 'Most Funded' },
  { value: 'team', label: 'Largest Team' },
  { value: 'az', label: 'A → Z' },
];

const ITEMS_PER_PAGE = 30;

function formatUsd(usd: number) {
  if (!usd || usd === 0) return null;
  if (usd >= 1e9) return `$${(usd / 1e9).toFixed(1)}B`;
  if (usd >= 1e6) return `$${(usd / 1e6).toFixed(0)}M`;
  return `$${(usd / 1e3).toFixed(0)}K`;
}

function stageLabel(s: string) {
  return STAGES.find(x => x.value === s)?.label || s?.replace(/_/g, ' ') || '';
}

function categoryShortLabel(c: string) {
  return CATEGORIES.find(x => x.value === c)?.label || c;
}

function isNewStartup(foundedYear?: number) {
  return foundedYear && foundedYear >= 2025;
}

interface Props {
  initialStartups: Startup[];
  initialTotal: number;
  cities: string[];
}

export default function StartupSearch({ initialStartups, initialTotal, cities }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [stage, setStage] = useState(searchParams.get('stage') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [businessType, setBusinessType] = useState(searchParams.get('businessType') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [country, setCountry] = useState(searchParams.get('country') || '');
  const [employeeRange, setEmployeeRange] = useState(searchParams.get('employeeRange') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');

  const [startups, setStartups] = useState<Startup[]>(initialStartups);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showTypeahead, setShowTypeahead] = useState(false);
  const [typeaheadIdx, setTypeaheadIdx] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoryScrollerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const wasDragged = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);

  const hasUserInteracted = useRef(false);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  const typeaheadSuggestions = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return initialStartups
      .filter(s => s.name.toLowerCase().includes(q) || s.tagline?.toLowerCase().includes(q))
      .slice(0, 6)
      .map(s => ({ name: s.name, slug: s.slug, category: s.category, logoUrl: s.logoUrl }));
  }, [query, initialStartups]);

  const buildSearchParams = useCallback((
    q: string, s: string, c: string, bt: string, st: string, ci: string, co: string, er: string, so: string, page: number
  ) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (s) params.set('stage', s);
    if (c) params.set('category', c);
    if (bt) params.set('businessType', bt);
    if (st) params.set('status', st);
    if (ci) params.set('city', ci);
    if (co) params.set('country', co);
    if (er) params.set('employeeRange', er);
    if (so) params.set('sort', so);
    params.set('limit', String(ITEMS_PER_PAGE));
    params.set('page', String(page));
    return params;
  }, []);

  const fetchStartups = useCallback(async (
    q: string, s: string, c: string, bt: string, st: string, ci: string, co: string, er: string, so: string
  ) => {
    setLoading(true);
    setStartups([]);
    setCurrentPage(1);
    try {
      const params = buildSearchParams(q, s, c, bt, st, ci, co, er, so, 1);
      const res = await fetch(`/api/startups/search?${params}`);
      const data = await res.json();
      setStartups(data.startups || []);
      setTotal(data.total || 0);
    } catch {
      // keep empty on error
    } finally {
      setLoading(false);
    }
  }, [buildSearchParams]);

  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    const nextPage = currentPage + 1;
    setLoadingMore(true);
    try {
      const params = buildSearchParams(query, stage, category, businessType, status, city, country, employeeRange, sort, nextPage);
      const res = await fetch(`/api/startups/search?${params}`);
      const data = await res.json();
      setStartups(prev => [...prev, ...(data.startups || [])]);
      setCurrentPage(nextPage);
    } catch {
      // keep existing on error
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, currentPage, query, stage, category, businessType, status, city, country, employeeRange, sort, buildSearchParams]);

  // Fast debounced search — instant for filters, 150ms for typing
  useEffect(() => {
    if (!hasUserInteracted.current) return;
    clearTimeout(debounceRef.current);
    const isTyping = query !== (searchParams.get('q') || '');
    debounceRef.current = setTimeout(() => {
      fetchStartups(query, stage, category, businessType, status, city, country, employeeRange, sort);
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (stage) params.set('stage', stage);
      if (category) params.set('category', category);
      if (businessType) params.set('businessType', businessType);
      if (status) params.set('status', status);
      if (city) params.set('city', city);
      if (country) params.set('country', country);
      if (employeeRange) params.set('employeeRange', employeeRange);
      if (sort) params.set('sort', sort);
      const newUrl = params.toString() ? `${pathname}?${params}` : pathname;
      router.replace(newUrl, { scroll: false });
    }, isTyping ? 150 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [query, stage, category, businessType, status, city, country, employeeRange, sort, fetchStartups, pathname, router, searchParams]);

  const handleCategoryChange = (value: string) => {
    hasUserInteracted.current = true;
    setCategory(value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    hasUserInteracted.current = true;
    setQuery(''); setStage(''); setCategory(''); setBusinessType('');
    setStatus(''); setCity(''); setCountry(''); setEmployeeRange('');
    setSort('');
    setCurrentPage(1);
  };

  const hasMore = startups.length < total;

  const activeFiltersCount = [
    stage,
    category,
    businessType,
    status,
    city,
    country,
    employeeRange
  ].filter(Boolean).length;

  const getFilterLabel = (key: string, val: string) => {
    if (key === 'stage') return STAGES.find(x => x.value === val)?.label || val;
    if (key === 'category') return CATEGORIES.find(x => x.value === val)?.label || val;
    if (key === 'businessType') return BUSINESS_TYPES.find(x => x.value === val)?.label || val;
    if (key === 'status') return STATUSES.find(x => x.value === val)?.label || val;
    if (key === 'employeeRange') return EMPLOYEE_RANGES.find(x => x.value === val)?.label || val;
    if (key === 'city') return `City: ${val}`;
    if (key === 'country') return `Country: ${val}`;
    return val;
  };

  const removeFilter = (key: string) => {
    hasUserInteracted.current = true;
    if (key === 'stage') setStage('');
    if (key === 'category') setCategory('');
    if (key === 'businessType') setBusinessType('');
    if (key === 'status') setStatus('');
    if (key === 'city') setCity('');
    if (key === 'country') setCountry('');
    if (key === 'employeeRange') setEmployeeRange('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-5">
      {/* ── Sticky Category Pills ── */}
      <div className="sticky top-0 z-10 bg-gray-50/90 dark:bg-gray-950/80 backdrop-blur-md -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-2.5 sm:py-3">
        <div className="relative">
          <div
            ref={categoryScrollerRef}
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide pb-1 cursor-grab active:cursor-grabbing select-none"
            onMouseDown={(e) => {
              isDragging.current = true;
              wasDragged.current = false;
              dragStartX.current = e.pageX;
              scrollStartX.current = categoryScrollerRef.current?.scrollLeft ?? 0;
            }}
            onMouseMove={(e) => {
              if (!isDragging.current || !categoryScrollerRef.current) return;
              e.preventDefault();
              const dx = e.pageX - dragStartX.current;
              if (Math.abs(dx) > 3) wasDragged.current = true;
              categoryScrollerRef.current.scrollLeft = scrollStartX.current - dx;
            }}
            onMouseUp={() => { isDragging.current = false; }}
            onMouseLeave={() => { isDragging.current = false; }}
            onClickCapture={(e) => {
              if (wasDragged.current) { e.stopPropagation(); e.preventDefault(); }
            }}
          >
            <button
              onClick={() => handleCategoryChange('')}
              className={`shrink-0 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-xs font-bold font-jakarta transition-all ${
                category === ''
                  ? 'bg-brand text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All Sectors
            </button>
            {CATEGORIES.filter(c => c.value !== '').map(cat => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`shrink-0 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-xs font-bold font-jakarta transition-all ${
                  category === cat.value
                    ? 'bg-brand text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="absolute right-0 top-0 bottom-1 w-6 bg-gradient-to-l from-gray-50 dark:from-gray-950 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* ── Search + Toggle Row ── */}
      <div className="space-y-3">
        {/* Main Search Row */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={e => { hasUserInteracted.current = true; setQuery(e.target.value); setShowTypeahead(true); setTypeaheadIdx(-1); }}
              onFocus={() => { if (query.length >= 2) setShowTypeahead(true); }}
              onBlur={() => { setTimeout(() => setShowTypeahead(false), 150); }}
              onKeyDown={e => {
                if (!showTypeahead || typeaheadSuggestions.length === 0) return;
                if (e.key === 'ArrowDown') { e.preventDefault(); setTypeaheadIdx(i => Math.min(i + 1, typeaheadSuggestions.length - 1)); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); setTypeaheadIdx(i => Math.max(i - 1, -1)); }
                else if (e.key === 'Enter' && typeaheadIdx >= 0) { e.preventDefault(); router.push(`/startups/${typeaheadSuggestions[typeaheadIdx].slug}`); setShowTypeahead(false); }
                else if (e.key === 'Escape') { setShowTypeahead(false); }
              }}
              inputMode="search" enterKeyHint="search" placeholder="Search startups by name, tagline, founder or category..."
              className="w-full pl-10 sm:pl-12 pr-10 py-2 sm:py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm font-jakarta"
              role="combobox" aria-expanded={showTypeahead && typeaheadSuggestions.length > 0} aria-autocomplete="list"
            />
            {query && (
              <button onClick={() => { hasUserInteracted.current = true; setQuery(''); setShowTypeahead(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full z-10" aria-label="Clear search">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}

            {/* Typeahead dropdown */}
            {showTypeahead && typeaheadSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden" role="listbox">
                {typeaheadSuggestions.map((s, i) => (
                  <Link
                    key={s.slug}
                    href={`/startups/${s.slug}`}
                    onClick={() => setShowTypeahead(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm font-jakarta transition-colors ${
                      i === typeaheadIdx
                        ? 'bg-brand/10 dark:bg-brand/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                    role="option" aria-selected={i === typeaheadIdx}
                  >
                    {s.logoUrl ? (
                      <Image src={s.logoUrl} alt="" width={24} height={24} className="w-6 h-6 rounded-md object-contain bg-white dark:bg-gray-900" />
                    ) : (
                      <div className="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-gray-900 dark:text-white font-semibold truncate block">{s.name}</span>
                    </div>
                    {s.category && (
                      <span className="text-[10px] text-gray-400 font-medium shrink-0">{categoryShortLabel(s.category)}</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl border font-jakarta text-sm font-semibold transition-all select-none min-h-[44px] sm:min-h-0 ${
              showAdvanced || activeFiltersCount > 0
                ? 'border-brand bg-brand/5 text-brand shadow-sm'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 flex items-center justify-center bg-brand text-white text-xs font-bold rounded-full animate-scale-in">
                {activeFiltersCount}
              </span>
            )}
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sort}
              onChange={e => { hasUserInteracted.current = true; setSort(e.target.value); setCurrentPage(1); }}
              className={`appearance-none flex items-center gap-2 pl-9 pr-8 py-2 sm:py-2.5 rounded-xl border font-jakarta text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer min-h-[44px] sm:min-h-0 ${
                sort
                  ? 'border-brand bg-brand/5 text-brand shadow-sm'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
          </div>
        </div>

        {/* Collapsible Advanced Filters Grid */}
        {showAdvanced && (
          <div className="bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200/60 dark:border-gray-800 rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-scale-in">
            {/* Stage Filter */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1 font-jakarta">Funding Stage</label>
              <select
                value={stage}
                onChange={e => { hasUserInteracted.current = true; setStage(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-jakarta text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
              >
                {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>


            {/* Business Model Filter */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1 font-jakarta">Business Model</label>
              <select
                value={businessType}
                onChange={e => { hasUserInteracted.current = true; setBusinessType(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-jakarta text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
              >
                {BUSINESS_TYPES.map(bt => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
              </select>
            </div>

            {/* Company Status Filter */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1 font-jakarta">Company Status</label>
              <select
                value={status}
                onChange={e => { hasUserInteracted.current = true; setStatus(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-jakarta text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
              >
                {STATUSES.map(st => <option key={st.value} value={st.value}>{st.label}</option>)}
              </select>
            </div>

            {/* Employee Size Filter */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1 font-jakarta">Team Size</label>
              <select
                value={employeeRange}
                onChange={e => { hasUserInteracted.current = true; setEmployeeRange(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-jakarta text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
              >
                {EMPLOYEE_RANGES.map(er => <option key={er.value} value={er.value}>{er.label}</option>)}
              </select>
            </div>

            {/* Country Filter */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1 font-jakarta">Country</label>
              <select
                value={country}
                onChange={e => { hasUserInteracted.current = true; setCountry(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-jakarta text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
              >
                {COUNTRIES.map(co => <option key={co.value} value={co.value}>{co.label}</option>)}
              </select>
            </div>

            {/* City Filter */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1 font-jakarta">Headquarters City</label>
              <select
                value={city}
                onChange={e => { hasUserInteracted.current = true; setCity(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-jakarta text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
              >
                <option value="">All Cities</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Clear All Button Grid Cell */}
            <div className="flex items-end">
              <button
                onClick={clearSearch}
                className="w-full px-3 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 hover:text-brand hover:border-brand/40 text-xs font-semibold font-jakarta transition-colors min-h-[36px]"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}

        {/* Results Info & Active Tags Row */}
        <div className="flex flex-col gap-2">
          {/* Active Filter Tags */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mr-1 font-jakarta select-none">Active Filters:</span>
              {stage && (
                <button onClick={() => removeFilter('stage')} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/5 border border-brand/20 text-brand hover:bg-brand/10 transition-colors font-jakarta">
                  <span>{getFilterLabel('stage', stage)}</span>
                  <X className="w-3 h-3" />
                </button>
              )}
              {category && (
                <button onClick={() => removeFilter('category')} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/5 border border-brand/20 text-brand hover:bg-brand/10 transition-colors font-jakarta">
                  <span>{getFilterLabel('category', category)}</span>
                  <X className="w-3 h-3" />
                </button>
              )}
              {businessType && (
                <button onClick={() => removeFilter('businessType')} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/5 border border-brand/20 text-brand hover:bg-brand/10 transition-colors font-jakarta">
                  <span>{getFilterLabel('businessType', businessType)}</span>
                  <X className="w-3 h-3" />
                </button>
              )}
              {status && (
                <button onClick={() => removeFilter('status')} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/5 border border-brand/20 text-brand hover:bg-brand/10 transition-colors font-jakarta">
                  <span>{getFilterLabel('status', status)}</span>
                  <X className="w-3 h-3" />
                </button>
              )}
              {employeeRange && (
                <button onClick={() => removeFilter('employeeRange')} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/5 border border-brand/20 text-brand hover:bg-brand/10 transition-colors font-jakarta">
                  <span>{getFilterLabel('employeeRange', employeeRange)}</span>
                  <X className="w-3 h-3" />
                </button>
              )}
              {country && (
                <button onClick={() => removeFilter('country')} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/5 border border-brand/20 text-brand hover:bg-brand/10 transition-colors font-jakarta">
                  <span>{getFilterLabel('country', country)}</span>
                  <X className="w-3 h-3" />
                </button>
              )}
              {city && (
                <button onClick={() => removeFilter('city')} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/5 border border-brand/20 text-brand hover:bg-brand/10 transition-colors font-jakarta">
                  <span>{getFilterLabel('city', city)}</span>
                  <X className="w-3 h-3" />
                </button>
              )}
              <button onClick={clearSearch} className="text-xs text-brand hover:underline font-jakarta font-bold px-2 py-1">
                Clear all
              </button>
            </div>
          )}

          {/* Results Count & View Toggle */}
          <div className="flex items-center justify-between text-xs text-gray-400 font-jakarta">
            {loading ? (
              <span className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Finding startups...</span>
            ) : (
              <span>Found <span className="font-bold text-navy dark:text-white">{total}</span> startups</span>
            )}
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-brand/10 text-brand' : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-brand/10 text-brand' : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                aria-label="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      {loading && startups.length === 0 ? (
        /* Skeleton loading — matches card layout exactly */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5 animate-pulse">
              {/* Header: logo + name */}
              <div className="flex items-start gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0" />
                <div className="flex-1 min-w-0 pt-1">
                  <div className="h-4 sm:h-5 w-3/4 bg-gray-100 dark:bg-gray-800 rounded mb-2" />
                  <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-800 rounded" />
                </div>
              </div>
              {/* Tagline */}
              <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded mb-2" />
              <div className="h-3 w-4/5 bg-gray-100 dark:bg-gray-800 rounded mb-4" />
              {/* Tags */}
              <div className="flex gap-2 mb-3">
                <div className="h-6 w-16 bg-gray-100 dark:bg-gray-800 rounded-full" />
                <div className="h-6 w-12 bg-gray-100 dark:bg-gray-800 rounded-full" />
                <div className="h-6 w-14 bg-gray-100 dark:bg-gray-800 rounded-full" />
              </div>
              {/* Footer */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
                <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : startups.length === 0 && !loading ? (
        <div className="text-center py-12 sm:py-16">
          <Building2 className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-900 dark:text-white font-sora font-bold text-base mb-1">No startups found</p>
          <p className="text-gray-400 font-jakarta text-sm mb-5 max-w-md mx-auto">
            {query
              ? `No results for "${query}"${activeFiltersCount > 0 ? ' with the active filters' : ''}. Try a different search term or adjust your filters.`
              : 'No startups match your current filters. Try broadening your search.'}
          </p>
          <button onClick={clearSearch} className="inline-flex items-center gap-1.5 text-sm text-brand font-semibold hover:underline font-jakarta mb-6">
            <X className="w-3.5 h-3.5" /> Clear all filters
          </button>

          {/* Suggested categories */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-5 mt-2">
            <p className="text-xs text-gray-400 font-jakarta font-semibold uppercase tracking-wide mb-3 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Popular categories
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['FinTech', 'HealthTech & BioTech', 'AI Infrastructure & MLOps', 'Enterprise Software & SaaS', 'Developer Tools & DevOps', 'EdTech'].map(cat => (
                <button
                  key={cat}
                  onClick={() => { hasUserInteracted.current = true; setQuery(''); setCategory(cat); setShowAdvanced(false); setCurrentPage(1); }}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold font-jakarta bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-brand/10 hover:text-brand transition-colors"
                >
                  {categoryShortLabel(cat)}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3' : 'flex flex-col gap-1.5 sm:gap-2'} transition-opacity duration-150 ${loading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
          {startups.map(s => viewMode === 'list' ? (
            /* ── List View Card ── */
            <Link key={s.slug} href={`/startups/${s.slug}`} prefetch={false} className="group">
              <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 hover:shadow-md hover:border-brand/30 dark:hover:border-brand/30 transition-all duration-200 flex items-center gap-3">
                {/* Logo */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {s.logoUrl ? (
                      <Image src={s.logoUrl} alt={s.name} className="w-full h-full object-cover" width={40} height={40} sizes="40px" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full"><Building2 className="w-5 h-5 text-brand" /></div>
                    )}
                  </div>
                  {s.isVerified && <VerifiedBadge onLogo size="sm" />}
                </div>

                {/* Name & Tagline — takes remaining space */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-sora font-bold text-sm text-navy dark:text-white group-hover:text-brand transition-colors truncate">{s.name}</h3>
                    {s.isVerified && <VerifiedBadge size="sm" showText={false} />}
                    {isNewStartup(s.foundedYear) && (
                      <span className="shrink-0 text-[9px] font-bold font-jakarta bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-wide leading-none">New</span>
                    )}
                    {s.isFeatured && (
                      <span className="shrink-0 text-[8px] font-bold font-jakarta bg-gradient-to-r from-red-500 to-rose-600 text-white px-1.5 py-px rounded uppercase tracking-wide leading-none">Featured</span>
                    )}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-jakarta line-clamp-1 mt-0.5">{s.tagline}</p>
                </div>

                {/* Right-side columns — pushed to the end */}
                <div className="hidden sm:flex items-center gap-2 shrink-0 ml-auto">
                  {/* Category */}
                  <div className="w-[120px] flex justify-start">
                    {s.category ? (
                      <span className="text-[10px] font-semibold bg-brand/10 dark:bg-brand/20 text-brand px-1.5 py-0.5 rounded-full truncate max-w-full">{categoryShortLabel(s.category)}</span>
                    ) : <span className="text-[10px] text-gray-300">—</span>}
                  </div>

                  {/* Stage */}
                  <div className="w-[80px] flex justify-start">
                    <span className="text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-full">{stageLabel(s.stage)}</span>
                  </div>

                  {/* Location */}
                  <div className="hidden md:flex w-[100px] justify-start text-xs font-jakarta">
                    {s.headquartersCity ? (
                      <span className="flex items-center gap-0.5 text-gray-400 truncate"><MapPin className="w-3 h-3 shrink-0" />{s.headquartersCity}</span>
                    ) : <span className="text-gray-300">—</span>}
                  </div>

                  {/* Funding */}
                  <div className="hidden md:flex w-[65px] justify-end">
                    <span className={`font-sora font-bold text-xs ${formatUsd(Number(s.totalUsd)) ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                      {formatUsd(Number(s.totalUsd)) || '—'}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ) : (
            /* ── Grid View Card ── */
            <Link key={s.slug} href={`/startups/${s.slug}`} prefetch={false} className="group">
              <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5 hover:shadow-xl hover:border-brand/30 dark:hover:border-brand/30 transition-all duration-300 h-full flex flex-col">
                {/* Featured ribbon */}
                {s.isFeatured && (
                  <div className="absolute -top-px -right-px bg-gradient-to-r from-red-500 to-rose-600 text-white text-[9px] font-bold font-jakarta uppercase tracking-wider px-2 py-px rounded-bl-md rounded-tr-xl">
                    Featured
                  </div>
                )}

                {/* Header Section */}
                <div className="flex items-start gap-2.5 sm:gap-3 mb-2.5 sm:mb-3">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                      {s.logoUrl ? (
                        <Image src={s.logoUrl} alt={s.name} className="w-full h-full object-cover" width={48} height={48} sizes="48px" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full"><Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-brand" /></div>
                      )}
                    </div>
                    {s.isVerified && <VerifiedBadge onLogo size="sm" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h3 className="font-sora font-extrabold text-sm sm:text-base text-navy dark:text-white group-hover:text-brand transition-colors truncate">{s.name}</h3>
                      {s.isVerified && <VerifiedBadge size="sm" showText={false} />}
                      {isNewStartup(s.foundedYear) && (
                        <span className="shrink-0 text-[9px] font-bold font-jakarta bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-wide leading-none">New</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 font-jakarta">
                      {s.headquartersCity && (
                        <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{s.headquartersCity}</span>
                      )}
                      {s.headquartersCity && s.foundedYear && <span className="text-gray-300 dark:text-gray-600">·</span>}
                      {s.foundedYear && <span>Est. {s.foundedYear}</span>}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-xs font-jakarta leading-relaxed mb-3 line-clamp-2 flex-1">{s.tagline}</p>

                <div className="flex items-center gap-1.5 mb-3">
                  {s.category && (
                    <span className="text-[11px] font-semibold bg-brand/10 dark:bg-brand/20 text-brand px-2 py-0.5 rounded-full truncate max-w-[120px]">{categoryShortLabel(s.category)}</span>
                  )}
                  <span className="text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">{stageLabel(s.stage)}</span>
                  {s.status && s.status !== 'ACTIVE' && (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.status === 'ACQUIRED' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                      {s.status === 'PUBLIC' ? 'IPO' : s.status}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 dark:border-gray-800 text-xs font-jakarta">
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <span className="font-semibold text-navy dark:text-gray-200">{s.employeeCount ? `${s.employeeCount}+` : '1-10'}</span>
                    <span>team</span>
                  </div>
                  <div className={`font-sora font-bold ${formatUsd(Number(s.totalUsd)) ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    {formatUsd(Number(s.totalUsd)) || '—'}
                  </div>
                </div>

                <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-6 h-6 rounded-full bg-brand/10 dark:bg-brand/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── Infinite Scroll Sentinel ── */}
      {hasMore && !loading && !loadingMore && (
        <InfiniteScrollTrigger onIntersect={loadMore} />
      )}
      {loadingMore && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 text-brand animate-spin" />
        </div>
      )}
    </div>
  );
}

function InfiniteScrollTrigger({ onIntersect }: { onIntersect: () => void }) {
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

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Building2, MapPin, X, Loader2, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
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
  { value: 'SERIES_B', label: 'Series B' },
  { value: 'SERIES_C', label: 'Series C' },
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
  
  const [startups, setStartups] = useState<Startup[]>(initialStartups);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(() => {
    if (typeof window === 'undefined') return ITEMS_PER_PAGE;
    try {
      const saved = sessionStorage.getItem('startups-visible-count');
      if (saved) {
        const count = parseInt(saved, 10);
        if (count > ITEMS_PER_PAGE) return count;
      }
    } catch {}
    return ITEMS_PER_PAGE;
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasUserInteracted = useRef(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    try {
      sessionStorage.setItem('startups-visible-count', String(visibleCount));
    } catch {}
  }, [visibleCount]);

  const fetchStartups = useCallback(async (
    q: string, s: string, c: string, bt: string, st: string, ci: string, co: string, er: string
  ) => {
    setLoading(true);
    setStartups([]); // Clear immediately — shows skeleton
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (s) params.set('stage', s);
      if (c) params.set('category', c);
      if (bt) params.set('businessType', bt);
      if (st) params.set('status', st);
      if (ci) params.set('city', ci);
      if (co) params.set('country', co);
      if (er) params.set('employeeRange', er);
      params.set('limit', '100');
      const res = await fetch(`/api/startups/search?${params}`);
      const data = await res.json();
      setStartups(data.startups || []);
      setTotal(data.total || 0);
      setVisibleCount(ITEMS_PER_PAGE);
    } catch {
      // keep empty on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Fast debounced search — instant for filters, 150ms for typing
  useEffect(() => {
    if (!hasUserInteracted.current) return;
    clearTimeout(debounceRef.current);
    const isTyping = query !== (searchParams.get('q') || '');
    debounceRef.current = setTimeout(() => {
      fetchStartups(query, stage, category, businessType, status, city, country, employeeRange);
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (stage) params.set('stage', stage);
      if (category) params.set('category', category);
      if (businessType) params.set('businessType', businessType);
      if (status) params.set('status', status);
      if (city) params.set('city', city);
      if (country) params.set('country', country);
      if (employeeRange) params.set('employeeRange', employeeRange);
      const newUrl = params.toString() ? `${pathname}?${params}` : pathname;
      router.replace(newUrl, { scroll: false });
    }, isTyping ? 150 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [query, stage, category, businessType, status, city, country, employeeRange, fetchStartups, pathname, router, searchParams]);

  const handleCategoryChange = (value: string) => {
    hasUserInteracted.current = true;
    setCategory(value);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const clearSearch = () => {
    hasUserInteracted.current = true;
    setQuery(''); setStage(''); setCategory(''); setBusinessType('');
    setStatus(''); setCity(''); setCountry(''); setEmployeeRange('');
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const visibleStartups = startups.slice(0, visibleCount);
  const hasMore = visibleCount < startups.length;

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
    setVisibleCount(ITEMS_PER_PAGE);
  };

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
            All Sectors
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

      {/* ── Search + Toggle Row ── */}
      <div className="space-y-3">
        {/* Main Search Row */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => { hasUserInteracted.current = true; setQuery(e.target.value); }}
              placeholder="Search startups by name, tagline, founder or category..."
              className="w-full pl-10 sm:pl-12 pr-10 py-2 sm:py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm font-jakarta"
            />
            {query && (
              <button onClick={() => { hasUserInteracted.current = true; setQuery(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>

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
              <span className="w-5 h-5 flex items-center justify-center bg-brand text-white text-[11px] font-bold rounded-full animate-scale-in">
                {activeFiltersCount}
              </span>
            )}
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible Advanced Filters Grid */}
        {showAdvanced && (
          <div className="bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200/60 dark:border-gray-800 rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-scale-in">
            {/* Stage Filter */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1 font-jakarta">Funding Stage</label>
              <select
                value={stage}
                onChange={e => { hasUserInteracted.current = true; setStage(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-jakarta text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
              >
                {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>


            {/* Business Model Filter */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1 font-jakarta">Business Model</label>
              <select
                value={businessType}
                onChange={e => { hasUserInteracted.current = true; setBusinessType(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-jakarta text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
              >
                {BUSINESS_TYPES.map(bt => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
              </select>
            </div>

            {/* Company Status Filter */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1 font-jakarta">Company Status</label>
              <select
                value={status}
                onChange={e => { hasUserInteracted.current = true; setStatus(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-jakarta text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
              >
                {STATUSES.map(st => <option key={st.value} value={st.value}>{st.label}</option>)}
              </select>
            </div>

            {/* Employee Size Filter */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1 font-jakarta">Team Size</label>
              <select
                value={employeeRange}
                onChange={e => { hasUserInteracted.current = true; setEmployeeRange(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-jakarta text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
              >
                {EMPLOYEE_RANGES.map(er => <option key={er.value} value={er.value}>{er.label}</option>)}
              </select>
            </div>

            {/* Country Filter */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1 font-jakarta">Country</label>
              <select
                value={country}
                onChange={e => { hasUserInteracted.current = true; setCountry(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-jakarta text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
              >
                {COUNTRIES.map(co => <option key={co.value} value={co.value}>{co.label}</option>)}
              </select>
            </div>

            {/* City Filter */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1 font-jakarta">Headquarters City</label>
              <select
                value={city}
                onChange={e => { hasUserInteracted.current = true; setCity(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
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
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mr-1 font-jakarta select-none">Active Filters:</span>
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

          {/* Results Count & Loader status */}
          <div className="flex items-center justify-between text-xs text-gray-400 font-jakarta">
            {loading ? (
              <span className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Finding startups...</span>
            ) : (
              <span>Found <span className="font-bold text-navy dark:text-white">{total}</span> startups</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      {loading && startups.length === 0 ? (
        /* Skeleton loading — matches card layout exactly */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-5 animate-pulse">
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
        <div className="text-center py-16">
          <Building2 className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 font-jakarta text-sm mb-2">No startups found matching your criteria.</p>
          <button onClick={clearSearch} className="text-sm text-brand font-semibold hover:underline">Clear all filters</button>
        </div>
      ) : (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 transition-opacity duration-150 ${loading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
          {visibleStartups.map(s => (
            <Link key={s.slug} href={`/startups/${s.slug}`} prefetch={false} className="group">
              <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-5 hover:shadow-xl hover:border-brand/30 dark:hover:border-brand/30 transition-all duration-300 h-full">
                {/* Header Section */}
                <div className="flex items-start gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                  {/* Logo */}
                  <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center shrink-0 shadow-sm">
                    {s.logoUrl ? (
                      <Image src={s.logoUrl} alt={s.name} className="w-8 h-8 sm:w-11 sm:h-11 object-contain" width={44} height={44} sizes="44px" />
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
                  {s.status && s.status !== 'ACTIVE' && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      s.status === 'PUBLIC'
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/30'
                        : s.status === 'ACQUIRED'
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-900/30'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                    }`}>
                      {s.status}
                    </span>
                  )}
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

      {/* ── Infinite Scroll Sentinel ── */}
      {hasMore && !loading && (
        <InfiniteScrollTrigger onIntersect={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)} />
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

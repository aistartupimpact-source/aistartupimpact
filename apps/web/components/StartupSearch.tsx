'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Search, Building2, TrendingUp, MapPin, X, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface Startup {
  id: string; name: string; slug: string; tagline: string;
  logoUrl?: string; stage: string; headquartersCity?: string;
  isFeatured: boolean; totalUsd: number;
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
  const [startups, setStartups] = useState<Startup[]>(initialStartups);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  const fetchStartups = useCallback(async (q: string, s: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (s) params.set('stage', s);
      const res = await fetch(`/api/startups/search?${params}`);
      const data = await res.json();
      setStartups(data.startups || []);
      setTotal(data.total || 0);
    } catch {
      // keep existing results
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search — 300ms delay, handles rapid typing
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchStartups(query, stage);
      // Update URL without navigation
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (stage) params.set('stage', stage);
      const newUrl = params.toString() ? `${pathname}?${params}` : pathname;
      router.replace(newUrl, { scroll: false });
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, stage, fetchStartups, pathname, router]);

  const clearSearch = () => { setQuery(''); setStage(''); };

  return (
    <div className="space-y-6">
      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search startups by name, tagline, city..."
            className="input-field pl-11 pr-10 w-full"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Stage filter pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 sm:pb-0">
          {STAGES.map(s => (
            <button key={s.value} onClick={() => setStage(s.value)}
              className={`px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                stage === s.value
                  ? 'bg-brand text-white shadow-sm shadow-brand/20'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 font-jakarta">
          {loading ? (
            <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching...</span>
          ) : (
            <span><span className="font-bold text-navy dark:text-white">{total}</span> startup{total !== 1 ? 's' : ''} found{(query || stage) ? ' for your search' : ''}</span>
          )}
        </p>
        {(query || stage) && (
          <button onClick={clearSearch} className="text-xs text-brand hover:underline font-jakarta flex items-center gap-1">
            <X className="w-3 h-3" /> Clear filters
          </button>
        )}
      </div>

      {/* Grid */}
      {startups.length === 0 && !loading ? (
        <div className="text-center py-16">
          <Building2 className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 font-jakarta text-sm">No startups found. Try a different search.</p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 transition-opacity duration-200 ${loading ? 'opacity-50' : 'opacity-100'}`}>
          {startups.map(s => (
            <Link key={s.slug} href={`/startups/${s.slug}`} className="group">
              <div className="card p-4 sm:p-5 h-full flex flex-col hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
                    {s.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.logoUrl} alt={s.name} className="w-10 h-10 object-contain" />
                    ) : (
                      <Building2 className="w-6 h-6 text-brand" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-sora font-bold text-base text-navy dark:text-white group-hover:text-brand transition-colors truncate">
                      {s.name}
                    </h3>
                    {s.headquartersCity && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 font-jakarta mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />{s.headquartersCity}
                      </div>
                    )}
                  </div>
                  {s.isFeatured && (
                    <span className="text-[9px] font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded-full shrink-0">★</span>
                  )}
                </div>

                <p className="text-gray-500 dark:text-gray-400 text-sm font-jakarta flex-1 line-clamp-2">{s.tagline}</p>

                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-[10px] font-bold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full uppercase">
                    {stageLabel(s.stage)}
                  </span>
                  {formatUsd(Number(s.totalUsd)) && (
                    <div className="flex items-center gap-1 text-sm font-sora font-extrabold text-brand">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {formatUsd(Number(s.totalUsd))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

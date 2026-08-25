'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';

interface City {
  id: string;
  slug: string;
  name: string;
  state: string | null;
  country: string;
}

interface CityAutocompleteProps {
  value: string; // display name (e.g. "Bengaluru")
  cityId?: string;
  onChange: (city: { id: string; name: string; state: string | null; country: string } | null) => void;
  placeholder?: string;
  className?: string;
}

export default function CityAutocomplete({ value, cityId, onChange, placeholder = 'Search city...', className = '' }: CityAutocompleteProps) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Sync external value changes
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = (q: string) => {
    clearTimeout(debounceRef.current);
    setQuery(q);

    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/cities/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.cities || []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);
  };

  const select = (city: City) => {
    setQuery(city.name);
    setOpen(false);
    onChange({ id: city.id, name: city.name, state: city.state, country: city.country });
  };

  const clear = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
    onChange(null);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => search(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand focus:border-transparent"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 animate-spin" />}
        {!loading && query && (
          <button onClick={clear} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute z-dropdown mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {results.map((city) => (
            <button
              key={city.id}
              type="button"
              onClick={() => select(city)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{city.name}</span>
                {(city.state || city.country) && (
                  <span className="text-xs text-gray-500 ml-1.5">
                    {city.state ? `${city.state}, ` : ''}{city.country}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute z-dropdown mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-center">
          <p className="text-xs text-gray-400">No cities found for &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Check, ChevronsUpDown } from 'lucide-react';
import { CITY_DATABASE } from '@aistartupimpact/utils/src/cities';
import type { CityEntry } from '@aistartupimpact/utils/src/cities';

interface CityComboboxProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
}

interface NormalizedCity {
  city: string;
  state?: string;
  country: string;
  lat?: number;
  lng?: number;
  aliases?: string[];
}

export default function CityCombobox({
  value,
  onChange,
  placeholder = 'Select or type a city...',
  className = '',
  id,
  name,
}: CityComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [dbCities, setDbCities] = useState<NormalizedCity[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Sync internal state when value prop changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Load custom/active database cities on mount
  useEffect(() => {
    async function fetchDbCities() {
      setLoading(true);
      try {
        const res = await fetch(`/api/india-ai/cities?t=${Date.now()}`, { cache: 'no-store' });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const normalized = json.data.map((item: any) => ({
            city: item.cityName,
            state: item.state || undefined,
            country: 'India', // Default to India for IndiaAICity table
            lat: item.latitude ? Number(item.latitude) : undefined,
            lng: item.longitude ? Number(item.longitude) : undefined,
            aliases: Array.isArray(item.aliases) ? item.aliases : (item.slug ? [item.slug] : []),
          }));
          setDbCities(normalized);
        }
      } catch (err) {
        console.error('Failed to load database cities:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDbCities();
  }, []);

  // Merge static database and dynamic database cities (removing duplicates)
  const mergedCities = useMemo(() => {
    const registry = new Map<string, NormalizedCity>();
    
    // 1. Add static cities first
    CITY_DATABASE.forEach(c => {
      registry.set(c.city.toLowerCase(), c);
    });

    // 2. Overlay database cities (which might have updated values or custom names)
    dbCities.forEach(c => {
      const existing = registry.get(c.city.toLowerCase());
      if (existing) {
        const combinedAliases = Array.from(new Set([
          ...(existing.aliases || []),
          ...(c.aliases || [])
        ]));
        registry.set(c.city.toLowerCase(), {
          ...existing,
          ...c,
          aliases: combinedAliases
        });
      } else {
        registry.set(c.city.toLowerCase(), c);
      }
    });

    return Array.from(registry.values());
  }, [dbCities]);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter cities based on search value
  const suggestions = useMemo(() => {
    if (!inputValue.trim()) {
      // Return top 15 cities if no input
      return mergedCities.slice(0, 15);
    }
    const query = inputValue.toLowerCase().trim();
    return mergedCities.filter(item => {
      const cityMatch = item.city.toLowerCase().includes(query);
      const stateMatch = item.state?.toLowerCase().includes(query) || false;
      const countryMatch = item.country.toLowerCase().includes(query);
      const aliasMatch = item.aliases?.some(alias => alias.toLowerCase().includes(query)) || false;
      return cityMatch || stateMatch || countryMatch || aliasMatch;
    });
  }, [inputValue, mergedCities]);

  // Adjust scroll when navigating via keyboard
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val); // Bubble up custom text immediately
    setIsOpen(true);
    setActiveIndex(-1);
  };

  const selectCity = (city: NormalizedCity) => {
    setInputValue(city.city);
    onChange(city.city);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
      }
    } else if (e.key === 'Enter') {
      if (isOpen && activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        selectCity(suggestions[activeIndex]);
      } else {
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          id={id}
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent ${className}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none text-gray-400">
          <ChevronsUpDown className="w-4 h-4" />
        </div>
      </div>

      {isOpen && (
        <ul
          ref={listRef}
          className="absolute z-dropdown w-full mt-1 max-h-60 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-1 shadow-lg focus:outline-none text-sm"
        >
          {suggestions.map((item, idx) => {
            const isSelected = value === item.city;
            const isActive = idx === activeIndex;
            return (
              <li
                key={`${item.city}-${idx}`}
                onClick={() => selectCity(item)}
                className={`relative cursor-pointer select-none py-2 pl-10 pr-4 transition-colors ${
                  isActive
                    ? 'bg-brand/10 dark:bg-brand/20 text-brand dark:text-white'
                    : isSelected
                    ? 'bg-gray-100 dark:bg-gray-700 font-semibold text-navy dark:text-white'
                    : 'text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand">
                  {isSelected ? (
                    <Check className="h-4 h-4" />
                  ) : (
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  )}
                </span>
                <div className="flex items-center justify-between">
                  <span className="truncate">{item.city}</span>
                  {item.state && (
                    <span className="text-xs text-gray-400 ml-2">
                      {item.state}, {item.country}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
          {suggestions.length === 0 && (
            <li 
              onClick={() => {
                onChange(inputValue);
                setIsOpen(false);
                // Submit custom city for admin review
                if (inputValue.trim().length >= 2) {
                  fetch('/api/cities/custom', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cityName: inputValue.trim() }),
                  }).catch(() => {}); // Fire and forget
                }
              }}
              className="relative cursor-pointer select-none py-2 px-4 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-xs italic"
            >
              Use custom city: &quot;{inputValue}&quot;
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

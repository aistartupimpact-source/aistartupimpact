"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";

interface City {
  id: string;
  name: string;
  state: string | null;
  country: string;
  slug: string;
}

interface Props {
  value: string;
  onChange: (city: { name: string; state?: string; country?: string }) => void;
  placeholder?: string;
}

/**
 * Simple city autocomplete dropdown using the existing /api/cities/search endpoint.
 * Stores city name (e.g. "Hyderabad, Telangana") for geo-targeting.
 */
export default function CitySelect({ value, onChange, placeholder = "Search your city..." }: Props) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch cities on query change
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/cities/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.cities || []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectCity = (city: City) => {
    const display = city.state
      ? `${city.name}, ${city.state}`
      : `${city.name}, ${city.country}`;
    setQuery(display);
    setOpen(false);
    onChange({ name: display, state: city.state || undefined, country: city.country });
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!e.target.value) onChange({ name: "" });
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm font-jakarta"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {results.map((city) => (
            <button
              key={city.id}
              type="button"
              onClick={() => selectCity(city)}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-200 font-jakarta">
                {city.name}
                {city.state && (
                  <span className="text-gray-400">, {city.state}</span>
                )}
              </span>
              <span className="text-[10px] text-gray-400 ml-auto">{city.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

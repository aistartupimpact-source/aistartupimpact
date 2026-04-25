'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface Sponsor {
  brand: string;
  tagline: string;
  ctaUrl: string;
  logoUrl?: string | null;
}

const INTERVAL = 4000;

export default function SponsorStrip({ sponsors }: { sponsors: Sponsor[] }) {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (sponsors.length <= 1) return;
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIdx(i => (i + 1) % sponsors.length);
        setFading(false);
      }, 300);
    }, INTERVAL);
    return () => clearInterval(t);
  }, [sponsors.length]);

  const s = sponsors[idx];
  if (!s) return null;

  return (
    <a
      href={s.ctaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col sm:flex-row sm:items-center justify-center gap-1 sm:gap-3 py-3 sm:py-3.5 px-4 group"
      style={{ transition: 'opacity 0.3s', opacity: fading ? 0 : 1 }}
    >
      {/* Desktop: single row. Mobile: stacked */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <span className="text-[10px] sm:text-xs text-gray-400 font-jakarta uppercase tracking-wider shrink-0">
          Powered by
        </span>
        {s.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.logoUrl} alt={s.brand} className="h-4 w-auto object-contain" />
        )}
        <span className="font-sora font-bold text-brand text-xs sm:text-sm group-hover:underline">{s.brand}</span>
        <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </div>

      {/* Tagline — visible on mobile, hidden on desktop (desktop shows inline) */}
      <span className="text-gray-400 text-[11px] font-jakarta text-center sm:hidden">
        {s.tagline}
      </span>
      <span className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm font-jakarta hidden sm:inline">
        — {s.tagline}
      </span>

      {/* Dots — below text on mobile, inline on desktop */}
      {sponsors.length > 1 && (
        <div className="flex gap-1 justify-center sm:ml-2 sm:justify-start">
          {sponsors.map((_, i) => (
            <span key={i} className={`h-1 rounded-full transition-all ${i === idx ? 'bg-brand w-4' : 'bg-gray-300 dark:bg-gray-600 w-1'}`} />
          ))}
        </div>
      )}
    </a>
  );
}

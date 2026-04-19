'use client';

import { memo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

interface Partner {
  name: string;
  tagline: string;
  description: string;
  ctaUrl: string;
  logoUrl?: string | null;
  statValue?: string | null;
  statLabel?: string | null;
}

const INTERVAL_MS = 6000;

function FeaturedPartnerRotator({ partners }: { partners: Partner[] }) {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback(
    (idx: number) => {
      if (animating || idx === active) return;
      setAnimating(true);
      setTimeout(() => {
        setActive(idx);
        setAnimating(false);
      }, 250);
    },
    [active, animating]
  );

  const next = useCallback(() => goTo((active + 1) % partners.length), [active, goTo, partners.length]);
  const prev = useCallback(() => goTo((active - 1 + partners.length) % partners.length), [active, goTo, partners.length]);

  // Auto-rotate
  useEffect(() => {
    if (partners.length <= 1) return;
    const t = setInterval(next, INTERVAL_MS);
    return () => clearInterval(t);
  }, [next, partners.length]);

  const p = partners[active];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0D1B2A]">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A] via-[#0F2239] to-[#071018]" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand/15 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 px-5 sm:px-10 py-10 sm:py-16">
        {/* Top-left badge */}
        <div className="absolute top-3 left-4 flex items-center gap-1 bg-brand/10 border border-brand/20 px-1.5 py-0.5 rounded-full">
          <span className="w-1 h-1 rounded-full bg-brand animate-pulse" />
          <span className="text-brand text-[8px] font-bold uppercase tracking-widest font-jakarta">
            Featured Partner
          </span>
        </div>

        {/* Pagination dots + arrows — top right */}
        {partners.length > 1 && (
          <div className="absolute top-3 right-4 flex items-center gap-2">
            <button
              onClick={prev}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              aria-label="Previous partner"
            >
              <ChevronLeft className="w-4 h-4 text-white/60" />
            </button>
            <div className="flex items-center gap-1.5">
              {partners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-300 ${i === active
                      ? 'w-4 h-1.5 bg-brand'
                      : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
                    }`}
                  aria-label={`Go to partner ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              aria-label="Next partner"
            >
              <ChevronRight className="w-4 h-4 text-white/60" />
            </button>
          </div>
        )}

        {/* Content — fades on transition */}
        <div
          className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8 transition-opacity duration-250"
          style={{ opacity: animating ? 0 : 1 }}
        >
          {/* Logo + Name + Tagline */}
          {/* Logo + Name + Tagline — fixed width so layout is consistent across all partners */}
          <div className="flex items-center gap-4 shrink-0 w-full sm:w-72">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-white/10 flex items-center justify-center overflow-hidden shadow-lg shadow-brand/10">
                {p.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.logoUrl} alt={p.name} className="w-12 h-12 sm:w-14 sm:h-14 object-contain" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random&color=fff&size=150`} alt={p.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#0D1B2A] flex items-center justify-center">
                <span className="text-[8px] text-white font-bold">✓</span>
              </div>
            </div>
            <div className="min-w-0">
              <h3 className="font-sora font-extrabold text-lg sm:text-xl text-white leading-tight">
                {p.name}
              </h3>
              {/* Tagline: single line, consistent across all tools */}
              <p className="text-brand text-xs sm:text-sm font-jakarta font-medium mt-1 leading-snug">
                {p.tagline}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-20 bg-white/10 shrink-0" />

          {/* Description — exactly 3 lines, vertically centered */}
          <div className="flex-1 min-w-0 flex items-center">
            <p className="text-gray-300 font-jakarta text-sm sm:text-base leading-relaxed line-clamp-3">
              {p.description}
            </p>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-20 bg-white/10 shrink-0" />

          {/* CTA */}
          <div className="flex items-center justify-end shrink-0 border-t border-white/10 sm:border-0 pt-4 sm:pt-0">
            <Link
              href={p.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand hover:bg-brand/90 text-white font-bold px-5 py-2.5 sm:py-3 rounded-xl text-sm font-jakarta transition-all duration-200 hover:shadow-lg hover:shadow-brand/30 flex items-center gap-2 group/btn whitespace-nowrap"
            >
              Get Started
              <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Progress bar */}
        {partners.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
            <div
              key={active}
              className="h-full bg-brand/60 origin-left"
              style={{
                animation: `progress-bar ${INTERVAL_MS}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes progress-bar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}

export default memo(FeaturedPartnerRotator);

'use client';

import { memo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSlide {
  id: string;
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  ctaUrl: string;
  ctaLabel: string;
  badgeText: string;
  authorName?: string | null;
  readTimeMinutes?: number | null;
}

const INTERVAL_MS = 7000;

function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback((idx: number, dir: 'next' | 'prev' = 'next') => {
    if (animating || idx === active) return;
    void dir;
    setAnimating(true);
    setTimeout(() => {
      setActive(idx);
      setAnimating(false);
    }, 300);
  }, [active, animating]);

  const next = useCallback(() => goTo((active + 1) % slides.length, 'next'), [active, goTo, slides.length]);
  const prev = useCallback(() => goTo((active - 1 + slides.length) % slides.length, 'prev'), [active, goTo, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(next, INTERVAL_MS);
    return () => clearInterval(t);
  }, [next, slides.length]);

  const s = slides[active];

  return (
    <div className="relative bg-[#0D1B2A] min-h-[340px] sm:min-h-[420px] md:min-h-[500px]">
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B2A]/95 via-[#0F2239]/80 to-black/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Premium SVG noise grain — Stripe/Linear/Vercel style */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.12] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <filter id="hero-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-noise)" />
      </svg>

      {/* Decorative glow */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 right-10 sm:top-20 sm:right-20 w-60 sm:w-96 h-60 sm:h-96 bg-brand rounded-full blur-[100px] sm:blur-[120px]" />
        <div className="absolute bottom-5 left-5 w-40 sm:w-64 h-40 sm:h-64 bg-brand-300 rounded-full blur-[80px] sm:blur-[100px]" />
      </div>

      {/* Slide content */}
      <Link href={s.ctaUrl} className="group block absolute inset-0 z-10">
        <div
          className="w-full h-full flex items-end transition-opacity duration-300"
          style={{ opacity: animating ? 0 : 1 }}
        >
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-20 md:pb-24 pt-32 sm:pt-20">
            <div className="max-w-3xl">
              {/* Premium eyebrow */}
              <div className="flex items-center gap-3 mb-4 sm:mb-5">
                <div className="h-px w-8 bg-brand/60" />
                <span className="text-brand/80 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] font-jakarta">
                  India AI · Cover Story
                </span>
              </div>

              {/* Title */}
              <h1 className="font-sora font-extrabold text-[22px] leading-[1.2] sm:text-3xl md:text-[42px] md:leading-[1.15] text-white group-hover:text-brand-200 transition-colors duration-300">
                {s.title}
              </h1>

              {/* Excerpt */}
              {s.excerpt && (
                <p className="text-gray-300 text-sm sm:text-base md:text-lg font-jakarta leading-relaxed max-w-2xl mt-3 sm:mt-5 line-clamp-4 sm:line-clamp-3">
                  {s.excerpt}
                </p>
              )}

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 font-jakarta mt-4 sm:mt-6">
                {s.authorName && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-brand/30 flex items-center justify-center text-[10px] text-brand font-bold">
                        {s.authorName.charAt(0)}
                      </div>
                      <span className="text-gray-300 font-medium">{s.authorName}</span>
                    </div>
                    <span className="text-gray-600">·</span>
                  </>
                )}
                {s.readTimeMinutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                    {s.readTimeMinutes} min read
                  </span>
                )}
                {/* CTA pill */}
                <span className="ml-auto sm:ml-0 inline-flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors border border-red-500/30">
                  {s.ctaLabel} →
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* ── Speaking Parrot ── */}
      <div
        className="hidden lg:block absolute z-30 select-none pointer-events-none bottom-12"
        style={{ right: '12rem', opacity: animating ? 0 : 1, transition: 'opacity 0.3s' }}
      >
        {/* Desktop size */}
        <svg
          viewBox="0 0 300 260"
          width="380"
          height="360"
          xmlns="http://www.w3.org/2000/svg"
          overflow="visible"
          style={{ filter: 'drop-shadow(0 4px 24px rgba(74,222,128,0.3))' }}
        >
          {/* Parrot body */}
          {/* Tail */}
          <ellipse cx="258" cy="182" rx="14" ry="5.5" fill="#1a6b3a" transform="rotate(30 258 182)" opacity="0.9"/>
          <ellipse cx="264" cy="187" rx="13" ry="5" fill="#22c55e" transform="rotate(42 264 187)" opacity="0.8"/>
          <ellipse cx="252" cy="185" rx="12" ry="4.5" fill="#16a34a" transform="rotate(18 252 185)" opacity="0.85"/>
          {/* Body */}
          <ellipse cx="232" cy="158" rx="32" ry="38" fill="#16a34a"/>
          <ellipse cx="222" cy="164" rx="18" ry="24" fill="#4ade80" opacity="0.45"/>
          {/* Wing */}
          <ellipse cx="244" cy="152" rx="20" ry="13" fill="#15803d" transform="rotate(-15 244 152)"/>
          <ellipse cx="244" cy="152" rx="14" ry="9" fill="#22c55e" transform="rotate(-15 244 152)" opacity="0.55"/>
          {/* Neck */}
          <ellipse cx="214" cy="128" rx="16" ry="19" fill="#16a34a"/>
          {/* Head */}
          <circle cx="204" cy="108" r="26" fill="#22c55e"/>
          {/* Crest */}
          <ellipse cx="198" cy="84" rx="6" ry="13" fill="#4ade80" transform="rotate(-20 198 84)"/>
          <ellipse cx="208" cy="81" rx="5" ry="11" fill="#86efac" transform="rotate(-8 208 81)"/>
          <ellipse cx="190" cy="88" rx="4.5" ry="10" fill="#16a34a" transform="rotate(-32 190 88)"/>
          {/* Eye */}
          <circle cx="193" cy="104" r="8" fill="white"/>
          <circle cx="191" cy="104" r="5.5" fill="#1e3a5f"/>
          <circle cx="190" cy="103" r="3" fill="#0a0a0a"/>
          <circle cx="192" cy="101.5" r="1.2" fill="white"/>
          {/* Cheek */}
          <ellipse cx="184" cy="112" rx="7" ry="5" fill="#fbbf24" opacity="0.65"/>
          {/* Beak upper */}
          <path d="M182 108 Q142 114 144 120 Q152 124 178 118 Z" fill="#f59e0b"/>
          {/* Beak lower — SMIL open/close */}
          <path d="M182 116 Q144 120 146 126 Q154 128 178 120 Z" fill="#d97706">
            <animateTransform attributeName="transform" type="rotate" values="0 163 118;12 163 118;0 163 118" keyTimes="0;0.5;1" dur="0.5s" repeatCount="indefinite"/>
          </path>
          {/* Feet */}
          <line x1="218" y1="192" x2="212" y2="208" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round"/>
          <line x1="232" y1="194" x2="226" y2="210" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round"/>
          <line x1="212" y1="208" x2="202" y2="211" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="226" y1="210" x2="216" y2="213" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"/>

          {/* Flying "Breaking!" words — pure SMIL, no CSS needed */}
          {([
            { begin: '0s' },
            { begin: '0.8s' },
            { begin: '1.6s' },
            { begin: '2.4s' },
            { begin: '3.2s' },
          ] as { begin: string }[]).map((w, i) => (
            <text key={i} fill="#ff4444" fontSize="14" fontWeight="bold" fontFamily="Arial, sans-serif" textAnchor="middle" opacity="0">
              Breaking!
              <animateTransform attributeName="transform" type="translate" values="160,115; 110,85; 60,55; 10,25" keyTimes="0;0.33;0.66;1" dur="2s" begin={w.begin} repeatCount="indefinite" additive="replace"/>
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.7;1" dur="2s" begin={w.begin} repeatCount="indefinite"/>
              <animate attributeName="font-size" values="8;14;16;18" keyTimes="0;0.33;0.66;1" dur="2s" begin={w.begin} repeatCount="indefinite"/>
            </text>
          ))}

          {/* BREAKING NEWS label */}
          <text x="218" y="228" textAnchor="middle" fill="#4ade80" fillOpacity="0.5" fontSize="8" fontWeight="bold" fontFamily="Arial, sans-serif" letterSpacing="2">BREAKING NEWS</text>
        </svg>
        {/* end desktop svg */}
      </div>

      {/* Controls — only if multiple slides */}
      {slides.length > 1 && (
        <>
          {/* Bottom bar: arrows + dots together — 44px touch targets */}
          <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-2 px-4">
            <button
              onClick={(e) => { e.preventDefault(); prev(); }}
              className="w-11 h-11 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center transition-colors shrink-0"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            <div className="flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); goTo(i, i > active ? 'next' : 'prev'); }}
                  className={`rounded-full transition-all duration-300 ${
                    i === active ? 'w-5 h-2 bg-brand' : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                  }`}
                  style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}
                  aria-label={`Slide ${i + 1}`}
                >
                  <span className={`rounded-full transition-all duration-300 block ${
                    i === active ? 'w-5 h-2 bg-brand' : 'w-2 h-2 bg-white/30'
                  }`} />
                </button>
              ))}
            </div>

            <button
              onClick={(e) => { e.preventDefault(); next(); }}
              className="w-11 h-11 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center transition-colors shrink-0"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5 z-20">
            <div
              key={active}
              className="h-full bg-brand/70 origin-left"
              style={{ animation: `hero-progress ${INTERVAL_MS}ms linear forwards` }}
            />
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes hero-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}

export default memo(HeroCarousel);

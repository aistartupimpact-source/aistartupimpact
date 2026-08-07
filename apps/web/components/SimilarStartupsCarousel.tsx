'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Building2, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

interface SimilarStartup {
  name: string;
  slug: string;
  tagline: string;
  logoUrl?: string | null;
  stage?: string;
  headquartersCity?: string;
  category?: string;
  businessType?: string;
  matchReason?: string;
}

interface Props {
  startups: SimilarStartup[];
}

const STAGE_LABELS: Record<string, string> = {
  BOOTSTRAPPED: 'Bootstrapped',
  IDEA: 'Idea',
  PRE_SEED: 'Pre-Seed',
  SEED: 'Seed',
  PRE_SERIES_A: 'Pre-Series A',
  SERIES_A: 'Series A',
  SERIES_B: 'Series B',
  SERIES_C: 'Series C',
  GROWTH: 'Growth',
  PUBLIC: 'Public',
};

export default function SimilarStartupsCarousel({ startups }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!startups?.length) return null;

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const cardWidth = 220;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -cardWidth * 2 : cardWidth * 2, behavior: 'smooth' });
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-sora font-bold text-xl text-navy dark:text-white">Similar Startups</h2>
          <p className="text-xs text-gray-400 font-jakarta mt-0.5">Based on sector, stage, and location</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-brand hover:text-brand transition-colors text-gray-500"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-brand hover:text-brand transition-colors text-gray-500"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {startups.map((s) => (
          <Link
            key={s.slug}
            href={`/startups/${s.slug}`}
            style={{ scrollSnapAlign: 'start', minWidth: '210px', maxWidth: '210px' }}
            className="group flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 hover:border-brand/40 hover:shadow-lg transition-all duration-200 shrink-0"
          >
            {/* Logo */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand/10 to-gray-100 dark:from-brand/20 dark:to-gray-800 flex items-center justify-center overflow-hidden mb-3 shrink-0">
              {s.logoUrl ? (
                <Image src={s.logoUrl} alt={s.name} className="w-10 h-10 object-contain" width={40} height={40} sizes="40px" />
              ) : (
                <Building2 className="w-6 h-6 text-brand" />
              )}
            </div>

            {/* Name + tagline */}
            <h3 className="font-sora font-bold text-sm text-navy dark:text-white group-hover:text-brand transition-colors line-clamp-1 mb-1">
              {s.name}
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-jakarta leading-relaxed line-clamp-2 flex-1 mb-3">
              {s.tagline}
            </p>

            {/* Meta */}
            <div className="space-y-1.5 mt-auto">
              {s.headquartersCity && (
                <span className="flex items-center gap-1 text-[10px] text-gray-400 font-jakarta">
                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                  {s.headquartersCity}
                </span>
              )}
              <div className="flex items-center gap-1.5 flex-wrap">
                {s.stage && (
                  <span className="text-[9px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-full uppercase">
                    {STAGE_LABELS[s.stage] || s.stage}
                  </span>
                )}
                {s.matchReason && (
                  <span className="text-[9px] font-bold bg-brand/10 text-brand px-1.5 py-0.5 rounded-full">
                    {s.matchReason}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

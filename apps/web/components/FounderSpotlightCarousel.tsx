'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Users, Clock } from 'lucide-react';

interface SpotlightItem {
  slug: string;
  title: string;
  excerpt?: string;
  author?: { name: string };
  readTimeMinutes?: number;
  publishedAt?: string;
  thumbnailImage?: string;
  coverImage?: string;
  category?: { name: string };
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function FounderSpotlightCarousel({ items }: { items: SpotlightItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* Scroll buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors hidden sm:flex"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors hidden sm:flex"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      </button>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/stories/${item.slug}`}
            className="group shrink-0 w-[280px] sm:w-[320px]"
          >
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-lg hover:border-brand/30 transition-all duration-300 h-full flex flex-col">
              {/* Cover image */}
              <div className="relative h-44 bg-gradient-to-br from-brand/10 to-gray-100 dark:from-brand/20 dark:to-gray-800 overflow-hidden shrink-0">
                {(item.thumbnailImage || item.coverImage) ? (
                  <Image
                    src={item.thumbnailImage || item.coverImage!}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center">
                      <Users className="w-7 h-7 text-brand/50" />
                    </div>
                  </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                {/* Badge */}
                <div className="absolute bottom-3 left-3">
                  <span className="bg-brand text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                    {item.category?.name || 'Founder Spotlight'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-sora font-bold text-sm text-gray-900 dark:text-white leading-snug group-hover:text-brand transition-colors line-clamp-3 flex-1">
                  {item.title}
                </h3>
                {item.excerpt && (
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-jakarta leading-relaxed mt-2 line-clamp-2">
                    {item.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 font-jakarta">
                  {item.author?.name && (
                    <>
                      <div className="w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center text-[9px] text-brand font-bold shrink-0">
                        {item.author.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-500 dark:text-gray-400 truncate">{item.author.name}</span>
                      <span className="text-gray-300 dark:text-gray-600">·</span>
                    </>
                  )}
                  {item.readTimeMinutes && (
                    <span className="flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {item.readTimeMinutes} min
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

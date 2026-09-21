'use client';

import dynamic from 'next/dynamic';

export const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'), { ssr: false });
export const AnnouncementBar = dynamic(() => import('@/components/layout/AnnouncementBar'), { ssr: false });
export const FeaturedPartnerRotator = dynamic(() => import('@/components/FeaturedPartnerRotator'), { ssr: false });
export const SponsorStrip = dynamic(() => import('@/components/SponsorStrip'), { ssr: false });
export const HeroCarousel = dynamic(() => import('@/components/HeroCarousel'), {
  ssr: false,
  loading: () => <div className="bg-navy-800 min-h-[340px] sm:min-h-[420px] md:min-h-[500px] animate-pulse" />,
});
export const RealIndiaMap = dynamic(() => import('@/components/india-ai/RealIndiaMap'), { ssr: false });

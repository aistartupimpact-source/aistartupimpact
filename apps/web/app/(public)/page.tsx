import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  ArrowRight, TrendingUp, Star, Users, ChevronRight,
  Sparkles, IndianRupee, Zap, Clock,
  ArrowUpRight,
} from 'lucide-react';

// ISR: revalidate every 60s — much better than force-dynamic for production
// Hero slots change infrequently; this gives CDN caching + fresh data
export const revalidate = 60;

import {
  getHeroArticleDirect as getHeroArticle,
  getLatestStoriesDirect as getLatestStories,
  getFounderSpotlightDirect as getFounderSpotlights,
  getIndiaAIEcosystemDirect as getIndiaAIEcosystem,
  getActiveCreativeForZone,
  getActiveLiveTickers,
  getFeaturedStartupDirect as getFeaturedStartup,
  getFundingDigestsDirect,
  getActiveSponsorDirect,
  getActiveHeroSlotsDirect,
  getFeaturedToolsDirect,
  getPriorityToolsDirect,
} from '@/lib/db';
import {
  getTrendingNews,
} from '@/lib/api';

// Fallbacks in a separate file — keeps this bundle lean
import {
  defaultHeroArticle,
  defaultTrendingItems,
  defaultLatestStories,
  defaultFounderSpotlights,
  defaultToolPicks,
  defaultFundingDigests,
  defaultPremiumStartup,
  defaultSponsor,
  defaultIndiaAI,
} from '@/lib/fallbacks';

// Dynamic imports for heavy client components — reduces initial JS bundle
const FeaturedPartnerRotator = dynamic(() => import('@/components/FeaturedPartnerRotator'), { ssr: false });
const HeroCarousel = dynamic(() => import('@/components/HeroCarousel'), { ssr: false });

const formatDate = (isoString: string) =>
  new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/* ═══════════════════════════════════════════════════════
   HOMEPAGE — Mobile-first + Dark/Light mode
   ═══════════════════════════════════════════════════════ */

export default async function HomePage() {
  // Fetch everything in parallel for maximum performance
  const [
    fetchedHeroArticle,
    fetchedTrending,
    fetchedLatest,
    fetchedSpotlights,
    fetchedTools,
    fetchedFundingDigests,
    fetchedFeaturedStartup,
    fetchedIndiaAI,
    heroAd,
    tickerAd,
    sectionAd,
    fetchedLiveTickers,
    fetchedSponsor,
    fetchedHeroSlots,
    fetchedFeaturedTools,
    fetchedPriorityTools,
  ] = await Promise.all([
    getHeroArticle(),
    getTrendingNews(),
    getLatestStories(8),
    getFounderSpotlights(8),
    Promise.resolve([]), // toolPicks deprecated locally
    getFundingDigestsDirect(3),
    getFeaturedStartup(),
    getIndiaAIEcosystem(4),
    getActiveCreativeForZone('H1_HERO_FEATURE'),
    getActiveCreativeForZone('H2_TRENDING_STRIP'),
    getActiveCreativeForZone('H3_SECTION_SPONSOR'),
    getActiveLiveTickers(),
    getActiveSponsorDirect(),
    getActiveHeroSlotsDirect(),
    getFeaturedToolsDirect(),
    getPriorityToolsDirect(12),
  ]);

  // Use fetched data, but provide elegant fallbacks if DB is empty or backend is unreachable
  const heroArticle = fetchedHeroArticle || defaultHeroArticle;
  const trendingItems = fetchedLiveTickers?.length > 0 ? fetchedLiveTickers : (fetchedTrending?.length > 0 ? fetchedTrending : defaultTrendingItems);
  const latestStories = fetchedLatest?.length > 0 ? fetchedLatest : defaultLatestStories;
  const founderSpotlights = (fetchedSpotlights && fetchedSpotlights.length > 0) ? fetchedSpotlights : defaultFounderSpotlights;
  const toolPicks = fetchedPriorityTools?.length > 0 ? fetchedPriorityTools : defaultToolPicks;
  const fundingDigests = fetchedFundingDigests?.length > 0 ? fetchedFundingDigests : defaultFundingDigests;
  const premiumStartups = (fetchedFeaturedStartup && fetchedFeaturedStartup.length > 0) ? fetchedFeaturedStartup : defaultPremiumStartup;

  // Merge premium startups and featured tools into one slider
  const featuredPartnersList = [
    ...(fetchedFeaturedTools?.length > 0 ? fetchedFeaturedTools.map((t: any) => ({
      name: t.name,
      tagline: t.tagline,
      description: t.description,
      ctaUrl: `/tools/${t.slug}`,
      logoUrl: t.logoUrl,
      statValue: t.avgRating ? `${t.avgRating}` : null,
      statLabel: t.avgRating ? 'Rating' : null,
    })) : []),
    ...premiumStartups
  ];
  const indiaAI = fetchedIndiaAI?.length > 0 ? fetchedIndiaAI : defaultIndiaAI;
  const activeSponsor = fetchedSponsor || defaultSponsor;
  // Hero: scheduled slots take priority, fallback to heroAd or featured article as a single slide
  const heroSlides = (fetchedHeroSlots && fetchedHeroSlots.length > 0)
    ? fetchedHeroSlots
    : heroAd
      ? [{
        id: 'hero-ad',
        title: heroAd.headline,
        excerpt: heroAd.bodyText,
        coverImage: heroAd.imageUrl ?? null,
        ctaUrl: heroAd.ctaUrl,
        ctaLabel: heroAd.ctaText || 'Learn More',
        badgeText: `★ Sponsored · ${heroAd.companyName}`,
        authorName: heroAd.companyName,
        readTimeMinutes: null,
      }]
      : [{
        id: heroArticle.id || 'hero-article',
        title: heroArticle.title,
        excerpt: heroArticle.excerpt ?? null,
        coverImage: heroArticle.coverImage ?? null,
        ctaUrl: heroArticle.type === 'STORY' ? `/stories/${heroArticle.slug}` : `/news/${heroArticle.slug}`,
        ctaLabel: 'Read Story',
        badgeText: heroArticle.category?.name || 'Story',
        authorName: heroArticle.author?.name ?? null,
        readTimeMinutes: heroArticle.readTimeMinutes ?? null,
      }];

  return (
    <>
      {/* ╔════════════════════════════════════════════╗
          ║  1. HERO — Scheduled Carousel / Ad / Article║
          ╚════════════════════════════════════════════╝ */}
      <div className="bg-[#08111B] text-center pt-3 pb-2 border-b border-white/5 px-4">
        <h1 className="text-[9px] sm:text-[10px] text-gray-500 font-jakarta font-medium tracking-[0.2em] uppercase truncate max-w-full">
          AI Startup Impact — #1 AI Startup India News, AI Ecosystem, and Tools
        </h1>
      </div>
      <section>
        <HeroCarousel slides={heroSlides} />
      </section>

      {/* ╔════════════════════════════════════════════╗
          ║  2. TRENDING TICKER — Live Strip            ║
          ╚════════════════════════════════════════════╝ */}
      <section className="bg-[#08111B] dark:bg-gray-900 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 sm:gap-4 h-10 sm:h-11 overflow-hidden">
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-brand" />
              </span>
              <span className="text-brand text-[9px] sm:text-[10px] font-bold uppercase tracking-wider font-sora">Live</span>
            </div>
            <div className="overflow-hidden flex-1">
              <div className="animate-ticker whitespace-nowrap flex gap-8 sm:gap-12">
                {tickerAd && (
                  <a href={tickerAd.ctaUrl} target="_blank" rel="noopener noreferrer"
                    className="text-brand text-xs sm:text-sm font-jakarta font-semibold inline-flex items-center gap-2 sm:gap-3 hover:underline">
                    <span className="text-yellow-400 font-bold">★ Sponsored</span>
                    {tickerAd.headline}
                  </a>
                )}
                {trendingItems.map((item: any, i: number) => (
                  <span key={i} className="text-gray-300 text-xs sm:text-sm font-jakarta inline-flex items-center gap-2 sm:gap-3">
                    <span className="text-brand font-bold">•</span>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ╔════════════════════════════════════════════╗
          ║  3. LATEST STORIES — Exact Grid Design     ║
          ╚════════════════════════════════════════════╝ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 cv-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="font-sora font-bold text-xl sm:text-2xl text-gray-900 dark:text-white">Latest Stories</h2>
          </div>
          <Link href="/news" className="text-red-500 hover:text-red-600 font-medium text-xs sm:text-sm flex items-center gap-1 font-jakarta">
            View All →
          </Link>
        </div>

        {/* Seamless Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          {latestStories.slice(0, 8).map((story: any, idx: number, arr: any[]) => {
            const N = arr.length;
            const borderClass = [
              idx < N - 1 ? 'border-b border-gray-200 dark:border-gray-700' : '',
              idx >= N - (N % 2 === 0 ? 2 : 1) ? 'sm:border-b-0' : '',
              idx % 2 === 0 ? 'sm:border-r border-gray-200 dark:border-gray-700' : ''
            ].filter(Boolean).join(' ');
            return (
              <Link key={story.slug} href={`/news/${story.slug}`} className="group">
                <div className={`bg-gray-50 dark:bg-gray-900 p-5 sm:p-6 relative hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 ${borderClass} hover:border-l-4 hover:border-l-red-500`}>
                  <div className="mb-3">
                    <span className="inline-block text-xs font-bold uppercase tracking-wider text-red-500">
                      {story.category?.name || 'News'}
                    </span>
                  </div>
                  <p className="font-sora font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-tight mb-3 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                    {story.title}
                  </p>
                  {story.excerpt && (
                    <p className="text-gray-600 dark:text-gray-400 font-jakarta text-sm leading-relaxed mb-4 line-clamp-3">
                      {story.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-jakarta">
                    {story.author?.name && <><span>{story.author.name}</span><span>·</span></>}
                    <span>{formatDate(story.publishedAt)}</span>
                    {story.readTimeMinutes && <><span>·</span><span>{story.readTimeMinutes} min read</span></>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ╔════════════════════════════════════════════╗
          ║  4. SPONSOR STRIP — Native Ad               ║
          ╚════════════════════════════════════════════╝ */}
      <section className="border-y border-brand/10 dark:border-brand/5 bg-brand/[0.02] dark:bg-brand/[0.03]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {sectionAd ? (
            <a href={sectionAd.ctaUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-3.5 group">
              <span className="text-[10px] sm:text-xs text-gray-400 font-jakarta uppercase tracking-wider">Sponsored</span>
              <span className="font-sora font-bold text-brand text-xs sm:text-sm group-hover:underline">{sectionAd.companyName}</span>
              <span className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm font-jakarta hidden sm:inline">— {sectionAd.headline}</span>
              <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ) : (
            <a href={activeSponsor.ctaUrl} className="flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-3.5 group">
              <span className="text-[10px] sm:text-xs text-gray-400 font-jakarta uppercase tracking-wider">Powered by</span>
              <span className="font-sora font-bold text-brand text-xs sm:text-sm group-hover:underline">{activeSponsor.brand}</span>
              <span className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm font-jakarta hidden sm:inline">— {activeSponsor.tagline}</span>
              <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          )}
        </div>
      </section>

      {/* ╔════════════════════════════════════════════╗
          ║  5. FOUNDER SPOTLIGHT — Premium Grid        ║
          ╚════════════════════════════════════════════╝ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 cv-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <h2 className="font-sora font-bold text-xl sm:text-2xl text-gray-900 dark:text-white">Founder Spotlight</h2>
            <span className="inline-flex items-center gap-1 bg-brand/10 text-brand text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-jakarta">
              <span className="w-1 h-1 rounded-full bg-brand animate-pulse" />
              Featured
            </span>
          </div>
          <Link href="/stories" className="text-brand font-semibold text-xs sm:text-sm hover:underline flex items-center gap-1 font-jakarta">
            All Stories <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Premium seamless 2-col grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
          {founderSpotlights.slice(0, 8).map((story: any, idx: number, arr: any[]) => {
            const N = arr.length;
            const borderClass = [
              idx < N - 1 ? 'border-b border-gray-200 dark:border-gray-700' : '',
              idx >= N - (N % 2 === 0 ? 2 : 1) ? 'sm:border-b-0' : '',
              idx % 2 === 0 ? 'sm:border-r border-gray-200 dark:border-gray-700' : ''
            ].filter(Boolean).join(' ');
            return (
              <Link key={story.slug} href={`/stories/${story.slug}`} className="group h-full">
                <div className={`relative bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 ${borderClass} flex flex-col h-full`}>
                  {/* Left accent bar on hover */}
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top rounded-r" />

                  {/* Thumbnail */}
                  <div className="relative h-48 sm:h-64 lg:h-72 bg-gradient-to-br from-brand/10 to-gray-100 dark:from-brand/20 dark:to-gray-800 overflow-hidden shrink-0">
                    {(story.thumbnailImage || story.coverImage) ? (
                      <Image
                        src={story.thumbnailImage || story.coverImage}
                        alt={story.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center">
                          <Users className="w-6 h-6 text-brand/40" />
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-white bg-brand px-2 py-0.5 rounded-sm">
                        Founder Story
                      </span>
                    </div>
                    {story.readTimeMinutes && (
                      <div className="absolute bottom-3 right-3">
                        <span className="flex items-center gap-1 text-[10px] text-white/80 font-jakarta bg-black/40 px-1.5 py-0.5 rounded">
                          <Clock className="w-2.5 h-2.5" />
                          {story.readTimeMinutes} min
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 sm:p-6 flex flex-col flex-1">
                    {/* Title */}
                    <p className="font-sora font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-snug mb-2.5 group-hover:text-brand transition-colors line-clamp-2">
                      {story.title}
                    </p>

                    {/* Excerpt */}
                    {story.excerpt && (
                      <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
                        {story.excerpt}
                      </p>
                    )}

                    {/* Author row */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800 mt-auto">
                      <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center text-[10px] text-brand font-bold shrink-0">
                        {story.author?.name?.charAt(0) || 'A'}
                      </div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 font-jakarta">
                        {story.author?.name || 'Editorial'}
                      </span>
                      {story.publishedAt && (
                        <>
                          <span className="text-gray-300 dark:text-gray-600">·</span>
                          <span className="text-xs text-gray-400 font-jakarta">{formatDate(story.publishedAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Tool Picks moved — see below India AI Ecosystem */}

      {/* ╔════════════════════════════════════════════╗
          ║  7. FUNDING DIGESTS — 3 Column Grid         ║
          ╚════════════════════════════════════════════╝ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 cv-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
            <h2 className="section-title">Funding Digests</h2>
          </div>
          <Link href="/funding" className="text-brand font-semibold text-sm hover:underline flex items-center gap-1 font-jakarta">
            All Digests <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Seamless grid — same style as India AI Ecosystem */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Dark header bar */}
          <div className="bg-gray-900 dark:bg-gray-800 px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand shrink-0" />
              <span className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider">Weekly Funding Rounds</span>
            </div>
            <div className="bg-gray-800 dark:bg-gray-700 px-2 sm:px-3 py-1 rounded-full shrink-0">
              <span className="text-gray-300 text-[10px] sm:text-xs font-medium uppercase tracking-wider">India AI</span>
            </div>
          </div>

          {/* 3-col seamless grid */}
          <div className="p-0 bg-gray-50 dark:bg-gray-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {fundingDigests.slice(0, 3).map((digest: any, idx: number) => {
                const borderClass = [
                  'border-b sm:border-r border-gray-200 dark:border-gray-700',
                  'border-b sm:border-b-0 sm:border-r lg:border-r border-gray-200 dark:border-gray-700',
                  '',
                ][idx] || '';
                return (
                  <Link key={digest.slug} href="/funding" className={`group ${borderClass}`}>
                    <div className="bg-gray-50 dark:bg-gray-800 p-5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 h-full flex flex-col gap-3">
                      {/* Date + badge */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-jakarta">
                          {formatDate(digest.date)}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                          <TrendingUp className="w-2.5 h-2.5" />
                          Weekly
                        </span>
                      </div>

                      {/* Total raised — hero number */}
                      <div>
                        <div className="font-sora font-extrabold text-2xl text-brand leading-none">
                          {digest.totalRaised}
                        </div>
                        <div className="text-xs text-gray-400 font-jakarta mt-0.5">
                          raised across {digest.dealsCount} {digest.dealsCount === 1 ? 'deal' : 'deals'}
                        </div>
                      </div>

                      {/* Title — cleaned up, no "Week X:" prefix */}
                      <p className="font-sora font-semibold text-sm text-gray-900 dark:text-white leading-snug group-hover:text-brand transition-colors line-clamp-2 flex-1">
                        {digest.title.replace(/^Week\s+\d+:\s*/i, '')}
                      </p>

                      {/* Top deals preview */}
                      {digest.deals?.slice(0, 2).map((deal: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-xs font-jakarta border-t border-gray-200 dark:border-gray-700 pt-2">
                          <span className="text-gray-600 dark:text-gray-300 font-medium truncate">{deal.startup}</span>
                          <span className="text-brand font-bold shrink-0 ml-2">{deal.amount}</span>
                        </div>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ╔════════════════════════════════════════════╗
          ║  8. PREMIUM FEATURED PARTNER ROTATOR        ║
          ╚════════════════════════════════════════════╝ */}
      {featuredPartnersList.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 mt-8">
          <FeaturedPartnerRotator partners={featuredPartnersList} />
        </section>
      )}

      {/* ╔════════════════════════════════════════════╗
          ║  9. INDIA AI ECOSYSTEM — Redesigned        ║
          ╚════════════════════════════════════════════╝ */}
      <section className="py-8 sm:py-12 cv-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="font-sora font-bold text-xl sm:text-2xl text-gray-900 dark:text-white">India AI Ecosystem</h2>
            </div>
            <Link href="/startups" className="text-red-500 hover:text-red-600 font-medium text-xs sm:text-sm flex items-center gap-1 font-jakarta">
              Explore →
            </Link>
          </div>

          {/* Main Container with Dark Header */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Dark Header */}
            <div className="bg-gray-900 dark:bg-gray-800 px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <span className="text-xl sm:text-2xl shrink-0">🇮🇳</span>
                <div className="min-w-0">
                  <span className="text-red-500 font-bold text-xs sm:text-sm uppercase tracking-wider">MADE IN</span>
                  <span className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider ml-1">INDIA</span>
                  <span className="text-gray-400 font-medium text-xs sm:text-sm ml-2 hidden sm:inline">— AI ECOSYSTEM</span>
                </div>
              </div>
              <div className="bg-gray-800 dark:bg-gray-700 px-2 sm:px-3 py-1 rounded-full shrink-0">
                <span className="text-gray-300 text-[10px] sm:text-xs font-medium uppercase tracking-wider">INDIA-FIRST</span>
              </div>
            </div>

            {/* Content Grid - No Gaps */}
            <div className="p-0 bg-gray-50 dark:bg-gray-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {indiaAI.slice(0, 4).map((item: any, idx: number) => {
                  const borderClass = [
                    'border-b sm:border-r border-gray-200 dark:border-gray-700',
                    'border-b sm:border-b-0 sm:border-r lg:border-r border-gray-200 dark:border-gray-700',
                    'border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-700',
                    '',
                  ][idx] || '';
                  return (
                    <Link key={item.slug} href={`/news/${item.slug}`} className={`group cursor-pointer ${borderClass}`}>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300">
                        <div className="mb-3">
                          <span className="inline-block text-xs font-bold uppercase tracking-wider text-red-500">
                            {item.category?.name || 'Ecosystem'}
                          </span>
                        </div>
                        <p className="font-sora font-bold text-sm text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-red-500 transition-colors">
                          {item.title}
                        </p>
                        <span className="text-xs text-gray-400 font-jakarta">
                          {formatDate(item.publishedAt)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ╔════════════════════════════════════════════╗
          ║  10. AI TOOL PICKS — Seamless Grid          ║
          ╚════════════════════════════════════════════╝ */}
      <section className="py-8 sm:py-12 cv-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
              <h2 className="font-sora font-bold text-xl sm:text-2xl text-gray-900 dark:text-white">AI Tool Picks</h2>
            </div>
            <Link href="/tools" className="text-brand font-semibold text-xs sm:text-sm hover:underline flex items-center gap-1 font-jakarta">
              Browse All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Dark header */}
            <div className="bg-gray-900 dark:bg-gray-800 px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-brand shrink-0" />
                <span className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider">Top Rated AI Tools</span>
              </div>
              <div className="bg-gray-800 dark:bg-gray-700 px-2 sm:px-3 py-1 rounded-full shrink-0">
                <span className="text-gray-300 text-[10px] sm:text-xs font-medium uppercase tracking-wider">Editor Picks</span>
              </div>
            </div>

            {/* 4-col seamless grid, 2 rows */}
            <div className="p-0 bg-gray-50 dark:bg-gray-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {toolPicks.map((tool: any, idx: number, arr: any[]) => {
                  const N = arr.length;
                  const isMobileLast = idx === N - 1;
                  const isTabletLastRow = idx >= N - 2;
                  const isDesktopLastRow = idx >= N - 4;

                  const isTabletRightEdge = idx % 2 === 1;
                  const isDesktopRightEdge = idx % 4 === 3;

                  const borderClass = [
                    !isMobileLast ? 'border-b border-gray-200 dark:border-gray-700' : '',
                    isTabletLastRow ? 'sm:border-b-0' : '',
                    isDesktopLastRow ? 'lg:border-b-0' : 'lg:border-b border-gray-200 dark:border-gray-700',
                    !isTabletRightEdge ? 'sm:border-r border-gray-200 dark:border-gray-700' : 'sm:border-r-0',
                    !isDesktopRightEdge ? 'lg:border-r border-gray-200 dark:border-gray-700' : 'lg:border-r-0'
                  ].filter(Boolean).join(' ');
                  return (
                    <Link key={tool.slug} href={`/tools/${tool.slug}`} className={`group ${borderClass}`}>
                      <div className="bg-gray-50 dark:bg-gray-800 p-5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 h-full flex flex-col">
                        {/* Top row: icon + rating */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="relative w-10 h-10 rounded-xl bg-brand/10 dark:bg-brand/20 flex items-center justify-center shrink-0 overflow-hidden">
                            {tool.logoUrl ? (
                              <Image src={tool.logoUrl} alt={tool.name} fill sizes="40px" className="object-cover" />
                            ) : (
                              <Image src={`https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=random&color=fff&size=150`} alt={tool.name} fill sizes="40px" className="object-cover" />
                            )}
                          </div>
                          {tool.avgRating && (
                            <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-0.5 rounded-full">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">{tool.avgRating}</span>
                            </div>
                          )}
                        </div>
                        {/* Name */}
                        <p className="font-sora font-bold text-sm text-gray-900 dark:text-white leading-tight mb-1.5 group-hover:text-brand transition-colors">
                          {tool.name}
                        </p>
                        {/* Tagline */}
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-jakarta leading-relaxed flex-1 line-clamp-2">
                          {tool.tagline}
                        </p>
                        {/* Category */}
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand">{tool.category?.name || 'Tool'}</span>
                          <span className="text-brand text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            View <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ╔════════════════════════════════════════════╗
          ║  11. EXPLORE SITE (INTERNAL LINKS)         ║
          ╚════════════════════════════════════════════╝ */}
      <section className="mt-16 mb-16 text-center">
        <h2 className="text-xl font-sora font-semibold mb-4 text-gray-900 dark:text-white">
          Explore AIStartupImpact
        </h2>

        <div className="flex flex-col gap-3 font-jakarta">
          <Link href="/news" className="text-brand hover:underline font-medium tracking-wide">
            Read latest AI startup news →
          </Link>
          <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-brand hover:underline transition-colors font-medium">
            Contact us for collaborations →
          </Link>
        </div>
      </section>
    </>
  );
}

import Link from 'next/link';
import {
  ArrowRight, TrendingUp, Star, Users, ChevronRight,
  Sparkles, IndianRupee, ExternalLink, Zap, Clock,
  ArrowUpRight, Play, Flag, Bookmark,
} from 'lucide-react';

import {
  getHeroArticle,
  getTrendingNews,
  getLatestStories,
  getFounderSpotlight,
  getToolPicks,
  getFundingNews,
  getFeaturedStartup,
  getIndiaAIEcosystem
} from '@/lib/api';

/* ═══════════════════════════════════════════════════════
   PREMIUM FALLBACK DATA (In case backend is offline)
   ═══════════════════════════════════════════════════════ */

const defaultHeroArticle = {
  slug: 'india-ai-revolution-2025',
  title: "India's AI Revolution: How 50 Startups Are Reshaping the Nation's Tech Landscape in 2025",
  excerpt:
    "From healthcare diagnostics to agricultural intelligence, Indian AI startups raised over $2.3 billion in 2024. Here's what's driving the momentum — and what's next for the ecosystem.",
  category: { name: 'Cover Story' },
  author: { name: 'Priya Sharma' },
  publishedAt: '2025-03-07T10:00:00Z',
  readTimeMinutes: 12,
};

const defaultTrendingItems = [
  "GPT-5 launches with advanced reasoning — what Indian developers need to know",
  "Krutrim AI raises $200M Series B to build India's foundation model",
  'Government announces ₹500Cr AI research fund for 2025-26',
];

const defaultLatestStories = [
  { slug: 's1', title: "OpenAI's GPT-5 Launch: What Indian Developers Need to Know About the New Era", category: { name: 'AI News' }, author: { name: 'Rahul Kumar' }, publishedAt: '2025-03-06T10:00:00Z', readTimeMinutes: 5 },
  { slug: 's2', title: "Ola Krutrim Raises $200M Series B to Build India's Own Foundation Model", category: { name: 'Funding' }, author: { name: 'Anjali Nair' }, publishedAt: '2025-03-05T10:00:00Z', readTimeMinutes: 4 },
  { slug: 's3', title: 'Cursor vs GitHub Copilot vs Cody: The Definitive 2025 Developer Survey Results', category: { name: 'Tools' }, author: { name: 'Vikram Patel' }, publishedAt: '2025-03-05T08:00:00Z', readTimeMinutes: 8 },
];

const sponsor = { brand: 'CloudAI Pro', tagline: 'Powering 500+ Indian AI startups with GPU compute', ctaUrl: '#' };

const defaultFounderSpotlight = {
  slug: 'medai-rural-india',
  title: 'From IIT Lab to 10,000 Villages: How MedAI is Bringing Diagnostics to Rural India',
  excerpt: 'Ravi Kumar left a ₹1.5Cr Google offer to build AI that detects tuberculosis from chest X-rays. Three years later, his tool has screened 2 million patients across rural clinics.',
  author: { name: 'Anjali Nair' },
  readTimeMinutes: 15,
};

const defaultToolPicks = [
  { slug: 'cursor-ai', name: 'Cursor', tagline: 'AI-first code editor that writes, edits, and debugs for you', category: { name: 'Dev Tools' }, avgRating: 4.8 },
  { slug: 'perplexity', name: 'Perplexity', tagline: 'AI search engine with cited sources and zero hallucinations', category: { name: 'Research' }, avgRating: 4.8 },
  { slug: 'midjourney', name: 'Midjourney', tagline: 'The gold standard for AI image generation and visual design', category: { name: 'Design' }, avgRating: 4.7 },
];

const defaultFundingNews = [
  { slug: 'f1', startup: { name: 'Sarvam AI' }, amountInr: 415000000000, roundType: 'Series A', headline: 'Sarvam AI Raises ₹415Cr Series A to Build India-First LLMs', announcedAt: '2025-03-03T10:00:00Z', leadInvestors: ['Lightspeed', 'Peak XV'] },
  { slug: 'f2', startup: { name: 'MedAI Health' }, amountInr: 83000000000, roundType: 'Seed', headline: 'MedAI Health Secures ₹83Cr Seed for AI-Powered Rural Diagnostics', announcedAt: '2025-03-01T10:00:00Z', leadInvestors: ['Sequoia Scout', 'AngelList India'] },
  { slug: 'f3', startup: { name: 'AgriBot Tech' }, amountInr: 50000000000, roundType: 'Series A', headline: 'AgriBot Tech Closes ₹50Cr Series A for AI Agriculture Solutions', announcedAt: '2025-02-28T10:00:00Z', leadInvestors: ['Omnivore', 'Accel'] },
];

const defaultPremiumStartup = { name: 'NeuralScale', tagline: 'GPU Cloud Infrastructure for Indian AI Startups', description: 'Get H100 instances at 40% lower cost with Mumbai data residency. Serving 200+ Indian AI companies.', ctaUrl: '#' };

const defaultIndiaAI = [
  { slug: 'i1', title: "India's New AI Policy Framework: What Every Startup Founder Must Know", category: { name: 'Policy' }, publishedAt: '2025-03-06T10:00:00Z' },
  { slug: 'i2', title: "Bangalore Overtakes Singapore as Asia's #2 AI Startup Hub", category: { name: 'Ecosystem' }, publishedAt: '2025-03-05T10:00:00Z' },
  { slug: 'i3', title: 'BharatGPT: The Open-Source LLM Trained on 22 Indian Languages', category: { name: 'Product' }, publishedAt: '2025-03-04T10:00:00Z' },
  { slug: 'i4', title: 'IIT System Launches Joint AI Research Initiative with ₹200Cr Budget', category: { name: 'Research' }, publishedAt: '2025-03-03T10:00:00Z' },
];

// Helper to format dates
const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Helper to format rupees clearly (from paise to Cr format)
const formatRupees = (paise: number) => {
  const cr = paise / 1000000000;
  return `₹${cr}Cr`;
};

/* ═══════════════════════════════════════════════════════
   HOMEPAGE — Mobile-first + Dark/Light mode
   ═══════════════════════════════════════════════════════ */

export default async function HomePage() {
  // Fetch everything in parallel for maximum performance
  const [
    fetchedHeroArticle,
    fetchedTrending,
    fetchedLatest,
    fetchedSpotlight,
    fetchedTools,
    fetchedFunding,
    fetchedFeaturedStartup,
    fetchedIndiaAI,
  ] = await Promise.all([
    getHeroArticle(),
    getTrendingNews(),
    getLatestStories(3),
    getFounderSpotlight(),
    getToolPicks(3),
    getFundingNews(3),
    getFeaturedStartup(),
    getIndiaAIEcosystem(4),
  ]);

  // Use fetched data, but provide elegant fallbacks if DB is empty or backend is unreachable
  const heroArticle = fetchedHeroArticle || defaultHeroArticle;
  const trendingItems = fetchedTrending?.length > 0 ? fetchedTrending : defaultTrendingItems;
  const latestStories = fetchedLatest?.length > 0 ? fetchedLatest : defaultLatestStories;
  const founderSpotlight = fetchedSpotlight || defaultFounderSpotlight;
  const toolPicks = fetchedTools?.length > 0 ? fetchedTools : defaultToolPicks;
  const fundingNews = fetchedFunding?.length > 0 ? fetchedFunding : defaultFundingNews;
  const premiumStartup = fetchedFeaturedStartup || defaultPremiumStartup;
  const indiaAI = fetchedIndiaAI?.length > 0 ? fetchedIndiaAI : defaultIndiaAI;

  return (
    <>
      {/* ╔════════════════════════════════════════════╗
          ║  1. HERO — Editorial Cover Story            ║
          ╚════════════════════════════════════════════╝ */}
      <section>
        <Link href={`/news/${heroArticle.slug}`} className="group block">
          <div className="relative overflow-hidden bg-[#0D1B2A] min-h-[340px] sm:min-h-[420px] md:min-h-[480px] flex items-end">
            {/* Decorative glows */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B2A] via-[#0F2239] to-black" />
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 right-10 sm:top-20 sm:right-20 w-60 sm:w-96 h-60 sm:h-96 bg-brand rounded-full blur-[100px] sm:blur-[120px]" />
              <div className="absolute bottom-5 left-5 sm:bottom-10 sm:left-10 w-40 sm:w-64 h-40 sm:h-64 bg-brand-300 rounded-full blur-[80px] sm:blur-[100px]" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 md:pb-16 pt-16 sm:pt-20">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-1.5 bg-brand px-2.5 py-1 rounded-sm text-white text-[11px] font-bold uppercase tracking-wider mb-4 sm:mb-5">
                  <Bookmark className="w-3 h-3" />
                  {heroArticle.category?.name || 'Story'}
                </span>
                <h1 className="font-sora font-extrabold text-[22px] leading-[1.2] sm:text-3xl md:text-[42px] md:leading-[1.15] text-white group-hover:text-brand-200 transition-colors duration-300">
                  {heroArticle.title}
                </h1>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg font-jakarta leading-relaxed max-w-2xl mt-3 sm:mt-5 line-clamp-3 sm:line-clamp-none">
                  {heroArticle.excerpt}
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 font-jakarta mt-4 sm:mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-brand/30 flex items-center justify-center text-[10px] text-brand font-bold">
                      {heroArticle.author?.name?.charAt(0) || 'A'}
                    </div>
                    <span className="text-gray-300 font-medium">{heroArticle.author?.name || 'Author'}</span>
                  </div>
                  <span className="text-gray-600">·</span>
                  <span>{formatDate(heroArticle.publishedAt || new Date().toISOString())}</span>
                  <span className="text-gray-600">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                    {heroArticle.readTimeMinutes} min read
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* ╔════════════════════════════════════════════╗
          ║  2. TRENDING TICKER — Live Strip            ║
          ╚════════════════════════════════════════════╝ */}
      <section className="bg-[#08111B] dark:bg-gray-900 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 sm:gap-4 h-10 sm:h-11 overflow-hidden">
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-brand" />
              </span>
              <span className="text-brand text-[10px] sm:text-xs font-bold uppercase tracking-wider font-sora">Live</span>
            </div>
            <div className="overflow-hidden flex-1">
              <div className="animate-ticker whitespace-nowrap flex gap-8 sm:gap-12">
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
          ║  3. LATEST STORIES — 3 Column Grid          ║
          ╚════════════════════════════════════════════╝ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="section-title">Latest Stories</h2>
          <Link href="/news" className="text-brand font-semibold text-sm hover:underline flex items-center gap-1 font-jakarta">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {latestStories.map((story: any) => (
            <Link key={story.slug} href={`/news/${story.slug}`} className="group">
              <div className="card overflow-hidden h-full">
                {/* Image placeholder */}
                <div className="aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 relative">
                  <span className="absolute top-3 left-3 badge-brand text-[10px]">{story.category?.name || 'News'}</span>
                </div>
                <div className="p-4 sm:p-5">
                  <h3 className="font-sora font-bold text-[15px] sm:text-base text-navy dark:text-white leading-snug group-hover:text-brand transition-colors line-clamp-2">
                    {story.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2.5 sm:mt-3 text-xs text-gray-400 dark:text-gray-500 font-jakarta">
                    <span className="font-medium text-gray-500 dark:text-gray-400">{story.author?.name || 'Author'}</span>
                    <span>·</span>
                    <span>{story.publishedAt ? formatDate(story.publishedAt) : 'Recently'}</span>
                    <span>·</span>
                    <span>{story.readTimeMinutes} min read</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ╔════════════════════════════════════════════╗
          ║  4. SPONSOR STRIP — Native Ad               ║
          ╚════════════════════════════════════════════╝ */}
      <section className="border-y border-brand/10 dark:border-brand/5 bg-brand/[0.02] dark:bg-brand/[0.03]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href={sponsor.ctaUrl} className="flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-3.5 group">
            <span className="text-[10px] sm:text-xs text-gray-400 font-jakarta uppercase tracking-wider">Powered by</span>
            <span className="font-sora font-bold text-brand text-xs sm:text-sm group-hover:underline">{sponsor.brand}</span>
            <span className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm font-jakarta hidden sm:inline">— {sponsor.tagline}</span>
            <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </section>

      {/* ╔════════════════════════════════════════════╗
          ║  5. FOUNDER SPOTLIGHT — Horizontal Card     ║
          ╚════════════════════════════════════════════╝ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <h2 className="section-title">Founder Spotlight</h2>
            <span className="badge-category hidden sm:inline-flex">Editorial</span>
          </div>
          <Link href="/stories" className="text-brand font-semibold text-sm hover:underline flex items-center gap-1 font-jakarta">
            All Stories <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <Link href={`/stories/${founderSpotlight.slug}`} className="group overflow-hidden">
          <div className="card overflow-hidden flex flex-col md:flex-row">
            {/* Image */}
            <div className="md:w-2/5 aspect-[16/10] md:aspect-auto bg-gradient-to-br from-brand-50 to-gray-50 dark:from-brand-900/20 dark:to-gray-900 relative min-h-[200px]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-brand/10 dark:bg-brand/20 flex items-center justify-center">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-brand/50" />
                </div>
              </div>
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
                <span className="badge-brand text-[10px]">Founder Spotlight</span>
              </div>
            </div>
            {/* Content */}
            <div className="md:w-3/5 p-5 sm:p-6 md:p-8 flex flex-col justify-center">
              <h3 className="font-sora font-extrabold text-lg sm:text-xl md:text-2xl text-navy dark:text-white leading-tight group-hover:text-brand transition-colors">
                {founderSpotlight.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm sm:text-base leading-relaxed mt-2.5 sm:mt-3 line-clamp-3">
                {founderSpotlight.excerpt}
              </p>
              <div className="flex items-center gap-2 sm:gap-3 mt-4 sm:mt-5 text-xs sm:text-sm text-gray-400 dark:text-gray-500 font-jakarta">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-brand/10 flex items-center justify-center text-[9px] sm:text-[10px] text-brand font-bold">
                    {founderSpotlight.author?.name?.charAt(0) || 'A'}
                  </div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">{founderSpotlight.author?.name || 'Anjali Nair'}</span>
                </div>
                <span>·</span>
                <span>{founderSpotlight.readTimeMinutes} min read</span>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* ╔════════════════════════════════════════════╗
          ║  6. TOOL PICKS — 3 Column Grid              ║
          ╚════════════════════════════════════════════╝ */}
      <section className="bg-gray-50/70 dark:bg-gray-900/50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
              <h2 className="section-title">AI Tool Picks</h2>
            </div>
            <Link href="/tools" className="text-brand font-semibold text-sm hover:underline flex items-center gap-1 font-jakarta">
              Browse All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {toolPicks.map((tool: any) => (
              <Link key={tool.slug} href={`/tools/${tool.slug}`} className="group block h-full">
                <div className="card p-5 sm:p-6 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/30 dark:to-brand-800/20 flex items-center justify-center">
                      <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-brand" />
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400">{tool.avgRating}</span>
                    </div>
                  </div>
                  <h3 className="font-sora font-bold text-base sm:text-lg text-navy dark:text-white group-hover:text-brand transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-jakarta mt-1.5 sm:mt-2 flex-1 leading-relaxed">
                    {tool.tagline}
                  </p>
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="badge-category text-[10px]">{tool.category?.name || 'Tool'}</span>
                    <span className="text-brand text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      View <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ╔════════════════════════════════════════════╗
          ║  7. NEWSLETTER SIGNUP — High Contrast       ║
          ╚════════════════════════════════════════════╝ */}
      <section className="bg-[#0D1B2A] dark:bg-gray-950 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-60 sm:w-80 h-60 sm:h-80 bg-brand/20 rounded-full blur-[80px] sm:blur-[100px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 text-brand text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-brand" />
              Free Weekly Newsletter
            </span>
            <h2 className="font-sora font-extrabold text-2xl sm:text-3xl md:text-4xl text-white leading-tight">
              Don&apos;t miss the <span className="text-brand">AI signal</span>
            </h2>
            <p className="text-gray-400 mt-2.5 sm:mt-3 font-jakarta text-sm sm:text-base md:text-lg max-w-lg mx-auto">
              Join 5,000+ founders, investors & engineers getting our weekly ecosystem digest every Friday.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 sm:px-5 py-3.5 bg-white/10 border border-white/15 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-brand focus:bg-white/15 font-jakarta text-sm sm:text-base transition-all min-h-[48px]"
              />
              <button className="bg-brand hover:bg-brand-600 text-white font-bold px-6 sm:px-8 py-3.5 rounded-xl font-jakarta transition-all duration-200 hover:shadow-lg hover:shadow-brand/25 shrink-0 min-h-[48px] active:scale-[0.97]">
                Subscribe
              </button>
            </div>
            <p className="text-gray-600 text-[11px] sm:text-xs font-jakarta mt-3 sm:mt-4">
              No spam. Unsubscribe anytime. Read by teams at Google, Flipkart & Zerodha.
            </p>
          </div>
        </div>
      </section>

      {/* ╔════════════════════════════════════════════╗
          ║  8. FUNDING NEWS — 3 Column Grid            ║
          ╚════════════════════════════════════════════╝ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
            <h2 className="section-title">Funding News</h2>
          </div>
          <Link href="/funding" className="text-brand font-semibold text-sm hover:underline flex items-center gap-1 font-jakarta">
            All Rounds <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {fundingNews.map((round: any) => (
            <Link key={round.slug} href={`/funding/${round.slug}`} className="group h-full">
              <div className="card p-4 sm:p-6 h-full">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 sm:px-2.5 py-1 rounded-full uppercase tracking-wider">
                    <IndianRupee className="w-3 h-3" />
                    {round.roundType}
                  </span>
                  <span className="font-sora font-extrabold text-brand text-base sm:text-lg">
                    {formatRupees(round.amountInr)}
                  </span>
                </div>
                <h3 className="font-sora font-bold text-[15px] sm:text-base text-navy dark:text-white leading-snug group-hover:text-brand transition-colors line-clamp-2">
                  {round.headline}
                </h3>
                <div className="mt-2.5 sm:mt-3 text-xs text-gray-400 dark:text-gray-500 font-jakarta">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">{round.leadInvestors?.join(', ')}</span>
                  <span className="mx-1.5">·</span>
                  <span>{formatDate(round.announcedAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ╔════════════════════════════════════════════╗
          ║  9. PREMIUM FEATURED STARTUP                ║
          ╚════════════════════════════════════════════╝ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        <div className="text-center mb-3 sm:mb-4">
          <span className="text-[10px] font-bold text-brand uppercase tracking-[0.2em] font-jakarta">Featured Partner</span>
        </div>
        <div className="group block">
          <div className="card-featured relative overflow-hidden bg-gradient-to-r from-brand-50/50 via-white to-brand-50/50 dark:from-brand-900/10 dark:via-gray-900 dark:to-brand-900/10">
            <div className="absolute -right-20 -top-20 w-48 sm:w-64 h-48 sm:h-64 bg-brand/5 rounded-full blur-[60px]" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8 p-6 sm:p-8 md:p-10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl bg-brand/10 dark:bg-brand/20 flex items-center justify-center shrink-0">
                <Zap className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-brand" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-sora font-extrabold text-lg sm:text-xl md:text-2xl text-navy dark:text-white group-hover:text-brand transition-colors">
                  {premiumStartup.name} — {premiumStartup.tagline}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm sm:text-base mt-1.5 sm:mt-2 max-w-xl mx-auto md:mx-0">
                  {premiumStartup.description}
                </p>
              </div>
              <div className="flex flex-col items-center shrink-0">
                <div className="font-sora font-extrabold text-3xl sm:text-4xl text-brand">40%</div>
                <div className="text-xs text-gray-400 font-jakarta mt-1">Lower GPU Cost</div>
                <Link href={premiumStartup.ctaUrl || '#'} className="mt-6 sm:mt-8 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-6 py-3 rounded-xl text-sm font-jakarta transition-all hover:border-white/40 flex items-center justify-center sm:inline-flex w-full sm:w-auto backdrop-blur-sm shadow-xl shadow-black/20 group-hover:bg-brand group-hover:border-brand">
                  Get Started →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ╔════════════════════════════════════════════╗
          ║  10. INDIA AI ECOSYSTEM                     ║
          ╚════════════════════════════════════════════╝ */}
      <section className="bg-gray-50/70 dark:bg-gray-900/50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <Flag className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
              <h2 className="section-title">India AI Ecosystem</h2>
              <span className="badge-brand text-[10px] hidden sm:inline-flex">UNIQUE</span>
            </div>
            <Link href="/startups" className="text-brand font-semibold text-sm hover:underline flex items-center gap-1 font-jakarta">
              Explore <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {indiaAI.map((article: any) => (
              <Link key={article.slug} href={`/news/${article.slug}`} className="group">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 border-l-4 border-l-brand hover:shadow-lg hover:border-brand/20 dark:hover:border-brand/30 transition-all duration-300 h-full">
                  <span className="badge-category inline-block mb-2.5 sm:mb-3">{article.category?.name || 'News'}</span>
                  <h3 className="font-sora font-bold text-[14px] sm:text-sm text-navy dark:text-white group-hover:text-brand transition-colors leading-snug line-clamp-3">
                    {article.title}
                  </h3>
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-jakarta mt-2.5 sm:mt-3 block">
                    {formatDate(article.publishedAt || new Date().toISOString())}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

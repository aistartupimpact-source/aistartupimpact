import Link from 'next/link';
import Image from 'next/image';
import { cache } from 'react';
import { Metadata } from 'next';
import { Star, ExternalLink, ChevronRight, Check, X as XIcon, ThumbsUp, ThumbsDown, IndianRupee, ArrowRight, Sparkles, Globe, Cpu, Smartphone } from 'lucide-react';
import { generateToolSchema } from '@/lib/seo';
import { sql } from '@/lib/db';
import EmbedBadge from '@/components/EmbedBadge';
import WriteReviewClient from '@/components/WriteReviewClient';
import ReviewHelpfulButton from '@/components/ReviewHelpfulButton';
import ScreenshotGallery from '@/components/ScreenshotGallery';
import BookmarkButton from '@/components/BookmarkButton';
import { ToolCTAButton } from '@/components/tools/ToolCTAButton';
import UpvoteButton from '@/components/tools/UpvoteButton';
import { getAiToolBySlugDirect, getSimilarToolsDirect, getToolTagsGroupedDirect, getToolProsConsDirect, getToolAlternativesDirect, getReviewResponsesDirect } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ToolSchema, FAQSchema } from '@/components/seo';
import { generateToolFAQs } from '@/lib/seo-utils';
import FAQSection from '@/components/FAQSection';
import SimilarTools from '@/components/tools/SimilarTools';
import SimilarToolsCarousel from '@/components/tools/SimilarToolsCarousel';

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const { sql } = await import('@/lib/db');
    const rows = await sql`
      SELECT slug FROM "AiTool"
      WHERE status = 'APPROVED' AND "deletedAt" IS NULL
      ORDER BY "upvoteCount" DESC NULLS LAST
      LIMIT 200
    `;
    return rows.map((r: any) => ({ slug: r.slug }));
  } catch {
    return [];
  }
}

const getToolCached = cache((slug: string) => getAiToolBySlugDirect(slug));

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tool = await getToolCached(params.slug) as any;
  if (!tool) return { title: 'Tool Not Found' };
  
  const title = `${tool.name} - ${tool.tagline} | AI Startup Impact`;
  const description = (tool.description || tool.tagline || '').slice(0, 155);
  const url = `https://aistartupimpact.com/tools/${tool.slug}`;
  
  // Use dynamic OG image (auto-generated from opengraph-image.tsx)
  const image = `${url}/opengraph-image`;

  return {
    title,
    description,
    keywords: [
      tool.name,
      tool.tagline,
      'AI tool',
      tool.categoryName || tool.category,
      tool.pricingModel,
      'artificial intelligence',
      'machine learning',
      'AI software'
    ].filter(Boolean).join(', '),
    creator: tool.name,
    publisher: 'AI Startup Impact',
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'AI Startup Impact',
      images: [{
        url: image,
        width: 1200,
        height: 630,
        alt: `${tool.name} - ${tool.tagline}`
      }],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@aistartupimpact',
      site: '@aistartupimpact',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

function getEmbedUrl(url: string): string {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  // Loom
  const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (loomMatch) return `https://www.loom.com/embed/${loomMatch[1]}`;
  // Fallback: return as-is (user might have pasted embed URL directly)
  return url;
}

export default async function ToolDetailPage({ params }: { params: { slug: string } }) {
  const tool = await getToolCached(params.slug) as any;

  if (!tool) {
    try {
      const redirectCheck = await sql`
        SELECT slug FROM "AiTool"
        WHERE ${params.slug} = ANY("previousSlugs") AND "deletedAt" IS NULL
        LIMIT 1
      `;
      if (redirectCheck.length > 0) {
        const { redirect } = await import('next/navigation');
        redirect(`/tools/${(redirectCheck[0] as any).slug}`);
      }
    } catch (e: any) {
      if (e?.digest?.startsWith('NEXT_REDIRECT')) throw e;
    }
    notFound();
  }

  const stories = tool.stories || [];
  const fundingRounds = tool.fundingRounds || [];
  const userReviews = tool.userReviews || [];

  // Fetch all supplementary data in parallel
  const [similarTools, toolTags, prosConsData, toolAlternatives, reviewResponses] = await Promise.all([
    tool.categoryId ? getSimilarToolsDirect(tool.categoryId, tool.slug, 8) : Promise.resolve([]),
    getToolTagsGroupedDirect(tool.id),
    getToolProsConsDirect(tool.id),
    getToolAlternativesDirect(tool.id),
    getReviewResponsesDirect(tool.id),
  ]);

  const toolPros = (prosConsData.pros as any[]) || [];
  const toolCons = (prosConsData.cons as any[]) || [];
  
  // Generate FAQs with tool-specific data
  const faqs = generateToolFAQs(tool);

  const formatAmount = (usd: number | null, inr: number | null) => {
    if (usd && Number(usd) > 0) {
      const u = Number(usd) / 100;
      if (u >= 1e9) return `$${(u / 1e9).toFixed(1)}B`;
      if (u >= 1e6) return `$${(u / 1e6).toFixed(0)}M`;
    }
    if (inr && Number(inr) > 0) return `₹${(Number(inr) / 10000000).toFixed(1)}Cr`;
    return 'Undisclosed';
  };

  const jsonLd = generateToolSchema({
    name: tool.name,
    description: tool.description || '',
    url: tool.websiteUrl,
    rating: tool.avgRating || 0,
    reviewCount: userReviews.length,
    category: tool.categoryName || tool.category || '',
    pricing: tool.pricingModel || '',
  });

  const pricingLabel: Record<string, string> = {
    FREE: 'Free', FREEMIUM: 'Freemium', PAID: 'Paid',
    OPEN_SOURCE: 'Open Source', ENTERPRISE: 'Enterprise', SUBSCRIPTION: 'Subscription',
  };

  return (
    <div className="max-w-7xl mx-auto px-0 sm:px-2 lg:px-4 py-6 sm:py-10">
      {/* JSON-LD Schema: Single @graph with WebPage + SoftwareApplication + BreadcrumbList */}
      <ToolSchema tool={tool} />
      
      {/* FAQ Schema (separate) */}
      <FAQSchema faqs={faqs} />
      
      {/* Legacy schema for backward compatibility */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs sm:text-sm font-jakarta text-gray-400 mb-6">
        <Link href="/" className="hover:text-brand">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/tools" className="hover:text-brand">Tools</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600 dark:text-gray-300">{tool.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700/50">
          <Image
            src={tool.logoUrl || `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${tool.websiteUrl}&size=128`}
            alt={tool.name}
            width={56}
            height={56}
            className="w-14 h-14 object-contain"
          />
        </div>
        <div className="flex-1">
          <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-navy dark:text-white">{tool.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm sm:text-base mt-1">{tool.tagline}</p>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            {tool.avgRating && (
              <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-2.5 py-1 rounded-full">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-yellow-700 dark:text-yellow-400">{tool.avgRating}</span>
                {userReviews.length > 0 && <span className="text-xs text-gray-400 ml-1">({userReviews.length} reviews)</span>}
              </div>
            )}
            {(tool.upvoteCount || 0) >= 5 && (
              <span className="text-[10px] font-bold bg-brand/10 text-brand px-2.5 py-1 rounded-full">
                {tool.upvoteCount} upvotes
              </span>
            )}
            {tool.categoryName && <span className="badge-category">{tool.categoryName}</span>}
            {tool.pricingModel && (
              <span className="text-[10px] font-bold bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-2.5 py-1 rounded-full uppercase">
                {pricingLabel[tool.pricingModel] || tool.pricingModel}
              </span>
            )}
            {tool.hasApi && (
              <span className="flex items-center gap-1 text-[10px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full">
                <Cpu className="w-3 h-3" /> API
              </span>
            )}
            {tool.hasMobileApp && (
              <span className="flex items-center gap-1 text-[10px] font-bold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full">
                <Smartphone className="w-3 h-3" /> Mobile App
              </span>
            )}
            {tool.freeTrialDays && tool.freeTrialDays > 0 && (
              <span className="text-[10px] font-bold bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 px-2.5 py-1 rounded-full">
                {tool.freeTrialDays}-Day Free Trial
              </span>
            )}
            {tool.isUrlVerified && (
              <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                <Check className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <ToolCTAButton
              toolId={tool.id}
              toolName={tool.name}
              source="TOOL_DETAIL"
              variant="primary"
              className="text-sm"
            >
              Visit Website
            </ToolCTAButton>
            {tool.pricingUrl && (
              <a href={tool.pricingUrl} target="_blank" rel="noopener noreferrer" className="btn-outline text-sm">
                Pricing <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            )}
            <BookmarkButton 
              type="tool" 
              itemId={tool.slug} 
              itemName={tool.name} 
              variant="button" 
              size="md" 
            />
            <UpvoteButton toolSlug={tool.slug} initialCount={tool.upvoteCount || 0} size="md" />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 space-y-8 min-w-0">

          {/* Overview */}
          <div className="card p-5 sm:p-6">
            <h2 className="section-title mb-4">Overview</h2>
            <p className="text-gray-600 dark:text-gray-300 font-jakarta text-sm sm:text-base leading-relaxed whitespace-pre-line">{tool.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              {tool.headquartersCountry && (
                <div><span className="text-xs text-gray-400 font-jakarta block">HQ</span><span className="font-sora font-bold text-sm text-navy dark:text-white">{tool.headquartersCountry}</span></div>
              )}
              {tool.founderNames?.length > 0 && (
                <div><span className="text-xs text-gray-400 font-jakarta block">Founders</span><span className="font-sora font-bold text-sm text-navy dark:text-white">{tool.founderNames.join(', ')}</span></div>
              )}
              <div><span className="text-xs text-gray-400 font-jakarta block">Website</span>
                <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer" className="font-sora font-bold text-sm text-brand hover:underline flex items-center gap-1">
                  <Globe className="w-3 h-3" />{tool.websiteUrl?.replace('https://', '').replace('http://', '')}
                </a>
              </div>
              {tool.startingPrice && (
                <div><span className="text-xs text-gray-400 font-jakarta block">Starting Price</span><span className="font-sora font-bold text-sm text-navy dark:text-white">${(tool.startingPrice / 8300).toFixed(0)}/mo</span></div>
              )}
            </div>
          </div>

          {/* Demo Video */}
          {tool.demoVideoUrl && (
            <div className="card p-0 overflow-hidden">
              <div className="aspect-video">
                <iframe
                  src={getEmbedUrl(tool.demoVideoUrl)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`${tool.name} Demo`}
                />
              </div>
            </div>
          )}

          {/* Screenshots */}
          {tool.screenshotUrls && tool.screenshotUrls.length > 0 && (
            <ScreenshotGallery screenshots={tool.screenshotUrls} toolName={tool.name} />
          )}

          {/* Pros & Cons */}
          {(toolPros.length > 0 || toolCons.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {toolPros.length > 0 && (
                <div className="card p-5">
                  <h3 className="font-sora font-bold text-sm text-green-700 dark:text-green-400 mb-3">Strengths</h3>
                  <div className="space-y-2">
                    {toolPros.map((pro: any) => (
                      <div key={pro.id} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-jakarta">{pro.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {toolCons.length > 0 && (
                <div className="card p-5">
                  <h3 className="font-sora font-bold text-sm text-orange-600 dark:text-orange-400 mb-3">Limitations</h3>
                  <div className="space-y-2">
                    {toolCons.map((con: any) => (
                      <div key={con.id} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-jakarta">{con.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Key Features */}
          {tool.useCases && tool.useCases.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-5 sm:p-6">
                <h2 className="section-title mb-4">Key Features</h2>
                <div className="space-y-2">
                  {tool.useCases.slice(0, Math.ceil(tool.useCases.length / 2)).map((item: any) => (
                    <div key={item.id} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-jakarta">
                        {item.text.replace(/^[•\-\*]\s*/, '')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Use Cases */}
              <div className="card p-5 sm:p-6">
                <h2 className="section-title mb-4">Use Cases</h2>
                <div className="space-y-2">
                  {tool.useCases.slice(Math.ceil(tool.useCases.length / 2)).map((item: any) => (
                    <div key={item.id} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-jakarta">
                        {item.text.replace(/^[•\-\*]\s*/, '')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Ideal Use Case + Not a Fit */}
          {(tool.idealUseCase || tool.notAFitFor) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tool.idealUseCase && (
                <div className="card p-5">
                  <h3 className="font-sora font-bold text-sm text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4" /> Ideal For
                  </h3>
                  <p className="text-sm font-jakarta text-gray-600 dark:text-gray-300 leading-relaxed">{tool.idealUseCase}</p>
                </div>
              )}
              {tool.notAFitFor && (
                <div className="card p-5">
                  <h3 className="font-sora font-bold text-sm text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                    <ThumbsDown className="w-4 h-4" /> Not a Fit For
                  </h3>
                  <p className="text-sm font-jakarta text-gray-600 dark:text-gray-300 leading-relaxed">{tool.notAFitFor}</p>
                </div>
              )}
            </div>
          )}

          {/* Tags & Capabilities */}
          {toolTags.length > 0 && (
            <div className="card p-5 sm:p-6">
              <h2 className="section-title mb-4">Tags & Capabilities</h2>
              <div className="space-y-4">
                {toolTags.map((group: any) => (
                  <div key={group.id}>
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide font-jakarta mb-2">{group.name}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {group.tags.map((tag: any) => (
                        <Link
                          key={tag.id}
                          href={`/tools?tag=${tag.slug}`}
                          className="inline-flex items-center px-2.5 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-[11px] font-jakarta text-gray-600 dark:text-gray-400 hover:border-brand/30 hover:text-brand hover:bg-brand/5 transition-colors"
                        >
                          {tag.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alternatives */}
          {toolAlternatives.length > 0 && (
            <div className="card p-5 sm:p-6">
              <h2 className="section-title mb-4">Alternatives to {tool.name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {toolAlternatives.map((alt: any) => (
                  <Link
                    key={alt.id}
                    href={`/tools/${alt.slug}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-brand/30 hover:bg-brand/5 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100 dark:border-gray-700">
                      {alt.logoUrl ? (
                        <Image src={alt.logoUrl} alt={alt.name} width={28} height={28} className="w-7 h-7 object-contain" />
                      ) : (
                        <span className="text-xs font-bold text-brand">{alt.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy dark:text-white group-hover:text-brand transition-colors truncate">{alt.name}</p>
                      <p className="text-[11px] text-gray-400 font-jakarta truncate">{alt.tagline}</p>
                    </div>
                    {alt.avgRating > 0 && (
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{parseFloat(alt.avgRating).toFixed(1)}</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* User Reviews */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title mb-0">User Reviews</h2>
              <WriteReviewClient toolSlug={tool.slug} toolName={tool.name} />
            </div>
            <div className="space-y-4">
              {userReviews.length > 0 ? userReviews.map((rev: any) => (
                <div key={rev.id} className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center text-sm text-brand font-bold">
                        {rev.authorName?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                      <div>
                        <span className="font-sora font-bold text-sm text-navy dark:text-white">{rev.authorName || 'Anonymous'}</span>
                        <span className="text-xs text-gray-400 block font-jakarta">{new Date(rev.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                  {rev.title && <h5 className="font-sora font-semibold text-sm mb-2">{rev.title}</h5>}
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-jakarta leading-relaxed mb-4">{rev.body}</p>
                  <div className="flex items-center justify-end border-t border-gray-100 dark:border-gray-800 pt-3">
                    <ReviewHelpfulButton reviewId={rev.id} toolSlug={tool.slug} initialCount={rev.helpfulCount || 0} />
                  </div>
                  {/* Founder Response */}
                  {reviewResponses[rev.id] && (
                    <div className="mt-3 ml-4 pl-4 border-l-2 border-brand/30 py-2">
                      <p className="text-[11px] font-semibold text-brand mb-1">
                        Founder Response — {reviewResponses[rev.id].founderName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-jakarta leading-relaxed">
                        {reviewResponses[rev.id].body}
                      </p>
                    </div>
                  )}
                </div>
              )) : (
                <div className="card p-8 text-center text-gray-500 text-sm font-jakarta">
                  No verified reviews yet. Be the first to review {tool.name}!
                </div>
              )}
            </div>
          </div>

          {/* FAQ Section */}
          <FAQSection faqs={faqs} />
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-6">
          <EmbedBadge urlSlug={tool.slug} type="tools" />

          {/* Built by Startup */}
          {tool.startupId && tool.startupName && (
            <Link href={`/startups/${tool.startupSlug || tool.startupId}`} className="card p-5 block hover:border-brand/30 transition-colors group">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-jakarta mb-3">Built by</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                  {tool.startupLogoUrl ? (
                    <Image src={tool.startupLogoUrl} alt={tool.startupName} width={32} height={32} className="w-8 h-8 object-contain" />
                  ) : (
                    <span className="text-sm font-bold text-brand">{tool.startupName.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="font-sora font-bold text-sm text-navy dark:text-white group-hover:text-brand transition-colors">{tool.startupName}</p>
                  {tool.totalFundingInr && Number(tool.totalFundingInr) > 0 && (
                    <p className="text-[10px] text-gray-400 font-jakarta">₹{(Number(tool.totalFundingInr) / 10000000).toFixed(1)}Cr raised</p>
                  )}
                </div>
              </div>
            </Link>
          )}

          {/* Similar Tools in Same Category */}
          {similarTools.length > 0 && (
            <SimilarTools
              tools={similarTools}
              categoryName={tool.categoryName || 'this category'}
              categorySlug={tool.categorySlug}
            />
          )}

          {/* Founder Story */}
          {stories.length > 0 && (
            <div className="card p-5 bg-gradient-to-br from-brand-50 to-brand-100/30 dark:from-brand-900/20 dark:to-gray-800 border-brand-100 dark:border-brand-900/50">
              <h4 className="font-sora font-extrabold text-sm text-brand mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Founder Story
              </h4>
              <div className="space-y-4">
                {stories.map((story: any) => (
                  <Link key={story.id} href={`/news/${story.slug}`} className="block group">
                    <h5 className="font-sora font-bold text-sm text-navy dark:text-white group-hover:text-brand leading-snug transition-colors">{story.title}</h5>
                    <p className="text-xs text-gray-500 font-jakarta mt-1 line-clamp-2">{story.excerpt}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand mt-2 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">Read Story <ArrowRight className="w-3 h-3" /></span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Funding History */}
          {fundingRounds.length > 0 && (
            <div className="card p-5">
              <h4 className="font-sora font-bold text-sm text-green-600 dark:text-green-400 mb-4 flex items-center gap-2">
                <IndianRupee className="w-4 h-4" /> Funding History
              </h4>
              <div className="space-y-3">
                {fundingRounds.map((round: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div>
                      <span className="font-sora font-bold text-sm text-navy dark:text-white block">{round.roundType}</span>
                      <span className="text-xs text-gray-400 font-jakarta">{new Date(round.announcedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-sora font-extrabold text-sm text-green-600 dark:text-green-400 block">{formatAmount(round.amountUsd, round.amountInr)}</span>
                      {round.leadInvestors?.[0] && <span className="text-[10px] text-gray-400 font-jakarta">{round.leadInvestors[0]}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Similar Tools Carousel — full width below main content */}
      <SimilarToolsCarousel
        tools={similarTools as any[]}
        categoryName={tool.categoryName || undefined}
        categorySlug={tool.categorySlug || undefined}
      />
    </div>
  );
}

import Link from 'next/link';
import { Metadata } from 'next';
import { Building2, MapPin, IndianRupee, TrendingUp, ExternalLink, ChevronRight, Globe, Users, Calendar, Star, ArrowUpRight, Tag, ThumbsUp, Shield } from 'lucide-react';
import { sql } from '@/lib/db';
// import EmbedBadge from '@/components/EmbedBadge'; // Temporarily hidden - can be shown in future
import ClaimStartupCard from '@/components/ClaimStartupCard';
import { detectCategory } from '@/lib/categories';
import WriteStartupReviewClient from '@/components/WriteStartupReviewClient';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { getUserSession } from '@/lib/user-session';
import FoundersSection from '@/components/FoundersSection';
import BookmarkButton from '@/components/BookmarkButton';
import { StartupSchema, FAQSchema } from '@/components/seo';
import { generateStartupFAQs, formatUsd as formatUsdUtil } from '@/lib/seo-utils';
import FAQSection from '@/components/FAQSection';
import SimilarStartupsCarousel from '@/components/SimilarStartupsCarousel';
import ImpactScoreBadge from '@/components/ImpactScoreBadge';
import { calculateImpactScore } from '@/lib/impact-score';
import ShareButton from '@/components/ShareButton';
import SubscribeForm from '@/components/SubscribeForm';

export const revalidate = 0; // Disable cache for debugging
export const dynamic = 'force-dynamic'; // Force dynamic rendering

async function getStartup(slug: string) {
  console.log(`[getStartup] START - Fetching startup with slug: "${slug}"`);
  try {
    // Try to fetch with category and businessType columns, but handle if they don't exist
    let rows;
    try {
      rows = await sql`
        SELECT id, name, slug, tagline,
               LEFT(description, 2500) AS description,
               "logoUrl", "websiteUrl", "linkedinUrl", stage,
               "headquartersCity", "foundedYear", "employeeCount",
               "isFeatured", "impactScore", founders, "foundersData",
               "isVerified", "verifiedAt", "claimedBy", category, "businessType",
               "createdAt"::text AS "createdAt",
               "updatedAt"::text AS "updatedAt"
        FROM "Startup"
        WHERE slug = ${slug} AND "deletedAt" IS NULL
        LIMIT 1
      `;
    } catch (columnError: any) {
      // If category or businessType column doesn't exist, fetch without them
      if (columnError.message?.includes('category') || columnError.message?.includes('businessType') || columnError.message?.includes('column')) {
        console.log('[getStartup] Category or businessType column not found, fetching without them');
        rows = await sql`
          SELECT id, name, slug, tagline,
                 LEFT(description, 2500) AS description,
                 "logoUrl", "websiteUrl", "linkedinUrl", stage,
                 "headquartersCity", "foundedYear", "employeeCount",
                 "isFeatured", "impactScore", founders, "foundersData",
                 "isVerified", "verifiedAt", "claimedBy",
                 "createdAt"::text AS "createdAt",
                 "updatedAt"::text AS "updatedAt"
          FROM "Startup"
          WHERE slug = ${slug} AND "deletedAt" IS NULL
          LIMIT 1
        `;
      } else {
        throw columnError;
      }
    }
    
    console.log(`[getStartup] Query returned ${rows.length} rows`);
    if (!rows.length) {
      console.log(`[getStartup] No startup found with slug: "${slug}"`);
      return null;
    }
    const s = rows[0] as any;
    console.log(`[getStartup] Found startup: ${s.name} (id: ${s.id})`);


    const rounds = await sql`
      SELECT "roundType", "amountUsd", "amountInr",
             "announcedAt"::text AS "announcedAt",
             "leadInvestors", "allInvestors"
      FROM "FundingRound"
      WHERE "startupId" = ${s.id}
      ORDER BY "announcedAt" DESC
    `;

    const namePattern = `%${s.name}%`;
    const news = await sql`
      SELECT title, slug, "publishedAt"::text AS "publishedAt"
      FROM "Article"
      WHERE status = 'PUBLISHED' AND "deletedAt" IS NULL
        AND title ILIKE ${namePattern}
      ORDER BY "publishedAt" DESC
      LIMIT 4
    `;

    // Smart similar startups: priority-based matching (8 results for carousel)
    // Priority 1: same category + same stage
    const sameCategoryStage = await sql`
      SELECT name, slug, tagline, "logoUrl", stage, "headquartersCity", category, "businessType"
      FROM "Startup"
      WHERE "deletedAt" IS NULL AND "isApproved" = true AND slug != ${slug}
        AND category = ${s.category || ''} AND stage = ${s.stage}
      ORDER BY "impactScore" DESC NULLS LAST LIMIT 3
    `;

    // Priority 2: same category, any stage
    const sameCategoryOnly = await sql`
      SELECT name, slug, tagline, "logoUrl", stage, "headquartersCity", category, "businessType"
      FROM "Startup"
      WHERE "deletedAt" IS NULL AND "isApproved" = true AND slug != ${slug}
        AND category = ${s.category || ''}
        AND slug NOT IN (${sameCategoryStage.length > 0 ? sameCategoryStage.map((r: any) => r.slug) : ['__none__']})
      ORDER BY "impactScore" DESC NULLS LAST LIMIT 3
    `;

    // Priority 3: same city
    const sameCity = await sql`
      SELECT name, slug, tagline, "logoUrl", stage, "headquartersCity", category, "businessType"
      FROM "Startup"
      WHERE "deletedAt" IS NULL AND "isApproved" = true AND slug != ${slug}
        AND "headquartersCity" = ${s.headquartersCity || ''}
        AND "headquartersCity" IS NOT NULL AND "headquartersCity" != ''
      ORDER BY "impactScore" DESC NULLS LAST LIMIT 2
    `;

    // Priority 4: same stage fallback
    const sameStage = await sql`
      SELECT name, slug, tagline, "logoUrl", stage, "headquartersCity", category, "businessType"
      FROM "Startup"
      WHERE "deletedAt" IS NULL AND "isApproved" = true AND slug != ${slug}
        AND stage = ${s.stage}
      ORDER BY "impactScore" DESC NULLS LAST LIMIT 3
    `;

    // Merge and deduplicate, max 8
    const seenSlugs = new Set<string>();
    const similar: any[] = [];
    const addWithReason = (rows: any[], reason: string) => {
      for (const r of rows) {
        if (!seenSlugs.has(r.slug) && similar.length < 8) {
          seenSlugs.add(r.slug);
          similar.push({ ...r, matchReason: reason });
        }
      }
    };
    addWithReason(sameCategoryStage, s.category || '');
    addWithReason(sameCategoryOnly, s.category || '');
    addWithReason(sameCity, s.headquartersCity ? `In ${s.headquartersCity}` : '');
    addWithReason(sameStage, '');

    // Reviews feature not yet implemented - return empty arrays
    const reviews: any[] = [];
    const avgRating = 0;

    // Enrich foundersData with FounderUser profile information if startup is claimed
    let enrichedFoundersData = s.foundersData || [];
    if (s.claimedBy) {
      try {
        const founderProfile = await sql`
          SELECT name, role, bio, avatar, linkedin, twitter, website
          FROM "FounderUser"
          WHERE id = ${s.claimedBy}
          LIMIT 1
        `;
        
        if (founderProfile.length > 0) {
          const profile = founderProfile[0];
          
          // If foundersData exists, update the first founder with profile data
          if (enrichedFoundersData.length > 0) {
            enrichedFoundersData[0] = {
              ...enrichedFoundersData[0],
              bio: profile.bio || enrichedFoundersData[0].bio,
              avatar: profile.avatar || enrichedFoundersData[0].avatar,
              linkedin: profile.linkedin || enrichedFoundersData[0].linkedin,
              twitter: profile.twitter || enrichedFoundersData[0].twitter,
              website: profile.website || enrichedFoundersData[0].website,
            };
          } else {
            // If no foundersData, create from profile
            enrichedFoundersData = [{
              name: profile.name,
              role: profile.role || 'Founder',
              bio: profile.bio,
              avatar: profile.avatar,
              linkedin: profile.linkedin,
              twitter: profile.twitter,
              website: profile.website,
            }];
          }
        }
      } catch (error) {
        console.error('[getStartup] Error enriching founder data:', error);
      }
    }

    return { 
      ...s, 
      foundersData: enrichedFoundersData,
      fundingRounds: rounds, 
      relatedNews: news, 
      similarStartups: similar,
      reviews,
      avgRating: null,
      reviewCount: 0
    };
  } catch (e) {
    console.error('[getStartup] ERROR:', e);
    return null;
  }
}

function formatUsd(usd: number | null) {
  if (!usd || Number(usd) === 0) return null;
  const u = Number(usd) / 100;
  if (u >= 1e9) return `$${(u / 1e9).toFixed(1)}B`;
  if (u >= 1e6) return `$${(u / 1e6).toFixed(0)}M`;
  return `$${(u / 1e3).toFixed(0)}K`;
}

function stageLabel(s: string) {
  return s?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';
}

// Get industry tag - use selected category if available, otherwise detect
function getIndustryTag(startup: any): string | null {
  // First, check if startup has a manually selected category
  if (startup.category) {
    return startup.category;
  }
  
  // Fallback to auto-detection if no category is set
  const combined = `${startup.name || ''} ${startup.description || ''} ${startup.tagline || ''}`;
  return detectCategory(combined);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  console.log('[generateMetadata] Called with slug:', params.slug);
  const s = await getStartup(params.slug) as any;
  console.log('[generateMetadata] getStartup returned:', s ? `${s.name} (${s.id})` : 'null');
  if (!s) return { title: 'Startup Not Found' };
  
  const title = `${s.name} - ${s.tagline || 'AI Startup'} | AI Startup Impact`;
  const description = (s.description || s.tagline || '').slice(0, 155);
  const url = `https://aistartupimpact.com/startups/${s.slug}`;
  
  // Use dynamic OG image (auto-generated from opengraph-image.tsx)
  const image = `${url}/opengraph-image`;

  return {
    title,
    description,
    keywords: [
      s.name,
      s.tagline,
      'AI startup India',
      s.headquartersCity,
      s.stage,
      'artificial intelligence',
      'machine learning',
      'India AI Mission',
      'startup funding'
    ].filter(Boolean).join(', '),
    authors: s.founders?.map((name: string) => ({ name })),
    creator: s.name,
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
        alt: `${s.name} - ${s.tagline || 'AI Startup'}`
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

export default async function StartupDetailPage({ params }: { params: { slug: string } }) {
  console.log('[StartupDetailPage] Called with slug:', params.slug);
  const startup = await getStartup(params.slug) as any;
  console.log('[StartupDetailPage] getStartup returned:', startup ? `${startup.name} (${startup.id})` : 'null');
  const session = await getUserSession();

  if (!startup) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h1 className="font-sora font-bold text-xl text-navy dark:text-white mb-2">Startup not found</h1>
        <p className="text-gray-500 font-jakarta text-sm mb-6">We couldn&apos;t find a startup with this URL.</p>
        <Link href="/startups" className="btn-brand">Browse All Startups</Link>
      </div>
    );
  }

  const totalRaised = startup.fundingRounds.reduce((sum: number, r: any) => sum + Number(r.amountUsd || 0), 0);
  const industryTag = getIndustryTag(startup);
  
  // Load FAQs from database first
  let faqs: any[] = [];
  try {
    const dbFaqs = await sql`
      SELECT id, question, answer, "order"
      FROM "StartupFAQ"
      WHERE "startupId" = ${startup.id}
      ORDER BY "order" ASC
    `;
    
    if (dbFaqs.length > 0) {
      // Use database FAQs if they exist
      faqs = dbFaqs.map((faq: any) => ({
        question: faq.question,
        answer: faq.answer
      }));
    } else {
      // Fallback to generated FAQs if no database FAQs exist
      faqs = generateStartupFAQs(startup, totalRaised);
    }
  } catch (error) {
    console.error('Error loading FAQs:', error);
    // Fallback to generated FAQs on error
    faqs = generateStartupFAQs(startup, totalRaised);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* JSON-LD Schema: Single @graph with WebPage + Organization + BreadcrumbList */}
      <StartupSchema startup={startup} />
      
      {/* FAQ Schema (separate) */}
      <FAQSchema faqs={faqs} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs sm:text-sm font-jakarta text-gray-400 mb-6">
        <Link href="/" className="hover:text-brand">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/startups" className="hover:text-brand">Startups</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600 dark:text-gray-300">{startup.name}</span>
      </nav>

      {/* Claim Banner - Removed (now in sidebar only) */}

      {/* ── Header ── */}
      <div className="mb-6">
        {/* Row 1: Logo + Name/Tagline + Impact Score */}
        <div className="flex items-start gap-4 mb-4">
          {/* Logo */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-brand/10 dark:bg-brand/20 flex items-center justify-center shrink-0 shadow-sm border border-brand/10">
            {startup.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={startup.logoUrl} alt={startup.name} className="w-14 h-14 object-contain" />
            ) : (
              <Building2 className="w-8 h-8 text-brand" />
            )}
            {startup.isVerified && <VerifiedBadge onLogo size="md" />}
          </div>

          {/* Name + Tagline (flex-1 so Impact Score stays right) */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-sora font-extrabold text-xl sm:text-3xl text-navy dark:text-white leading-tight">{startup.name}</h1>
                  {startup.isVerified && <VerifiedBadge size="md" showText />}
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm sm:text-base mt-1 line-clamp-2">{startup.tagline}</p>
              </div>
              {/* Impact Score — top right, parallel to logo */}
              {startup.impactScore > 0 && (() => {
                const totalFundingUsdCents = (startup.fundingRounds || []).reduce((sum: number, r: any) => sum + Number(r.amountUsd || 0), 0);
                const breakdown = calculateImpactScore({
                  totalFundingUsdCents,
                  employeeCount: startup.employeeCount,
                  stage: startup.stage,
                  foundedYear: startup.foundedYear,
                });
                return (
                  <div className="relative shrink-0">
                    <ImpactScoreBadge score={breakdown.total} breakdown={breakdown} />
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Row 2: Tags — category, business type, stage, location */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {industryTag && (
            <span className="flex items-center gap-1 text-[10px] font-bold bg-brand/10 dark:bg-brand/20 text-brand px-2.5 py-1 rounded-full uppercase">
              <Tag className="w-3 h-3" />{industryTag}
            </span>
          )}
          {startup.businessType && (
            <span className="flex items-center gap-1 text-[10px] font-bold bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-2.5 py-1 rounded-full uppercase">
              {startup.businessType}
            </span>
          )}
          <span className="text-[10px] font-bold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full uppercase">
            {stageLabel(startup.stage)}
          </span>
          {startup.headquartersCity && (
            <span className="flex items-center gap-1 text-xs text-gray-400 font-jakarta">
              <MapPin className="w-3 h-3" />{startup.headquartersCity}
            </span>
          )}
          {startup.isFeatured && (
            <span className="text-[10px] font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2.5 py-1 rounded-full">★ Featured</span>
          )}
          {totalRaised > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full">
              {formatUsd(totalRaised)} raised
            </span>
          )}
        </div>

        {/* Row 3: Action bar — Visit Website (text) + LinkedIn icon + Bookmark icon + Share icon */}
        <div className="flex items-center gap-2">
          {startup.websiteUrl && (
            <a href={startup.websiteUrl} target="_blank" rel="noopener noreferrer"
              className="btn-brand text-sm px-4 py-2 h-9"
            >
              Visit Website <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          )}
          {startup.linkedinUrl && (
            <a href={startup.linkedinUrl} target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm hover:border-[#0A66C2] hover:text-[#0A66C2] transition-colors text-gray-500 dark:text-gray-400"
              title="LinkedIn"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          )}
          <BookmarkButton type="startup" itemId={startup.slug} itemName={startup.name} variant="icon" size="sm" />
          <ShareButton
            title={`${startup.name} — ${startup.tagline}`}
            text={`${startup.name}: ${startup.tagline}${startup.stage ? ` · ${startup.stage.replace(/_/g, ' ')}` : ''}${startup.headquartersCity ? ` · ${startup.headquartersCity}` : ''}`}
            url={`https://aistartupimpact.com/startups/${startup.slug}`}
            iconOnly
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Main ── */}
        <div className="flex-1 space-y-6">

          {/* About */}
          <div className="card p-5 sm:p-6">
            <h2 className="section-title mb-4">About</h2>

            {/* Description — 4 lines, 500 word limit */}
            <p className="text-gray-600 dark:text-gray-300 font-jakarta text-sm sm:text-base leading-relaxed line-clamp-4">
              {startup.description}
            </p>

            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              {startup.foundedYear && (
                <div>
                  <span className="text-xs text-gray-400 font-jakarta flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3" /> Founded
                  </span>
                  <span className="font-sora font-bold text-sm text-navy dark:text-white">{startup.foundedYear}</span>
                </div>
              )}
              {startup.employeeCount && (
                <div>
                  <span className="text-xs text-gray-400 font-jakarta flex items-center gap-1 mb-1">
                    <Users className="w-3 h-3" /> Employees
                  </span>
                  <span className="font-sora font-bold text-sm text-navy dark:text-white block">{startup.employeeCount}+</span>
                  {startup.foundedYear && (
                    <span className="text-[10px] text-brand font-jakarta flex items-center gap-0.5 mt-0.5">
                      <ArrowUpRight className="w-3 h-3" />
                      Growing since {startup.foundedYear}
                    </span>
                  )}
                </div>
              )}
              {startup.headquartersCity && (
                <div>
                  <span className="text-xs text-gray-400 font-jakarta flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3" /> Location
                  </span>
                  <span className="font-sora font-bold text-sm text-navy dark:text-white">{startup.headquartersCity}</span>
                </div>
              )}
              {startup.websiteUrl && (
                <div>
                  <span className="text-xs text-gray-400 font-jakarta flex items-center gap-1 mb-1">
                    <Globe className="w-3 h-3" /> Website
                  </span>
                  <a href={startup.websiteUrl} target="_blank" rel="noopener noreferrer"
                    className="font-sora font-bold text-sm text-brand hover:underline break-all block">
                    {startup.websiteUrl.replace('https://', '').replace('http://', '').replace(/\/$/, '')}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Founders */}
          {startup.foundersData?.length > 0 && (
            <FoundersSection founders={startup.foundersData} />
          )}

          {/* Funding History */}
          {startup.fundingRounds.length > 0 && (
            <div className="card p-5 sm:p-6">
              <h2 className="section-title mb-4 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-brand" /> Funding History
              </h2>
              <div className="space-y-3">
                {startup.fundingRounds.map((r: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                        <IndianRupee className="w-5 h-5 text-brand" />
                      </div>
                      <div>
                        <span className="font-sora font-bold text-sm text-navy dark:text-white block">{r.roundType}</span>
                        <span className="text-xs text-gray-400 font-jakarta">
                          {r.leadInvestors?.length > 0 ? r.leadInvestors.join(', ') : 'Undisclosed'}
                          {r.announcedAt && ` · ${new Date(r.announcedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                        </span>
                      </div>
                    </div>
                    <span className="font-sora font-extrabold text-brand">{formatUsd(r.amountUsd) || 'Undisclosed'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Community Reviews & Ratings */}
          <div className="card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title flex items-center gap-2">
                <Star className="w-4 h-4 text-brand" /> Community Reviews
              </h2>
              {startup.reviewCount > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-sora font-bold text-sm text-navy dark:text-white">{startup.avgRating}</span>
                  <span className="text-xs text-gray-400 font-jakarta">({startup.reviewCount} {startup.reviewCount === 1 ? 'review' : 'reviews'})</span>
                </div>
              )}
            </div>
            
            {startup.reviews && startup.reviews.length > 0 ? (
              <div className="space-y-4">
                {startup.reviews.map((review: any) => (
                  <div key={review.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                          {review.userName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-sora font-bold text-sm text-navy dark:text-white">{review.userName || 'Anonymous'}</span>
                            {review.isVerifiedFounder && (
                              <span className="text-[9px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded font-semibold">Verified Founder</span>
                            )}
                            {review.isVerifiedInvestor && (
                              <span className="text-[9px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 rounded font-semibold">Verified Investor</span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 font-jakarta">
                            {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`w-3 h-3 ${i <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    {review.title && (
                      <h4 className="font-sora font-bold text-sm text-navy dark:text-white mb-1">{review.title}</h4>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-jakarta leading-relaxed mb-2">
                      {review.body}
                    </p>
                    {review.helpfulCount > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{review.helpfulCount} found this helpful</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-jakarta text-sm mb-4">No reviews yet. Be the first to share your experience!</p>
              </div>
            )}

            <WriteStartupReviewClient startupSlug={startup.slug} startupName={startup.name} />
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-6">
          {/* Claim This Startup Card */}
          <ClaimStartupCard 
            startupId={startup.id}
            startupSlug={startup.slug}
            isVerified={startup.isVerified || false}
            isClaimed={!!startup.claimedBy}
            isOwner={session?.id === startup.claimedBy}
          />
          
          {/* EmbedBadge temporarily hidden - can be shown in future */}
          {/* <EmbedBadge urlSlug={startup.slug} type="startups" /> */}

          {/* Related News */}
          {startup.relatedNews.length > 0 && (
            <div className="card p-5">
              <h4 className="font-sora font-bold text-sm text-navy dark:text-white mb-4">Related News</h4>
              <div className="space-y-3">
                {startup.relatedNews.map((n: any) => (
                  <Link key={n.slug} href={`/news/${n.slug}`} className="group block">
                    <h5 className="text-sm font-jakarta text-gray-600 dark:text-gray-400 group-hover:text-brand transition-colors leading-snug line-clamp-2">{n.title}</h5>
                    <span className="text-xs text-gray-400 font-jakarta">
                      {new Date(n.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Track startup */}
          <div className="card p-5 bg-gradient-to-br from-brand-50 to-white dark:from-brand-900/20 dark:to-gray-900">
            <h4 className="font-sora font-bold text-sm text-navy dark:text-white mb-2">Track this startup</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta mb-4">
              Get notified about funding rounds, product launches, and news.
            </p>
            <SubscribeForm source="sidebar" buttonText="Subscribe" />
          </div>
        </aside>
      </div>

      {/* FAQ Section */}
      <div className="mt-12">
        <FAQSection faqs={faqs} />
      </div>

      {/* Similar Startups Carousel */}
      <SimilarStartupsCarousel startups={startup.similarStartups || []} />
    </div>
  );
}

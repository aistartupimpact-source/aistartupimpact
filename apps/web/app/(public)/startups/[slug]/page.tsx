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
               "isVerified", "verifiedAt", "claimedBy", category, "businessType"
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
                 "isVerified", "verifiedAt", "claimedBy"
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

    // Get similar startups based on stage
    const similar = await sql`
      SELECT name, slug, tagline, "logoUrl", stage, "headquartersCity"
      FROM "Startup"
      WHERE "deletedAt" IS NULL 
        AND slug != ${slug}
        AND stage = ${s.stage}
      ORDER BY 
        "impactScore" DESC NULLS LAST, 
        "createdAt" DESC
      LIMIT 4
    `;

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
  return {
    title: `${s.name} — ${s.tagline}`,
    description: (s.description || s.tagline || '').slice(0, 160),
    alternates: { canonical: `https://aistartupimpact.com/startups/${s.slug}` },
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
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
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-8">
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

        {/* Name + badges */}
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-navy dark:text-white">{startup.name}</h1>
            {startup.isVerified && <VerifiedBadge size="md" showText />}
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm sm:text-base mt-1">{startup.tagline}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
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
          </div>
          <div className="flex gap-3 mt-4">
            {startup.websiteUrl && (
              <a href={startup.websiteUrl} target="_blank" rel="noopener noreferrer" className="btn-brand text-sm">
                Visit Website <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            )}
            {startup.linkedinUrl && (
              <a href={startup.linkedinUrl} target="_blank" rel="noopener noreferrer" className="btn-outline text-sm">LinkedIn</a>
            )}
            <BookmarkButton 
              type="startup" 
              itemId={startup.slug} 
              itemName={startup.name} 
              variant="button" 
              size="md" 
            />
          </div>
        </div>

        {/* Total Raised + Impact Score */}
        <div className="text-right shrink-0">
          {totalRaised > 0 && (
            <>
              <div className="font-sora font-extrabold text-2xl sm:text-3xl text-brand">{formatUsd(totalRaised)}</div>
              <div className="text-xs text-gray-400 font-jakarta">Total Raised</div>
            </>
          )}
          {startup.impactScore && (
            <div className="flex items-center gap-1 justify-end mt-2">
              <TrendingUp className="w-3.5 h-3.5 text-brand" />
              <span className="text-sm font-sora font-bold text-brand">Impact Score: {startup.impactScore}</span>
            </div>
          )}
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
            <input type="email" placeholder="your@email.com" className="input-field text-xs mb-2" />
            <button className="btn-brand w-full text-xs">Subscribe</button>
          </div>
        </aside>
      </div>

      {/* Similar Startups Section */}
      {startup.similarStartups?.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <h2 className="font-sora font-bold text-xl text-navy dark:text-white mb-6">
            You might also want to explore
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {startup.similarStartups.map((s: any) => (
              <Link
                key={s.slug}
                href={`/startups/${s.slug}`}
                className="group card p-4 hover:border-brand dark:hover:border-brand transition-all hover:shadow-lg"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-brand/10 dark:bg-brand/20 flex items-center justify-center shrink-0 overflow-hidden">
                    {s.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.logoUrl} alt={s.name} className="w-10 h-10 object-contain" />
                    ) : (
                      <Building2 className="w-6 h-6 text-brand" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-sora font-bold text-sm text-navy dark:text-white group-hover:text-brand transition-colors truncate">
                      {s.name}
                    </h3>
                    {s.headquartersCity && (
                      <span className="text-[10px] text-gray-400 font-jakarta flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5" />{s.headquartersCity}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-jakarta leading-relaxed line-clamp-2 mb-3">
                  {s.tagline}
                </p>
                {s.stage && (
                  <span className="inline-block text-[9px] font-bold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full uppercase">
                    {stageLabel(s.stage)}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

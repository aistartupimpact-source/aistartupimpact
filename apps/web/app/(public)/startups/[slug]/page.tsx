import Link from 'next/link';
import { Metadata } from 'next';
import { Building2, MapPin, IndianRupee, TrendingUp, ExternalLink, ChevronRight, Globe, Users, Calendar, Star, ArrowUpRight, Tag, ThumbsUp } from 'lucide-react';
import { sql } from '@/lib/db';
import EmbedBadge from '@/components/EmbedBadge';
import { detectCategory } from '@/lib/categories';
import WriteStartupReviewClient from '@/components/WriteStartupReviewClient';

export const revalidate = 60;

async function getStartup(slug: string) {
  try {
    const rows = await sql`
      SELECT id, name, slug, tagline,
             LEFT(description, 2500) AS description,
             "logoUrl", "websiteUrl", "linkedinUrl", stage,
             "headquartersCity", "foundedYear", "employeeCount",
             "isFeatured", "impactScore", founders, "foundersData",
             category, "useCases", "employeeGrowthData"
      FROM "Startup"
      WHERE slug = ${slug} AND "deletedAt" IS NULL
      LIMIT 1
    `;
    if (!rows.length) return null;
    const s = rows[0] as any;

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

    // Get similar startups based on category or stage
    const similar = await sql`
      SELECT name, slug, tagline, "logoUrl", stage, "headquartersCity", category
      FROM "Startup"
      WHERE "deletedAt" IS NULL 
        AND slug != ${slug}
        AND (
          (category IS NOT NULL AND category = ${s.category})
          OR stage = ${s.stage}
        )
      ORDER BY 
        CASE WHEN category = ${s.category} THEN 0 ELSE 1 END,
        "impactScore" DESC NULLS LAST, 
        "createdAt" DESC
      LIMIT 4
    `;

    // Get reviews
    const reviews = await sql`
      SELECT 
        r.id, r.rating, r.title, r.body, r."helpfulCount",
        r."createdAt"::text AS "createdAt",
        r."isVerifiedFounder", r."isVerifiedInvestor",
        u.name AS "userName", u.email AS "userEmail", u.avatar AS "userAvatar"
      FROM "StartupReview" r
      LEFT JOIN "User" u ON u.id = r."userId"
      WHERE r."startupId" = ${s.id} AND r.status = 'APPROVED'
      ORDER BY r."createdAt" DESC
      LIMIT 10
    `;

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
      : 0;

    return { 
      ...s, 
      fundingRounds: rounds, 
      relatedNews: news, 
      similarStartups: similar,
      reviews,
      avgRating: avgRating > 0 ? avgRating.toFixed(1) : null,
      reviewCount: reviews.length
    };
  } catch (e) {
    console.error('getStartup error:', e);
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

// Get industry tag - use database category first, fallback to detection
function getIndustryTag(startup: any): string | null {
  // Use database category if available
  if (startup.category) {
    return startup.category;
  }
  
  // Fallback to detection algorithm
  const combined = `${startup.name || ''} ${startup.description || ''} ${startup.tagline || ''}`;
  return detectCategory(combined);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const s = await getStartup(params.slug) as any;
  if (!s) return { title: 'Startup Not Found' };
  return {
    title: `${s.name} — ${s.tagline}`,
    description: (s.description || s.tagline || '').slice(0, 160),
    alternates: { canonical: `https://aistartupimpact.com/startups/${s.slug}` },
  };
}

export default async function StartupDetailPage({ params }: { params: { slug: string } }) {
  const startup = await getStartup(params.slug) as any;

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

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-8">
        {/* Logo */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-brand/10 dark:bg-brand/20 flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-brand/10">
          {startup.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={startup.logoUrl} alt={startup.name} className="w-14 h-14 object-contain" />
          ) : (
            <Building2 className="w-8 h-8 text-brand" />
          )}
        </div>

        {/* Name + badges */}
        <div className="flex-1">
          <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-navy dark:text-white">{startup.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm sm:text-base mt-1">{startup.tagline}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {industryTag && (
              <span className="flex items-center gap-1 text-[10px] font-bold bg-brand/10 dark:bg-brand/20 text-brand px-2.5 py-1 rounded-full uppercase">
                <Tag className="w-3 h-3" />{industryTag}
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
                    className="font-sora font-bold text-sm text-brand hover:underline truncate block">
                    {startup.websiteUrl.replace('https://', '').replace('http://', '').replace(/\/$/, '')}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Founders */}
          {startup.foundersData?.length > 0 && (
            <div className="card p-5 sm:p-6">
              <h2 className="section-title mb-4">Founders</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {startup.foundersData.map((f: any) => (
                  <div key={f.name} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className="w-11 h-11 rounded-full bg-brand/10 dark:bg-brand/20 flex items-center justify-center text-brand font-bold font-sora text-lg shrink-0">
                      {f.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-sora font-bold text-sm text-navy dark:text-white block">{f.name}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-jakarta block">{f.role}</span>
                      <span className="text-[10px] text-brand font-jakarta font-semibold">{f.prev}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
          <EmbedBadge urlSlug={startup.slug} type="startups" />

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

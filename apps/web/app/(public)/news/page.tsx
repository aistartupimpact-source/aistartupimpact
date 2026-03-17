import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { getArticlesDirect, getActiveCreativeForZone } from '@/lib/db';
import { generateCollectionPageSchema, generateItemListSchema, generateBreadcrumbSchema } from '@/lib/seo';
import ArticlesListClient from '@/components/ArticlesListClient';
import SubscribeForm from '@/components/SubscribeForm';

export const metadata: Metadata = {
  title: 'Latest AI News — India & Global',
  description:
    'Breaking AI news, startup updates, funding announcements, and ecosystem intelligence from India and around the world. Updated daily.',
  alternates: { canonical: 'https://aistartupimpact.com/news' },
  openGraph: {
    title: 'Latest AI News — India & Global',
    description:
      'Breaking AI news, startup updates, funding announcements, and ecosystem intelligence from India and around the world.',
    type: 'website',
    url: 'https://aistartupimpact.com/news',
    siteName: 'AIStartupImpact',
    images: [{ url: 'https://aistartupimpact.com/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Latest AI News — India & Global',
    description: 'Breaking AI news, startup updates, and ecosystem intelligence.',
    creator: '@aikitstartup',
  },
};

const formatDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

export const revalidate = 60;

export default async function NewsPage() {
  const [articles, inArticleAd] = await Promise.all([
    getArticlesDirect({ limit: 100 }) as Promise<any[]>,
    getActiveCreativeForZone('A1_IN_ARTICLE'),
  ]);
  const allArticles = articles || [];
  const featured = allArticles.filter((a) => a.isFeatured).slice(0, 2);

  const siteUrl = 'https://aistartupimpact.com';

  const collectionSchema = generateCollectionPageSchema({
    name: 'Latest AI News — India & Global',
    description:
      'Breaking AI news, startup updates, funding announcements, and ecosystem intelligence from India and around the world.',
    url: `${siteUrl}/news`,
  });

  const itemListSchema =
    allArticles.length > 0
      ? generateItemListSchema({
          name: 'Latest AI News Articles',
          description: 'Most recent AI startup news from India and around the world.',
          url: `${siteUrl}/news`,
          items: allArticles.slice(0, 20).map((a: any, i: number) => ({
            position: i + 1,
            name: a.title,
            url: `${siteUrl}/news/${a.slug}`,
            description: a.excerpt || undefined,
          })),
        })
      : null;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'News', url: `${siteUrl}/news` },
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {itemListSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      )}

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="font-sora font-extrabold text-2xl sm:text-3xl md:text-4xl text-navy dark:text-white">
          Latest News
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-jakarta mt-2 text-sm sm:text-base">
          Breaking AI news, startup updates, and ecosystem intelligence from India and the world.
        </p>
      </div>

      {allArticles.length === 0 && (
        <p className="text-gray-400 font-jakarta text-center py-20">No articles published yet.</p>
      )}

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
        {/* ── Main column ── */}
        <div className="flex-1 min-w-0">
          {/* Featured — 2-col cards */}
          {featured.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {featured.map((article) => (
                <Link key={article.slug} href={`/news/${article.slug}`} className="group">
                  <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-brand/40 transition-colors h-full flex flex-col">
                    <div className="aspect-[16/9] bg-gradient-to-br from-brand/10 to-gray-100 dark:from-brand/20 dark:to-gray-800 relative overflow-hidden">
                      {(article.thumbnailImage || article.coverImage) && (
                        <Image
                          src={article.thumbnailImage || article.coverImage}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-white bg-brand px-2 py-0.5 rounded-sm z-10">
                        {article.category?.name || 'News'}
                      </span>
                      <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold bg-yellow-400 text-black px-2 py-0.5 rounded-sm z-10">
                        <TrendingUp className="w-2.5 h-2.5" /> Featured
                      </span>
                    </div>
                    <div className="p-4 sm:p-5 flex flex-col flex-1">
                      <h2 className="font-sora font-bold text-base sm:text-lg text-navy dark:text-white group-hover:text-brand transition-colors leading-snug line-clamp-2 flex-1">
                        {article.title}
                      </h2>
                      {article.excerpt && (
                        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-jakarta mt-2 line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 font-jakarta">
                        <div className="w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center text-[9px] font-bold text-brand shrink-0">
                          {article.author?.name?.charAt(0) || 'A'}
                        </div>
                        <span className="font-medium text-gray-500 dark:text-gray-400">{article.author?.name}</span>
                        {article.publishedAt && (
                          <>
                            <span className="text-gray-300 dark:text-gray-600">·</span>
                            <span>{formatDate(article.publishedAt)}</span>
                          </>
                        )}
                        {article.readTimeMinutes && (
                          <>
                            <span className="text-gray-300 dark:text-gray-600">·</span>
                            <span>{article.readTimeMinutes} min</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Sponsored strip */}
          {inArticleAd && (
            <a
              href={inArticleAd.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-4 bg-brand/5 dark:bg-brand/10 border border-brand/20 rounded-xl px-5 py-4 mb-8 group hover:border-brand/40 transition-colors"
            >
              <div>
                <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                  Sponsored · {inArticleAd.companyName}
                </span>
                <p className="font-sora font-bold text-sm text-navy dark:text-white mt-0.5">
                  {inArticleAd.headline}
                </p>
                {inArticleAd.bodyText && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta mt-0.5 line-clamp-1">
                    {inArticleAd.bodyText}
                  </p>
                )}
              </div>
              <span className="shrink-0 flex items-center gap-1 text-xs font-semibold text-brand group-hover:underline">
                {inArticleAd.ctaText || 'Learn More'} <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </a>
          )}

          {/* All Articles list */}
          {allArticles.length > 0 && (
            <div>
              <h2 className="font-sora font-bold text-lg text-navy dark:text-white mb-4">
                All Articles
                <span className="ml-2 text-sm font-normal text-gray-400 font-jakarta">
                  {allArticles.length} articles
                </span>
              </h2>
              <ArticlesListClient articles={allArticles} />
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-6">
          {/* Newsletter CTA */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-brand mb-2">Free Weekly</div>
            <h3 className="font-sora font-bold text-base text-navy dark:text-white leading-snug mb-1">
              India AI Digest
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta mb-4 leading-relaxed">
              Join 5,000+ founders and investors getting the week's top AI stories every Friday.
            </p>
            <SubscribeForm source="sidebar" buttonText="Subscribe Free" />
          </div>

          {/* Categories */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
            <h3 className="font-sora font-bold text-sm text-navy dark:text-white mb-4">Browse by Topic</h3>
            <div className="flex flex-wrap gap-2">
              {['Funding', 'Policy', 'LLMs', 'HealthTech', 'EdTech', 'AgriTech', 'Deep Tech', 'Ecosystem', 'Startups', 'Research'].map((cat) => (
                <span key={cat} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-brand/10 hover:text-brand cursor-pointer transition-colors font-jakarta">
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Trending */}
          {allArticles.slice(0, 5).length > 0 && (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
              <h3 className="font-sora font-bold text-sm text-navy dark:text-white mb-4">Trending Now</h3>
              <div className="space-y-3">
                {allArticles.slice(0, 5).map((a: any, i: number) => (
                  <Link key={a.slug} href={`/news/${a.slug}`} className="group flex gap-3 items-start">
                    <span className="font-sora font-extrabold text-xl text-gray-100 dark:text-gray-800 leading-none shrink-0 w-6 text-right">
                      {i + 1}
                    </span>
                    <p className="text-xs font-semibold text-navy dark:text-white group-hover:text-brand transition-colors leading-snug line-clamp-2 font-jakarta">
                      {a.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

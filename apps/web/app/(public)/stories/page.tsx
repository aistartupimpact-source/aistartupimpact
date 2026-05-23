import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { getArticlesDirect } from '@/lib/db';
import { generateCollectionPageSchema, generateItemListSchema, generateBreadcrumbSchema } from '@/lib/seo';
import StoriesListClient from '@/components/StoriesListClient';
import SubscribeForm from '@/components/SubscribeForm';

export const metadata: Metadata = {
  title: 'Founder Stories — Indian AI Entrepreneurs',
  description:
    "Deep-dive interviews and profiles of the founders building India's AI future. Learn from their journeys, challenges, and insights.",
  alternates: { canonical: 'https://aistartupimpact.com/stories' },
  openGraph: {
    title: 'Founder Stories — Indian AI Entrepreneurs',
    description: "Deep-dive interviews and profiles of the founders building India's AI future.",
    type: 'website',
    url: 'https://aistartupimpact.com/stories',
    siteName: 'AIStartupImpact',
    images: [{ url: 'https://aistartupimpact.com/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Founder Stories — Indian AI Entrepreneurs',
    description: "Deep-dive interviews and profiles of the founders building India's AI future.",
    creator: '@aikitstartup',
  },
};

const formatDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

export const revalidate = 60;

export default async function StoriesPage() {
  const articles: any[] = (await getArticlesDirect({ type: 'STORY', limit: 100 })) || [];
  const featured = articles.filter((a) => a.isFeatured).slice(0, 2);

  const siteUrl = 'https://aistartupimpact.com';

  const collectionSchema = generateCollectionPageSchema({
    name: 'Founder Stories — Indian AI Entrepreneurs',
    description: "Deep-dive interviews and profiles of the founders building India's AI future.",
    url: `${siteUrl}/stories`,
  });

  const itemListSchema =
    articles.length > 0
      ? generateItemListSchema({
          name: 'Founder Stories',
          description: 'Profiles and interviews with Indian AI startup founders.',
          url: `${siteUrl}/stories`,
          items: articles.slice(0, 20).map((a: any, i: number) => ({
            position: i + 1,
            name: a.title,
            url: `${siteUrl}/stories/${a.slug}`,
            description: a.excerpt || undefined,
          })),
        })
      : null;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Founder Stories', url: `${siteUrl}/stories` },
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
        <h1 className="font-sora font-extrabold text-2xl sm:text-3xl md:text-4xl text-navy dark:text-white leading-tight tracking-tight">
          Founder Stories.{' '}
          <span className="text-brand">Unfiltered.</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm max-w-2xl mt-2">
          Deep-dive interviews and profiles of the founders building the AI future — their journeys, challenges, and hard-won insights.
        </p>
      </div>

      {articles.length === 0 && (
        <p className="text-gray-400 font-jakarta text-center py-20">No stories published yet.</p>
      )}

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
        {/* ── Main column ── */}
        <div className="flex-1 min-w-0">
          {/* Featured — 2-col cards */}
          {featured.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {featured.map((story) => (
                <Link key={story.slug} href={`/stories/${story.slug}`} className="group">
                  <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-brand/40 transition-colors h-full flex flex-col">
                    <div className="aspect-[16/9] bg-gradient-to-br from-brand/10 to-gray-100 dark:from-brand/20 dark:to-gray-800 relative overflow-hidden">
                      {(story.thumbnailImage || story.coverImage) && (
                        <Image
                          src={story.thumbnailImage || story.coverImage}
                          alt={story.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-white bg-brand px-2 py-0.5 rounded-sm z-10">
                        Featured
                      </span>
                    </div>
                    <div className="p-4 sm:p-5 flex flex-col flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand mb-2">
                        {story.category?.name || 'Founder Story'}
                      </span>
                      <h2 className="font-sora font-bold text-base sm:text-lg text-navy dark:text-white group-hover:text-brand transition-colors leading-snug line-clamp-2 flex-1">
                        {story.title}
                      </h2>
                      {story.excerpt && (
                        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-jakarta mt-2 line-clamp-2">
                          {story.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 font-jakarta">
                        <div className="w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center text-[9px] font-bold text-brand shrink-0">
                          {story.author?.name?.charAt(0) || 'A'}
                        </div>
                        <span className="font-medium text-gray-500 dark:text-gray-400">{story.author?.name}</span>
                        {story.publishedAt && (
                          <>
                            <span className="text-gray-300 dark:text-gray-600">·</span>
                            <span>{formatDate(story.publishedAt)}</span>
                          </>
                        )}
                        {story.readTimeMinutes && (
                          <>
                            <span className="text-gray-300 dark:text-gray-600">·</span>
                            <span>{story.readTimeMinutes} min</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* All Stories list */}
          {articles.length > 0 && (
            <StoriesListClient stories={articles} />
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

          {/* About */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
            <h3 className="font-sora font-bold text-sm text-navy dark:text-white mb-3">About Founder Stories</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta leading-relaxed">
              In-depth profiles of the builders, investors, and operators shaping India's AI ecosystem. Every story is independently reported — no PR, no fluff.
            </p>
          </div>

          {/* Topics */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
            <h3 className="font-sora font-bold text-sm text-navy dark:text-white mb-4">Story Themes</h3>
            <div className="flex flex-wrap gap-2">
              {['Origin Story', 'Fundraising', 'Product', 'Team Building', 'Failure', 'Vision', 'India Stack', 'Global Expansion'].map((tag) => (
                <span key={tag} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-brand/10 hover:text-brand cursor-pointer transition-colors font-jakarta">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Recent stories quick list */}
          {articles.slice(0, 5).length > 0 && (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
              <h3 className="font-sora font-bold text-sm text-navy dark:text-white mb-4">Recent Stories</h3>
              <div className="space-y-3">
                {articles.slice(0, 5).map((s: any, i: number) => (
                  <Link key={s.slug} href={`/stories/${s.slug}`} className="group flex gap-3 items-start">
                    <span className="font-sora font-extrabold text-xl text-gray-100 dark:text-gray-800 leading-none shrink-0 w-6 text-right">
                      {i + 1}
                    </span>
                    <p className="text-xs font-semibold text-navy dark:text-white group-hover:text-brand transition-colors leading-snug line-clamp-2 font-jakarta">
                      {s.title}
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

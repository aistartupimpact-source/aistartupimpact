import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';
import { generateItemListSchema, generateCollectionPageSchema, generateBreadcrumbSchema } from '@/lib/seo';
import FounderActionButton from '@/components/auth/FounderActionButton';

const ToolsListWithComparison = dynamic(() => import('@/components/ToolsListWithComparison'), {
  loading: () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl" />
      <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
        ))}
      </div>
    </div>
  ),
});
const DiscoverySections = dynamic(() => import('@/components/tools/DiscoverySections'), {
  loading: () => (
    <div className="space-y-6 mb-8 animate-pulse">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i}>
          <div className="h-5 w-40 bg-gray-100 dark:bg-gray-800 rounded mb-3" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="shrink-0 w-56 h-36 bg-gray-100 dark:bg-gray-800 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
});

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Editor's Picks: Best AI Tools — Reviewed & Rated",
  description:
    "150+ AI tools reviewed and rated by our editorial team. Honest verdicts, ratings, and pricing — no pay-to-play, no affiliate bias.",
  alternates: { canonical: 'https://aistartupimpact.com/tools' },
  openGraph: {
    title: "Editor's Picks: Best AI Tools — Reviewed & Rated",
    description:
      "150+ AI tools reviewed and rated by our editorial team. Honest verdicts, ratings, and pricing.",
    type: 'website',
    url: 'https://aistartupimpact.com/tools',
    siteName: 'AIStartupImpact',
    images: [{ url: 'https://aistartupimpact.com/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Editor's Picks: Best AI Tools",
    description: "150+ AI tools reviewed and rated. Honest verdicts, ratings, and pricing.",
    creator: '@aikitstartup',
  },
};

import { getDirectoryToolsDirect, getToolCategoryTreeDirect, getToolTagGroupsForFilterDirect, getToolTagMappingsDirect, getTrendingToolsDirect, getRecentlyAddedToolsDirect, getEditorPicksDirect, getMostUpvotedThisMonthDirect } from '@/lib/db';

export default async function ToolsPage({ searchParams }: { searchParams: { category?: string; tag?: string; pricing?: string } }) {
  const [picks, categoryTree, tagGroups, toolTagMap, trending, recentlyAdded, editorPicks, mostUpvoted] = await Promise.all([
    getDirectoryToolsDirect(),
    getToolCategoryTreeDirect(),
    getToolTagGroupsForFilterDirect(),
    getToolTagMappingsDirect(),
    getTrendingToolsDirect(12),
    getRecentlyAddedToolsDirect(12),
    getEditorPicksDirect(12),
    getMostUpvotedThisMonthDirect(12),
  ]);

  // Resolve initial tag slug to tag ID if ?tag= query param provided
  const initialTagSlug = searchParams.tag || null;
  let initialTagId: string | null = null;
  if (initialTagSlug) {
    for (const group of tagGroups) {
      const found = group.tags.find((t: any) => t.slug === initialTagSlug);
      if (found) {
        initialTagId = found.id;
        break;
      }
    }
  }

  const initialPricing = searchParams.pricing || null;

  const siteUrl = 'https://aistartupimpact.com';

  const itemListSchema = generateItemListSchema({
    name: "Editor's Picks: Best AI Tools",
    description: "AI tools reviewed and rated by the AIStartupImpact editorial team.",
    url: `${siteUrl}/tools`,
    items: picks.map((t, i) => ({
      position: i + 1,
      name: t.name,
      url: `${siteUrl}/tools/${t.slug}`,
      description: t.tagline,
    })),
  });

  const collectionSchema = generateCollectionPageSchema({
    name: "Editor's Picks: Best AI Tools",
    description: "AI tools reviewed and rated by the AIStartupImpact editorial team. No pay-to-play, no affiliate bias.",
    url: `${siteUrl}/tools`,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'AI Tools', url: `${siteUrl}/tools` },
  ]);

  // Get category tree for browse grid
  const parentCategoriesForGrid = (categoryTree as any[]).filter((c: any) => c.toolCount > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24 sm:pb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero Section */}
      <div className="mb-6 sm:mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div>
            <h1 className="font-sora font-extrabold text-lg sm:text-2xl md:text-3xl lg:text-4xl text-navy dark:text-white leading-tight tracking-tight">
              Find the right AI tool.{' '}
              <span className="text-brand">Not just the most popular one.</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-jakarta text-xs sm:text-sm max-w-2xl mt-1 sm:mt-2">
              {picks.length}+ AI tools across {parentCategoriesForGrid.length} categories — powered by real reviews.
            </p>
          </div>
          <FounderActionButton
            href="/founder/tools/new"
            className="border border-brand text-brand bg-brand/5 hover:bg-brand/10 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold font-jakarta text-xs sm:text-sm transition-colors whitespace-nowrap text-center shrink-0 w-full md:w-auto"
          >
            + Submit Your Tool
          </FounderActionButton>
        </div>

        {/* Search Suggestions as Filter Shortcuts */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs text-gray-400 font-jakarta">Popular:</span>
          <Link href="/tools/category/writing-content" className="px-2.5 py-1.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold font-jakarta bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-brand/10 hover:text-brand transition-colors active:scale-95">Write blog posts</Link>
          <Link href="/tools/category/image-generation-editing" className="px-2.5 py-1.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold font-jakarta bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-brand/10 hover:text-brand transition-colors active:scale-95">Generate images</Link>
          <Link href="/tools/category/code-development" className="px-2.5 py-1.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold font-jakarta bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-brand/10 hover:text-brand transition-colors active:scale-95">Code assistant</Link>
          <Link href="/tools?pricing=FREE" className="px-2.5 py-1.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold font-jakarta bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 transition-colors active:scale-95">Free tools</Link>
          <Link href="/tools/category/customer-experience" className="px-2.5 py-1.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold font-jakarta bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-brand/10 hover:text-brand transition-colors active:scale-95">AI chatbots</Link>
          <Link href="/tools/category/video" className="px-2.5 py-1.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold font-jakarta bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-brand/10 hover:text-brand transition-colors active:scale-95">Video creation</Link>
        </div>
      </div>

      {/* Discovery Sections */}
      <DiscoverySections
        trending={trending as any[]}
        recentlyAdded={recentlyAdded as any[]}
        editorPicks={editorPicks as any[]}
        mostUpvoted={mostUpvoted as any[]}
      />

      {/* Browse by Category */}
      {parentCategoriesForGrid.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <h2 className="font-sora font-bold text-sm sm:text-lg text-navy dark:text-white mb-3 sm:mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {parentCategoriesForGrid.map((cat: any) => (
              <Link
                key={cat.slug}
                href={`/tools/category/${cat.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md bg-gray-50 dark:bg-gray-800/60 hover:bg-brand/10 dark:hover:bg-brand/15 transition-colors group"
              >
                {cat.icon && <span className="text-sm">{cat.icon}</span>}
                <span className="font-sora font-medium text-xs sm:text-sm text-navy dark:text-gray-200 group-hover:text-brand transition-colors">{cat.name}</span>
                <span className="text-[10px] sm:text-xs text-gray-400 font-jakarta">{cat.toolCount}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tools List Component with State */}
      <ToolsListWithComparison picks={picks} tagGroups={tagGroups} toolTagMap={toolTagMap} initialTagId={initialTagId} initialPricing={initialPricing} />


    </div>
  );
}

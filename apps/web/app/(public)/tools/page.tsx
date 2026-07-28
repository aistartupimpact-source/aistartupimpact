import Link from 'next/link';
import { Metadata } from 'next';
import { generateItemListSchema, generateCollectionPageSchema, generateBreadcrumbSchema } from '@/lib/seo';
import ToolsListWithComparison from '@/components/ToolsListWithComparison';
import FounderActionButton from '@/components/auth/FounderActionButton';
import DiscoverySections from '@/components/tools/DiscoverySections';

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Editor's Picks: Best AI Tools — Reviewed & Rated",
  description:
    "24 AI tools our editorial team actually uses and recommends. Honest verdicts, ratings, and pricing — no pay-to-play, no affiliate bias.",
  alternates: { canonical: 'https://aistartupimpact.com/tools' },
  openGraph: {
    title: "Editor's Picks: Best AI Tools — Reviewed & Rated",
    description:
      "24 AI tools our editorial team actually uses and recommends. Honest verdicts, ratings, and pricing.",
    type: 'website',
    url: 'https://aistartupimpact.com/tools',
    siteName: 'AIStartupImpact',
    images: [{ url: 'https://aistartupimpact.com/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Editor's Picks: Best AI Tools",
    description: "12 AI tools our editorial team actually uses and recommends.",
    creator: '@aikitstartup',
  },
};

import { getDirectoryToolsDirect, getToolCategoryTreeDirect, getToolTagGroupsForFilterDirect, getToolTagMappingsDirect, getTrendingToolsDirect, getRecentlyAddedToolsDirect, getEditorPicksDirect, getMostUpvotedThisMonthDirect } from '@/lib/db';

export default async function ToolsPage({ searchParams }: { searchParams: { category?: string; tag?: string } }) {
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
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* Header */}
      <div className="mb-5 sm:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-sora font-extrabold text-xl sm:text-2xl md:text-3xl lg:text-4xl text-navy dark:text-white leading-tight tracking-tight">
            Find the right AI tool.{' '}
            <span className="text-brand">Not just the most popular one.</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-jakarta text-xs sm:text-sm max-w-2xl mt-1.5 sm:mt-2">
            Browse, filter, and compare {picks.length}+ AI tools — tested by real users, ranked by what actually works.
          </p>
        </div>
        <FounderActionButton
          href="/founder/tools/new"
          className="bg-brand text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold font-jakarta text-xs sm:text-sm hover:scale-105 transition-transform shadow-lg shadow-brand/20 whitespace-nowrap text-center shrink-0"
        >
          + Submit Your Tool
        </FounderActionButton>
      </div>

      {/* Discovery Sections */}
      <DiscoverySections
        trending={trending as any[]}
        recentlyAdded={recentlyAdded as any[]}
        editorPicks={editorPicks as any[]}
        mostUpvoted={mostUpvoted as any[]}
      />

      {/* Tools List Component with State */}
      <ToolsListWithComparison picks={picks} tagGroups={tagGroups} toolTagMap={toolTagMap} initialTagId={initialTagId} />


    </div>
  );
}

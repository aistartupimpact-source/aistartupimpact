import Link from 'next/link';
import { Metadata } from 'next';
import { generateItemListSchema, generateCollectionPageSchema, generateBreadcrumbSchema } from '@/lib/seo';
import ToolsListWithComparison from '@/components/ToolsListWithComparison';

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
    images: [{ url: 'https://aistartupimpact.com/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Editor's Picks: Best AI Tools",
    description: "12 AI tools our editorial team actually uses and recommends.",
    creator: '@aikitstartup',
  },
};

import { getDirectoryToolsDirect, getToolCategoriesDirect } from '@/lib/db';

export default async function ToolsPage({ searchParams }: { searchParams: { category?: string } }) {
  const [picks, categories] = await Promise.all([
    getDirectoryToolsDirect(),
    getToolCategoriesDirect()
  ]);

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
      <div className="mb-8 sm:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-sora font-extrabold text-2xl sm:text-3xl md:text-4xl text-navy dark:text-white leading-tight tracking-tight">
            Find the right AI tool.{' '}
            <span className="text-brand">Not just the most popular one.</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm max-w-2xl mt-2">
            Browse, filter, and compare {picks.length}+ AI tools — tested by real users, ranked by what actually works.
          </p>
        </div>
        <Link href="/submit-tool" className="bg-brand text-white px-5 py-2.5 rounded-xl font-bold font-jakarta text-sm hover:scale-105 transition-transform shadow-lg shadow-brand/20 whitespace-nowrap text-center shrink-0">
          + Submit Your Tool
        </Link>
      </div>

      {/* Tools List Component with State */}
      <ToolsListWithComparison picks={picks} />

      {/* CTA */}
      <div className="card p-6 mt-8 text-center bg-gradient-to-r from-brand-50 to-white dark:from-brand-900/15 dark:to-gray-900">
        <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta">
          Know a tool we should review? <a href="mailto:tools@aistartupimpact.com" className="text-brand font-semibold hover:underline">Submit it here →</a>
        </p>
      </div>
    </div>
  );
}

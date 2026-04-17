import Link from 'next/link';
import { Metadata } from 'next';
import { Star, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { generateItemListSchema, generateCollectionPageSchema, generateBreadcrumbSchema } from '@/lib/seo';
import ToolsListWithComparison from '@/components/ToolsListWithComparison';

export const metadata: Metadata = {
  title: "Editor's Picks: Best AI Tools — Reviewed & Rated",
  description:
    "12 AI tools our editorial team actually uses and recommends. Honest verdicts, ratings, and pricing — no pay-to-play, no affiliate bias.",
  alternates: { canonical: 'https://aistartupimpact.com/tools' },
  openGraph: {
    title: "Editor's Picks: Best AI Tools — Reviewed & Rated",
    description:
      "12 AI tools our editorial team actually uses and recommends. Honest verdicts, ratings, and pricing.",
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

const editorialPicks = [
  { slug: 'cursor', name: 'Cursor', tagline: 'AI-first code editor that writes, edits, and debugs for you', category: 'Dev Tools', rating: 4.8, pricing: 'Freemium', verdict: 'Best AI code editor right now. The Composer feature for multi-file edits is unmatched.' },
  { slug: 'perplexity', name: 'Perplexity', tagline: 'AI search engine with cited sources and zero hallucinations', category: 'Research', rating: 4.8, pricing: 'Freemium', verdict: 'Replaced Google for research queries. The citation system builds real trust.' },
  { slug: 'midjourney', name: 'Midjourney', tagline: 'The gold standard for AI image generation and design', category: 'Design', rating: 4.7, pricing: 'Paid ($10/mo)', verdict: 'Nothing else comes close for creative image generation quality.' },
  { slug: 'v0-dev', name: 'v0.dev', tagline: 'AI-powered UI generation from text prompts by Vercel', category: 'Dev Tools', rating: 4.6, pricing: 'Freemium', verdict: 'Cuts frontend prototyping time by 80%. Ideal for rapid MVP building.' },
  { slug: 'claude', name: 'Claude', tagline: "Anthropic's conversational AI with 200K context window", category: 'Productivity', rating: 4.7, pricing: 'Freemium', verdict: 'Best for long-document analysis. The 200K context window is game-changing.' },
  { slug: 'hugging-face', name: 'Hugging Face', tagline: 'The open-source AI community — models, datasets, spaces', category: 'Open Source', rating: 4.9, pricing: 'Free', verdict: 'Essential for any ML engineer. The Spaces feature alone makes it invaluable.' },
  { slug: 'notion-ai', name: 'Notion AI', tagline: 'AI writing assistant built into your workspace', category: 'Writing', rating: 4.4, pricing: 'Add-on ($10/mo)', verdict: 'Useful if you already live in Notion. Summarization and Q&A features are solid.' },
  { slug: 'gamma', name: 'Gamma', tagline: 'AI-powered presentations from text — beautiful slides in seconds', category: 'Productivity', rating: 4.6, pricing: 'Freemium', verdict: 'Killed PowerPoint for us. Feed it a doc and get a deck in 30 seconds.' },
  { slug: 'descript', name: 'Descript', tagline: 'AI-powered video and podcast editing platform', category: 'Media', rating: 4.5, pricing: 'Freemium', verdict: 'Edit video by editing text. The filler word removal alone saves hours.' },
  { slug: 'replit-ai', name: 'Replit AI', tagline: 'AI-powered cloud IDE with code generation and deployment', category: 'Dev Tools', rating: 4.5, pricing: 'Freemium', verdict: 'Deploy a full app from a text prompt. Best for hackathons and quick prototypes.' },
  { slug: 'jasper', name: 'Jasper', tagline: 'Enterprise AI content platform for marketing teams', category: 'Marketing', rating: 4.3, pricing: 'Paid ($49/mo)', verdict: 'Expensive but powerful for marketing teams that need brand-consistent copy at scale.' },
  { slug: 'intercom-fin', name: 'Intercom Fin', tagline: 'AI customer service agent that resolves 50% of queries', category: 'Support', rating: 4.4, pricing: 'Paid', verdict: 'Real ROI — cuts support tickets in half. Best for SaaS companies with docs.' },
];

export default async function ToolsPage({ searchParams }: { searchParams: { category?: string } }) {
  const categorySlug = searchParams.category || 'all';

  const [dbPicks, categories] = await Promise.all([
    getDirectoryToolsDirect(categorySlug),
    getToolCategoriesDirect()
  ]);

  // Combine DB tools with the editorial fallback tools to guarantee the grid is full
  // and apply frontend category filtering to the static array if selected.
  const staticFiltered = categorySlug === 'all'
    ? editorialPicks
    : editorialPicks.filter(p => p.category.toLowerCase().replace(' ', '-') === categorySlug);

  const picks = [...dbPicks, ...staticFiltered];

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
      <div className="mb-8 sm:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Sparkles className="w-6 h-6 text-brand" />
            <h1 className="font-sora font-extrabold text-2xl sm:text-3xl md:text-4xl text-navy dark:text-white">
              Editor&apos;s Picks: AI Tools
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm sm:text-base max-w-2xl">
            {picks.length} AI tools we actually use and recommend. Honest verdicts from our editorial team — no pay-to-play, no affiliate bias.
          </p>
        </div>
        <Link href="/submit-tool" className="bg-brand text-white px-5 py-2.5 rounded-xl font-bold font-jakarta text-sm hover:scale-105 transition-transform shadow-lg shadow-brand/20 whitespace-nowrap text-center">
          + Submit Your Tool
        </Link>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
        <Link
          href="/tools?category=all"
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${categorySlug === 'all' ? 'bg-navy text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          All Tools
        </Link>
        {categories.map((cat: any) => (
          <Link
            key={cat.slug}
            href={`/tools?category=${cat.slug}`}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${categorySlug === cat.slug ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            {cat.name}
          </Link>
        ))}
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

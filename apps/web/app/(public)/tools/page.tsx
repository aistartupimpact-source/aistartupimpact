import Link from 'next/link';
import { Star, Zap, ExternalLink, ArrowRight, Sparkles } from 'lucide-react';

const picks = [
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

export default function ToolsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-8 sm:mb-10">
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

      {/* Tools List */}
      <div className="space-y-4 sm:space-y-5">
        {picks.map((tool, i) => (
          <Link key={tool.slug} href={`/tools/${tool.slug}`} className="group block">
            <div className="card p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
              {/* Icon + Rank */}
              <div className="flex sm:flex-col items-center gap-3 sm:gap-2 sm:w-16 shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/30 dark:to-brand-800/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-brand" />
                </div>
                <span className="text-xs font-sora font-bold text-gray-300 dark:text-gray-600 sm:text-center">#{i + 1}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-sora font-bold text-base sm:text-lg text-navy dark:text-white group-hover:text-brand transition-colors">
                      {tool.name}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-jakarta mt-0.5">{tool.tagline}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-full shrink-0">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400">{tool.rating}</span>
                  </div>
                </div>

                {/* Verdict */}
                <p className="text-sm text-gray-600 dark:text-gray-300 font-jakarta mt-2 italic leading-relaxed">
                  &ldquo;{tool.verdict}&rdquo;
                </p>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="badge-category text-[10px]">{tool.category}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${tool.pricing === 'Free' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : tool.pricing === 'Freemium' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                    {tool.pricing}
                  </span>
                  <span className="text-brand text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-auto">
                    Read Review <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="card p-6 mt-8 text-center bg-gradient-to-r from-brand-50 to-white dark:from-brand-900/15 dark:to-gray-900">
        <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta">
          Know a tool we should review? <a href="mailto:tools@aistartupimpact.com" className="text-brand font-semibold hover:underline">Submit it here →</a>
        </p>
      </div>
    </div>
  );
}

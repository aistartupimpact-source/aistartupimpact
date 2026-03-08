import Link from 'next/link';
import { Star, Zap, ExternalLink, ChevronRight, Check, X as XIcon, ThumbsUp, ThumbsDown, Globe, IndianRupee, ArrowRight } from 'lucide-react';

const tool = {
  name: 'Cursor',
  slug: 'cursor',
  tagline: 'AI-first code editor that writes, edits, and debugs for you',
  description: 'Cursor is a code editor built from the ground up for AI-assisted development. It includes inline code generation, multi-file editing, and a conversational AI assistant that understands your entire codebase. Built on VS Code, it supports all extensions and themes you already use.',
  category: 'Dev Tools',
  rating: 4.8,
  reviews: 2340,
  pricing: 'Freemium',
  website: 'https://cursor.sh',
  founded: '2023',
  hq: 'San Francisco, USA',
  pros: ['Inline code generation is exceptionally fast', 'Multi-file editing (Composer) understands project context', 'Built on VS Code — all extensions work', 'Tab completion feels magical after training'],
  cons: ['Pro plan required for best models (GPT-4, Claude)', 'Can be resource-heavy on older machines', 'Occasional hallucinations in complex codebases'],
  plans: [
    { name: 'Hobby', price: 'Free', features: ['2,000 completions/month', 'GPT-3.5 access', 'Basic chat'] },
    { name: 'Pro', price: '$20/mo', features: ['Unlimited completions', 'GPT-4 + Claude access', 'Multi-file editing', 'Priority support'], recommended: true },
    { name: 'Business', price: '$40/mo', features: ['Everything in Pro', 'Admin dashboard', 'SSO + SAML', 'Usage analytics', 'Centralized billing'] },
  ],
  alternatives: [
    { slug: 'github-copilot', name: 'GitHub Copilot', rating: 4.5, pricing: '$10/mo' },
    { slug: 'replit-ai', name: 'Replit AI', rating: 4.5, pricing: 'Freemium' },
    { slug: 'tabnine', name: 'Tabnine', rating: 4.2, pricing: '$12/mo' },
  ],
  userReviews: [
    { author: 'Rohit S.', role: 'Full-Stack Dev', rating: 5, text: 'Cursor completely changed how I code. The Composer feature lets me refactor entire modules by just describing what I want.' },
    { author: 'Priya M.', role: 'Data Scientist', rating: 4, text: 'Great for Python and notebook work. The tab completions are addictive. Only downside is occasional slowness with very large files.' },
    { author: 'Aditya K.', role: 'Startup CTO', rating: 5, text: 'Rolled Cursor out to our entire 15-person eng team. Productivity jumped measurably. The business plan is well worth it.' },
  ],
};

export default function ToolDetailPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs sm:text-sm font-jakarta text-gray-400 dark:text-gray-500 mb-6">
        <Link href="/" className="hover:text-brand">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/tools" className="hover:text-brand">Tools</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600 dark:text-gray-300">{tool.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/30 dark:to-brand-800/20 flex items-center justify-center shrink-0">
          <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-brand" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-navy dark:text-white">{tool.name}</h1>
              <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm sm:text-base mt-1">{tool.tagline}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-2.5 py-1 rounded-full">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-yellow-700 dark:text-yellow-400">{tool.rating}</span>
              <span className="text-xs text-gray-400 ml-1">({tool.reviews.toLocaleString()} reviews)</span>
            </div>
            <span className="badge-category">{tool.category}</span>
            <span className="text-[10px] font-bold bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-2.5 py-1 rounded-full uppercase">{tool.pricing}</span>
          </div>
          <div className="flex gap-3 mt-4">
            <a href={tool.website} target="_blank" rel="noopener noreferrer" className="btn-brand text-sm">
              Visit Website <ExternalLink className="w-4 h-4 ml-1" />
            </a>
            <button className="btn-outline text-sm">Compare</button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 space-y-8">
          {/* Overview */}
          <div className="card p-5 sm:p-6">
            <h2 className="section-title mb-4">Overview</h2>
            <p className="text-gray-600 dark:text-gray-300 font-jakarta text-sm sm:text-base leading-relaxed">{tool.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
              <div><span className="text-xs text-gray-400 font-jakarta block">Founded</span><span className="font-sora font-bold text-sm text-navy dark:text-white">{tool.founded}</span></div>
              <div><span className="text-xs text-gray-400 font-jakarta block">HQ</span><span className="font-sora font-bold text-sm text-navy dark:text-white">{tool.hq}</span></div>
              <div><span className="text-xs text-gray-400 font-jakarta block">Website</span><a href={tool.website} className="font-sora font-bold text-sm text-brand hover:underline">{tool.website.replace('https://', '')}</a></div>
            </div>
          </div>

          {/* Pros / Cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="font-sora font-bold text-sm text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                <ThumbsUp className="w-4 h-4" /> Pros
              </h3>
              <ul className="space-y-2.5">
                {tool.pros.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm font-jakarta text-gray-600 dark:text-gray-300">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />{p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-5">
              <h3 className="font-sora font-bold text-sm text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                <ThumbsDown className="w-4 h-4" /> Cons
              </h3>
              <ul className="space-y-2.5">
                {tool.cons.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm font-jakarta text-gray-600 dark:text-gray-300">
                    <XIcon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />{c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h2 className="section-title mb-6">Pricing Plans</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {tool.plans.map((plan) => (
                <div key={plan.name} className={`card p-5 flex flex-col ${'recommended' in plan && plan.recommended ? 'ring-2 ring-brand' : ''}`}>
                  {'recommended' in plan && plan.recommended && (
                    <span className="badge-brand text-[9px] self-start mb-3">Recommended</span>
                  )}
                  <h3 className="font-sora font-bold text-base text-navy dark:text-white">{plan.name}</h3>
                  <div className="font-sora font-extrabold text-2xl text-brand mt-2">{plan.price}</div>
                  <ul className="mt-4 space-y-2 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm font-jakarta text-gray-500 dark:text-gray-400">
                        <Check className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />{f}
                      </li>
                    ))}
                  </ul>
                  <button className={`mt-5 w-full text-sm ${'recommended' in plan && plan.recommended ? 'btn-brand' : 'btn-outline'}`}>
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* User Reviews */}
          <div>
            <h2 className="section-title mb-6">User Reviews</h2>
            <div className="space-y-4">
              {tool.userReviews.map((rev) => (
                <div key={rev.author} className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand/10 dark:bg-brand/20 flex items-center justify-center text-sm text-brand font-bold">{rev.author.charAt(0)}</div>
                      <div>
                        <span className="font-sora font-bold text-sm text-navy dark:text-white">{rev.author}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 block font-jakarta">{rev.role}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-jakarta leading-relaxed">{rev.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-6">
          <div className="card p-5 sticky top-20">
            <h4 className="font-sora font-bold text-sm text-navy dark:text-white mb-4">Alternatives</h4>
            <div className="space-y-3">
              {tool.alternatives.map((alt) => (
                <Link key={alt.slug} href={`/tools/${alt.slug}`} className="flex items-center justify-between group p-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><Zap className="w-4 h-4 text-brand" /></div>
                    <span className="font-jakarta font-medium text-sm text-navy dark:text-white group-hover:text-brand transition-colors">{alt.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />{alt.rating}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

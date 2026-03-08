'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search as SearchIcon, Clock, Zap, Building2, IndianRupee, Newspaper, BookOpen, X } from 'lucide-react';

const tabs = [
  { label: 'All', icon: SearchIcon },
  { label: 'Articles', icon: Newspaper },
  { label: 'Tools', icon: Zap },
  { label: 'Startups', icon: Building2 },
  { label: 'Funding', icon: IndianRupee },
];

const mockResults = [
  { type: 'article', title: "OpenAI's GPT-5 Launch: What Indian Developers Need to Know", slug: '/news/openai-gpt5-india', excerpt: 'The latest frontier model brings advanced reasoning and multimodal capabilities...', category: 'AI News', date: 'Mar 6, 2025' },
  { type: 'tool', title: 'Cursor — AI-First Code Editor', slug: '/tools/cursor', excerpt: 'AI-first code editor that writes, edits, and debugs for you', category: 'Dev Tools', date: '' },
  { type: 'startup', title: 'Sarvam AI', slug: '/startups/sarvam-ai', excerpt: 'India-first foundation models for enterprise', category: 'LLM/NLP', date: 'Series A • ₹415Cr' },
  { type: 'article', title: "India's New AI Policy Framework: What Every Founder Must Know", slug: '/news/india-ai-policy', excerpt: 'Comprehensive guidelines covering data privacy, model transparency, and startup incentives.', category: 'Policy', date: 'Mar 4, 2025' },
  { type: 'funding', title: 'MedAI Health — ₹83Cr Seed Round', slug: '/funding/medai-seed', excerpt: 'AI-powered diagnostics for rural healthcare', category: 'HealthTech', date: 'Mar 1, 2025' },
  { type: 'tool', title: 'Perplexity — AI Search Engine', slug: '/tools/perplexity', excerpt: 'AI search engine with cited sources and zero hallucinations', category: 'Research', date: '' },
];

const typeIcons: Record<string, typeof Newspaper> = { article: Newspaper, tool: Zap, startup: Building2, funding: IndianRupee };

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const hasQuery = query.length > 0;

  const filtered = activeTab === 'All'
    ? mockResults
    : mockResults.filter(r => r.type === activeTab.toLowerCase().replace('articles', 'article'));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-navy dark:text-white mb-6">Search</h1>

      {/* Search Input */}
      <div className="relative mb-6">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles, tools, startups, funding..."
          className="input-field pl-12 pr-10 text-base"
          autoFocus
        />
        {hasQuery && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`pill whitespace-nowrap text-xs shrink-0 flex items-center gap-1.5 ${activeTab === tab.label ? 'bg-brand text-white hover:bg-brand-600 hover:text-white' : ''}`}
          >
            <tab.icon className="w-3.5 h-3.5" />{tab.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {!hasQuery ? (
        <div className="text-center py-16 sm:py-20">
          <SearchIcon className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
          <h2 className="font-sora font-bold text-lg text-gray-400 dark:text-gray-500">Start typing to search</h2>
          <p className="text-sm text-gray-400 dark:text-gray-600 font-jakarta mt-1">Search across articles, tools, startups, and funding rounds</p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['GPT-5', 'Krutrim', 'AI Tools', 'Funding India', 'LLM'].map((t) => (
              <button key={t} onClick={() => setQuery(t)} className="pill text-xs">{t}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-400 font-jakarta mb-4">{filtered.length} results for &ldquo;{query}&rdquo;</p>
          {filtered.map((r, i) => {
            const Icon = typeIcons[r.type] || Newspaper;
            return (
              <Link key={i} href={r.slug} className="group block">
                <div className="card p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-brand" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{r.type}</span>
                      <span className="badge-category text-[9px]">{r.category}</span>
                    </div>
                    <h3 className="font-sora font-bold text-[15px] sm:text-base text-navy dark:text-white group-hover:text-brand transition-colors">{r.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta mt-1 line-clamp-1">{r.excerpt}</p>
                    {r.date && <span className="text-xs text-gray-400 font-jakarta mt-1 block">{r.date}</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

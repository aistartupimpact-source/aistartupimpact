import Link from 'next/link';
import { ChevronRight, Clock, TrendingUp, Filter, Search } from 'lucide-react';

const categories = ['All', 'AI News', 'Startups', 'Funding', 'Policy', 'Product Launches', 'Opinion'];

const articles = [
  { slug: 'openai-gpt5-india', title: "OpenAI's GPT-5 Launch: What Indian Developers Need to Know", excerpt: 'The latest frontier model brings advanced reasoning, multimodal capabilities, and a new pricing tier aimed at startups.', category: 'AI News', author: 'Rahul Kumar', date: 'Mar 6, 2025', readTime: '5 min', featured: true },
  { slug: 'krutrim-series-b', title: "Ola Krutrim Raises $200M Series B to Build India's Own Foundation Model", excerpt: 'Bhavish Aggarwal-led AI startup secures major funding round to compete with global LLM providers.', category: 'Funding', author: 'Anjali Nair', date: 'Mar 5, 2025', readTime: '4 min', featured: true },
  { slug: 'cursor-copilot-cody', title: 'Cursor vs GitHub Copilot vs Cody: The 2025 Developer Survey Results', excerpt: 'We surveyed 5,000 developers to find out which AI coding assistant actually improves productivity.', category: 'AI News', author: 'Vikram Patel', date: 'Mar 5, 2025', readTime: '8 min', featured: false },
  { slug: 'india-ai-policy', title: "India's New AI Policy Framework: What Every Founder Must Know", excerpt: 'The government releases comprehensive guidelines covering data privacy, model transparency, and startup incentives.', category: 'Policy', author: 'Priya Sharma', date: 'Mar 4, 2025', readTime: '6 min', featured: false },
  { slug: 'bangalore-ai-hub', title: "Bangalore Overtakes Singapore as Asia's #2 AI Startup Hub", excerpt: 'New report from CB Insights ranks Bangalore behind only Beijing in terms of AI startup density and funding.', category: 'Startups', author: 'Meera Rao', date: 'Mar 3, 2025', readTime: '5 min', featured: false },
  { slug: 'bharat-gpt-launch', title: 'BharatGPT: Open-Source LLM Trained on 22 Indian Languages', excerpt: 'A consortium of IITs releases a multilingual model that outperforms GPT-4 on Hindi and Tamil benchmarks.', category: 'Product Launches', author: 'Arjun Singh', date: 'Mar 2, 2025', readTime: '7 min', featured: false },
  { slug: 'ai-regulation-global', title: 'AI Regulation Landscape 2025: How India Compares to EU, US, and China', excerpt: 'A comprehensive comparison of AI governance approaches across the four largest regulatory blocks.', category: 'Policy', author: 'Priya Sharma', date: 'Mar 1, 2025', readTime: '10 min', featured: false },
  { slug: 'deeptech-funding-q1', title: 'Deep Tech Funding in India: Q1 2025 Report Card', excerpt: 'AI and deep tech startups raised ₹4,200 Cr in Q1 — a 43% increase over the same period last year.', category: 'Funding', author: 'Anjali Nair', date: 'Feb 28, 2025', readTime: '6 min', featured: false },
  { slug: 'ai-healthcare-india', title: 'How AI is Transforming Healthcare in Rural India', excerpt: 'From X-ray diagnostics to drug discovery, Indian AI healthtech startups are reaching millions.', category: 'Startups', author: 'Rahul Kumar', date: 'Feb 27, 2025', readTime: '9 min', featured: false },
];

export default function NewsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-6 sm:mb-10">
        <h1 className="font-sora font-extrabold text-2xl sm:text-3xl md:text-4xl text-navy dark:text-white">
          Latest News
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-jakarta mt-2 text-sm sm:text-base">
          Breaking AI news, startup updates, and ecosystem intelligence from India and the world.
        </p>
      </div>

      {/* Category Filter — horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {categories.map((cat, i) => (
          <button
            key={cat}
            className={`pill whitespace-nowrap text-xs sm:text-sm shrink-0 ${i === 0 ? 'bg-brand text-white hover:bg-brand-600 hover:text-white' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
        {articles.filter(a => a.featured).map((article) => (
          <Link key={article.slug} href={`/news/${article.slug}`} className="group">
            <div className="card overflow-hidden h-full">
              <div className="aspect-[16/9] bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 relative">
                <span className="absolute top-3 left-3 badge-brand text-[10px]">{article.category}</span>
                <span className="absolute top-3 right-3 badge-category text-[10px] bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
                  <TrendingUp className="w-3 h-3" /> Featured
                </span>
              </div>
              <div className="p-4 sm:p-6">
                <h2 className="font-sora font-bold text-lg sm:text-xl text-navy dark:text-white group-hover:text-brand transition-colors leading-snug">
                  {article.title}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-jakarta mt-2 line-clamp-2">{article.excerpt}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400 dark:text-gray-500 font-jakarta">
                  <span className="font-medium text-gray-500 dark:text-gray-400">{article.author}</span>
                  <span>·</span><span>{article.date}</span>
                  <span>·</span><span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.readTime}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* All Articles List */}
      <h2 className="section-title mb-6">All Articles</h2>
      <div className="space-y-4">
        {articles.filter(a => !a.featured).map((article) => (
          <Link key={article.slug} href={`/news/${article.slug}`} className="group block">
            <div className="card flex flex-col sm:flex-row overflow-hidden">
              <div className="sm:w-48 md:w-56 aspect-[16/10] sm:aspect-auto bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 relative shrink-0 sm:min-h-[140px]">
                <span className="absolute top-3 left-3 badge-brand text-[10px]">{article.category}</span>
              </div>
              <div className="p-4 sm:p-5 flex flex-col justify-center flex-1">
                <h3 className="font-sora font-bold text-[15px] sm:text-base text-navy dark:text-white group-hover:text-brand transition-colors leading-snug">
                  {article.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-jakarta mt-1.5 line-clamp-2 hidden sm:block">{article.excerpt}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 dark:text-gray-500 font-jakarta">
                  <span className="font-medium text-gray-500 dark:text-gray-400">{article.author}</span>
                  <span>·</span><span>{article.date}</span>
                  <span>·</span><span>{article.readTime}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-8 sm:mt-12">
        <button className="btn-outline">Load More Articles</button>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { Metadata } from 'next';
import { generateArticleSchema } from '@/lib/seo';
import { Clock, Calendar, User, Share2, Bookmark, ChevronRight, ArrowLeft, ThumbsUp, MessageSquare, Twitter, Linkedin, Facebook, Copy, TrendingUp } from 'lucide-react';

const article = {
  title: "OpenAI's GPT-5 Launch: What Indian Developers Need to Know About the New Era",
  excerpt: 'The latest frontier model brings advanced reasoning, multimodal capabilities, and a new pricing tier aimed at startups in emerging markets.',
  category: 'AI News',
  author: { name: 'Rahul Kumar', slug: 'rahul-kumar', bio: 'Senior AI Reporter covering deep tech, LLMs, and infrastructure.' },
  date: 'March 6, 2025',
  readTime: '5 min read',
  tags: ['GPT-5', 'OpenAI', 'LLM', 'India Developers'],
  content: `
    <h2>The Next Leap in AI Reasoning</h2>
    <p>OpenAI officially launched GPT-5 yesterday, marking what CEO Sam Altman called "the biggest capability jump in the history of AI." The model introduces significant improvements in logical reasoning, multilingual understanding, and code generation — areas particularly relevant to India's booming developer community.</p>
    <p>Unlike its predecessor, GPT-5 can maintain coherent reasoning chains across 128K context windows without degradation, a breakthrough that enables entirely new categories of applications — from legal document analysis to end-to-end software engineering workflows.</p>
    <h2>What's New for Indian Developers</h2>
    <p>Perhaps the most significant announcement for the Indian ecosystem is the new <strong>Startup Tier pricing</strong>, which offers GPT-5 API access at 60% reduced rates for registered startups in India, Brazil, and Southeast Asia. This directly addresses the cost barrier that has limited adoption of frontier models in emerging markets.</p>
    <blockquote>
      <p>"We believe the next billion AI users will come from India. This pricing reflects our commitment to making the most capable models accessible to Indian builders." — Sam Altman, CEO, OpenAI</p>
    </blockquote>
    <h2>Performance Benchmarks</h2>
    <p>Early benchmarks reveal GPT-5 achieves a 94.2% score on the MMLU-Pro benchmark, up from GPT-4o's 87.1%. On the HumanEval coding benchmark, it scores 96.8%, making it the first model to surpass human expert-level performance on standard coding tasks.</p>
    <p>For Indian language tasks, GPT-5 shows a 40% improvement in Hindi, Tamil, Telugu, and Bengali comprehension — largely attributed to the inclusion of 500B tokens of Indic language data in the training set.</p>
    <h2>Impact on the Indian AI Startup Ecosystem</h2>
    <p>The launch has immediate implications for hundreds of Indian startups building on OpenAI's API. Companies like Krutrim, Sarvam AI, and YellowG are expected to evaluate migration strategies in the coming weeks.</p>
    <p>Industry analysts predict that GPT-5's improved multilingual capabilities could accelerate the adoption of AI-powered services in tier-2 and tier-3 Indian cities, where vernacular language support has been a key adoption barrier.</p>
    <h2>What Comes Next</h2>
    <p>OpenAI has announced that GPT-5 will be available in India through Microsoft Azure's Mumbai data center, ensuring data residency compliance for regulated industries. The company also plans to open a dedicated developer relations office in Bangalore by Q3 2025.</p>
  `,
  relatedArticles: [
    { slug: 'krutrim-series-b', title: "Ola Krutrim Raises $200M Series B to Build India's Own Foundation Model", category: 'Funding', readTime: '4 min' },
    { slug: 'bharat-gpt', title: 'BharatGPT: Open-Source LLM Trained on 22 Indian Languages', category: 'Product', readTime: '7 min' },
    { slug: 'ai-regulation', title: "India's New AI Policy Framework: What Every Founder Must Know", category: 'Policy', readTime: '6 min' },
  ],
};

const toc = [
  { id: 'the-next-leap', label: 'The Next Leap in AI Reasoning' },
  { id: 'indian-devs', label: "What's New for Indian Developers" },
  { id: 'benchmarks', label: 'Performance Benchmarks' },
  { id: 'ecosystem-impact', label: 'Impact on Indian AI Ecosystem' },
  { id: 'whats-next', label: 'What Comes Next' },
];

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: new Date(article.date).toISOString(),
      authors: [article.author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
    },
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const jsonLd = generateArticleSchema({
    title: article.title,
    excerpt: article.excerpt,
    author: article.author,
    date: article.date,
    url: `https://aistartupimpact.com/news/${params.slug}`,
    category: article.category,
    tags: article.tags
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs sm:text-sm font-jakarta text-gray-400 dark:text-gray-500 mb-6">
        <Link href="/" className="hover:text-brand">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/news" className="hover:text-brand">News</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{article.category}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* ─── Main Content Column ──────────────── */}
        <article itemScope itemType="https://schema.org/NewsArticle" className="flex-1 min-w-0 max-w-article mx-auto lg:mx-0 w-full">
          {/* Category + Meta */}
          <span className="badge-brand text-[10px] mb-4 inline-block">{article.category}</span>

          <h1 itemProp="headline" className="font-sora font-extrabold text-[22px] leading-[1.2] sm:text-3xl md:text-[36px] md:leading-[1.2] text-navy dark:text-white">
            {article.title}
          </h1>

          <p itemProp="description" className="text-gray-500 dark:text-gray-400 font-jakarta text-sm sm:text-base mt-3 sm:mt-4 leading-relaxed">
            {article.excerpt}
          </p>

          {/* Author + Meta Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand/10 dark:bg-brand/20 flex items-center justify-center text-sm text-brand font-bold font-sora">
                {article.author.name.charAt(0)}
              </div>
              <div>
                <Link itemProp="author" itemScope itemType="https://schema.org/Person" href={`/ author / ${article.author.slug}`} className="text-sm font-semibold text-navy dark:text-white hover:text-brand font-jakarta">
                  <span itemProp="name">{article.author.name}</span>
                </Link>
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 font-jakarta">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{article.date}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.readTime}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Share">
                <Share2 className="w-4 h-4 text-gray-400" />
              </button>
              <button className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Bookmark">
                <Bookmark className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Cover Image Placeholder */}
          <div className="aspect-[16/9] bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl my-6 sm:my-8" />

          {/* Article Body */}
          <div
            itemProp="articleBody"
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            {article.tags.map((tag) => (
              <Link key={tag} href={`/ tag / ${tag.toLowerCase().replace(/ /g, '-')}`}>
                <span className="pill text-xs">{tag}</span>
              </Link>
            ))}
          </div>

          {/* Share Bar */}
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-400 font-jakarta font-bold uppercase tracking-wider">Share</span>
            {[Twitter, Linkedin, Facebook, Copy].map((Icon, i) => (
              <button key={i} className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-brand/10 dark:hover:bg-brand/20 flex items-center justify-center transition-colors">
                <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            ))}
          </div>

          {/* Author Bio */}
          <div className="card p-5 sm:p-6 mt-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-brand/10 dark:bg-brand/20 flex items-center justify-center text-lg text-brand font-bold font-sora shrink-0">
                {article.author.name.charAt(0)}
              </div>
              <div>
                <Link href={`/ author / ${article.author.slug}`} className="font-sora font-bold text-navy dark:text-white hover:text-brand">
                  {article.author.name}
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta mt-1">{article.author.bio}</p>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          <div className="mt-10 sm:mt-12">
            <h2 className="section-title mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {article.relatedArticles.map((rela) => (
                <Link key={rela.slug} href={`/ news / ${rela.slug}`} className="group">
                  <div className="card p-4 h-full">
                    <span className="badge-category text-[10px] mb-2 inline-block">{rela.category}</span>
                    <h3 className="font-sora font-bold text-sm text-navy dark:text-white group-hover:text-brand transition-colors leading-snug line-clamp-3">
                      {rela.title}
                    </h3>
                    <span className="text-xs text-gray-400 font-jakarta mt-2 block">{rela.readTime}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </article>

        {/* ─── Sidebar ─────────────────────────── */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-6">
          {/* Table of Contents — hidden on mobile */}
          <div className="hidden lg:block card p-5 sticky top-20">
            <h4 className="font-sora font-bold text-sm text-navy dark:text-white mb-4">Table of Contents</h4>
            <nav className="space-y-2">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block text-sm text-gray-500 dark:text-gray-400 hover:text-brand font-jakarta py-1 border-l-2 border-transparent hover:border-brand pl-3 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Newsletter CTA */}
          <div className="card p-5 bg-gradient-to-br from-brand-50 to-white dark:from-brand-900/20 dark:to-gray-900">
            <h4 className="font-sora font-bold text-sm text-navy dark:text-white mb-2">Get weekly insights</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta mb-4">Join 5,000+ founders reading our AI ecosystem digest.</p>
            <input type="email" placeholder="your@email.com" className="input-field text-xs mb-2" />
            <button className="btn-brand w-full text-xs">Subscribe Free</button>
          </div>

          {/* Trending */}
          <div className="card p-5">
            <h4 className="font-sora font-bold text-sm text-navy dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand" /> Trending
            </h4>
            <div className="space-y-3">
              {['GPT-5 Impact Analysis', 'Krutrim vs Sarvam AI', 'India AI Policy 2025'].map((t, i) => (
                <Link key={t} href="#" className="flex items-start gap-3 group">
                  <span className="text-lg font-sora font-extrabold text-brand/30">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-sm font-jakarta text-gray-600 dark:text-gray-400 group-hover:text-brand transition-colors leading-snug">{t}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

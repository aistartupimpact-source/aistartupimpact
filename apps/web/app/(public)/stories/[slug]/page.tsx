import Link from 'next/link';
import { Metadata } from 'next';
import { generateArticleSchema } from '@/lib/seo';
import { Clock, Calendar, User, Share2, Bookmark, ChevronRight, ArrowLeft, Twitter, Linkedin, Copy, Users, Quote } from 'lucide-react';

const story = {
  title: 'From IIT Lab to 10,000 Villages: How MedAI is Bringing Diagnostics to Rural India',
  excerpt: 'Ravi Kumar left a ₹1.5Cr Google offer to build AI that detects tuberculosis from chest X-rays — and it\'s already saving lives across Maharashtra.',
  author: { name: 'Anjali Nair', slug: 'anjali-nair', bio: 'Covers funding, startups, and the humans behind them.' },
  date: 'March 4, 2025',
  readTime: '15 min read',
  tags: ['HealthTech', 'Social Impact', 'Deep Tech', 'IIT Alumni'],
  content: `
    <h2>The Beginning: A Personal Mission</h2>
    <p>Ravi Kumar was six months into his role as a Machine Learning Engineer at Google Bangalore when he received a phone call that changed everything. His grandmother, living in a village outside Nagpur, had been misdiagnosed with a common cold — when she actually had early-stage tuberculosis.</p>
    <p>"The nearest qualified radiologist was 80 kilometers away," Ravi recalls. "By the time we got a proper diagnosis, she had been suffering for three months. That's when it hit me — AI can read X-rays faster and more accurately than most human readers. Why isn't this technology in every primary health center?"</p>
    <p>Six weeks later, Ravi resigned from Google. His friends thought he was crazy. His parents were terrified. But Ravi had a clarity of purpose that, as he puts it, "made the decision feel inevitable."</p>

    <h2>Building MedAI: The First 100 Days</h2>
    <p>Ravi started MedAI from his apartment in Indiranagar, Bangalore, with ₹12 lakhs in personal savings and a dataset of 50,000 chest X-rays from a partnership with CMC Vellore. His first hire was Deepa Rao, an IIT Madras PhD in computer vision who shared his conviction that AI could democratize healthcare.</p>
    <blockquote>
      <p>"We didn't want to build another AI tool for affluent urban hospitals. We wanted to build for the PHC in Yavatmal, the district hospital in Chhindwara. That's where the impact is." — Ravi Kumar, CEO, MedAI</p>
    </blockquote>
    <p>The technical challenge was formidable. Most AI diagnostic models are trained on Western patient data — they perform poorly on Indian demographics. MedAI's breakthrough was building a model trained exclusively on Indian patient data, accounting for differences in body composition, disease prevalence, and X-ray equipment quality.</p>

    <h2>The Pivot That Changed Everything</h2>
    <p>By month eight, MedAI had a working product — a mobile app that could analyze a chest X-ray in under 30 seconds and flag potential TB cases with 94.2% accuracy. But they hit a wall: rural health workers didn't use smartphones. The X-ray machines were old analog devices. The internet connectivity was spotty at best.</p>
    <p>"We had built a Silicon Valley product for rural India," Ravi laughs. "Classic mistake." The team pivoted to a hardware solution — a ₹15,000 portable AI device that could be attached to any X-ray machine, process images offline, and send results via SMS.</p>

    <h2>Impact at Scale</h2>
    <p>Today, MedAI's devices are deployed in 847 primary health centers across Maharashtra, Madhya Pradesh, and Tamil Nadu. They've screened over 2.3 million patients, flagging 142,000 for further examination — of which 38,000 were confirmed TB cases that would have gone undiagnosed.</p>
    <p>The numbers are staggering: MedAI estimates that their early detection has prevented an estimated 12,000 TB transmission chains, potentially saving tens of thousands of lives.</p>

    <h2>What's Next</h2>
    <p>With their recent ₹83Cr seed round led by Sequoia Scout, MedAI is expanding beyond TB. They're training models for malaria, pneumonia, and cardiac conditions — all optimized for Indian patient demographics and low-resource clinical settings.</p>
    <p>Ravi's vision is audacious: "By 2028, every primary health center in India should have AI-assisted diagnostics. Not as a luxury — as a standard. The technology is ready. The infrastructure is ready. We just need the will."</p>
  `,
  pullQuote: "We didn't want to build another AI tool for affluent urban hospitals. We wanted to build for the PHC in Yavatmal.",
};

const relatedStories = [
  { slug: 'sarvam-ai-journey', title: 'Sarvam AI: Building India-First Foundation Models from Scratch', readTime: '12 min' },
  { slug: 'agribot-agriculture', title: "AgriBot's Mission: AI-Powered Farming for 100 Million Indian Farmers", readTime: '10 min' },
  { slug: 'padhai-edtech', title: 'PadhAI: The AI Tutor Teaching in 10 Indian Languages', readTime: '11 min' },
];

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return {
    title: story.title,
    description: story.excerpt,
    openGraph: {
      title: story.title,
      description: story.excerpt,
      type: 'article',
      publishedTime: new Date(story.date).toISOString(),
      authors: [story.author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: story.title,
      description: story.excerpt,
    },
  };
}

export default function StoryDetailPage({ params }: { params: { slug: string } }) {
  const jsonLd = generateArticleSchema({
    title: story.title,
    excerpt: story.excerpt,
    author: story.author,
    date: story.date,
    url: `https://aistartupimpact.com/stories/${params.slug}`,
    category: "Founder Story",
    tags: story.tags
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs sm:text-sm font-jakarta text-gray-400 dark:text-gray-500 mb-6">
        <Link href="/" className="hover:text-brand">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/stories" className="hover:text-brand">Stories</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600 dark:text-gray-300 truncate max-w-[200px]">Founder Story</span>
      </nav>

      <article itemScope itemType="https://schema.org/Article" className="max-w-article mx-auto">
        {/* Category */}
        <span className="badge-brand text-[10px] mb-4 inline-block">Founder Story</span>

        <h1 itemProp="headline" className="font-sora font-extrabold text-[22px] leading-[1.2] sm:text-3xl md:text-[36px] md:leading-[1.2] text-navy dark:text-white">
          {story.title}
        </h1>

        <p itemProp="description" className="text-gray-500 dark:text-gray-400 font-jakarta text-sm sm:text-base mt-3 sm:mt-4 leading-relaxed">
          {story.excerpt}
        </p>

        {/* Author + Meta */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand/10 dark:bg-brand/20 flex items-center justify-center text-sm text-brand font-bold font-sora">
              {story.author.name.charAt(0)}
            </div>
            <div>
              <Link itemProp="author" itemScope itemType="https://schema.org/Person" href={`/ author / ${story.author.slug}`} className="text-sm font-semibold text-navy dark:text-white hover:text-brand font-jakarta">
                <span itemProp="name">{story.author.name}</span>
              </Link>
              <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 font-jakarta">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{story.date}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{story.readTime}</span>
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

        {/* Cover */}
        <div className="aspect-[16/9] bg-gradient-to-br from-brand-50 to-gray-50 dark:from-brand-900/20 dark:to-gray-900 rounded-xl my-6 sm:my-8 flex items-center justify-center">
          <Users className="w-20 h-20 text-brand/20" />
        </div>

        {/* Pull Quote */}
        <div className="card p-5 sm:p-6 border-l-4 border-l-brand my-8 bg-gradient-to-r from-brand-50/50 to-white dark:from-brand-900/10 dark:to-gray-900">
          <Quote className="w-6 h-6 text-brand/30 mb-2" />
          <p className="font-sora font-bold text-base sm:text-lg text-navy dark:text-white leading-snug italic">
            &ldquo;{story.pullQuote}&rdquo;
          </p>
          <p className="text-sm text-brand font-jakarta font-semibold mt-3">— {story.author.name.split(' ')[0]} Kumar, CEO, MedAI</p>
        </div>

        {/* Body */}
        <div itemProp="articleBody" className="article-content" dangerouslySetInnerHTML={{ __html: story.content }} />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          {story.tags.map((tag) => (
            <Link key={tag} href={`/ tag / ${tag.toLowerCase().replace(/ /g, '-')}`}>
              <span className="pill text-xs">{tag}</span>
            </Link>
          ))}
        </div>

        {/* Share Bar */}
        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <span className="text-xs text-gray-400 font-jakarta font-bold uppercase tracking-wider">Share</span>
          {[Twitter, Linkedin, Copy].map((Icon, i) => (
            <button key={i} className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-brand/10 dark:hover:bg-brand/20 flex items-center justify-center transition-colors">
              <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          ))}
        </div>

        {/* Author Bio */}
        <div className="card p-5 sm:p-6 mt-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-brand/10 dark:bg-brand/20 flex items-center justify-center text-lg text-brand font-bold font-sora shrink-0">
              {story.author.name.charAt(0)}
            </div>
            <div>
              <Link href={`/ author / ${story.author.slug}`} className="font-sora font-bold text-navy dark:text-white hover:text-brand">
                {story.author.name}
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta mt-1">{story.author.bio}</p>
            </div>
          </div>
        </div>

        {/* Related Stories */}
        <div className="mt-10">
          <h2 className="section-title mb-6">More Founder Stories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedStories.map((s) => (
              <Link key={s.slug} href={`/ stories / ${s.slug}`} className="group">
                <div className="card p-4 h-full">
                  <span className="badge-category text-[10px] mb-2 inline-block">Founder Story</span>
                  <h3 className="font-sora font-bold text-sm text-navy dark:text-white group-hover:text-brand transition-colors leading-snug line-clamp-3">
                    {s.title}
                  </h3>
                  <span className="text-xs text-gray-400 font-jakarta mt-2 block">{s.readTime}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}

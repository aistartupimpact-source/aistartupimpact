import Link from 'next/link';
import { Flag, TrendingUp, Building2, IndianRupee, Users, BookOpen, ChevronRight, ArrowRight, MapPin, Globe } from 'lucide-react';

const highlights = [
  { label: 'AI Startups', value: '3,200+', desc: 'Active in India' },
  { label: 'Total Funding', value: '₹28,000Cr', desc: '2024 calendar year' },
  { label: 'AI Talent Pool', value: '1.2M+', desc: 'Engineers in India' },
  { label: 'Global Rank', value: '#3', desc: 'AI startup ecosystem' },
];

const pillars = [
  { title: 'Policy & Governance', icon: Flag, items: ['IndiaAI Mission (₹10,372Cr budget)', 'Data Protection Act 2023 implementation', 'AI Safety Standards Committee', 'Startup India AI incentives'] },
  { title: 'Funding Ecosystem', icon: IndianRupee, items: ['$2.3B raised by AI startups in 2024', 'Peak XV, Lightspeed lead AI deals', '47% YoY increase in seed rounds', 'Government AI VC fund launched'] },
  { title: 'Talent & Research', icon: Users, items: ['IIT Joint AI Research Initiative', '22 AI Centers of Excellence', 'NASSCOM FutureSkills Prime', '300+ PhD programs in AI/ML'] },
  { title: 'Startup Hubs', icon: MapPin, items: ['Bangalore — #1 with 1,400+ AI startups', 'Mumbai — FinTech AI concentration', 'Hyderabad — Healthcare AI hub', 'Chennai — Deep tech + robotics'] },
];

const news = [
  { slug: 'india-ai-policy-2025', title: "India's New AI Policy Framework: What Every Startup Founder Must Know", category: 'Policy', date: 'Mar 6' },
  { slug: 'bangalore-ai-hub', title: "Bangalore Overtakes Singapore as Asia's #2 AI Startup Hub", category: 'Ecosystem', date: 'Mar 5' },
  { slug: 'bharat-gpt', title: 'BharatGPT: Open-Source LLM Trained on 22 Indian Languages', category: 'Product', date: 'Mar 4' },
  { slug: 'iit-ai-initiative', title: 'IIT System Launches Joint AI Research Initiative with ₹200Cr Budget', category: 'Research', date: 'Mar 3' },
  { slug: 'nasscom-ai-report', title: 'NASSCOM Report: India to Become $17B AI Market by 2027', category: 'Report', date: 'Mar 2' },
  { slug: 'ai-defence-india', title: 'India Defence Ministry Launches AI-Powered Surveillance System', category: 'Government', date: 'Mar 1' },
];

export default function IndiaAIPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-8 sm:mb-12 text-center">
        <div className="inline-flex items-center gap-2 badge-brand mb-4">
          <Flag className="w-3 h-3" /> India AI Ecosystem
        </div>
        <h1 className="font-sora font-extrabold text-2xl sm:text-3xl md:text-[42px] md:leading-tight text-navy dark:text-white max-w-3xl mx-auto">
          India&apos;s AI Revolution:<br className="hidden sm:block" /> The Complete Ecosystem Map
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm sm:text-base mt-3 max-w-xl mx-auto">
          Everything you need to know about India&apos;s AI startup ecosystem — policy, funding, talent, and innovation.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-14">
        {highlights.map((h) => (
          <div key={h.label} className="card p-4 sm:p-5 text-center">
            <div className="font-sora font-extrabold text-xl sm:text-3xl text-brand">{h.value}</div>
            <div className="text-xs text-gray-400 font-jakarta mt-1">{h.desc}</div>
            <div className="text-[10px] text-gray-500 font-jakarta font-bold uppercase tracking-wider mt-2">{h.label}</div>
          </div>
        ))}
      </div>

      {/* Pillars Grid */}
      <h2 className="section-title justify-center mb-6 sm:mb-8">Ecosystem Pillars</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-10 sm:mb-14">
        {pillars.map((p) => (
          <div key={p.title} className="card p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand/10 dark:bg-brand/20 flex items-center justify-center">
                <p.icon className="w-5 h-5 text-brand" />
              </div>
              <h3 className="font-sora font-bold text-base sm:text-lg text-navy dark:text-white">{p.title}</h3>
            </div>
            <ul className="space-y-2">
              {p.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm font-jakarta text-gray-600 dark:text-gray-300">
                  <span className="text-brand mt-1">•</span>{item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Latest India AI News */}
      <h2 className="section-title mb-6">Latest India AI News</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {news.map((n) => (
          <Link key={n.slug} href={`/news/${n.slug}`} className="group">
            <div className="card p-4 sm:p-5 border-l-4 border-l-brand h-full">
              <span className="badge-category text-[10px] mb-2 inline-block">{n.category}</span>
              <h3 className="font-sora font-bold text-[14px] sm:text-sm text-navy dark:text-white group-hover:text-brand transition-colors leading-snug line-clamp-3">{n.title}</h3>
              <span className="text-xs text-gray-400 font-jakarta mt-2 block">{n.date}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

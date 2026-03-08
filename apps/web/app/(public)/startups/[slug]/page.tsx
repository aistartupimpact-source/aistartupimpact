import Link from 'next/link';
import { Building2, MapPin, Users, IndianRupee, TrendingUp, ExternalLink, ChevronRight, Calendar, ArrowUpRight, Globe, Star } from 'lucide-react';

const startup = {
  name: 'Sarvam AI',
  slug: 'sarvam-ai',
  tagline: 'India-first foundation models for enterprise',
  description: 'Sarvam AI is building India\'s own large language models, trained on Indian data for Indian use cases. Their models outperform GPT-4 on Hindi, Tamil, and Telugu benchmarks while being cost-effective for Indian enterprises. Founded by ex-Google and ex-Microsoft AI researchers.',
  stage: 'Series A',
  sector: 'LLM/NLP',
  location: 'Bangalore, Karnataka',
  founded: '2023',
  employees: '80+',
  website: 'https://sarvam.ai',
  impactScore: 92,
  totalFunding: '₹415Cr',
  founders: [
    { name: 'Vivek Raghavan', role: 'Co-founder & CEO', prev: 'Ex-Google AI' },
    { name: 'Pratyush Kumar', role: 'Co-founder & CTO', prev: 'Ex-Microsoft Research' },
  ],
  fundingHistory: [
    { round: 'Series A', amount: '₹415Cr', date: 'Mar 2025', investors: 'Lightspeed, Peak XV Partners', lead: 'Lightspeed India' },
    { round: 'Seed', amount: '₹41Cr', date: 'Sep 2023', investors: 'Khosla Ventures, Lightspeed', lead: 'Khosla Ventures' },
  ],
  keyMetrics: [
    { label: 'Models Published', value: '4' },
    { label: 'API Calls/Day', value: '2M+' },
    { label: 'Enterprise Clients', value: '45+' },
    { label: 'Languages Supported', value: '10' },
  ],
  relatedNews: [
    { slug: 'sarvam-ai-series-a', title: 'Sarvam AI Raises ₹415Cr Series A Led by Lightspeed', date: 'Mar 3' },
    { slug: 'indic-llm-benchmark', title: 'Sarvam Tops New Indic LLM Benchmark Across 10 Languages', date: 'Feb 20' },
    { slug: 'sarvam-enterprise', title: 'Sarvam AI Signs Enterprise Deals with 3 Indian Banks', date: 'Feb 10' },
  ],
};

export default function StartupDetailPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs sm:text-sm font-jakarta text-gray-400 dark:text-gray-500 mb-6">
        <Link href="/" className="hover:text-brand">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/startups" className="hover:text-brand">Startups</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600 dark:text-gray-300">{startup.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/30 dark:to-brand-800/20 flex items-center justify-center shrink-0">
          <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-brand" />
        </div>
        <div className="flex-1">
          <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-navy dark:text-white">{startup.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm sm:text-base mt-1">{startup.tagline}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-[10px] font-bold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full uppercase">{startup.stage}</span>
            <span className="badge-category">{startup.sector}</span>
            <span className="flex items-center gap-1 text-xs text-gray-400 font-jakarta">
              <MapPin className="w-3 h-3" /> {startup.location}
            </span>
          </div>
          <div className="flex gap-3 mt-4">
            <a href={startup.website} target="_blank" rel="noopener noreferrer" className="btn-brand text-sm">
              Visit Website <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </div>
        </div>
        <div className="text-right sm:shrink-0">
          <div className="font-sora font-extrabold text-2xl sm:text-3xl text-brand">{startup.totalFunding}</div>
          <div className="text-xs text-gray-400 font-jakarta">Total Raised</div>
          <div className="flex items-center gap-1 justify-end mt-2">
            <TrendingUp className="w-3.5 h-3.5 text-brand" />
            <span className="text-sm font-sora font-bold text-brand">Impact Score: {startup.impactScore}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* About */}
          <div className="card p-5 sm:p-6">
            <h2 className="section-title mb-4">About</h2>
            <p className="text-gray-600 dark:text-gray-300 font-jakarta text-sm sm:text-base leading-relaxed">{startup.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div><span className="text-xs text-gray-400 font-jakarta block">Founded</span><span className="font-sora font-bold text-sm text-navy dark:text-white">{startup.founded}</span></div>
              <div><span className="text-xs text-gray-400 font-jakarta block">Employees</span><span className="font-sora font-bold text-sm text-navy dark:text-white">{startup.employees}</span></div>
              <div><span className="text-xs text-gray-400 font-jakarta block">Location</span><span className="font-sora font-bold text-sm text-navy dark:text-white">{startup.location.split(',')[0]}</span></div>
              <div><span className="text-xs text-gray-400 font-jakarta block">Website</span><a href={startup.website} className="font-sora font-bold text-sm text-brand hover:underline">{startup.website.replace('https://', '')}</a></div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {startup.keyMetrics.map((m) => (
              <div key={m.label} className="card p-4 text-center">
                <div className="font-sora font-extrabold text-xl text-brand">{m.value}</div>
                <div className="text-[10px] text-gray-400 font-jakarta mt-1 uppercase tracking-wider font-bold">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Founders */}
          <div className="card p-5 sm:p-6">
            <h2 className="section-title mb-4">Founders</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {startup.founders.map((f) => (
                <div key={f.name} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="w-11 h-11 rounded-full bg-brand/10 dark:bg-brand/20 flex items-center justify-center text-brand font-bold font-sora">
                    {f.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-sora font-bold text-sm text-navy dark:text-white">{f.name}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-jakarta block">{f.role}</span>
                    <span className="text-[10px] text-brand font-jakarta font-semibold">{f.prev}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Funding History */}
          <div className="card p-5 sm:p-6">
            <h2 className="section-title mb-4">
              <IndianRupee className="w-4 h-4 text-brand" /> Funding History
            </h2>
            <div className="space-y-4">
              {startup.fundingHistory.map((r) => (
                <div key={r.round} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand/10 dark:bg-brand/20 flex items-center justify-center">
                      <IndianRupee className="w-5 h-5 text-brand" />
                    </div>
                    <div>
                      <span className="font-sora font-bold text-sm text-navy dark:text-white">{r.round}</span>
                      <div className="text-xs text-gray-400 font-jakarta">{r.lead} · {r.date}</div>
                    </div>
                  </div>
                  <span className="font-sora font-extrabold text-brand">{r.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-6">
          {/* Related News */}
          <div className="card p-5 sticky top-20">
            <h4 className="font-sora font-bold text-sm text-navy dark:text-white mb-4">Related News</h4>
            <div className="space-y-3">
              {startup.relatedNews.map((n) => (
                <Link key={n.slug} href={`/news/${n.slug}`} className="group block">
                  <h5 className="text-sm font-jakarta text-gray-600 dark:text-gray-400 group-hover:text-brand transition-colors leading-snug line-clamp-2">{n.title}</h5>
                  <span className="text-xs text-gray-400 font-jakarta">{n.date}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="card p-5 bg-gradient-to-br from-brand-50 to-white dark:from-brand-900/20 dark:to-gray-900">
            <h4 className="font-sora font-bold text-sm text-navy dark:text-white mb-2">Track this startup</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta mb-4">Get notified about funding rounds, product launches, and news.</p>
            <input type="email" placeholder="your@email.com" className="input-field text-xs mb-2" />
            <button className="btn-brand w-full text-xs">Subscribe</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

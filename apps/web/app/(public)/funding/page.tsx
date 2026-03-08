import Link from 'next/link';
import { IndianRupee, TrendingUp, Calendar, ChevronRight, ArrowRight, Clock, Building2 } from 'lucide-react';

const latestDigest = {
  slug: 'funding-digest-mar-7-2025',
  title: 'Funding Digest #12 — Sarvam AI raises ₹415Cr, MedAI Health closes seed, and more',
  excerpt: 'This week saw ₹548Cr flow into Indian AI startups across 4 deals. Sarvam AI leads with a massive Series A, while healthcare and agri-tech continue attracting investor interest.',
  date: 'March 7, 2025',
  readTime: '5 min read',
  deals: [
    { startup: 'Sarvam AI', amount: '₹415Cr', round: 'Series A', investors: 'Lightspeed, Peak XV', sector: 'LLM/NLP' },
    { startup: 'MedAI Health', amount: '₹83Cr', round: 'Seed', investors: 'Sequoia Scout, AngelList', sector: 'HealthTech' },
    { startup: 'AgriBot Tech', amount: '₹50Cr', round: 'Series A', investors: 'Omnivore, Accel', sector: 'AgriTech' },
  ],
};

const pastDigests = [
  { slug: 'funding-digest-feb-28-2025', title: 'Funding Digest #11 — LendAI raises ₹250Cr, NeuralScale grows GPU cloud', date: 'Feb 28, 2025' },
  { slug: 'funding-digest-feb-21-2025', title: 'Funding Digest #10 — PadhAI gets ₹33Cr to teach AI in 10 Indian languages', date: 'Feb 21, 2025' },
  { slug: 'funding-digest-feb-14-2025', title: 'Funding Digest #9 — GreenAI closes ₹300Cr Series B for clean energy AI', date: 'Feb 14, 2025' },
  { slug: 'funding-digest-feb-7-2025', title: 'Funding Digest #8 — Q4 2024 wrap-up: ₹3,100Cr across 34 deals', date: 'Feb 7, 2025' },
];

export default function FundingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-6 sm:mb-10">
        <div className="flex items-center gap-3 mb-2">
          <IndianRupee className="w-6 h-6 text-brand" />
          <h1 className="font-sora font-extrabold text-2xl sm:text-3xl md:text-4xl text-navy dark:text-white">
            Funding Digest
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm sm:text-base max-w-2xl">
          Weekly roundup of Indian AI startup funding rounds. Published every Friday.
        </p>
      </div>

      {/* Latest Digest — Featured */}
      <Link href={`/news/${latestDigest.slug}`} className="group block mb-8 sm:mb-10">
        <div className="card-featured p-5 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="badge-brand text-[10px]">Latest</span>
            <span className="text-xs text-gray-400 font-jakarta flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {latestDigest.date}
            </span>
            <span className="text-xs text-gray-400 font-jakarta flex items-center gap-1">
              <Clock className="w-3 h-3" /> {latestDigest.readTime}
            </span>
          </div>

          <h2 className="font-sora font-extrabold text-lg sm:text-xl md:text-2xl text-navy dark:text-white group-hover:text-brand transition-colors leading-snug">
            {latestDigest.title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm sm:text-base mt-3 leading-relaxed">
            {latestDigest.excerpt}
          </p>

          {/* Deals Summary */}
          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800 space-y-3">
            {latestDigest.deals.map((d) => (
              <div key={d.startup} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand/10 dark:bg-brand/20 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-brand" />
                  </div>
                  <div>
                    <span className="font-sora font-bold text-sm text-navy dark:text-white">{d.startup}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-jakarta ml-2">{d.investors}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full uppercase">{d.round}</span>
                  <span className="font-sora font-extrabold text-brand text-sm">{d.amount}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-1 text-brand font-semibold text-sm font-jakarta group-hover:gap-2 transition-all">
            Read Full Digest <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>

      {/* Past Digests */}
      <h2 className="section-title mb-4">Past Digests</h2>
      <div className="space-y-3">
        {pastDigests.map((d) => (
          <Link key={d.slug} href={`/news/${d.slug}`} className="group block">
            <div className="card p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <IndianRupee className="w-4 h-4 text-brand shrink-0 mt-1" />
                <h3 className="font-sora font-bold text-[14px] sm:text-sm text-navy dark:text-white group-hover:text-brand transition-colors leading-snug line-clamp-2">
                  {d.title}
                </h3>
              </div>
              <span className="text-xs text-gray-400 font-jakarta whitespace-nowrap shrink-0">{d.date}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Subscribe CTA */}
      <div className="card p-6 mt-8 text-center bg-gradient-to-r from-brand-50 to-white dark:from-brand-900/15 dark:to-gray-900">
        <h3 className="font-sora font-bold text-base text-navy dark:text-white">Never miss a deal</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta mt-1">
          Get the Funding Digest delivered to your inbox every Friday.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto mt-4">
          <input type="email" placeholder="your@email.com" className="input-field flex-1 text-sm" />
          <button className="btn-brand text-sm whitespace-nowrap">Subscribe</button>
        </div>
      </div>
    </div>
  );
}

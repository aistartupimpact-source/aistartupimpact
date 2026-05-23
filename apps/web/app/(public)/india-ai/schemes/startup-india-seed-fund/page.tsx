import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, ExternalLink, CheckCircle2, IndianRupee, Users, Briefcase } from 'lucide-react';
import { IndiaAISchemeSchema, STARTUP_INDIA_SEED_FUND_FAQS } from '@/components/seo';

export const metadata: Metadata = {
  title: 'Startup India Seed Fund Scheme (SISFS) - ₹945 Cr | Eligibility & Application',
  description: 'Complete guide to Startup India Seed Fund Scheme. Get up to ₹70 Lakh funding for your AI startup. Learn eligibility criteria, application process, and how to apply through incubators.',
  keywords: [
    'Startup India Seed Fund',
    'SISFS',
    'startup seed funding India',
    'DPIIT funding',
    'incubator funding India',
    'early stage startup funding',
    'government startup grants'
  ].join(', '),
  alternates: {
    canonical: 'https://aistartupimpact.com/india-ai/schemes/startup-india-seed-fund',
  },
};

const schemeData = {
  name: 'Startup India Seed Fund Scheme (SISFS)',
  slug: 'startup-india-seed-fund',
  description: 'The Startup India Seed Fund Scheme (SISFS) is a ₹945 Crore government initiative to provide financial assistance to startups for proof of concept, prototype development, product trials, market entry, and commercialization through eligible incubators.',
  budgetAllocated: 94500000000, // ₹945 Cr in paise
  budgetDisbursed: 35000000000, // Example
  eligibility: [
    'Startup recognized by DPIIT',
    'Incorporated less than 2 years ago',
    'Working on innovation or new product development',
    'Not received more than ₹10 Lakh from government schemes',
    'Incubated or selected by an eligible incubator'
  ],
  applicationUrl: 'https://www.startupindia.gov.in/content/sih/en/seedfund.html',
  provider: 'Department for Promotion of Industry and Internal Trade (DPIIT)',
  providerUrl: 'https://www.startupindia.gov.in/',
  createdAt: '2021-04-01T00:00:00Z',
  updatedAt: new Date().toISOString(),
};

export default function StartupIndiaSeedFundPage() {
  return (
    <>
      <IndiaAISchemeSchema scheme={schemeData} faqs={STARTUP_INDIA_SEED_FUND_FAQS} />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm font-jakarta text-gray-400 dark:text-gray-500 mb-6">
          <Link href="/" className="hover:text-brand">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/india-ai" className="hover:text-brand">India AI</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600 dark:text-gray-300">Startup India Seed Fund</span>
        </nav>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 badge-brand mb-3 text-[10px] sm:text-xs">
            <Briefcase className="w-3 h-3" /> Government Scheme
          </div>
          <h1 className="font-sora font-extrabold text-2xl sm:text-3xl md:text-4xl text-navy dark:text-white mb-4">
            Startup India Seed Fund Scheme (SISFS)
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-jakarta leading-relaxed">
            ₹945 Crore government initiative providing up to ₹70 Lakh per startup for proof of concept, prototype development, and market entry.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card p-5">
            <div className="flex items-center gap-2 text-brand mb-2">
              <IndianRupee className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wide">Total Budget</span>
            </div>
            <div className="font-sora font-bold text-2xl text-navy dark:text-white">₹945 Cr</div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wide">Max Funding</span>
            </div>
            <div className="font-sora font-bold text-2xl text-navy dark:text-white">₹70 Lakh</div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <Users className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wide">Startups Funded</span>
            </div>
            <div className="font-sora font-bold text-2xl text-navy dark:text-white">750+</div>
          </div>
        </div>

        <div className="card p-6 sm:p-8 mb-8">
          <h2 className="font-sora font-bold text-xl text-navy dark:text-white mb-4">Funding Structure</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-navy dark:text-white mb-2">Grant (Up to ₹20 Lakh)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                For proof of concept, prototype development, and product trials. Non-repayable grant.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-navy dark:text-white mb-2">Debt/Convertible (Up to ₹50 Lakh)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                For market entry, commercialization, and scaling. Provided as debt or convertible debentures.
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6 sm:p-8 mb-8">
          <h2 className="font-sora font-bold text-xl text-navy dark:text-white mb-4">Eligibility Criteria</h2>
          <ul className="space-y-3">
            {schemeData.eligibility.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6 sm:p-8 mb-8">
          <h2 className="font-sora font-bold text-xl text-navy dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {STARTUP_INDIA_SEED_FUND_FAQS.map((faq, idx) => (
              <div key={idx}>
                <h3 className="font-semibold text-navy dark:text-white mb-2">{faq.question}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6 sm:p-8 bg-gradient-to-br from-brand-50 to-white dark:from-brand-900/20 dark:to-gray-900">
          <h2 className="font-sora font-bold text-xl text-navy dark:text-white mb-4">Ready to Apply?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Applications are submitted through eligible incubators. Find an incubator and start your application today.
          </p>
          <a
            href={schemeData.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-brand inline-flex items-center gap-2"
          >
            View Eligible Incubators
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </>
  );
}

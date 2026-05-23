import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, ExternalLink, CheckCircle2, IndianRupee, Users, Award } from 'lucide-react';
import { IndiaAISchemeSchema, MEITY_GRANTS_FAQS } from '@/components/seo';

export const metadata: Metadata = {
  title: 'MeitY Grants for AI Startups - Up to ₹1 Cr | Eligibility & Application',
  description: 'Complete guide to Ministry of Electronics and IT (MeitY) grants for AI startups. Multiple schemes offering ₹10 Lakh to ₹1 Crore for product development, R&D, and innovation.',
  keywords: [
    'MeitY grants',
    'MeitY startup funding',
    'TIDE 2.0',
    'MeitY Startup Hub',
    'electronics IT grants India',
    'AI research grants',
    'government R&D funding'
  ].join(', '),
  alternates: {
    canonical: 'https://aistartupimpact.com/india-ai/schemes/meity-grants',
  },
};

const schemeData = {
  name: 'MeitY Grants for AI Startups',
  slug: 'meity-grants',
  description: 'The Ministry of Electronics and IT (MeitY) offers multiple grant schemes for AI startups including Startup Hub grants, TIDE 2.0, R&D grants, and innovation challenges with funding ranging from ₹10 Lakh to ₹1 Crore.',
  budgetAllocated: 500000000000, // Estimated ₹5,000 Cr across schemes
  budgetDisbursed: 180000000000,
  eligibility: [
    'Indian startup registered in India',
    'Working on electronics, IT, or AI technology',
    'DPIIT-recognized startup (for some schemes)',
    'Clear innovation or R&D component',
    'Alignment with Digital India priorities'
  ],
  applicationUrl: 'https://www.meity.gov.in/startups',
  provider: 'Ministry of Electronics and IT (MeitY)',
  providerUrl: 'https://www.meity.gov.in/',
  createdAt: '2020-01-01T00:00:00Z',
  updatedAt: new Date().toISOString(),
};

export default function MeityGrantsPage() {
  return (
    <>
      <IndiaAISchemeSchema scheme={schemeData} faqs={MEITY_GRANTS_FAQS} />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm font-jakarta text-gray-400 dark:text-gray-500 mb-6">
          <Link href="/" className="hover:text-brand">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/india-ai" className="hover:text-brand">India AI</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600 dark:text-gray-300">MeitY Grants</span>
        </nav>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 badge-brand mb-3 text-[10px] sm:text-xs">
            <Award className="w-3 h-3" /> Government Scheme
          </div>
          <h1 className="font-sora font-extrabold text-2xl sm:text-3xl md:text-4xl text-navy dark:text-white mb-4">
            MeitY Grants for AI Startups
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-jakarta leading-relaxed">
            Multiple grant schemes from the Ministry of Electronics and IT offering ₹10 Lakh to ₹1 Crore for AI innovation, product development, and R&D.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card p-5">
            <div className="flex items-center gap-2 text-brand mb-2">
              <IndianRupee className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wide">Max Grant</span>
            </div>
            <div className="font-sora font-bold text-2xl text-navy dark:text-white">₹1 Crore</div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wide">Active Schemes</span>
            </div>
            <div className="font-sora font-bold text-2xl text-navy dark:text-white">5+</div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <Users className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wide">Startups Funded</span>
            </div>
            <div className="font-sora font-bold text-2xl text-navy dark:text-white">1,200+</div>
          </div>
        </div>

        <div className="card p-6 sm:p-8 mb-8">
          <h2 className="font-sora font-bold text-xl text-navy dark:text-white mb-6">MeitY Grant Schemes</h2>
          <div className="space-y-4">
            {[
              { name: 'Startup Hub Grants', amount: '₹10L - ₹50L', desc: 'Product development and market entry support' },
              { name: 'TIDE 2.0', amount: 'Up to ₹1 Cr', desc: 'Deep-tech product development and scaling' },
              { name: 'R&D Grants (CDAC/IITs)', amount: '₹25L - ₹2 Cr', desc: 'Multi-year research projects' },
              { name: 'Innovation Challenges', amount: '₹5L - ₹50L', desc: 'Prize money for specific challenges' },
              { name: 'IndiaAI Mission Grants', amount: 'Varies', desc: 'AI-specific funding under IndiaAI pillars' },
            ].map((scheme, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-navy dark:text-white">{scheme.name}</h3>
                  <span className="text-brand font-bold text-sm">{scheme.amount}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{scheme.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6 sm:p-8 mb-8">
          <h2 className="font-sora font-bold text-xl text-navy dark:text-white mb-4">General Eligibility</h2>
          <ul className="space-y-3">
            {schemeData.eligibility.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            * Specific eligibility varies by scheme. Check individual scheme requirements on the MeitY portal.
          </p>
        </div>

        <div className="card p-6 sm:p-8 mb-8">
          <h2 className="font-sora font-bold text-xl text-navy dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {MEITY_GRANTS_FAQS.map((faq, idx) => (
              <div key={idx}>
                <h3 className="font-semibold text-navy dark:text-white mb-2">{faq.question}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6 sm:p-8 bg-gradient-to-br from-brand-50 to-white dark:from-brand-900/20 dark:to-gray-900">
          <h2 className="font-sora font-bold text-xl text-navy dark:text-white mb-4">Explore MeitY Schemes</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Visit the MeitY Startup Hub to explore all available schemes and submit your application.
          </p>
          <a
            href={schemeData.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-brand inline-flex items-center gap-2"
          >
            Visit MeitY Startup Hub
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </>
  );
}

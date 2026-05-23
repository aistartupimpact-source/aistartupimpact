import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, ExternalLink, CheckCircle2, IndianRupee, Users, Cpu, Database, Rocket } from 'lucide-react';
import { IndiaAISchemeSchema, INDIAAI_MISSION_FAQS } from '@/components/seo';

export const metadata: Metadata = {
  title: 'IndiaAI Mission - ₹10,372 Cr Government AI Funding | Eligibility & Application',
  description: 'Complete guide to IndiaAI Mission funding for AI startups in India. Learn about ₹10,372 Crore budget allocation, eligibility criteria, compute infrastructure access, and how to apply for government AI grants.',
  keywords: [
    'IndiaAI Mission',
    'IndiaAI Mission funding',
    'AI startup funding India',
    'government AI grants India',
    'MeitY AI funding',
    'IndiaAI compute infrastructure',
    'AI startup eligibility India',
    'IndiaAI Mission application'
  ].join(', '),
  alternates: {
    canonical: 'https://aistartupimpact.com/india-ai/schemes/indiaai-mission',
  },
  openGraph: {
    title: 'IndiaAI Mission - ₹10,372 Cr Government AI Funding',
    description: 'Complete guide to IndiaAI Mission funding for AI startups. Eligibility, application process, and compute infrastructure access.',
    url: 'https://aistartupimpact.com/india-ai/schemes/indiaai-mission',
    siteName: 'AI Startup Impact',
    images: [{
      url: 'https://aistartupimpact.com/og-images/indiaai-mission.jpg',
      width: 1200,
      height: 630,
    }],
    locale: 'en_IN',
    type: 'website',
  },
};

const schemeData = {
  name: 'IndiaAI Mission',
  slug: 'indiaai-mission',
  description: 'The IndiaAI Mission is a ₹10,372 Crore government initiative launched by the Ministry of Electronics and IT (MeitY) to accelerate India\'s AI ecosystem through compute infrastructure, innovation centers, datasets, application development, future skills, safe & trusted AI, and startup financing.',
  budgetAllocated: 1037200000000, // ₹10,372 Cr in paise
  budgetDisbursed: 250000000000, // Example: ₹2,500 Cr disbursed
  eligibility: [
    'Company registered in India',
    'Working on AI/ML technology or applications',
    'Alignment with national AI priorities',
    'Team with relevant technical expertise',
    'Clear use case for compute resources or funding'
  ],
  applicationUrl: 'https://indiaai.gov.in',
  provider: 'Ministry of Electronics and IT (MeitY)',
  providerUrl: 'https://www.meity.gov.in/',
  createdAt: '2024-03-01T00:00:00Z',
  updatedAt: new Date().toISOString(),
};

export default function IndiaAIMissionPage() {
  return (
    <>
      <IndiaAISchemeSchema scheme={schemeData} faqs={INDIAAI_MISSION_FAQS} />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm font-jakarta text-gray-400 dark:text-gray-500 mb-6">
          <Link href="/" className="hover:text-brand">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/india-ai" className="hover:text-brand">India AI</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/india-ai/schemes" className="hover:text-brand">Schemes</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600 dark:text-gray-300">IndiaAI Mission</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 badge-brand mb-3 text-[10px] sm:text-xs">
            <Rocket className="w-3 h-3" /> Government Scheme
          </div>
          <h1 className="font-sora font-extrabold text-2xl sm:text-3xl md:text-4xl text-navy dark:text-white mb-4">
            IndiaAI Mission
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-jakarta leading-relaxed">
            ₹10,372 Crore government initiative to accelerate India's AI ecosystem through compute infrastructure, innovation centers, and startup financing.
          </p>
        </div>

        {/* Budget Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card p-5">
            <div className="flex items-center gap-2 text-brand mb-2">
              <IndianRupee className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wide">Total Budget</span>
            </div>
            <div className="font-sora font-bold text-2xl text-navy dark:text-white">
              ₹10,372 Cr
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wide">Disbursed</span>
            </div>
            <div className="font-sora font-bold text-2xl text-navy dark:text-white">
              ₹2,500 Cr
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <Users className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wide">Beneficiaries</span>
            </div>
            <div className="font-sora font-bold text-2xl text-navy dark:text-white">
              500+ Startups
            </div>
          </div>
        </div>

        {/* Seven Pillars */}
        <div className="card p-6 sm:p-8 mb-8">
          <h2 className="font-sora font-bold text-xl text-navy dark:text-white mb-6">
            Seven Pillars of IndiaAI Mission
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Cpu, title: 'IndiaAI Compute Capacity', desc: '10,000+ GPUs for AI research and startups' },
              { icon: Rocket, title: 'IndiaAI Innovation Centre', desc: 'Sector-specific AI solutions and applications' },
              { icon: Database, title: 'IndiaAI Datasets Platform', desc: 'Non-personal datasets for AI training' },
              { icon: Users, title: 'IndiaAI Application Development', desc: 'AI solutions for governance and public good' },
              { icon: CheckCircle2, title: 'IndiaAI FutureSkills', desc: 'AI education and workforce development' },
              { icon: CheckCircle2, title: 'IndiaAI Startup Financing', desc: '₹2,000+ Cr fund-of-funds for AI startups' },
              { icon: CheckCircle2, title: 'Safe & Trusted AI', desc: 'AI safety, ethics, and responsible deployment' },
            ].map((pillar, idx) => (
              <div key={idx} className="flex gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <pillar.icon className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm text-navy dark:text-white mb-1">{pillar.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Eligibility */}
        <div className="card p-6 sm:p-8 mb-8">
          <h2 className="font-sora font-bold text-xl text-navy dark:text-white mb-4">
            Eligibility Criteria
          </h2>
          <ul className="space-y-3">
            {schemeData.eligibility.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* How to Apply */}
        <div className="card p-6 sm:p-8 mb-8">
          <h2 className="font-sora font-bold text-xl text-navy dark:text-white mb-4">
            How to Apply
          </h2>
          <ol className="space-y-4">
            {[
              'Visit the National AI Portal at indiaai.gov.in',
              'Register your startup or organization',
              'Select the relevant pillar (Compute, Innovation, Datasets, etc.)',
              'Submit detailed project proposal with technical specifications',
              'Provide company information and founder details',
              'Demonstrate AI capability and impact potential',
              'Wait for expert committee review (typically 4-6 weeks)',
            ].map((step, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-gray-700 dark:text-gray-300 pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6">
            <a
              href={schemeData.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-brand inline-flex items-center gap-2"
            >
              Apply on IndiaAI Portal
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* FAQs */}
        <div className="card p-6 sm:p-8">
          <h2 className="font-sora font-bold text-xl text-navy dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {INDIAAI_MISSION_FAQS.map((faq, idx) => (
              <div key={idx}>
                <h3 className="font-semibold text-navy dark:text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Schemes */}
        <div className="mt-8">
          <h2 className="font-sora font-bold text-xl text-navy dark:text-white mb-4">
            Other Government Schemes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/india-ai/schemes/startup-india-seed-fund" className="card p-5 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-navy dark:text-white mb-2">
                Startup India Seed Fund
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                ₹945 Cr seed funding for early-stage startups
              </p>
              <span className="text-brand text-sm font-semibold">Learn more →</span>
            </Link>
            <Link href="/india-ai/schemes/meity-grants" className="card p-5 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-navy dark:text-white mb-2">
                MeitY Grants
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Multiple grant schemes for AI innovation
              </p>
              <span className="text-brand text-sm font-semibold">Learn more →</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

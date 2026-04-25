import Link from 'next/link';
import { Metadata } from 'next';
import { IndianRupee, TrendingUp, Calendar, ArrowRight, Clock, Building2, Megaphone } from 'lucide-react';
import { generateItemListSchema, generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo';

import { getAllFundingRoundsDirect } from '@/lib/db';
import FundingDashboard from './FundingDashboard';

export const metadata: Metadata = {
  title: 'Funding Dashboard — AI Startups Funding Rounds Tracker',
  description: 'Filterable tracker of all AI startup funding rounds. Track deals, top investors, and total capital flow in the AI ecosystem.',
  alternates: { canonical: 'https://aistartupimpact.com/funding' },
  openGraph: {
    title: 'Funding Dashboard — AI Startups Funding Rounds Tracker',
    description: 'Filterable tracker of all AI startup funding rounds. Track deals, top investors, and total capital flow.',
    type: 'website',
    url: 'https://aistartupimpact.com/funding',
    siteName: 'AIStartupImpact',
    images: [{ url: 'https://aistartupimpact.com/og-default.png', width: 1200, height: 630 }],
  },
};

export default async function FundingPage() {
  const siteUrl = 'https://aistartupimpact.com';

  // Real DB connection 
  const rounds = await getAllFundingRoundsDirect();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Funding Tracker', url: `${siteUrl}/funding` },
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* Header */}
      <div className="mb-6 sm:mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <IndianRupee className="w-8 h-8 text-brand" />
          <h1 className="font-sora font-extrabold text-3xl sm:text-4xl md:text-5xl text-navy dark:text-white tracking-tight">
            AI Startups <span className="text-brand">Funding Tracker</span>
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm sm:text-base max-w-2xl mx-auto mt-4">
          The most comprehensive, continuously-updated dashboard of capital raised by Artificial Intelligence startups. Filter by stage, year, or search for investors.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/advertise" className="group flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-brand/30 rounded-xl px-5 py-3 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white transition-colors">
              <Megaphone className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-sora font-bold text-navy dark:text-white leading-none">Announce your round</span>
              <span className="text-xs text-brand font-semibold mt-1 leading-none">Premium PR Service <ArrowRight className="inline w-3 h-3 ml-0.5" /></span>
            </div>
          </Link>
        </div>
      </div>

      {/* Mount our Client Dashboard */}
      <FundingDashboard data={rounds as any} />


    </div>
  );
}

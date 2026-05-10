import { Metadata } from 'next';
import Link from 'next/link';
import { 
  Flag, 
  MapPin, 
  Rocket,
  Trophy,
  IndianRupee,
  Users,
  BookOpen,
  GraduationCap,
  ArrowRight,
  TrendingUp,
  Building2,
  FileText,
  Newspaper
} from 'lucide-react';
import { neon } from '@neondatabase/serverless';
import IndiaAIHero from '@/components/india-ai/IndiaAIHero';
import FundingTracker from '@/components/india-ai/FundingTracker';
import NewsletterCapture from '@/components/india-ai/NewsletterCapture';
import RealIndiaMap from '@/components/india-ai/RealIndiaMap';
import GovernmentSchemesHardcoded from '@/components/india-ai/GovernmentSchemesHardcoded';
import PolicyLiveFeedHardcoded from '@/components/india-ai/PolicyLiveFeedHardcoded';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// SEO Metadata with target keywords
export const metadata: Metadata = {
  title: 'India AI Startups 2026 - Live Ecosystem Map | IndiaAI Mission, Funding & Policy',
  description: 'Discover 3,247+ AI startups in India, ₹28,470Cr funding tracked, IndiaAI Mission updates, AI policy, and top AI companies in Bangalore, Mumbai, Hyderabad. Real-time intelligence on India\'s AI revolution.',
  keywords: [
    'India AI startups',
    'AI funding India',
    'Indian AI companies',
    'IndiaAI Mission',
    'AI startups Bangalore',
    'Top AI startups India',
    'AI policy India',
    'AI ecosystem India',
    'Bangalore AI startups',
    'Mumbai AI companies',
    'AI talent India',
    'AI research India'
  ],
  openGraph: {
    title: 'India AI Startups 2026 - Live Ecosystem Map',
    description: '3,247+ AI startups, ₹28,470Cr funding tracked. Explore India\'s AI revolution with real-time data on startups, funding, policy, and talent.',
    type: 'website',
    url: 'https://aistartupimpact.com/india-ai',
    images: [
      {
        url: '/og-images/india-ai-ecosystem.jpg',
        width: 1200,
        height: 630,
        alt: 'India AI Ecosystem Map 2026',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'India AI Startups 2026 - Live Ecosystem Map',
    description: '3,247+ AI startups, ₹28,470Cr funding tracked. Real-time intelligence on India\'s AI revolution.',
    images: ['/og-images/india-ai-ecosystem.jpg'],
  },
  alternates: {
    canonical: 'https://aistartupimpact.com/india-ai',
  },
};

// Fetch all data server-side
async function getIndiaAIData() {
  const sql = neon(process.env.DATABASE_URL!);

  const [stats, cities, mission, researchHubs, recentFunding, allStartups] = await Promise.all([
    // Live stats
    sql`
      SELECT * FROM "IndiaAIStats"
      WHERE "isActive" = true
      ORDER BY "displayOrder" ASC
    `,
    // Cities
    sql`
      SELECT * FROM "IndiaAICity"
      WHERE "isActive" = true
      ORDER BY "displayOrder" ASC
      LIMIT 6
    `,
    // IndiaAI Mission
    sql`
      SELECT * FROM "IndiaAIMissionTracker"
      WHERE "isActive" = true
      ORDER BY "displayOrder" ASC
    `,
    // Research Hubs
    sql`
      SELECT * FROM "ResearchHub"
      WHERE "isActive" = true
      ORDER BY "displayOrder" ASC
      LIMIT 5
    `,
    // Recent Funding - Connect to existing FundingRound table
    sql`
      SELECT 
        fr.id,
        fr."roundType",
        fr."amountInr",
        fr."announcedAt",
        fr."leadInvestors",
        s.name as "startupName",
        s.slug as "startupSlug",
        s."logoUrl" as "startupLogo",
        s."headquartersCity"
      FROM "FundingRound" fr
      JOIN "Startup" s ON fr."startupId" = s.id
      WHERE s."isIndian" = true
        AND fr."announcedAt" >= NOW() - INTERVAL '90 days'
      ORDER BY fr."announcedAt" DESC
      LIMIT 10
    `,
    // All Indian AI Startups for the map
    sql`
      SELECT 
        id,
        name,
        slug,
        tagline,
        "logoUrl",
        "headquartersCity",
        stage,
        "totalFundingInr",
        "foundedYear"
      FROM "Startup"
      WHERE "isIndian" = true
        AND "deletedAt" IS NULL
        AND "headquartersCity" IS NOT NULL
      ORDER BY "totalFundingInr" DESC
      LIMIT 500
    `,
  ]);

  // Add sector mapping (you can enhance this based on your data)
  const startupsWithSectors = allStartups.map((s: any) => ({
    ...s,
    sector: s.stage?.includes('FinTech') ? 'FinTech' : 
            s.stage?.includes('Health') ? 'HealthTech' :
            s.stage?.includes('Ed') ? 'EdTech' : 'SaaS', // Default
    headquartersCity: s.headquartersCity || 'Other',
  }));

  return { stats, cities, mission, researchHubs, recentFunding, allStartups: startupsWithSectors };
}

function formatCurrency(paise: number): string {
  const crores = paise / 10000000000;
  return `₹${crores.toLocaleString()}Cr`;
}

function formatBudget(paise: number): string {
  const crores = paise / 10000000000;
  return `₹${crores.toLocaleString()} Cr`;
}

const iconMap: Record<string, any> = {
  rocket: Rocket,
  currency: IndianRupee,
  users: Users,
  trophy: Trophy,
};

export default async function IndiaAIPage() {
  const { stats, cities, mission, researchHubs, recentFunding, allStartups } = await getIndiaAIData();

  // Calculate mission totals
  const totalBudget = mission.reduce((sum, item) => sum + Number(item.budgetAllocated), 0);
  const totalDisbursed = mission.reduce((sum, item) => sum + Number(item.budgetDisbursed), 0);
  const disbursementPercentage = totalBudget > 0 ? (totalDisbursed / totalBudget) * 100 : 0;

  // JSON-LD Schema Markup for SEO
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AI Startup Impact - India AI Ecosystem',
    url: 'https://aistartupimpact.com/india-ai',
    logo: 'https://aistartupimpact.com/logo.png',
    description: 'Comprehensive database and intelligence platform for India\'s AI startup ecosystem',
    sameAs: [
      'https://twitter.com/aistartupimpact',
      'https://linkedin.com/company/aistartupimpact',
    ],
  };

  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'India AI Startups Database 2026',
    description: 'Comprehensive database of 3,247+ AI startups in India with funding data, city-wise distribution, and ecosystem insights',
    url: 'https://aistartupimpact.com/india-ai',
    keywords: 'India AI startups, AI funding India, Indian AI companies, AI ecosystem',
    creator: {
      '@type': 'Organization',
      name: 'AI Startup Impact',
    },
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'application/json',
      contentUrl: 'https://aistartupimpact.com/api/india-ai/stats',
    },
  };

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-10">
        {/* ============================================
            SECTION 1: HERO WITH LIVE STATS
            ============================================ */}
        <div className="mb-8 sm:mb-12 lg:mb-16 text-center">
          <div className="inline-flex items-center gap-2 badge-brand mb-2 sm:mb-3 text-[10px] sm:text-xs">
            <Flag className="w-3 h-3" /> India AI Ecosystem — Live
          </div>
          <h1 className="font-sora font-extrabold text-lg sm:text-xl md:text-2xl lg:text-3xl text-navy dark:text-white max-w-4xl mx-auto px-2">
            India&apos;s AI Revolution — Live
          </h1>
          <p className="text-gray-600 dark:text-gray-300 font-jakarta text-[11px] sm:text-xs lg:text-sm mt-2 sm:mt-3 max-w-2xl mx-auto px-4 leading-relaxed">
            Real-time intelligence on <strong>3,247+ AI startups</strong>, funding, policy, and talent shaping India&apos;s AI future
          </p>

          {/* Live Stats Counters */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mt-5 sm:mt-6 lg:mt-8">
            {stats.map((stat: any) => {
              const Icon = iconMap[stat.metricIcon] || Rocket;
              return (
                <div key={stat.id} className="card p-3 sm:p-4 lg:p-5 text-center hover:shadow-lg transition-shadow">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand/10 dark:bg-brand/20 flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand" />
                  </div>
                  <div className="font-sora font-extrabold text-base sm:text-lg md:text-xl lg:text-2xl text-brand mb-0.5 sm:mb-1">
                    {stat.metricValue}
                  </div>
                  <div className="text-[8px] sm:text-[9px] text-gray-500 dark:text-gray-400 font-jakarta mb-1">
                    {stat.metricChange}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-gray-700 dark:text-gray-300 font-jakarta font-semibold leading-tight">
                    {stat.metricLabel}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Newsletter CTA */}
          <NewsletterCapture source="india-ai-hero" />
        </div>

        {/* ============================================
            SECTION 2: INTERACTIVE INDIA AI MAP
            ============================================ */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          <h2 className="section-title justify-center mb-2 sm:mb-3 text-xl sm:text-2xl">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
            Live India AI Ecosystem Map
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base px-4 leading-relaxed">
            Interactive map showing <strong>AI startups across India</strong> — filter by sector, stage, and year
          </p>

          {/* Interactive Map Component */}
          <RealIndiaMap cities={cities as any} allStartups={allStartups as any} />
        </div>

        {/* ============================================
            SECTION 3: LIVE AI FUNDING TRACKER
            ============================================ */}
        <FundingTracker recentFunding={recentFunding as any} />

        {/* ============================================
            SECTION 4: INDIAAI MISSION TRACKER
            ============================================ */}
        <div className="mb-12 sm:mb-16">
          <h2 className="section-title justify-center mb-3">
            <Flag className="w-6 h-6" />
            IndiaAI Mission Tracker
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Track the <strong>₹10,372 Cr IndiaAI Mission</strong> budget allocation and disbursement
          </p>

          {/* Mission Summary */}
          <div className="card p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-brand mb-1">
                  {formatBudget(totalBudget)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Budget Allocated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {formatBudget(totalDisbursed)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Amount Disbursed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {disbursementPercentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Disbursement Rate</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-brand to-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${disbursementPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Mission Components */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {mission.map((component: any) => (
              <div key={component.id} className="card p-5 sm:p-6">
                <h3 className="font-sora font-bold text-base sm:text-lg text-navy dark:text-white mb-3">
                  {component.component}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {component.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Allocated:</span>
                    <span className="font-bold text-brand">
                      {formatBudget(component.budgetAllocated)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Disbursed:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {formatBudget(component.budgetDisbursed)}
                    </span>
                  </div>
                </div>

                {/* Component Progress */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-brand h-2 rounded-full transition-all"
                    style={{
                      width: `${
                        (Number(component.budgetDisbursed) / Number(component.budgetAllocated)) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================
            SECTION 5: GOVERNMENT SCHEMES & POLICY HUB
            ============================================ */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          <h2 className="section-title justify-center mb-2 sm:mb-3 text-xl sm:text-2xl">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
            Government Schemes & Policy Hub
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base px-4 leading-relaxed">
            Complete directory of <strong>AI funding schemes</strong>, eligibility criteria, and application support
          </p>

          <div className="mb-8 sm:mb-10 lg:mb-12">
            <h3 className="font-sora font-bold text-lg sm:text-xl text-navy dark:text-white mb-4 sm:mb-6 text-center flex items-center justify-center gap-2">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
              Available Schemes & Programs
            </h3>
            <GovernmentSchemesHardcoded />
          </div>

          <div>
            <h3 className="font-sora font-bold text-lg sm:text-xl text-navy dark:text-white mb-4 sm:mb-6 text-center flex items-center justify-center gap-2">
              <Newspaper className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
              AI Policy Live Feed
            </h3>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 max-w-2xl mx-auto text-xs sm:text-sm px-4 leading-relaxed">
              Latest updates from MeitY, NITI Aayog, Data Protection Board, and AI Safety Committee
            </p>
            <PolicyLiveFeedHardcoded />
          </div>
        </div>

        {/* ============================================
            SECTION 6: AI TALENT & RESEARCH
            ============================================ */}
        <div className="mb-12 sm:mb-16">
          <h2 className="section-title justify-center mb-3">
            <GraduationCap className="w-6 h-6" />
            AI Talent & Research Hubs
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            India&apos;s leading <strong>AI research institutions</strong> and talent development centers
          </p>

          {/* Research Hubs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {researchHubs.map((hub: any) => (
              <div key={hub.id} className="card p-5 sm:p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-sora font-bold text-base sm:text-lg text-navy dark:text-white">
                      {hub.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{hub.city}</p>
                  </div>
                  <BookOpen className="w-5 h-5 text-brand" />
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {hub.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">PhD Programs:</span>
                    <span className="font-bold text-brand">{hub.phdPrograms}+</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Type:</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{hub.type}</span>
                  </div>
                </div>

                {hub.focusAreas && hub.focusAreas.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Focus Areas:</div>
                    <div className="flex flex-wrap gap-1">
                      {hub.focusAreas.slice(0, 3).map((area: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ============================================
            FINAL CTA BLOCK
            ============================================ */}
        <div className="card p-6 sm:p-8 lg:p-12 text-center bg-gradient-to-br from-brand/10 to-blue-50 dark:from-brand/20 dark:to-gray-800">
          <h2 className="font-sora font-bold text-xl sm:text-2xl lg:text-3xl text-navy dark:text-white mb-3 sm:mb-4 px-2">
            Stay Updated on India&apos;s AI Revolution
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base px-4 leading-relaxed">
            Get weekly insights on <strong>AI funding India</strong>, policy updates, and ecosystem trends
          </p>
          <NewsletterCapture source="india-ai-footer" />
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-3 sm:mt-4">
            Join 5,200+ founders, investors, and AI enthusiasts
          </p>
        </div>
      </div>
    </>
  );
}

import Link from 'next/link';
import { 
  Flag, 
  TrendingUp, 
  Building2, 
  IndianRupee, 
  Users, 
  BookOpen, 
  MapPin, 
  Rocket,
  Trophy,
  DollarSign,
  GraduationCap,
  Briefcase,
  ArrowRight
} from 'lucide-react';
import { neon } from '@neondatabase/serverless';

// Fetch all data server-side
async function getIndiaAIData() {
  const sql = neon(process.env.DATABASE_URL!);

  const [stats, cities, mission, researchHubs] = await Promise.all([
    sql`
      SELECT * FROM "IndiaAIStats"
      WHERE "isActive" = true
      ORDER BY "displayOrder" ASC
    `,
    sql`
      SELECT * FROM "IndiaAICity"
      WHERE "isActive" = true
      ORDER BY "displayOrder" ASC
      LIMIT 6
    `,
    sql`
      SELECT * FROM "IndiaAIMissionTracker"
      WHERE "isActive" = true
      ORDER BY "displayOrder" ASC
    `,
    sql`
      SELECT * FROM "ResearchHub"
      WHERE "isActive" = true
      ORDER BY "displayOrder" ASC
      LIMIT 5
    `,
  ]);

  return { stats, cities, mission, researchHubs };
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

export default async function IndiaAIPageNew() {
  const { stats, cities, mission, researchHubs } = await getIndiaAIData();

  // Calculate mission totals
  const totalBudget = mission.reduce((sum, item) => sum + Number(item.budgetAllocated), 0);
  const totalDisbursed = mission.reduce((sum, item) => sum + Number(item.budgetDisbursed), 0);
  const disbursementPercentage = totalBudget > 0 ? (totalDisbursed / totalBudget) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* ============================================
          SECTION 1: HERO WITH LIVE STATS
          ============================================ */}
      <div className="mb-12 sm:mb-16 text-center">
        <div className="inline-flex items-center gap-2 badge-brand mb-4">
          <Flag className="w-3 h-3" /> India AI Ecosystem — Live
        </div>
        <h1 className="font-sora font-extrabold text-3xl sm:text-4xl md:text-[48px] md:leading-tight text-navy dark:text-white max-w-4xl mx-auto">
          India&apos;s AI Revolution — Live
        </h1>
        <p className="text-gray-600 dark:text-gray-300 font-jakarta text-base sm:text-lg mt-4 max-w-2xl mx-auto">
          Real-time intelligence on India&apos;s AI ecosystem — startups, funding, policy, talent, and innovation
        </p>

        {/* Live Stats Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-10">
          {stats.map((stat: any) => {
            const Icon = iconMap[stat.metricIcon] || Rocket;
            return (
              <div key={stat.id} className="card p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-full bg-brand/10 dark:bg-brand/20 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-brand" />
                </div>
                <div className="font-sora font-extrabold text-3xl sm:text-4xl text-brand mb-1">
                  {stat.metricValue}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-jakarta mb-2">
                  {stat.metricChange}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 font-jakarta font-semibold">
                  {stat.metricLabel}
                </div>
              </div>
            );
          })}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
            />
            <button className="px-6 py-3 bg-brand text-white rounded-lg font-semibold hover:bg-brand/90 transition-colors">
              Subscribe
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Join 5,200+ subscribers • Weekly India AI Intelligence Report
          </p>
        </div>
      </div>

      {/* ============================================
          SECTION 2: INTERACTIVE INDIA AI MAP
          ============================================ */}
      <div className="mb-12 sm:mb-16">
        <h2 className="section-title justify-center mb-8">
          <MapPin className="w-6 h-6" />
          India AI Ecosystem Map
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Explore India&apos;s AI startup hubs — click on any city to see detailed ecosystem data
        </p>

        {/* Cities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city: any) => (
            <Link
              key={city.id}
              href={`/india-ai/cities/${city.slug}`}
              className="group card p-6 hover:shadow-xl transition-all hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-sora font-bold text-xl text-navy dark:text-white group-hover:text-brand transition-colors">
                    {city.cityName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{city.state}</p>
                </div>
                <MapPin className="w-5 h-5 text-brand" />
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">AI Startups</span>
                  <span className="font-bold text-lg text-brand">
                    {city.totalStartups.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Funding</span>
                  <span className="font-bold text-lg text-green-600 dark:text-green-400">
                    {formatCurrency(city.totalFunding)}
                  </span>
                </div>
              </div>

              {city.topSectors && city.topSectors.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Top Sectors:</div>
                  <div className="flex flex-wrap gap-1">
                    {city.topSectors.slice(0, 3).map((sector: string, idx: number) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <span className="text-sm text-brand font-semibold">View Details</span>
                <ArrowRight className="w-4 h-4 text-brand group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ============================================
          SECTION 4: INDIAAI MISSION TRACKER
          ============================================ */}
      <div className="mb-12 sm:mb-16">
        <h2 className="section-title justify-center mb-8">
          <Flag className="w-6 h-6" />
          IndiaAI Mission Tracker
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Track the ₹10,372 Cr IndiaAI Mission budget allocation and disbursement
        </p>

        {/* Mission Summary */}
        <div className="card p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-brand mb-1">
                {formatBudget(totalBudget)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Budget Allocated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                {formatBudget(totalDisbursed)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Amount Disbursed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {mission.map((component: any) => (
            <div key={component.id} className="card p-6">
              <h3 className="font-sora font-bold text-lg text-navy dark:text-white mb-3">
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
          SECTION 6: AI TALENT & RESEARCH
          ============================================ */}
      <div className="mb-12 sm:mb-16">
        <h2 className="section-title justify-center mb-8">
          <GraduationCap className="w-6 h-6" />
          AI Talent & Research Hubs
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          India&apos;s leading AI research institutions and talent development centers
        </p>

        {/* Research Hubs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {researchHubs.map((hub: any) => (
            <div key={hub.id} className="card p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-sora font-bold text-lg text-navy dark:text-white">
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
      <div className="card p-8 sm:p-12 text-center bg-gradient-to-br from-brand/10 to-blue-50 dark:from-brand/20 dark:to-gray-800">
        <h2 className="font-sora font-bold text-2xl sm:text-3xl text-navy dark:text-white mb-4">
          Stay Updated on India&apos;s AI Revolution
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Get weekly insights on funding, policy updates, and ecosystem trends
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button className="px-8 py-3 bg-brand text-white rounded-lg font-semibold hover:bg-brand/90 transition-colors whitespace-nowrap">
            Subscribe Now
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          Join 5,200+ founders, investors, and AI enthusiasts
        </p>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { Building2, TrendingUp, Star, MapPin, Users, IndianRupee, ExternalLink, ChevronRight, Search, Globe } from 'lucide-react';

const stages = ['All', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Public'];
const sectors = ['All Sectors', 'LLM/NLP', 'HealthTech', 'FinTech', 'EdTech', 'AgriTech', 'Dev Tools', 'CleanTech', 'Infrastructure'];

const startups = [
  { slug: 'sarvam-ai', name: 'Sarvam AI', tagline: 'India-first foundation models for enterprise', stage: 'Series A', sector: 'LLM/NLP', totalFunding: '₹415Cr', impactScore: 92, location: 'Bangalore', employees: '80+', isIndian: true },
  { slug: 'medai-health', name: 'MedAI Health', tagline: 'AI diagnostics for rural healthcare', stage: 'Seed', sector: 'HealthTech', totalFunding: '₹83Cr', impactScore: 88, location: 'Chennai', employees: '35', isIndian: true },
  { slug: 'krutrim', name: 'Krutrim', tagline: "India's own AI foundation model by Ola", stage: 'Series B', sector: 'LLM/NLP', totalFunding: '₹5,000Cr', impactScore: 95, location: 'Bangalore', employees: '300+', isIndian: true },
  { slug: 'agribot-tech', name: 'AgriBot Tech', tagline: 'AI-powered precision farming for Indian agriculture', stage: 'Series A', sector: 'AgriTech', totalFunding: '₹50Cr', impactScore: 79, location: 'Pune', employees: '45', isIndian: true },
  { slug: 'lendai', name: 'LendAI', tagline: 'NLP credit scoring for underserved borrowers', stage: 'Series B', sector: 'FinTech', totalFunding: '₹340Cr', impactScore: 85, location: 'Mumbai', employees: '120', isIndian: true },
  { slug: 'padhai', name: 'PadhAI', tagline: 'AI tutoring in 10 Indian languages', stage: 'Seed', sector: 'EdTech', totalFunding: '₹33Cr', impactScore: 76, location: 'Delhi', employees: '25', isIndian: true },
  { slug: 'neuralscale', name: 'NeuralScale', tagline: 'GPU cloud infrastructure with Mumbai data residency', stage: 'Series A', sector: 'Infrastructure', totalFunding: '₹166Cr', impactScore: 82, location: 'Hyderabad', employees: '60', isIndian: true },
  { slug: 'codeassist', name: 'CodeAssist', tagline: 'AI pair programmer for Indian tech teams', stage: 'Pre-Seed', sector: 'Dev Tools', totalFunding: '₹12Cr', impactScore: 68, location: 'Bangalore', employees: '12', isIndian: true },
];

export default function StartupsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="mb-6 sm:mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-6 h-6 text-brand" />
          <h1 className="font-sora font-extrabold text-2xl sm:text-3xl md:text-4xl text-navy dark:text-white">Startup Directory</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm sm:text-base max-w-2xl">
          {startups.length}+ Indian AI startups tracked. Browse by stage, sector, and impact score.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Search startups..." className="input-field pl-12" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap flex-1">
          {stages.map((s, i) => (<button key={s} className={`pill whitespace-nowrap text-xs shrink-0 ${i === 0 ? 'bg-brand text-white hover:bg-brand-600 hover:text-white' : ''}`}>{s}</button>))}
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
          {sectors.slice(0, 5).map((s, i) => (<button key={s} className={`pill whitespace-nowrap text-xs shrink-0 ${i === 0 ? 'bg-navy dark:bg-gray-700 text-white hover:text-white' : ''}`}>{s}</button>))}
        </div>
      </div>

      {/* Startups Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {startups.map((s) => (
          <Link key={s.slug} href={`/startups/${s.slug}`} className="group">
            <div className="card p-4 sm:p-5 h-full flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/30 dark:to-brand-800/20 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-brand" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-sora font-bold text-base text-navy dark:text-white group-hover:text-brand transition-colors">{s.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-jakarta">
                    <MapPin className="w-3 h-3" />{s.location}
                  </div>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-jakarta flex-1">{s.tagline}</p>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full uppercase">{s.stage}</span>
                  <span className="badge-category text-[9px]">{s.sector}</span>
                </div>
                <div className="text-right">
                  <div className="font-sora font-extrabold text-sm text-brand">{s.totalFunding}</div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <TrendingUp className="w-3 h-3" />Score: {s.impactScore}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

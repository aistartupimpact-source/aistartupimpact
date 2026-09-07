'use client';

import { useState } from 'react';
import {
  GraduationCap,
  MapPin,
  ExternalLink,
  BookOpen,
  Award,
  FlaskConical,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Lab {
  name: string;
  description: string;
}

interface Institution {
  id: string;
  name: string;
  city: string;
  state: string;
  tag: string;
  category: string;
  aiCentre?: string | null;
  dept?: string | null;
  faculty?: string | null;
  students?: string | null;
  programs?: string | null;
  fundedBy?: string | null;
  bharatGen?: string | null;
  appliedAI?: string | null;
  researchAreas: string[];
  labs: Lab[];
  link: string;
  linkLabel: string;
}

interface Stat {
  id: string;
  label: string;
  value: string;
}

interface Programme {
  id: string;
  description: string;
  note?: string | null;
  link?: string | null;
  linkLabel?: string | null;
}

interface Props {
  institutions: Institution[];
  headerStats: Stat[];
  futureSkillsStats: Stat[];
  programmes: Programme[];
  lastUpdated?: string;
}

export default function AITalentResearchHubsClient({ institutions, headerStats, futureSkillsStats, programmes, lastUpdated }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedInstitution, setExpandedInstitution] = useState<Set<string>>(new Set());

  const filteredInstitutions = selectedCategory === 'All'
    ? institutions
    : institutions.filter(i => i.category === selectedCategory);

  const categories = ['All', ...Array.from(new Set(institutions.map(i => i.category)))];
  const categoryCounts: Record<string, number> = { All: institutions.length };
  institutions.forEach(i => { categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1; });

  const toggleExpand = (id: string) => {
    setExpandedInstitution(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const lastProgramme = programmes[programmes.length - 1];
  const regularProgrammes = programmes.slice(0, -1);

  return (
    <div>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-4 max-w-3xl mx-auto text-xs sm:text-sm leading-relaxed px-2">
        Verified directory of premier AI research institutions, dedicated AI departments, centres of excellence,
        and national talent development initiatives — with faculty counts, programs, and focus areas sourced from
        official institutional websites and government data as of August 2026.
      </p>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {headerStats.map((stat) => (
          <div key={stat.id} className="card p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-brand">{stat.value}</div>
            <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-2 justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              selectedCategory === cat
                ? 'bg-brand text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {cat}
            <span className="ml-1.5 text-xs opacity-75">({categoryCounts[cat] || 0})</span>
          </button>
        ))}
      </div>
      {lastUpdated && (
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-6">Last updated: {lastUpdated}</p>
      )}

      {/* Section Title */}
      <h3 className="font-sora font-bold text-base sm:text-lg text-navy dark:text-white mb-4 text-center">
        Premier AI Research Institutions
      </h3>

      {/* Institution Cards */}
      <div className="space-y-4 sm:space-y-5">
        {filteredInstitutions.map((inst) => {
          const isExpanded = expandedInstitution.has(inst.id);
          const labs = (Array.isArray(inst.labs) ? inst.labs : []) as Lab[];
          return (
            <div key={inst.id} className="card p-4 sm:p-6 border-l-4 border-brand">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="font-sora font-bold text-base sm:text-lg text-navy dark:text-white">
                      {inst.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <MapPin className="w-3 h-3" />
                      {inst.city}, {inst.state}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {inst.tag}
                    </span>
                  </div>
                </div>
                <GraduationCap className="w-5 h-5 text-brand shrink-0 ml-2" />
              </div>

              {/* Key Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 mb-3 text-xs sm:text-sm">
                {inst.aiCentre && (
                  <div className="flex items-start gap-1.5">
                    <span className="text-gray-500 dark:text-gray-400 font-medium shrink-0">AI Centre</span>
                    <span className="font-semibold text-brand">{inst.aiCentre}</span>
                  </div>
                )}
                {inst.dept && (
                  <div className="flex items-start gap-1.5">
                    <span className="text-gray-500 dark:text-gray-400 font-medium shrink-0">Dept</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{inst.dept}</span>
                  </div>
                )}
                {inst.faculty && (
                  <div className="flex items-start gap-1.5">
                    <span className="text-gray-500 dark:text-gray-400 font-medium shrink-0">Faculty</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{inst.faculty}</span>
                  </div>
                )}
                {inst.students && (
                  <div className="flex items-start gap-1.5">
                    <span className="text-gray-500 dark:text-gray-400 font-medium shrink-0">Students</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{inst.students}</span>
                  </div>
                )}
                {inst.programs && (
                  <div className="flex items-start gap-1.5 sm:col-span-2">
                    <span className="text-gray-500 dark:text-gray-400 font-medium shrink-0">Programs</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{inst.programs}</span>
                  </div>
                )}
                {inst.fundedBy && (
                  <div className="flex items-start gap-1.5">
                    <span className="text-gray-500 dark:text-gray-400 font-medium shrink-0">Funded by</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{inst.fundedBy}</span>
                  </div>
                )}
                {inst.appliedAI && (
                  <div className="flex items-start gap-1.5">
                    <span className="text-gray-500 dark:text-gray-400 font-medium shrink-0">Applied AI</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{inst.appliedAI}</span>
                  </div>
                )}
                {inst.bharatGen && (
                  <div className="flex items-start gap-1.5">
                    <span className="text-gray-500 dark:text-gray-400 font-medium shrink-0">BharatGen</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{inst.bharatGen}</span>
                  </div>
                )}
              </div>

              {/* Research Areas */}
              <div className="mb-3">
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Research Areas</div>
                <div className="flex flex-wrap gap-1.5">
                  {inst.researchAreas.map((area, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Expandable Labs Section */}
              {labs.length > 0 && (
                <>
                  <button
                    onClick={() => toggleExpand(inst.id)}
                    className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand hover:underline mb-2"
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    Key Labs & Centres ({labs.length})
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <ul className="space-y-2 mb-3">
                      {labs.map((lab, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <FlaskConical className="w-3 h-3 text-brand shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-gray-800 dark:text-gray-200">{lab.name}</strong>
                            {' — '}{lab.description}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {/* Link */}
              <a
                href={inst.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand hover:underline"
              >
                {inst.linkLabel}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          );
        })}
      </div>

      {/* FutureSkills Section */}
      <div className="mt-8 sm:mt-10 card p-4 sm:p-6 border-l-4 border-green-500 bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-900/10">
        <div className="flex items-start gap-3 mb-4">
          <Award className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-sora font-bold text-base sm:text-lg text-navy dark:text-white">
              National Talent Development — IndiaAI FutureSkills
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
              Building India&apos;s AI talent pipeline through fellowships, Data & AI Labs in Tier 2/3 cities,
              and industry-aligned curricula. As of July 2026, the government has approved 58 AI Centres of Excellence
              and identified 543 additional labs for ITIs and polytechnics.
            </p>
          </div>
        </div>

        {/* FutureSkills Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
          {futureSkillsStats.map((stat) => (
            <div key={stat.id} className="bg-white dark:bg-gray-800 rounded-lg p-2.5 sm:p-3 text-center">
              <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">{stat.value}</div>
              <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Programme Breakdown */}
        <div className="mb-3">
          <div className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Programme Breakdown</div>
          <ul className="space-y-1.5">
            {regularProgrammes.map((prog) => (
              <li key={prog.id} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <BookOpen className="w-3 h-3 text-green-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{prog.description}</span>
              </li>
            ))}
            {lastProgramme && (
              <li className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <BookOpen className="w-3 h-3 text-green-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{lastProgramme.description}</span>
              </li>
            )}
          </ul>
        </div>

        {lastProgramme?.note && (
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 italic mb-3">
            Note: {lastProgramme.note}
          </p>
        )}

        {lastProgramme?.link && (
          <a
            href={lastProgramme.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400 hover:underline"
          >
            {lastProgramme.linkLabel || 'Visit Portal'}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

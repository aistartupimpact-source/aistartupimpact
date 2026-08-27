'use client';

import { useState } from 'react';
import {
  GraduationCap,
  Building2,
  MapPin,
  ExternalLink,
  Users,
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
  category: 'Dedicated AI Dept' | 'AI Centre';
  aiCentre?: string;
  dept?: string;
  faculty?: string;
  students?: string;
  programs?: string;
  fundedBy?: string;
  bharatGen?: string;
  appliedAI?: string;
  researchAreas: string[];
  labs: Lab[];
  link: string;
  linkLabel: string;
}

const STATS = [
  { label: 'Institutions', value: '8' },
  { label: 'AI CoEs Approved', value: '58' },
  { label: 'Data & AI Labs', value: '543' },
  { label: 'Fellowships Awarded', value: '686' },
];

const INSTITUTIONS: Institution[] = [
  {
    id: 'iisc',
    name: 'IISc Bangalore',
    city: 'Bengaluru',
    state: 'Karnataka',
    tag: 'Institute of Eminence',
    category: 'AI Centre',
    aiCentre: 'Kotak IISc AI-ML Centre (KIAC)',
    dept: 'CDS (14 labs)',
    programs: 'PhD, MTech(Res), MTech(CDS), BTech(Math&Comp)',
    researchAreas: ['Machine Learning', 'Deep Learning', 'Generative AI', 'Computer Vision', 'NLP & Speech', 'Robotics', 'AI Ethics & Fairness', 'AI for Science'],
    labs: [
      { name: 'KIAC (Kotak IISc AI-ML Centre)', description: 'Flagship AI centre with PhD & MTech(Res) programs, 2026 admissions open' },
      { name: 'Vision & AI Lab (VAL)', description: 'Ranked #1 AI research lab in India by CSRankings; 3 papers at ECCV 2026' },
      { name: 'CDS Department', description: '14 research labs including DREAM:Lab, NLP Lab, QUEST, BioMedIA, FLAME:Lab' },
      { name: 'STARS Group', description: 'Scientific Machine Learning, Physics-Informed Neural Networks, MLOps' },
    ],
    link: 'https://kiac.iisc.ac.in/',
    linkLabel: 'Visit KIAC',
  },
  {
    id: 'iitb',
    name: 'IIT Bombay',
    city: 'Mumbai',
    state: 'Maharashtra',
    tag: 'Institute of Eminence',
    category: 'AI Centre',
    aiCentre: 'C-MInDS',
    faculty: '80+ (across 15 depts)',
    students: '100+ current & alumni',
    researchAreas: ['AI & ML', 'Robotics', 'Data Science', 'NLP (CFILT Lab)', 'Medical AI (MeDAL)', 'Trustworthy AI', 'Generative AI'],
    labs: [
      { name: 'C-MInDS', description: '80+ faculty, 45+ research projects, 35+ industry engagements' },
      { name: 'BharatGen Technology Foundation', description: 'Section 8 company leading India\'s sovereign AI stack; 8-institution consortium; Param2-17B, Patram-7B models' },
      { name: 'CFILT (NLP Lab)', description: 'Indian language technology since 1996; 30+ researchers' },
      { name: 'MeDAL', description: 'Medical Deep Learning & AI Lab — medical image analysis, genomic data' },
      { name: 'Columbia-IITB Centre of AI for Manufacturing', description: 'Established Feb 2026; semiconductors, robotics, industrial AI' },
      { name: 'SBI Foundation Hub', description: 'AI for banking & finance; papers at AAAI 2025, ICLR 2025, IJCAI 2024' },
    ],
    link: 'https://www.minds.iitb.ac.in/',
    linkLabel: 'Visit C-MInDS',
  },
  {
    id: 'iitm',
    name: 'IIT Madras',
    city: 'Chennai',
    state: 'Tamil Nadu',
    tag: 'Institute of Eminence',
    category: 'Dedicated AI Dept',
    aiCentre: 'Wadhwani School of DS & AI',
    faculty: '33+ (RBC-DSAI alone)',
    students: '25+ PhDs (RBC-DSAI)',
    researchAreas: ['Deep Learning', 'Reinforcement Learning', 'AI Safety', 'NLP & Speech', 'Network Analytics', 'Interpretable ML', 'AI for Healthcare'],
    labs: [
      { name: 'Wadhwani School of Data Science & AI (WSAI)', description: 'Flagship interdisciplinary school; faculty appointed to UN International Scientific Panel on AI (2026)' },
      { name: 'RBC-DSAI (Robert Bosch Centre)', description: 'Founded 2017; largest Deep RL group in India' },
      { name: 'AI4Bharat', description: 'Open-source datasets & models for 22 Indian languages; 15,000 hrs transcribed data from 400+ districts' },
      { name: 'CeRAI', description: 'Centre for Responsible AI — standards, policy & tooling for accountable AI' },
      { name: 'IBSE', description: 'AI/ML for clinical & biological data; precision medicine' },
      { name: 'Bodhan AI', description: 'CoE powering Bharat EduAI Stack for multilingual education' },
      { name: 'Walmart Centre for Tech Excellence', description: 'AI & IoT for MSMEs' },
    ],
    link: 'https://wsai.iitm.ac.in/',
    linkLabel: 'Visit WSAI',
  },
  {
    id: 'iiith',
    name: 'IIIT Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    tag: 'Deemed University',
    category: 'AI Centre',
    aiCentre: 'INAI + KCIS',
    appliedAI: 'Mobility & Healthcare',
    fundedBy: 'TCS Foundation, MeitY',
    researchAreas: ['NLP', 'Computer Vision', 'Speech Processing', 'Robotics', 'AI for Mobility', 'AI for Healthcare', 'Foundation Models'],
    labs: [
      { name: 'INAI (Applied AI Research Centre)', description: 'Launched 2020 as part of Telangana Year of AI; focus on mobility & healthcare' },
      { name: 'KCIS (Kohli Center on Intelligent Systems)', description: 'Established 2015 with TCS Foundation funding' },
      { name: 'iHub-Data (TIH & NM-ICPS)', description: 'Data-driven AI innovation hub' },
    ],
    link: 'https://inai.iiit.ac.in/',
    linkLabel: 'Visit INAI',
  },
  {
    id: 'iitk',
    name: 'IIT Kanpur',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    tag: 'Institute of Eminence',
    category: 'AI Centre',
    aiCentre: 'CoE in AI',
    programs: 'BTech, MTech, PhD (CSE)',
    bharatGen: 'Consortium member',
    researchAreas: ['Machine Learning', 'Computer Vision', 'NLP', 'AI for Manufacturing', 'Quantum AI'],
    labs: [
      { name: 'Centre of Excellence in AI', description: 'Foundational AI research across CSE & allied departments' },
      { name: 'BharatGen consortium member', description: 'Contributing to India\'s sovereign multilingual AI models' },
      { name: 'Tata Group AI CoE', description: 'One of UP\'s first AI Centres of Excellence' },
    ],
    link: 'https://www.iitk.ac.in/',
    linkLabel: 'Visit IITK',
  },
  {
    id: 'iitd',
    name: 'IIT Delhi',
    city: 'Delhi',
    state: 'Delhi',
    tag: 'Institute of Eminence',
    category: 'Dedicated AI Dept',
    aiCentre: 'School of AI (ScAI)',
    faculty: '20+ core AI faculty',
    programs: 'BTech(AI), MTech(AI), PhD(AI)',
    researchAreas: ['Machine Learning', 'Computer Vision', 'NLP', 'AI for Healthcare', 'Responsible AI', 'Federated Learning'],
    labs: [
      { name: 'School of Artificial Intelligence (ScAI)', description: 'India\'s first dedicated AI school at an IIT; launched 2020' },
      { name: 'Privacy-Preserving ML Lab', description: 'IIT Delhi + IIIT Delhi + IIT Dharwad — federated learning models' },
    ],
    link: 'https://scai.iitd.ac.in/',
    linkLabel: 'Visit ScAI',
  },
  {
    id: 'iith',
    name: 'IIT Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    tag: 'Institute of National Importance',
    category: 'Dedicated AI Dept',
    aiCentre: 'Dept of AI',
    programs: 'BTech(AI), MTech(AI), PhD',
    researchAreas: ['Machine Learning', 'Computer Vision', 'NLP', 'Robotics', 'AI for Agriculture', 'Ethical AI'],
    labs: [
      { name: 'Department of Artificial Intelligence', description: 'One of India\'s first standalone AI departments; established 2019' },
      { name: 'Foundations of Ethical AI Workshop', description: 'Joint workshops with IIIT Hyderabad (June 2026)' },
    ],
    link: 'https://ai.iith.ac.in/',
    linkLabel: 'Visit IIT Hyderabad AI',
  },
  {
    id: 'iitj',
    name: 'IIT Jodhpur',
    city: 'Jodhpur',
    state: 'Rajasthan',
    tag: 'Institute of National Importance',
    category: 'Dedicated AI Dept',
    aiCentre: 'School of AI & DS',
    programs: 'BTech(AI&DS), MTech, PhD',
    researchAreas: ['Machine Learning', 'Deep Learning', 'AI Safety', 'Deepfake Detection', 'Machine Unlearning', 'AI for Science'],
    labs: [
      { name: 'School of AI & Data Science', description: 'Dedicated school offering BTech, MTech and PhD programs' },
      { name: 'Saakshya Project (with IIT Madras)', description: 'Multi-agent deepfake detection framework — IndiaAI Safety Institute approved' },
      { name: 'Machine Unlearning Lab', description: 'Removing sensitive/outdated info from generative models — RAI project' },
    ],
    link: 'https://iitj.ac.in/department/index.php?id=ai',
    linkLabel: 'Visit IIT Jodhpur AI',
  },
];

const FUTURESKILLS_STATS = [
  { label: 'Fellowships Awarded', value: '686' },
  { label: 'AI CoEs Approved', value: '58' },
  { label: 'Data & AI Labs Identified', value: '543' },
  { label: 'NIELT Labs Operational', value: '27' },
  { label: 'Institutes with Fellows', value: '178' },
  { label: 'YUVA AI Trainees', value: '26.5L+' },
];

const FUTURESKILLS_PROGRAMMES = [
  'PhD Fellowships — 500 supported across 26 institutes; part of 686 total fellowships',
  'Postgraduate Fellowships — 5,000 PG students targeted; selection ongoing',
  'Undergraduate Fellowships — 8,000 UG students targeted; 150 selected in first year (shortfall flagged by parliamentary panel)',
  'NIELT Data & AI Labs — 27 labs operational in Tier 2/3 cities with Learning Zone & Developmental Zone; 3,500+ students trained',
  'ITI/Polytechnic Labs — 543 labs identified across 174 ITIs & polytechnics nominated by states/UTs',
  'YUVA AI for All — 26.5 lakh+ individuals completed the programme',
  '762 AI use cases identified across 62 ministries for application development',
];

export default function AITalentResearchHubs() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedInstitution, setExpandedInstitution] = useState<Set<string>>(new Set());

  const filteredInstitutions = selectedCategory === 'All'
    ? INSTITUTIONS
    : INSTITUTIONS.filter(i => i.category === selectedCategory);

  const categories = ['All', 'Dedicated AI Dept', 'AI Centre'];
  const categoryCounts: Record<string, number> = { All: INSTITUTIONS.length };
  INSTITUTIONS.forEach(i => { categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1; });

  const toggleExpand = (id: string) => {
    setExpandedInstitution(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-4 max-w-3xl mx-auto text-xs sm:text-sm leading-relaxed px-2">
        Verified directory of premier AI research institutions, dedicated AI departments, centres of excellence,
        and national talent development initiatives — with faculty counts, programs, and focus areas sourced from
        official institutional websites and government data as of August 2026.
      </p>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {STATS.map((stat) => (
          <div key={stat.label} className="card p-3 sm:p-4 text-center">
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
      <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-6">Last updated: 27 Aug 2026</p>

      {/* Section Title */}
      <h3 className="font-sora font-bold text-base sm:text-lg text-navy dark:text-white mb-4 text-center">
        Premier AI Research Institutions
      </h3>

      {/* Institution Cards */}
      <div className="space-y-4 sm:space-y-5">
        {filteredInstitutions.map((inst) => {
          const isExpanded = expandedInstitution.has(inst.id);
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
              <button
                onClick={() => toggleExpand(inst.id)}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand hover:underline mb-2"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                Key Labs & Centres ({inst.labs.length})
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {isExpanded && (
                <ul className="space-y-2 mb-3">
                  {inst.labs.map((lab, idx) => (
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

      {/* ==========================================
          FUTURESKILLS SECTION
          ========================================== */}
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
          {FUTURESKILLS_STATS.map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-lg p-2.5 sm:p-3 text-center">
              <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">{stat.value}</div>
              <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Programme Breakdown */}
        <div className="mb-3">
          <div className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Programme Breakdown</div>
          <ul className="space-y-1.5">
            {FUTURESKILLS_PROGRAMMES.map((prog, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <BookOpen className="w-3 h-3 text-green-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{prog}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 italic mb-3">
          Note: A parliamentary panel report flagged that the IndiaAI Mission selected only 150 of 5,000 targeted UG fellows
          in 2024 and spent 32% of its 2025-26 funds. The 2026-27 allocation was halved from initial projections.
        </p>

        <a
          href="https://indiaai.gov.in/hub/indiaai-futureskills"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400 hover:underline"
        >
          Visit FutureSkills Portal
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

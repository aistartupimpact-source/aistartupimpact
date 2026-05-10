'use client';

import { useState } from 'react';
import { 
  Newspaper, 
  ExternalLink, 
  Clock,
  Building2,
  Scale,
  Shield,
  FileText,
  TrendingUp
} from 'lucide-react';

const HARDCODED_POLICY_UPDATES = [
  {
    id: 'policy-1',
    title: 'IndiaAI Mission Approved with ₹10,372 Cr Budget',
    source: 'MeitY',
    date: new Date('2024-03-07'),
    excerpt: 'Cabinet approves comprehensive IndiaAI Mission to democratize AI computing, innovation, and safe AI deployment across India. Seven pillars include compute infrastructure, datasets, application development, and AI safety.',
    link: 'https://www.meity.gov.in/indiaai-mission',
    category: 'Funding',
    impact: 'High',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'policy-2',
    title: 'Digital Personal Data Protection Act 2023 Implementation Guidelines',
    source: 'Data Protection',
    date: new Date('2024-02-15'),
    excerpt: 'Data Protection Board releases implementation guidelines for DPDP Act 2023. AI companies must ensure consent mechanisms, data localization for sensitive data, and right to erasure compliance.',
    link: 'https://www.meity.gov.in/dpdp-act',
    category: 'Regulation',
    impact: 'High',
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'policy-3',
    title: 'NITI Aayog Releases National AI Strategy 2.0',
    source: 'NITI Aayog',
    date: new Date('2024-01-20'),
    excerpt: 'Updated national strategy focuses on AI for social good, responsible AI development, and positioning India as global AI talent hub. Targets 500,000 AI professionals by 2027.',
    link: 'https://www.niti.gov.in/ai-strategy',
    category: 'Policy',
    impact: 'High',
    displayOrder: 3,
    isActive: true,
  },
  {
    id: 'policy-4',
    title: 'Karnataka Announces ₹500 Cr AI Fund',
    source: 'MeitY',
    date: new Date('2023-12-10'),
    excerpt: 'Karnataka government launches dedicated AI fund to support startups, research institutions, and AI Centers of Excellence. Focus on healthcare, agriculture, and governance applications.',
    link: 'https://itbt.karnataka.gov.in/ai-policy',
    category: 'Funding',
    impact: 'Medium',
    displayOrder: 4,
    isActive: true,
  },
  {
    id: 'policy-5',
    title: 'AI Safety Committee Formed Under MeitY',
    source: 'AI Safety',
    date: new Date('2023-11-25'),
    excerpt: 'Ministry forms expert committee to develop AI safety standards, ethical guidelines, and risk assessment frameworks. Will work with global bodies on AI governance.',
    link: 'https://www.meity.gov.in/ai-safety',
    category: 'Regulation',
    impact: 'Medium',
    displayOrder: 5,
    isActive: true,
  },
  {
    id: 'policy-6',
    title: 'Supreme Court Guidelines on AI Use in Judiciary',
    source: 'Court',
    date: new Date('2023-10-15'),
    excerpt: 'Supreme Court issues guidelines for AI-assisted legal research and case management. Emphasizes human oversight, transparency, and accountability in AI-driven judicial processes.',
    link: 'https://www.sci.gov.in/ai-guidelines',
    category: 'Regulation',
    impact: 'Medium',
    displayOrder: 6,
    isActive: true,
  },
];

export default function PolicyLiveFeedHardcoded() {
  const [selectedCategory, setSelectedCategory] = useState<'All' | string>('All');

  const filteredUpdates = selectedCategory === 'All'
    ? HARDCODED_POLICY_UPDATES
    : HARDCODED_POLICY_UPDATES.filter(u => u.category === selectedCategory);

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(HARDCODED_POLICY_UPDATES.map(u => u.category)))];

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'MeitY': return <Building2 className="w-4 h-4" />;
      case 'NITI Aayog': return <TrendingUp className="w-4 h-4" />;
      case 'Data Protection': return <Shield className="w-4 h-4" />;
      case 'AI Safety': return <Shield className="w-4 h-4" />;
      case 'Court': return <Scale className="w-4 h-4" />;
      case 'Parliament': return <FileText className="w-4 h-4" />;
      default: return <Newspaper className="w-4 h-4" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'MeitY': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'NITI Aayog': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Data Protection': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'AI Safety': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Court': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Parliament': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getImpactBadge = (impact: string) => {
    const colors: Record<string, string> = {
      High: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      Low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return colors[impact] || colors.Medium;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              selectedCategory === category
                ? 'bg-brand text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {category}
            {category !== 'All' && (
              <span className="ml-2 text-xs opacity-75">
                ({HARDCODED_POLICY_UPDATES.filter(u => u.category === category).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Updates List - Optimized for Mobile */}
      <div className="space-y-3 sm:space-y-4">
        {filteredUpdates.map((update) => (
          <div
            key={update.id}
            className="card p-4 sm:p-5 hover:shadow-lg transition-all border-l-4 border-brand"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 sm:gap-4 mb-2 sm:mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${getSourceColor(update.source)}`}>
                    {getSourceIcon(update.source)}
                    <span>{update.source}</span>
                  </span>
                  <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap ${getImpactBadge(update.impact)}`}>
                    {update.impact}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(update.date)}</span>
                  </span>
                </div>
                <h3 className="font-sora font-bold text-sm sm:text-base text-navy dark:text-white mb-1.5 sm:mb-2 leading-snug">
                  {update.title}
                </h3>
              </div>
            </div>

            {/* Excerpt */}
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2 sm:mb-3 leading-relaxed">
              {update.excerpt}
            </p>

            {/* Action */}
            <a
              href={update.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-brand hover:underline"
            >
              <span>Read Full Update</span>
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </a>
          </div>
        ))}
      </div>

      {/* Subscribe CTA */}
      <div className="mt-6 sm:mt-8 card p-5 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-center">
        <Newspaper className="w-7 h-7 sm:w-8 sm:h-8 text-brand mx-auto mb-2 sm:mb-3" />
        <h3 className="font-sora font-bold text-base sm:text-lg text-navy dark:text-white mb-2">
          Get Policy Updates in Your Inbox
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
          Weekly digest of AI policy changes, regulations, and government announcements
        </p>
        <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          />
          <button
            type="submit"
            className="px-5 sm:px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors font-semibold text-sm whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
}

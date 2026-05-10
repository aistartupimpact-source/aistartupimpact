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

interface PolicyUpdate {
  id: string;
  title: string;
  source: string;
  date: Date;
  excerpt: string;
  link: string;
  category: string;
  impact: string;
  displayOrder: number;
  isActive: boolean;
}

export default function PolicyLiveFeedClient({ policyUpdates }: { policyUpdates: PolicyUpdate[] }) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | string>('All');

  const filteredUpdates = selectedCategory === 'All'
    ? policyUpdates
    : policyUpdates.filter(u => u.category === selectedCategory);

  // Get unique categories from policy updates
  const categories = ['All', ...Array.from(new Set(policyUpdates.map(u => u.category)))];

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

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - dateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
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
                    <span className="hidden xs:inline">{update.source}</span>
                  </span>
                  <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap ${getImpactBadge(update.impact)}`}>
                    {update.impact}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span className="hidden xs:inline">{formatDate(update.date)}</span>
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

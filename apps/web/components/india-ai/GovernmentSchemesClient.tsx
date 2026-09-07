'use client';

import { useState } from 'react';
import {
  FileText,
  Calendar,
  IndianRupee,
  CheckCircle2,
  ExternalLink,
  Building2,
} from 'lucide-react';

interface Scheme {
  id: string;
  name: string;
  shortName: string;
  fundingAmount: string;
  eligibility: string[];
  applicationDeadline: string;
  status: string;
  applyLink: string;
  description: string;
  benefits: string[];
  category: string;
  state?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export default function GovernmentSchemesClient({ schemes, lastUpdated }: { schemes: Scheme[]; lastUpdated?: string }) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | string>('All');
  const [expandedEligibility, setExpandedEligibility] = useState<Set<string>>(new Set());

  const filteredSchemes = selectedCategory === 'All'
    ? schemes
    : schemes.filter(s => s.category === selectedCategory);

  const categories = ['All', ...Array.from(new Set(schemes.map(s => s.category)))];
  const categoryCounts: Record<string, number> = { All: schemes.length };
  schemes.forEach(s => { categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1; });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Closed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Rolling': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Coming Soon': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div>
      {/* Filter Tabs with Counts */}
      <div className="flex flex-wrap items-center gap-2 mb-4 justify-center">
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
            <span className="ml-1.5 text-xs opacity-75">
              ({categoryCounts[category] || 0})
            </span>
          </button>
        ))}
      </div>
      {lastUpdated && (
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-6">
          Last updated: {lastUpdated}
        </p>
      )}

      {/* Schemes Grid - Optimized for Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {filteredSchemes.map((scheme) => (
          <div key={scheme.id} className="card p-4 sm:p-6 hover:shadow-xl transition-all">
            {/* Header */}
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="font-sora font-bold text-base sm:text-lg text-navy dark:text-white">
                    {scheme.shortName}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs sm:text-xs font-bold whitespace-nowrap ${getStatusColor(scheme.status)}`}>
                    {scheme.status}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 line-clamp-1">
                  {scheme.name}
                </p>
                {scheme.state && (
                  <span className="inline-flex items-center gap-1 text-xs sm:text-xs text-brand font-medium">
                    <Building2 className="w-3 h-3" />
                    {scheme.state}
                  </span>
                )}
              </div>
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-brand shrink-0 ml-2" />
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
              {scheme.description}
            </p>

            {/* Key Info */}
            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 sm:gap-2">
                  <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">Funding</span>
                </span>
                <span className="font-bold text-brand text-xs sm:text-sm">{scheme.fundingAmount}</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">Deadline</span>
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                  {scheme.applicationDeadline}
                </span>
              </div>
            </div>

            {/* Eligibility */}
            <div className="mb-3 sm:mb-4">
              <div className="text-xs sm:text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                Eligibility:
              </div>
              <ul className="space-y-1">
                {(expandedEligibility.has(scheme.id) ? scheme.eligibility : scheme.eligibility.slice(0, 2)).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-xs text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
              {scheme.eligibility.length > 2 && (
                <button
                  onClick={() => setExpandedEligibility(prev => {
                    const next = new Set(prev);
                    if (next.has(scheme.id)) next.delete(scheme.id); else next.add(scheme.id);
                    return next;
                  })}
                  className="text-xs sm:text-xs text-brand hover:underline mt-1"
                >
                  {expandedEligibility.has(scheme.id) ? 'Show less' : `+${scheme.eligibility.length - 2} more criteria`}
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <a
                href={scheme.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors text-xs sm:text-sm font-semibold"
              >
                <span>Apply Now</span>
                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

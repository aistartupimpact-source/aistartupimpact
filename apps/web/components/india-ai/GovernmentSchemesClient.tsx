'use client';

import { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  IndianRupee, 
  CheckCircle2, 
  ExternalLink,
  ArrowRight,
  Building2,
  Mail,
  Sparkles
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

export default function GovernmentSchemesClient({ schemes }: { schemes: Scheme[] }) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | string>('All');
  const [showEmailCapture, setShowEmailCapture] = useState<string | null>(null);

  const filteredSchemes = selectedCategory === 'All' 
    ? schemes 
    : schemes.filter(s => s.category === selectedCategory);

  // Get unique categories from schemes
  const categories = ['All', ...Array.from(new Set(schemes.map(s => s.category)))];

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
                ({schemes.filter(s => s.category === category).length})
              </span>
            )}
          </button>
        ))}
      </div>

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
                  <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap ${getStatusColor(scheme.status)}`}>
                    {scheme.status}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 line-clamp-1">
                  {scheme.name}
                </p>
                {scheme.state && (
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-brand font-medium">
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
                  <span className="text-[11px] sm:text-sm">Funding</span>
                </span>
                <span className="font-bold text-brand text-xs sm:text-sm">{scheme.fundingAmount}</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-[11px] sm:text-sm">Deadline</span>
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                  {scheme.applicationDeadline}
                </span>
              </div>
            </div>

            {/* Eligibility */}
            <div className="mb-3 sm:mb-4">
              <div className="text-[10px] sm:text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                Eligibility:
              </div>
              <ul className="space-y-1">
                {scheme.eligibility.slice(0, 2).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
              {scheme.eligibility.length > 2 && (
                <button className="text-[10px] sm:text-xs text-brand hover:underline mt-1">
                  +{scheme.eligibility.length - 2} more criteria
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
              <button
                onClick={() => setShowEmailCapture(scheme.id)}
                className="px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm font-semibold whitespace-nowrap"
              >
                Get Help
              </button>
            </div>

            {/* Email Capture Modal */}
            {showEmailCapture === scheme.id && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 sm:p-6 max-w-md w-full">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h4 className="font-sora font-bold text-base sm:text-lg text-navy dark:text-white">
                      Get Application Help
                    </h4>
                    <button
                      onClick={() => setShowEmailCapture(null)}
                      className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                      aria-label="Close"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Our experts will help you with <strong>{scheme.shortName}</strong> application. 
                    Service fee: ₹5,000 - ₹25,000 based on complexity.
                  </p>
                  <form className="space-y-3">
                    <input
                      type="email"
                      placeholder="Your email"
                      className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Startup name"
                      className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    />
                    <button
                      type="submit"
                      className="w-full px-4 py-2.5 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors font-semibold text-sm"
                    >
                      Request Consultation
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Help CTA */}
      <div className="mt-6 sm:mt-8 card p-5 sm:p-6 bg-gradient-to-r from-brand/10 to-blue-50 dark:from-brand/20 dark:to-gray-800 text-center">
        <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-brand mx-auto mb-2 sm:mb-3" />
        <h3 className="font-sora font-bold text-lg sm:text-xl text-navy dark:text-white mb-2">
          Need Help Applying?
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto leading-relaxed">
          Our team has helped <strong>200+ startups</strong> successfully apply for government schemes. 
          We handle documentation, eligibility checks, and application submission.
        </p>
        <button className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors font-semibold text-sm">
          <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
          Get Expert Help
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}

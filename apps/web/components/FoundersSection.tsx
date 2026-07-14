'use client';

import { useState } from 'react';
import FounderProfileModal from './FounderProfileModal';

interface Founder {
  name: string;
  role: string;
  prev?: string;
  bio?: string;
  avatar?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

interface FoundersSectionProps {
  founders: Founder[];
  startupName?: string;
}

export default function FoundersSection({ founders, startupName }: FoundersSectionProps) {
  const [selectedFounder, setSelectedFounder] = useState<Founder | null>(null);

  return (
    <>
      <div className="card p-5 sm:p-6">
        <h2 className="section-title mb-4">Founders & CEOs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {founders.map((founder) => (
            <div
              key={founder.name}
              onClick={() => setSelectedFounder(founder)}
              className="flex items-center gap-3 p-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all cursor-pointer text-left group"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand/10 dark:bg-brand/20 flex items-center justify-center text-brand font-bold font-sora text-xl shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                {founder.avatar ? (
                  <img 
                    src={founder.avatar} 
                    alt={founder.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{founder.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-sora font-extrabold text-sm sm:text-base text-navy dark:text-white block group-hover:text-brand transition-colors truncate">
                    {founder.name}
                  </span>
                  {founder.linkedin && (
                    <a
                      href={founder.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0A66C2] hover:scale-110 transition-transform shrink-0 relative z-10"
                      onClick={(e) => e.stopPropagation()}
                      title={`${founder.name}'s LinkedIn`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-jakarta block truncate mt-0.5">
                  {founder.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Founder Profile Modal */}
      {selectedFounder && (
        <FounderProfileModal
          founder={selectedFounder}
          isOpen={!!selectedFounder}
          onClose={() => setSelectedFounder(null)}
          startupName={startupName}
        />
      )}
    </>
  );
}

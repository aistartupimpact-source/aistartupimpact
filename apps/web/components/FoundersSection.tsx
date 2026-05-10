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
}

export default function FoundersSection({ founders }: FoundersSectionProps) {
  const [selectedFounder, setSelectedFounder] = useState<Founder | null>(null);

  return (
    <>
      <div className="card p-5 sm:p-6">
        <h2 className="section-title mb-4">Founders</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {founders.map((founder) => (
            <button
              key={founder.name}
              onClick={() => setSelectedFounder(founder)}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-left group"
            >
              <div className="w-11 h-11 rounded-full bg-brand/10 dark:bg-brand/20 flex items-center justify-center text-brand font-bold font-sora text-lg shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                {founder.avatar ? (
                  <img 
                    src={founder.avatar} 
                    alt={founder.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{founder.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-sora font-bold text-sm text-navy dark:text-white block group-hover:text-brand transition-colors">
                  {founder.name}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-jakarta block truncate">
                  {founder.role}
                </span>
                {founder.prev && (
                  <span className="text-[10px] text-brand font-jakarta font-semibold block truncate">
                    {founder.prev}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Founder Profile Modal */}
      {selectedFounder && (
        <FounderProfileModal
          founder={selectedFounder}
          isOpen={!!selectedFounder}
          onClose={() => setSelectedFounder(null)}
        />
      )}
    </>
  );
}

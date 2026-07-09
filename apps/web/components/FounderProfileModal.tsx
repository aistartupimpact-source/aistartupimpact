'use client';

import { X, Linkedin, Twitter, Globe, Briefcase, Building2, Shield, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

interface FounderProfileModalProps {
  founder: {
    name: string;
    role: string;
    prev?: string;
    bio?: string;
    avatar?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function FounderProfileModal({ founder, isOpen, onClose }: FounderProfileModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-150 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200 flex flex-col relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button on top of banner */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Banner with premium gradient */}
          <div className="h-32 bg-gradient-to-tr from-slate-900 via-navy to-brand relative shrink-0">
            {/* Decorative background overlay */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500 via-pink-500 to-red-500" />
          </div>

          {/* Avatar and Main Info Container */}
          <div className="px-6 pb-6 relative flex flex-col flex-1">
            {/* Overlapping Avatar */}
            <div className="flex items-end justify-between -mt-14 mb-4 relative z-10">
              <div className="w-24 h-24 rounded-2xl bg-white dark:bg-gray-850 border-4 border-white dark:border-gray-900 shadow-xl flex items-center justify-center font-sora font-extrabold text-3xl text-navy dark:text-white overflow-hidden">
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

              {/* Ex-Company Pill if present */}
              {founder.prev && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-500/20 shadow-sm font-jakarta">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Ex-{founder.prev}</span>
                </div>
              )}
            </div>

            {/* Profile Meta */}
            <div className="space-y-1">
              <h4 className="font-sora font-extrabold text-2xl text-navy dark:text-white leading-tight">
                {founder.name}
              </h4>
              
              {founder.role && (
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-jakarta text-sm">
                  <Briefcase className="w-4 h-4 text-brand/80" />
                  <span>{founder.role}</span>
                </div>
              )}
            </div>

            {/* Content Body */}
            <div className="mt-6 space-y-5 flex-1">
              {/* Bio */}
              {founder.bio ? (
                <div className="space-y-2">
                  <h5 className="font-sora font-bold text-xs text-navy dark:text-white uppercase tracking-wider opacity-60">
                    Biography
                  </h5>
                  <div className="border-l-2 border-brand/35 pl-4 py-0.5">
                    <p className="text-gray-600 dark:text-gray-300 font-jakarta text-sm leading-relaxed whitespace-pre-wrap">
                      {founder.bio}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 border border-dashed border-gray-150 dark:border-gray-800 rounded-xl">
                  <p className="text-xs text-gray-455 dark:text-gray-500 font-jakarta">
                    No bio description provided.
                  </p>
                </div>
              )}

              {/* Social / Connect Section */}
              {(founder.linkedin || founder.twitter || founder.website) && (
                <div className="space-y-2.5 pt-2">
                  <h5 className="font-sora font-bold text-xs text-navy dark:text-white uppercase tracking-wider opacity-60">
                    Connect
                  </h5>
                  <div className="flex flex-wrap gap-2.5">
                    {founder.linkedin && (
                      <a
                        href={founder.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl transition-all text-xs font-bold border border-blue-100 dark:border-blue-900/20 hover:scale-[1.02] cursor-pointer"
                      >
                        <Linkedin className="w-4 h-4 shrink-0" />
                        LinkedIn
                      </a>
                    )}
                    
                    {founder.twitter && (
                      <a
                        href={founder.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 hover:bg-sky-100 dark:bg-sky-900/10 dark:hover:bg-sky-900/20 text-sky-700 dark:text-sky-400 rounded-xl transition-all text-xs font-bold border border-sky-100 dark:border-sky-900/20 hover:scale-[1.02] cursor-pointer"
                      >
                        <Twitter className="w-4 h-4 shrink-0" />
                        Twitter
                      </a>
                    )}
                    
                    {founder.website && (
                      <a
                        href={founder.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all text-xs font-bold border border-gray-150 dark:border-gray-800 hover:scale-[1.02] cursor-pointer"
                      >
                        <Globe className="w-4 h-4 shrink-0" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer with branding */}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center text-[10px] font-jakarta">
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold text-xs">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                Verified Profile
              </span>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

'use client';

import { X, Linkedin, Twitter, Globe, Briefcase, Building2, Shield, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';

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
  startupName?: string;
}

export default function FounderProfileModal({ founder, isOpen, onClose, startupName }: FounderProfileModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div 
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-xl w-full h-auto max-h-[90vh] sm:max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200 flex flex-col relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button on top of banner */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Scrollable Container */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Banner with premium textured black background */}
            <div className="h-32 bg-zinc-950 relative shrink-0 flex items-center justify-center overflow-hidden border-b border-zinc-800 dark:border-gray-800">
              {/* Vercel-style fine grid line pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:18px_18px]" />
              {/* Soft spotlight radial glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_60%)]" />
              {/* Vignette fade towards edges */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#09090b)] opacity-80" />
              {startupName && (
                <div className="relative z-10 flex flex-col items-center max-w-full px-6">
                  <div className="inline-flex flex-col items-start relative max-w-full">
                    <span className="font-sora font-extrabold text-white text-xl sm:text-3xl tracking-wide opacity-95 truncate max-w-full">
                      {startupName}
                    </span>
                    {/* Red dot and gradient line */}
                    <div className="flex items-center gap-2 mt-0.5 w-full">
                      {/* Red dot */}
                      <span 
                        className="w-2 h-2 rounded-full bg-red-500 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                        style={{ animation: 'pulse 3.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                      />
                      {/* Gradient Line */}
                      <div className="h-[1.5px] flex-1 bg-gradient-to-r from-white/90 via-white/40 to-transparent" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Avatar and Main Info Container */}
            <div className="px-6 pb-6 relative flex flex-col flex-1">
              {/* Overlapping Avatar */}
              <div className="flex items-end gap-3 sm:gap-4 -mt-14 mb-4 relative z-10">
                <div className="w-24 h-24 rounded-2xl bg-white dark:bg-gray-850 border-4 border-white dark:border-gray-900 shadow-xl flex items-center justify-center font-sora font-extrabold text-3xl text-navy dark:text-white overflow-hidden shrink-0">
                  {founder.avatar ? (
                    <Image
                      src={founder.avatar}
                      alt={founder.name}
                      className="w-full h-full object-cover"
                      width={96}
                      height={96}
                    />
                  ) : (
                    <span>{founder.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                {/* Previous experience hidden */}
              </div>

              {/* Profile Meta */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-4">
                  <h4 className="font-sora font-extrabold text-2xl text-navy dark:text-white leading-tight">
                    {founder.name}
                  </h4>
                  {founder.linkedin && (
                    <a
                      href={founder.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0A66C2] hover:scale-110 transition-transform shrink-0"
                      title="LinkedIn Profile"
                    >
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  )}
                </div>
                
                {founder.role && (
                  <div className="text-gray-550 dark:text-gray-400 font-jakarta text-sm">
                    {founder.role}
                  </div>
                )}
              </div>

              {/* Content Body */}
              <div className="mt-6 space-y-5 flex-1">
                {/* Bio */}
                {founder.bio ? (
                  <div className="space-y-2">
                    <div className="border-l-2 border-brand/35 pl-4 py-0.5">
                      <p className="text-gray-600 dark:text-gray-300 font-jakarta text-sm leading-relaxed whitespace-pre-wrap">
                        {founder.bio}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                    <p className="text-xs text-gray-455 dark:text-gray-500 font-jakarta">
                      No bio description provided.
                    </p>
                  </div>
                )}

              </div>

            </div>
          </div>
          {/* Decorative bottom-right textured arcs in corner */}
          <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none z-0 overflow-hidden rounded-br-3xl">
            {/* Soft background glow */}
            <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-brand/5 dark:bg-brand/10 rounded-full blur-2xl" />
            
            {/* Concentric Arcs */}
            <div className="absolute -bottom-4 -right-4 w-12 h-12 rounded-full border border-brand/10 dark:border-brand/20" />
            <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full border border-brand/10 dark:border-brand/20" />
            <div className="absolute -bottom-12 -right-12 w-36 h-36 rounded-full border border-brand/5 dark:border-brand/15" />
            <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full border border-brand/5 dark:border-brand/10" />
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

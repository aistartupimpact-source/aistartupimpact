'use client';

import { X, Linkedin, Twitter, Globe, Briefcase, Building2 } from 'lucide-react';
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
            <h3 className="font-sora font-bold text-lg text-navy dark:text-white">
              Founder Profile
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Avatar & Name */}
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand to-brand/80 flex items-center justify-center text-white text-2xl font-bold font-sora shrink-0 overflow-hidden">
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
              
              <div className="flex-1">
                <h4 className="font-sora font-bold text-xl text-navy dark:text-white mb-1">
                  {founder.name}
                </h4>
                
                {founder.role && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                    <Briefcase className="w-4 h-4" />
                    <span className="font-jakarta text-sm">{founder.role}</span>
                  </div>
                )}
                
                {founder.prev && (
                  <div className="flex items-center gap-2 text-brand">
                    <Building2 className="w-4 h-4" />
                    <span className="font-jakarta text-xs font-semibold">{founder.prev}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {founder.bio && (
              <div>
                <h5 className="font-sora font-bold text-sm text-navy dark:text-white mb-2">
                  About
                </h5>
                <p className="text-gray-600 dark:text-gray-300 font-jakarta text-sm leading-relaxed whitespace-pre-wrap">
                  {founder.bio}
                </p>
              </div>
            )}

            {/* Social Links */}
            {(founder.linkedin || founder.twitter || founder.website) && (
              <div>
                <h5 className="font-sora font-bold text-sm text-navy dark:text-white mb-3">
                  Connect
                </h5>
                <div className="flex flex-wrap gap-2">
                  {founder.linkedin && (
                    <a
                      href={founder.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                  )}
                  
                  {founder.twitter && (
                    <a
                      href={founder.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors text-sm font-medium"
                    >
                      <Twitter className="w-4 h-4" />
                      Twitter
                    </a>
                  )}
                  
                  {founder.website && (
                    <a
                      href={founder.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Empty state if no additional info */}
            {!founder.bio && !founder.linkedin && !founder.twitter && !founder.website && (
              <div className="text-center py-6">
                <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm">
                  No additional information available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

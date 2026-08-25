'use client';

import { useState } from 'react';
import { BadgeCheck, Check } from 'lucide-react';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  onLogo?: boolean;
  className?: string;
}

export function VerifiedBadge({ 
  size = 'md', 
  showText = true, 
  onLogo = false,
  className = ''
}: VerifiedBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const sizes = {
    sm: { 
      icon: 'w-3 h-3', 
      logoIcon: 'w-2.5 h-2.5',
      text: 'text-xs', 
      padding: 'px-1.5 py-0.5', 
      badgePadding: 'p-[2px]',
    },
    md: { 
      icon: 'w-3.5 h-3.5', 
      logoIcon: 'w-3 h-3',
      text: 'text-xs', 
      padding: 'px-2 py-0.5', 
      badgePadding: 'p-[2.5px]',
    },
    lg: { 
      icon: 'w-4 h-4', 
      logoIcon: 'w-3.5 h-3.5',
      text: 'text-sm', 
      padding: 'px-2.5 py-1', 
      badgePadding: 'p-[3px]',
    },
  };

  const s = sizes[size];

  const tooltip = (
    <div className={`absolute z-dropdown bottom-full left-0 mb-2 w-64 bg-gray-900 dark:bg-gray-800 rounded-lg rounded-bl-none shadow-xl px-3.5 py-2.5 pointer-events-none transition-all duration-150 ${showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 invisible'}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <BadgeCheck className="w-3.5 h-3.5 text-green-400" />
        <span className="text-xs font-bold text-white font-jakarta">Verified</span>
      </div>
      <p className="text-xs text-gray-300 font-jakarta leading-relaxed">
        The owner of this company profile has verified ownership by completing domain verification.
      </p>
      {/* Corner tail — 45 degree from bottom-left edge */}
      <div className="absolute top-full left-0 w-0 h-0 border-t-[8px] border-t-gray-900 dark:border-t-gray-800 border-r-[8px] border-r-transparent" />
    </div>
  );

  if (onLogo) {
    return (
      <div
        className={`absolute bottom-[-3px] right-[-3px] bg-green-500 dark:bg-green-600 rounded-full ${s.badgePadding} border-2 border-white dark:border-gray-900 shadow-sm flex items-center justify-center text-white cursor-pointer ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        <Check className={`${s.logoIcon} stroke-[3.5] text-white`} />
        {tooltip}
      </div>
    );
  }

  return (
    <span
      className={`relative inline-flex items-center gap-1 ${s.padding} rounded-full bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-100/60 dark:border-green-900/30 font-medium ${s.text} cursor-pointer ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(!showTooltip)}
    >
      <BadgeCheck className={`${s.icon} text-green-500 dark:text-green-400`} />
      {showText && 'Verified'}
      {tooltip}
    </span>
  );
}

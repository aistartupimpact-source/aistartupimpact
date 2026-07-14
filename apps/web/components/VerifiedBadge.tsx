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
  const sizes = {
    sm: { 
      icon: 'w-3 h-3', 
      logoIcon: 'w-2.5 h-2.5',
      text: 'text-[10px]', 
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

  if (onLogo) {
    // Professional solid green circular verified badge with a crisp bold white checkmark
    return (
      <div 
        className={`absolute bottom-[-3px] right-[-3px] bg-green-500 dark:bg-green-600 rounded-full ${s.badgePadding} border-2 border-white dark:border-gray-900 shadow-sm flex items-center justify-center text-white ${className}`}
        title="Verified"
      >
        <Check className={`${s.logoIcon} stroke-[3.5] text-white`} />
      </div>
    );
  }

  // Mini clean green chip verified badge
  return (
    <span 
      className={`inline-flex items-center gap-1 ${s.padding} rounded-full bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-100/60 dark:border-green-900/30 font-medium ${s.text} ${className}`}
      title="Domain verified"
    >
      <BadgeCheck className={`${s.icon} text-green-500 dark:text-green-400`} />
      {showText && 'Verified'}
    </span>
  );
}

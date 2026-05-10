import { CheckCircle } from 'lucide-react';

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
      text: 'text-xs', 
      padding: 'px-2 py-0.5', 
      badge: 'p-0.5',
      border: 'border'
    },
    md: { 
      icon: 'w-4 h-4', 
      text: 'text-sm', 
      padding: 'px-3 py-1', 
      badge: 'p-1',
      border: 'border-2'
    },
    lg: { 
      icon: 'w-5 h-5', 
      text: 'text-base', 
      padding: 'px-4 py-1.5', 
      badge: 'p-1.5',
      border: 'border-2'
    },
  };

  const s = sizes[size];

  if (onLogo) {
    // Badge overlay on logo (green checkmark) - positioned inside container
    return (
      <div 
        className={`absolute bottom-0 right-0 bg-green-500 rounded-full ${s.badge} ${s.border} border-white shadow-lg ${className}`}
        title="Verified"
      >
        <CheckCircle className={`${s.icon} text-white`} />
      </div>
    );
  }

  // Inline badge with green text
  return (
    <span 
      className={`inline-flex items-center gap-1 ${s.padding} rounded-full bg-green-100 text-green-700 font-medium ${s.text} ${className}`}
      title="Domain verified"
    >
      <CheckCircle className={s.icon} />
      {showText && 'Verified'}
    </span>
  );
}

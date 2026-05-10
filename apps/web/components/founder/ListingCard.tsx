import Link from 'next/link';
import { Clock, CheckCircle, XCircle, Edit, Shield, AlertCircle } from 'lucide-react';
import { VerifiedBadge } from '@/components/VerifiedBadge';

interface ListingCardProps {
  id: string;
  slug: string; // Added slug
  name: string;
  tagline: string;
  logoUrl: string | null;
  status: string;
  type: 'startup' | 'tool';
  isVerified?: boolean;
}

const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  UNCLAIMED: {
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    icon: Clock,
    label: 'Unclaimed',
  },
  PENDING: {
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    icon: Clock,
    label: 'Pending',
  },
  CLAIMED: {
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    icon: CheckCircle,
    label: 'Live',
  },
  VERIFIED: {
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    icon: CheckCircle,
    label: 'Verified',
  },
  REJECTED: {
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    icon: XCircle,
    label: 'Rejected',
  },
};

export default function ListingCard({ id, slug, name, tagline, logoUrl, status, type, isVerified = false }: ListingCardProps) {
  const config = statusConfig[status] || statusConfig.UNCLAIMED;
  const StatusIcon = config.icon;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
      <div className="flex items-start gap-3 p-3">
        {/* Logo */}
        <div className="relative w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt={name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <span className="text-base font-bold text-gray-400 dark:text-gray-600">
              {name.charAt(0)}
            </span>
          )}
          {isVerified && <VerifiedBadge onLogo size="sm" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {name}
              </h3>
              {isVerified && <VerifiedBadge size="sm" showText={false} />}
            </div>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.color} shrink-0`}>
              <StatusIcon className="w-3 h-3" />
              {config.label}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
            {tagline}
          </p>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href={`/founder/${type === 'startup' ? 'startups' : 'tools'}/${slug}`}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            >
              <Edit className="w-3 h-3" />
              Edit
            </Link>
            {!isVerified && type === 'startup' && (
              <Link
                href={`/founder/claim/${id}`}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                <Shield className="w-3 h-3" />
                Verify
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

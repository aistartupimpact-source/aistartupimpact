import Link from 'next/link';
import { Clock, CheckCircle, XCircle, Edit } from 'lucide-react';

interface ListingCardProps {
  id: string;
  name: string;
  tagline: string;
  logoUrl: string | null;
  status: string;
  type: 'startup' | 'tool';
}

const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  UNCLAIMED: {
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    icon: Clock,
    label: 'Unclaimed',
  },
  PENDING: {
    color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
    icon: Clock,
    label: 'Pending Review',
  },
  CLAIMED: {
    color: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
    icon: CheckCircle,
    label: 'Live',
  },
  VERIFIED: {
    color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    icon: CheckCircle,
    label: 'Verified',
  },
  REJECTED: {
    color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
    icon: XCircle,
    label: 'Rejected',
  },
};

export default function ListingCard({ id, name, tagline, logoUrl, status, type }: ListingCardProps) {
  const config = statusConfig[status] || statusConfig.UNCLAIMED;
  const StatusIcon = config.icon;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-brand dark:hover:border-brand transition-colors">
      <div className="flex items-start gap-4 p-4">
        {/* Logo */}
        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-gray-400 dark:text-gray-600">
              {name.charAt(0)}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {name}
            </h3>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color} shrink-0`}>
              <StatusIcon className="w-3 h-3" />
              {config.label}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mb-3">
            {tagline}
          </p>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href={`/founder/${type === 'startup' ? 'startups' : 'tools'}/${id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand/10 rounded-lg transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

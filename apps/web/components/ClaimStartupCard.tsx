'use client';

import Link from 'next/link';
import { Shield, CheckCircle, TrendingUp, Sparkles } from 'lucide-react';

interface ClaimStartupCardProps {
  startupId: string;
  startupSlug: string;
  isVerified?: boolean;
  isClaimed?: boolean;
  isOwner?: boolean;
}

export default function ClaimStartupCard({
  startupId,
  startupSlug,
  isVerified = false,
  isClaimed = false,
  isOwner = false,
}: ClaimStartupCardProps) {
  // If verified, don't show the card at all
  if (isVerified) {
    return null;
  }

  // If claimed but not verified, show verification prompt (only to owner)
  if (isClaimed && !isVerified && isOwner) {
    return (
      <div className="card p-5 border-2 border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-900/10">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <h4 className="font-sora font-bold text-sm text-yellow-900 dark:text-yellow-100">
            Verification Pending
          </h4>
        </div>
        <p className="text-xs text-yellow-700 dark:text-yellow-300 font-jakarta mb-4 leading-relaxed">
          Complete DNS verification to get your verified badge and unlock premium features.
        </p>
        <Link
          href={`/founder/claim/${startupId}`}
          className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-sm font-jakarta transition-colors"
        >
          <Shield className="w-4 h-4" />
          Complete Verification
        </Link>
      </div>
    );
  }

  // If claimed but user is not the owner, don't show the card
  if (isClaimed && !isOwner) {
    return null;
  }

  // Default: Show claim prompt (only if not claimed)
  return (
    <div className="card p-5 border-2 border-brand/20 bg-gradient-to-br from-brand/5 via-purple-500/5 to-blue-500/5 dark:from-brand/10 dark:via-purple-500/10 dark:to-blue-500/10 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-brand/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-500/10 rounded-full blur-xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-brand" />
          <h4 className="font-sora font-bold text-sm text-navy dark:text-white">
            Is This Your Startup?
          </h4>
        </div>
        
        <p className="text-xs text-gray-600 dark:text-gray-400 font-jakarta mb-4 leading-relaxed">
          Claim this listing to get a verified badge, manage your profile, access analytics, and connect with investors.
        </p>

        {/* Benefits list */}
        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
            <span className="text-xs text-gray-700 dark:text-gray-300 font-jakarta">
              Get verified badge instantly
            </span>
          </div>
          <div className="flex items-start gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <span className="text-xs text-gray-700 dark:text-gray-300 font-jakarta">
              Track views & engagement
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
            <span className="text-xs text-gray-700 dark:text-gray-300 font-jakarta">
              Update info anytime
            </span>
          </div>
        </div>

        <Link
          href={`/founder/claim/${startupId}`}
          className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-brand to-brand/90 hover:from-brand/90 hover:to-brand text-white font-bold text-sm font-jakarta transition-all hover:shadow-lg hover:shadow-brand/30 hover:scale-[1.02]"
        >
          <Shield className="w-4 h-4" />
          Claim This Startup
        </Link>

        <p className="text-[10px] text-gray-500 dark:text-gray-500 font-jakarta mt-3 text-center">
          100% Free • Verified via DNS • Takes 5 minutes
        </p>
      </div>
    </div>
  );
}

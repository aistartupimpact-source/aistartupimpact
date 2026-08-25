'use client';

import { useState } from 'react';
import { Crown } from 'lucide-react';
import SignInModal from '@/components/auth/SignInModal';

interface SignInGateProps {
  children?: React.ReactNode;
  isSignedIn: boolean;
  label?: string;
  blurContent?: boolean;
}

export default function SignInGate({ children, isSignedIn, label = 'Sign in to view', blurContent = true }: SignInGateProps) {
  const [showSignIn, setShowSignIn] = useState(false);

  if (isSignedIn) {
    return <>{children}</>;
  }

  if (!blurContent) {
    return (
      <>
        <div
          className="border-t border-gray-100 dark:border-gray-800 bg-gradient-to-b from-gray-50/80 to-white dark:from-gray-800/40 dark:to-gray-900 px-6 py-8 text-center cursor-pointer"
          onClick={() => setShowSignIn(true)}
        >
          <div className="max-w-sm mx-auto">
            <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Crown className="w-5 h-5 text-brand" />
            </div>
            <h3 className="font-sora font-bold text-base text-navy dark:text-white mb-1.5">
              {label}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-jakarta">
              Create a free account to unlock full details.
            </p>
            <button className="btn-brand px-8 py-2.5 text-sm">
              Sign In — It&apos;s Free
            </button>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-jakarta mt-3">
              No credit card required · Google sign-in · Takes 5 seconds
            </p>
          </div>
        </div>

        <SignInModal
          isOpen={showSignIn}
          onClose={() => setShowSignIn(false)}
          defaultMode="signin"
        />
      </>
    );
  }

  return (
    <>
      <div className="relative">
        <div className="pointer-events-none select-none blur-sm opacity-60">
          {children}
        </div>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer"
          onClick={() => setShowSignIn(true)}
        >
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/90 dark:bg-gray-900/90 border border-amber-200 dark:border-amber-700/50 shadow-lg backdrop-blur-sm hover:border-amber-400 hover:shadow-amber-500/10 transition-all">
            <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-jakarta font-semibold text-navy dark:text-white">{label}</span>
          </div>
        </div>
      </div>

      <SignInModal
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        defaultMode="signin"
      />
    </>
  );
}

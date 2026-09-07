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
          className="border-t border-gray-100 dark:border-gray-800 bg-gradient-to-b from-gray-50/80 to-white dark:from-gray-800/40 dark:to-gray-900 px-4 py-4 text-center cursor-pointer"
          onClick={() => setShowSignIn(true)}
        >
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-brand" />
              <span className="font-sora font-bold text-xs text-navy dark:text-white">
                {label}
              </span>
            </div>
            <button className="inline-flex items-center justify-center bg-brand hover:bg-brand-600 text-white font-bold font-jakarta px-4 py-1.5 text-xs rounded-lg transition-all">
              Sign In — It&apos;s Free
            </button>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-jakarta">
              No credit card required · Google sign-in
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

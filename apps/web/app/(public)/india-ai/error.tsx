'use client';

import { useEffect } from 'react';

export default function IndiaAIError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('India AI page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white font-sora mb-2">Unable to load India AI data</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-jakarta mb-6">We couldn&apos;t fetch the latest ecosystem data. Please try again.</p>
        <button onClick={reset} className="px-6 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-lg font-medium text-sm font-jakarta transition-colors">
          Try again
        </button>
      </div>
    </div>
  );
}

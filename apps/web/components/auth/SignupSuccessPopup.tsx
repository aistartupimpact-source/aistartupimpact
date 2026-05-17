'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import Link from 'next/link';

export default function SignupSuccessPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const handleSignupSuccess = (event: CustomEvent) => {
      setEmail(event.detail.email);
      setIsVisible(true);
    };

    window.addEventListener('founderSignupSuccess', handleSignupSuccess as EventListener);

    return () => {
      window.removeEventListener('founderSignupSuccess', handleSignupSuccess as EventListener);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 text-center relative animate-scale-in">
        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Success icon */}
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Check Your Email!
        </h2>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We've sent a verification link to{' '}
          <span className="font-semibold text-gray-900 dark:text-white">{email}</span>
        </p>

        {/* Info box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Please click the link in the email to verify your account and complete registration.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setIsVisible(false)}
            className="w-full bg-brand hover:bg-brand/90 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Got it!
          </button>
          <Link
            href="/auth/login"
            onClick={() => setIsVisible(false)}
            className="text-brand hover:underline font-medium text-sm"
          >
            Back to Login
          </Link>
        </div>

        {/* Additional help */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
          Didn't receive the email? Check your spam folder or{' '}
          <button className="text-brand hover:underline">
            resend verification email
          </button>
        </p>
      </div>
    </div>
  );
}

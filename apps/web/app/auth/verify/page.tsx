'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-verified'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/founder/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.message?.includes('already verified')) {
          setStatus('already-verified');
          setMessage('Your email is already verified. You can login now.');
        } else {
          setStatus('success');
          setMessage('Email verified successfully! You can now login.');
        }
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="mb-6">
            {status === 'loading' && (
              <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            )}
            {status === 'already-verified' && (
              <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="font-sora font-bold text-2xl text-navy dark:text-white mb-3">
            {status === 'loading' && 'Verifying Your Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'already-verified' && 'Already Verified'}
            {status === 'error' && 'Verification Failed'}
          </h1>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-400 font-jakarta text-sm mb-6 leading-relaxed">
            {message}
          </p>

          {/* Actions */}
          <div className="space-y-3">
            {(status === 'success' || status === 'already-verified') && (
              <>
                <p className="text-xs text-gray-500 dark:text-gray-500 font-jakarta mb-4">
                  Redirecting to login in 3 seconds...
                </p>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold text-sm font-jakarta transition-colors"
                >
                  Go to Login
                </Link>
              </>
            )}
            
            {status === 'error' && (
              <>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold text-sm font-jakarta transition-colors"
                >
                  Try Signing Up Again
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-brand dark:hover:border-brand text-navy dark:text-white font-bold text-sm font-jakarta transition-colors"
                >
                  Back to Login
                </Link>
              </>
            )}
          </div>

          {/* Help text */}
          <p className="text-xs text-gray-500 dark:text-gray-500 font-jakarta mt-6">
            Need help? Contact us at{' '}
            <a href="mailto:support@aistartupimpact.com" className="text-brand hover:underline">
              support@aistartupimpact.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

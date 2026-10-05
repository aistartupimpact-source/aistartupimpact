'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Mail } from 'lucide-react';

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; bg: string; title: string; message: string }> = {
  confirmed: {
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30',
    title: 'Subscription Confirmed!',
    message: "You're all set! You'll receive our weekly digest with the latest AI startups, tools, and insights.",
  },
  already: {
    icon: AlertCircle,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    title: 'Already Confirmed',
    message: "Your email is already confirmed. You're subscribed and will continue receiving our newsletter.",
  },
  invalid: {
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
    title: 'Invalid or Expired Link',
    message: 'This confirmation link is invalid or has expired. Please subscribe again to get a new confirmation email.',
  },
  error: {
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
    title: 'Something Went Wrong',
    message: 'We encountered an error confirming your subscription. Please try subscribing again.',
  },
};

function ConfirmContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || 'invalid';
  const config = statusConfig[status] || statusConfig.invalid;
  const Icon = config.icon;
  const isSuccess = status === 'confirmed' || status === 'already';

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className={`w-20 h-20 ${config.bg} rounded-full flex items-center justify-center mx-auto mb-6`}>
          <Icon className={`w-10 h-10 ${config.color}`} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold font-sora text-gray-900 dark:text-white mb-3">
          {config.title}
        </h1>

        <p className="text-gray-600 dark:text-gray-400 font-jakarta mb-8 leading-relaxed">
          {config.message}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isSuccess ? (
            <>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand text-white font-semibold rounded-lg hover:bg-brand/90 transition-colors"
              >
                Explore AI Startups
              </Link>
              <Link
                href="/newsletter"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Newsletter Page
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/newsletter"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand text-white font-semibold rounded-lg hover:bg-brand/90 transition-colors"
              >
                Subscribe Again
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Go to Homepage
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NewsletterConfirmPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" /></div>}>
      <ConfirmContent />
    </Suspense>
  );
}

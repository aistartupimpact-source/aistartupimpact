'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/founder/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        // Check if error is about unverified email
        if (data.error?.includes('verify your email')) {
          setShowResendVerification(true);
        }
        throw new Error(data.error || 'Login failed');
      }

      // Check if 2FA is required
      if (data.requires2FA) {
        setRequires2FA(true);
        setUserId(data.userId);
        setLoading(false);
        return;
      }

      // Redirect to returnTo URL or dashboard
      router.push(returnTo || '/founder/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/founder/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          token: twoFACode,
          isBackupCode: useBackupCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '2FA verification failed');
      }

      // Redirect to returnTo URL or dashboard
      router.push(returnTo || '/founder/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingVerification(true);
    setResendSuccess(false);
    
    try {
      const res = await fetch('/api/founder/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (res.ok) {
        setResendSuccess(true);
        setError('');
        setShowResendVerification(false);
      } else {
        throw new Error(data.error || 'Failed to resend verification email');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResendingVerification(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h2 className="text-2xl font-bold text-brand">AI Startup Impact</h2>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
          <p className="text-gray-600 dark:text-gray-400">Sign in to your account</p>
          {returnTo && (
            <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                {returnTo.includes('/tools/new') && 'Sign in to submit your AI tool'}
                {returnTo.includes('/startups/new') && 'Sign in to submit your startup'}
                {!returnTo.includes('/tools/new') && !returnTo.includes('/startups/new') && 'Sign in to continue'}
              </p>
            </div>
          )}
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8">
          {/* Google OAuth Button */}
          <a
            href={`/api/founder/auth/google${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-semibold text-gray-700 dark:text-gray-300">Continue with Google</span>
          </a>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or sign in with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {resendSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-sm text-green-600 dark:text-green-400">
                ✅ Verification email sent! Please check your inbox.
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>
                {showResendVerification && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendingVerification}
                    className="text-sm text-brand hover:underline font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {resendingVerification ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Resend Verification Email'
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Show 2FA verification form if required */}
            {requires2FA ? (
              <>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Two-Factor Authentication
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {useBackupCode 
                      ? 'Enter one of your backup codes'
                      : 'Enter the 6-digit code from your authenticator app'}
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    value={twoFACode}
                    onChange={(e) => setTwoFACode(useBackupCode ? e.target.value.toUpperCase() : e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder={useBackupCode ? 'XXXXXXXX' : '000000'}
                    maxLength={useBackupCode ? 8 : 6}
                    className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    autoFocus
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setUseBackupCode(!useBackupCode);
                    setTwoFACode('');
                    setError('');
                  }}
                  className="text-sm text-brand hover:underline"
                >
                  {useBackupCode ? 'Use authenticator code' : 'Use backup code'}
                </button>

                <button
                  onClick={handleVerify2FA}
                  disabled={loading || (useBackupCode ? twoFACode.length !== 8 : twoFACode.length !== 6)}
                  className="w-full bg-brand hover:bg-brand/90 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRequires2FA(false);
                    setTwoFACode('');
                    setUserId('');
                    setError('');
                  }}
                  className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                >
                  Back to login
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="john@startup.com"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-brand hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand hover:bg-brand/90 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </>
            )}
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link 
                href={`/auth/signup${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`} 
                className="text-brand hover:text-brand/80 font-semibold transition-colors"
              >
                Sign up to create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

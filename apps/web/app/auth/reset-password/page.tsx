'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, Eye, EyeOff, ArrowLeft, XCircle } from 'lucide-react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const getPasswordStrength = (pw: string) => {
    if (pw.length === 0) return { strength: 0, label: '', color: '' };
    if (pw.length < 6) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
    if (pw.length < 8) return { strength: 2, label: 'Fair', color: 'bg-orange-500' };
    if (pw.length < 12) return { strength: 3, label: 'Good', color: 'bg-yellow-500' };
    return { strength: 4, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Invalid Link</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This password reset link is invalid or has expired.
            </p>
            <Link href="/auth/forgot-password" className="inline-flex items-center gap-2 text-brand hover:underline font-medium">
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/founder/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Password Reset Successfully</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <Link href="/auth/login" className="inline-block bg-brand hover:bg-brand/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h2 className="text-2xl font-bold text-brand">AI Startup Impact</h2>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Set New Password</h1>
          <p className="text-gray-600 dark:text-gray-400">Enter your new password below</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white pr-12"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full transition-all ${passwordStrength.color}`} style={{ width: `${(passwordStrength.strength / 4) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{passwordStrength.label}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                  confirmPassword && confirmPassword !== password ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'
                }`}
                placeholder="••••••••"
              />
              {confirmPassword && confirmPassword !== password && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || password.length < 8 || password !== confirmPassword}
              className="w-full bg-brand hover:bg-brand/90 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Resetting...</> : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-brand transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}

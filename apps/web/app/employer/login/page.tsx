'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Briefcase, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function EmployerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    fetch('/api/employer/session').then(r => r.json()).then(data => {
      if (data.authenticated) router.replace('/employer/dashboard');
    }).catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/employer/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      router.push('/employer/dashboard');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Employer Portal</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta mt-2">Sign in to manage your AI job listings</p>
        </div>

        {/* Form */}
        <div className="card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className={`rounded-lg p-3 text-sm border ${error.includes('locked') || error.includes('Locked') ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'}`}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-jakarta mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="company@example.com" required className="input-field pl-10 w-full" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-jakarta">Password</label>
                <Link href="/employer/forgot-password" className="text-[11px] text-brand font-semibold font-jakarta hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field pl-10 pr-10 w-full"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-brand w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 font-jakarta mt-5">
            Don&apos;t have an account?{' '}
            <Link href="/employer/signup" className="text-brand font-semibold hover:underline">Create Employer Account</Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 font-jakarta mt-6">
          <Link href="/" className="hover:text-brand">← Back to AI Startup Impact</Link>
        </p>
      </div>
    </div>
  );
}

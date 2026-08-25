'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Briefcase, Building2, Mail, Lock, Globe, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function EmployerSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'verify'>('form');

  // If already logged in, redirect to dashboard
  useEffect(() => {
    fetch('/api/employer/session').then(r => r.json()).then(data => {
      if (data.authenticated) router.replace('/employer/onboarding');
    }).catch(() => {});
  }, [router]);

  const [formData, setFormData] = useState({
    companyName: '', email: '', password: '', websiteUrl: '', industry: '', companySize: '',
  });
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Password strength
  const getPasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };
  const strength = getPasswordStrength(formData.password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength] || '';
  const strengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'][strength] || '';

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/employer/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Signup failed'); return; }

      // Send OTP
      await fetch('/api/employer/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      setStep('verify');
    } catch { setError('Something went wrong'); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/employer/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Verification failed'); return; }

      router.push('/employer/onboarding');
      router.refresh();
    } catch { setError('Something went wrong'); }
    finally { setLoading(false); }
  };

  const resendOtp = async () => {
    setError('');
    await fetch('/api/employer/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: formData.email }),
    });
    setError('New code sent to your email');
  };

  // OTP Verification Step
  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-page dark:bg-page-dark flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Verify Your Email</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta mt-2">
              We sent a 6-digit code to <strong>{formData.email}</strong>
            </p>
          </div>

          <div className="card p-6 sm:p-8">
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {error && (
                <div className={`rounded-lg p-3 text-sm ${error.includes('sent') ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'} border ${error.includes('sent') ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}`}>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Verification Code</label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  required
                  className="input-field w-full text-center text-2xl font-mono tracking-[0.5em]"
                  autoFocus
                />
              </div>

              <button type="submit" disabled={loading || otpCode.length !== 6} className="btn-brand w-full py-3 disabled:opacity-50">
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </form>

            <div className="text-center mt-4">
              <button onClick={resendOtp} className="text-xs text-brand font-semibold font-jakarta hover:underline">
                Didn&apos;t receive the code? Resend
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 font-jakarta mt-4">Code expires in 10 minutes. Max 3 attempts.</p>
        </div>
      </div>
    );
  }

  // Signup Form
  return (
    <div className="min-h-screen bg-page dark:bg-page-dark flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Create Employer Account</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta mt-2">Post AI jobs and reach 45K+ professionals</p>
        </div>

        <div className="card p-6 sm:p-8">
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-400">{error}</div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Company Name *</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={formData.companyName} onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))} placeholder="Anthropic" required className="input-field pl-10 w-full" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Work Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="hiring@company.com" required className="input-field pl-10 w-full" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Min 8 chars, uppercase + number"
                  required
                  minLength={8}
                  className="input-field pl-10 pr-10 w-full"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength bar */}
              {formData.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColor : 'bg-gray-200 dark:bg-gray-700'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-jakarta ${strength >= 4 ? 'text-green-600' : strength >= 3 ? 'text-yellow-600' : 'text-red-500'}`}>
                    {strengthLabel}
                    {strength < 3 && ' — needs uppercase, lowercase & number'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="url" value={formData.websiteUrl} onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))} placeholder="https://company.com" className="input-field pl-10 w-full" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Industry</label>
                <select value={formData.industry} onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))} className="input-field w-full text-sm">
                  <option value="">Select</option>
                  <option value="AI Infrastructure & MLOps">AI Infrastructure</option>
                  <option value="Enterprise Software & SaaS">Enterprise SaaS</option>
                  <option value="Developer Tools & DevOps">Developer Tools</option>
                  <option value="FinTech">FinTech</option>
                  <option value="HealthTech & BioTech">HealthTech</option>
                  <option value="EdTech">EdTech</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Data & Analytics">Data & Analytics</option>
                  <option value="Robotics & Industrial Automation">Robotics</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Company Size</label>
                <select value={formData.companySize} onChange={(e) => setFormData(prev => ({ ...prev, companySize: e.target.value }))} className="input-field w-full text-sm">
                  <option value="">Select</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  <option value="500+">500+</option>
                </select>
              </div>
            </div>

            <p className="text-xs text-gray-400 font-jakarta">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="underline hover:text-brand">Terms of Service</Link> and{' '}
              <Link href="/privacy" className="underline hover:text-brand">Privacy Policy</Link>.
            </p>

            <button type="submit" disabled={loading || strength < 3} className="btn-brand w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 font-jakarta mt-5">
            Already have an account?{' '}
            <Link href="/employer/login" className="text-brand font-semibold hover:underline">Sign In</Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 font-jakarta mt-6">
          <Link href="/" className="hover:text-brand">← Back to AI Startup Impact</Link>
        </p>
      </div>
    </div>
  );
}

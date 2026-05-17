'use client';

import { useState } from 'react';
import { X, Eye, EyeOff, Loader2, User, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'user' | 'founder';
type ModeType = 'signin' | 'signup';

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('user');
  const [mode, setMode] = useState<ModeType>('signin');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      company: '',
      agreeToTerms: false,
    });
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
    if (password.length < 8) return { strength: 2, label: 'Fair', color: 'bg-orange-500' };
    if (password.length < 12) return { strength: 3, label: 'Good', color: 'bg-yellow-500' };
    return { strength: 4, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation for signup
    if (mode === 'signup') {
      if (!formData.name || formData.name.length < 2) {
        setError('Name must be at least 2 characters long');
        return;
      }

      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }

      // For founders, require terms agreement
      if (activeTab === 'founder' && !formData.agreeToTerms) {
        setError('Please agree to the terms and conditions');
        return;
      }

      // Only validate confirm password for users (founders don't have it)
      if (activeTab === 'user' && formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = mode === 'signin'
        ? (activeTab === 'user' ? '/api/user/auth/login' : '/api/founder/auth/login')
        : (activeTab === 'user' ? '/api/user/auth/signup' : '/api/founder/auth/signup');

      const payload = mode === 'signin'
        ? { email: formData.email, password: formData.password }
        : activeTab === 'founder'
          ? { name: formData.name, email: formData.email, password: formData.password, company: formData.company || undefined }
          : { name: formData.name, email: formData.email, password: formData.password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `${mode === 'signin' ? 'Login' : 'Signup'} failed`);
      }

      // For signup, handle differently based on user type
      if (mode === 'signup') {
        if (activeTab === 'founder') {
          // Founders need to verify email first - close modal and show success popup
          onClose();
          resetForm();
          // Trigger success popup (will be handled by parent component)
          window.dispatchEvent(new CustomEvent('founderSignupSuccess', { 
            detail: { email: formData.email } 
          }));
          return;
        } else {
          // Users can auto-login
          const loginEndpoint = '/api/user/auth/login';
          const loginRes = await fetch(loginEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email, password: formData.password }),
          });

          if (!loginRes.ok) {
            throw new Error('Account created but login failed. Please try logging in.');
          }
          
          // Close modal and redirect to profile
          onClose();
          resetForm();
          router.push('/profile');
          router.refresh();
          return;
        }
      }

      // For signin, close modal and redirect
      onClose();
      resetForm();
      
      if (activeTab === 'founder') {
        router.push('/founder/dashboard');
      } else {
        router.push('/profile');
      }
      
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    const returnUrl = activeTab === 'founder' ? '/founder/dashboard' : '/profile';
    const endpoint = activeTab === 'user'
      ? `/api/user/auth/google?returnTo=${encodeURIComponent(returnUrl)}`
      : `/api/founder/auth/google?returnTo=${encodeURIComponent(returnUrl)}`;
    
    window.location.href = endpoint;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {mode === 'signin' 
                ? 'Welcome back! Sign in to continue' 
                : 'Join us and start your journey'}
            </p>
          </div>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => {
              setActiveTab('user');
              resetForm();
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 font-semibold text-sm transition-colors ${
              activeTab === 'user'
                ? 'text-brand border-b-2 border-brand bg-brand/5'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <User className="w-4 h-4" />
            User
          </button>
          <button
            onClick={() => {
              setActiveTab('founder');
              resetForm();
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 font-semibold text-sm transition-colors ${
              activeTab === 'founder'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Star className="w-4 h-4" />
            Founder
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              Continue with Google
            </span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                Or sign in with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Name field - only for signup */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address{mode === 'signup' && ' *'}
                {mode === 'signup' && activeTab === 'founder' && (
                  <span className="text-xs text-gray-500"> (Company email only)</span>
                )}
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder={mode === 'signup' && activeTab === 'founder' ? 'john@yourcompany.com' : 'your@email.com'}
              />
              {mode === 'signup' && activeTab === 'founder' && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  ⚠️ Personal emails (Gmail, Yahoo, etc.) are not allowed
                </p>
              )}
            </div>

            {/* Company field - only for founder signup */}
            {mode === 'signup' && activeTab === 'founder' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="My Awesome Startup"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password{mode === 'signup' && ' *'}
              </label>
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
              
              {/* Password Strength Indicator - only for founder signup */}
              {mode === 'signup' && activeTab === 'founder' && formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {passwordStrength.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Use at least 8 characters with a mix of letters, numbers & symbols
                  </p>
                </div>
              )}
              
              {mode === 'signup' && activeTab === 'user' && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Must be at least 8 characters long
                </p>
              )}
            </div>

            {/* Confirm Password - only for user signup */}
            {mode === 'signup' && activeTab === 'user' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Terms & Conditions - only for founder signup */}
            {mode === 'signup' && activeTab === 'founder' && (
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                  className="mt-1 w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand"
                />
                <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                  I agree to the{' '}
                  <Link href="/terms" className="text-brand hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-brand hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (mode === 'signup' && activeTab === 'founder' && !formData.agreeToTerms)}
              className="w-full bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                mode === 'signin' 
                  ? `Sign In as ${activeTab === 'user' ? 'User' : 'Founder'}`
                  : `Create ${activeTab === 'user' ? 'User' : 'Founder'} Account`
              )}
            </button>
          </form>

          {/* Toggle between signin and signup */}
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signup');
                    resetForm();
                  }}
                  className="font-semibold transition-colors"
                >
                  <span className="text-brand hover:text-brand/80">Sign up</span>
                  <span className="text-gray-600 dark:text-gray-400"> to create one</span>
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signin');
                    resetForm();
                  }}
                  className="text-brand hover:text-brand/80 font-semibold transition-colors"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

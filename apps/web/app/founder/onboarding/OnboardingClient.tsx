'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, User, Briefcase, Phone, Linkedin, Twitter, Globe, ArrowRight, CheckCircle } from 'lucide-react';
import { completeOnboardingAction } from './actions';

interface User {
  id: string;
  email: string;
  name: string;
  company: string | null;
  companyDomain: string | null;
  role: string | null;
  phone: string | null;
  linkedin: string | null;
  twitter: string | null;
  website: string | null;
  onboardingStep: number;
}

export default function OnboardingClient({ user, returnTo }: { user: User; returnTo?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(user.onboardingStep || 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    company: user.company || '',
    role: user.role || '',
    phone: user.phone || '',
    linkedin: user.linkedin || '',
    twitter: user.twitter || '',
    website: user.website || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.company || !formData.role) {
      setError('Company name and role are required');
      return;
    }

    setLoading(true);
    
    try {
      const result = await completeOnboardingAction(formData);
      
      if (!result.success) {
        setError(result.error || 'Failed to complete onboarding');
        setLoading(false);
        return;
      }

      // Redirect to returnTo URL or dashboard with welcome message
      const destination = returnTo || '/founder/dashboard?welcome=true';
      router.push(destination);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 mb-4">
            <Building2 className="w-8 h-8 text-brand" />
          </div>
          <h1 className="font-sora font-bold text-3xl text-gray-900 dark:text-white mb-2">
            Welcome to AI Startup Impact! 🎉
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-jakarta">
            Let's complete your profile to get started
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white text-sm font-bold">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sign Up</span>
          </div>
          <div className="w-12 h-0.5 bg-brand" />
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-brand text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'} text-sm font-bold`}>
              2
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Profile</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-200 dark:bg-gray-700" />
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 text-sm font-bold">
              3
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Dashboard</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-sm text-red-600 dark:text-red-400 font-jakarta">{error}</p>
              </div>
            )}

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-jakarta">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 pl-11 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 font-jakarta"
                />
                <User className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
                <div className="absolute right-3 top-3">
                  <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                </div>
              </div>
              {user.companyDomain && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-jakarta">
                  Company domain: <span className="font-semibold text-brand">{user.companyDomain}</span>
                </p>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-jakarta">
                Company Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g., Yotta Data Services"
                  required
                  className="w-full px-4 py-3 pl-11 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent font-jakarta"
                />
                <Building2 className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-jakarta">
                Your Role <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  className="w-full px-4 py-3 pl-11 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent font-jakarta appearance-none"
                >
                  <option value="">Select your role</option>
                  <option value="Founder">Founder</option>
                  <option value="Co-Founder">Co-Founder</option>
                  <option value="CEO">CEO</option>
                  <option value="CTO">CTO</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="Marketing Head">Marketing Head</option>
                  <option value="Other">Other</option>
                </select>
                <Briefcase className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-jakarta">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 pl-11 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent font-jakarta"
                />
                <Phone className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-jakarta">
                  LinkedIn
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-4 py-3 pl-11 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent font-jakarta"
                  />
                  <Linkedin className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-jakarta">
                  Twitter
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    placeholder="https://twitter.com/..."
                    className="w-full px-4 py-3 pl-11 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent font-jakarta"
                  />
                  <Twitter className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-jakarta">
                Company Website
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://yourcompany.com"
                  className="w-full px-4 py-3 pl-11 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent font-jakarta"
                />
                <Globe className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand-600 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-jakarta"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Completing Profile...
                </>
              ) : (
                <>
                  Complete Profile & Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6 font-jakarta">
          You can update these details anytime from your dashboard settings
        </p>
      </div>
    </div>
  );
}

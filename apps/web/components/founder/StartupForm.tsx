'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Loader2 } from 'lucide-react';
import { submitStartupAction } from '@/app/founder/startups/actions';
import { FAQManager, type FAQ } from '@/components/shared/FAQManager';
import FundingRoundsManager, { FundingRound, convertToSaveFormat } from '@/components/shared/FundingRoundsManager';
import FoundersDetailsManager, { FounderDetail } from '@/components/shared/FoundersDetailsManager';
import SocialLinksManager, { SocialLink } from '@/components/shared/SocialLinksManager';

const STARTUP_STAGES = [
  'BOOTSTRAPPED',
  'IDEA',
  'PRE_SEED',
  'SEED',
  'PRE_SERIES_A',
  'SERIES_A',
  'SERIES_B',
  'SERIES_C',
  'GROWTH',
  'PUBLIC',
];

const STARTUP_CATEGORIES = [
  'FinTech', 'HealthTech', 'BioTech & Life Sciences', 'EdTech', 'E-Commerce & Retail',
  'SaaS', 'AI/ML', 'Enterprise & B2B Software', 'Developer Tools', 'Cybersecurity',
  'Consumer Apps & Social', 'DeepTech & Hardware', 'CleanTech & Energy', 'AgriTech',
  'Logistics & Supply Chain', 'HRTech', 'MarTech & AdTech', 'PropTech',
  'FoodTech & Restaurant', 'Mobility & Transportation', 'Gaming & eSports',
  'Media & Entertainment', 'Creator Economy', 'Web3 & Blockchain', 'InsurTech',
  'LegalTech', 'Robotics & Drones', 'SpaceTech & Aerospace', 'Defense & GovTech',
  'Travel & Hospitality', 'Construction & InfraTech', 'Telecom & Connectivity',
  'Fashion & Beauty', 'Sports & Fitness', 'Other',
];

const BUSINESS_TYPES = ['B2B', 'B2C', 'B2B2C', 'B2G', 'D2C', 'Marketplace', 'Platform'];

interface StartupFormProps {
  initialFounder?: {
    name: string;
    role: string;
    prev?: string;
    bio: string;
    avatar: string;
    linkedin: string;
    twitter?: string;
  };
}

export default function StartupForm({ initialFounder }: StartupFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [success, setSuccess] = useState(false);

  const [draftLoaded, setDraftLoaded] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem('draft_founder_new_startup');
    if (draft) {
      try {
        const { formData: dForm, faqs: dFaqs, fundingRounds: dRounds, foundersDetails: dFounders, socialLinks: dSocialLinks } = JSON.parse(draft);
        if (dForm) setFormData(dForm);
        if (dFaqs) setFaqs(dFaqs);
        if (dRounds) setFundingRounds(dRounds);
        if (dFounders) setFoundersDetails(dFounders);
        if (dSocialLinks) setSocialLinks(dSocialLinks);
      } catch (e) {
        console.error('Failed to restore startup draft:', e);
      }
    }
    setDraftLoaded(true);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    websiteUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    foundedYear: new Date().getFullYear(),
    headquartersCity: '',
    stage: 'SEED',
    status: 'ACTIVE',
    employeeCount: '',
    logoUrl: '',
    category: '',
    businessType: '',
  });

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [fundingRounds, setFundingRounds] = useState<FundingRound[]>([]);
  const [foundersDetails, setFoundersDetails] = useState<FounderDetail[]>(
    initialFounder && initialFounder.name
      ? [
          {
            name: initialFounder.name,
            role: initialFounder.role,
            prev: initialFounder.prev || '',
            bio: initialFounder.bio,
            avatar: initialFounder.avatar,
            linkedin: initialFounder.linkedin,
            twitter: initialFounder.twitter || '',
          },
        ]
      : []
  );

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  // Save draft to localStorage on changes
  useEffect(() => {
    if (!draftLoaded) return;
    localStorage.setItem('draft_founder_new_startup', JSON.stringify({ formData, faqs, fundingRounds, foundersDetails, socialLinks }));
  }, [formData, faqs, fundingRounds, foundersDetails, socialLinks, draftLoaded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to media library
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setFormData(prev => ({ ...prev, logoUrl: data.url }));
    } catch (err) {
      setError('Failed to upload logo');
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name || !formData.tagline || !formData.description || !formData.websiteUrl || !formData.category || !formData.businessType || !formData.employeeCount || !formData.foundedYear || !formData.stage || !formData.logoUrl) {
        throw new Error('Please fill in all required fields');
      }

      const activeFounders = foundersDetails.filter(f => f.name.trim());
      if (activeFounders.length === 0) {
        throw new Error('Please add at least one founder under Founders Details');
      }

      // Parse founders from details
      const foundersArray = foundersDetails
        .map(f => f.name.trim())
        .filter(Boolean);

      const result = await submitStartupAction({
        name: formData.name,
        tagline: formData.tagline,
        description: formData.description,
        websiteUrl: formData.websiteUrl,
        linkedinUrl: formData.linkedinUrl || undefined,
        twitterUrl: formData.twitterUrl || undefined,
        foundedYear: formData.foundedYear,
        headquartersCity: formData.headquartersCity || undefined,
        stage: formData.stage as any,
        status: formData.status,
        employeeCount: formData.employeeCount ? parseInt(formData.employeeCount) : undefined,
        founders: foundersArray,
        logoUrl: formData.logoUrl || undefined,
        category: formData.category || undefined,
        businessType: formData.businessType || undefined,
        faqs: faqs.length > 0 ? faqs : undefined,
        fundingRounds: fundingRounds.length > 0 ? convertToSaveFormat(fundingRounds) : undefined,
        foundersData: foundersDetails.filter(f => f.name.trim()).length > 0
          ? foundersDetails.filter(f => f.name.trim())
          : undefined,
        socialLinks: socialLinks.length > 0 ? socialLinks : undefined,
      });

      if (!result.success) {
        throw new Error(result.error || 'Submission failed');
      }

      // Show success card
      localStorage.removeItem('draft_founder_new_startup');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white font-sora mb-2">Startup Submitted Successfully</h2>
        <p className="text-gray-600 dark:text-gray-400 font-jakarta text-sm mb-6">
          Our editorial team will review your submission within 2-3 business days. You'll receive an email once it's approved and live.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => router.push('/founder/startups')}
            className="px-6 py-2.5 bg-brand text-white font-bold text-sm rounded-lg hover:bg-brand/90 transition-colors"
          >
            View in Dashboard
          </button>
          <button
            onClick={() => router.push('/founder/dashboard')}
            className="px-6 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Logo <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-4">
          {logoPreview ? (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setLogoPreview('');
                  setFormData(prev => ({ ...prev, logoUrl: '' }));
                }}
                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <label className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-brand transition-colors">
              <Upload className="w-6 h-6 text-gray-400" />
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
          )}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>Upload your startup logo</p>
            <p className="text-xs">PNG, JPG up to 5MB</p>
          </div>
        </div>
      </div>

      {/* Company Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Company Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
          placeholder="e.g. OpenAI"
        />
      </div>

      {/* Tagline */}
      <div>
        <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tagline <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="tagline"
          name="tagline"
          value={formData.tagline}
          onChange={handleChange}
          required
          maxLength={100}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
          placeholder="A short, catchy description (max 100 characters)"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formData.tagline.length}/100 characters
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          maxLength={1000}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
          placeholder="Describe your startup, what problem it solves, and what makes it unique..."
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formData.description.length}/1000 characters
        </p>
      </div>

      {/* Website URL */}
      <div>
        <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Website URL <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          id="websiteUrl"
          name="websiteUrl"
          value={formData.websiteUrl}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
          placeholder="https://yourcompany.com"
        />
      </div>

      {/* Social Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            LinkedIn URL
          </label>
          <input
            type="url"
            id="linkedinUrl"
            name="linkedinUrl"
            value={formData.linkedinUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
            placeholder="https://linkedin.com/company/..."
          />
        </div>

        <div>
          <label htmlFor="twitterUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Twitter/X URL
          </label>
          <input
            type="url"
            id="twitterUrl"
            name="twitterUrl"
            value={formData.twitterUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
            placeholder="https://twitter.com/..."
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <SocialLinksManager links={socialLinks} onChange={setSocialLinks} />
      </div>

      {/* Company Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="foundedYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Founded Year <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="foundedYear"
            name="foundedYear"
            value={formData.foundedYear}
            onChange={handleChange}
            min="1900"
            max={new Date().getFullYear()}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="stage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Funding Stage <span className="text-red-500">*</span>
          </label>
          <select
            id="stage"
            name="stage"
            value={formData.stage}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
          >
            {STARTUP_STAGES.map(stage => (
              <option key={stage} value={stage}>
                {stage.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company Status <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
          >
            <option value="ACTIVE">Active</option>
            <option value="PUBLIC">Public</option>
            <option value="ACQUIRED">Acquired</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <div>
          <label htmlFor="employeeCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Team Size <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="employeeCount"
            name="employeeCount"
            value={formData.employeeCount}
            onChange={handleChange}
            min="1"
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
            placeholder="e.g. 10"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="headquartersCity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Headquarters
        </label>
        <input
          type="text"
          id="headquartersCity"
          name="headquartersCity"
          value={formData.headquartersCity}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
          placeholder="e.g. San Francisco, CA"
        />
      </div>

      {/* Category & Business Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
          >
            <option value="">Select category</option>
            {STARTUP_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Business Type <span className="text-red-500">*</span>
          </label>
          <select
            id="businessType"
            name="businessType"
            value={formData.businessType}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
          >
            <option value="">Select business type</option>
            {BUSINESS_TYPES.map(bt => (
              <option key={bt} value={bt}>{bt}</option>
            ))}
          </select>
        </div>
      </div>


      {/* Founders Details Section */}
      <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
        <FoundersDetailsManager founders={foundersDetails} onChange={setFoundersDetails} maxFounders={5} />
      </div>

      {/* Funding Rounds Section */}
      <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
        <FundingRoundsManager rounds={fundingRounds} onChange={setFundingRounds} maxRounds={10} />
      </div>

      {/* FAQs Section */}
      <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
        <FAQManager faqs={faqs} onChange={setFaqs} maxFaqs={10} />
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={
            loading ||
            !formData.name ||
            !formData.tagline ||
            !formData.description ||
            !formData.websiteUrl ||
            !formData.category ||
            !formData.businessType ||
            !formData.employeeCount ||
            !formData.foundedYear ||
            !formData.stage ||
            !formData.logoUrl ||
            !foundersDetails.some(f => f.name.trim())
          }
          className="px-6 py-2 bg-brand hover:bg-brand/90 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Submitting...' : 'Submit for Review'}
        </button>
      </div>
    </form>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Loader2 } from 'lucide-react';
import { updateStartupAction } from '@/app/founder/startups/actions';

interface Startup {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  websiteUrl?: string | null;
  logoUrl?: string | null;
  stage?: string | null;
  fundingAmount?: number | null;
  teamSize?: number | null;
  foundedYear?: number | null;
  location?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  status?: string;
  [key: string]: any;
}

const STARTUP_STAGES = [
  'IDEA',
  'PRE_SEED',
  'SEED',
  'SERIES_A',
  'SERIES_B',
  'SERIES_C',
  'GROWTH',
  'PUBLIC',
];

const STARTUP_CATEGORIES = [
  'FinTech',
  'HealthTech',
  'EdTech',
  'E-commerce',
  'SaaS',
  'AI/ML',
  'Enterprise Software',
  'Consumer Tech',
  'DeepTech',
  'CleanTech',
  'AgriTech',
  'LogisticsTech',
  'HRTech',
  'MarTech',
  'PropTech',
  'FoodTech',
  'Mobility',
  'Gaming',
  'Media & Entertainment',
  'Other',
];

const BUSINESS_TYPES = [
  'B2B',
  'B2C',
  'B2B2C',
  'B2G',
  'C2C',
  'D2C',
  'B2B2B',
  'Marketplace',
  'Platform',
];

interface StartupEditFormProps {
  startup: Startup;
}

export default function StartupEditForm({ startup }: StartupEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoPreview, setLogoPreview] = useState(startup.logoUrl || '');

  const [formData, setFormData] = useState({
    name: startup.name,
    tagline: startup.tagline,
    description: startup.description,
    websiteUrl: startup.websiteUrl || '',
    linkedinUrl: startup.linkedinUrl || '',
    twitterUrl: startup.twitterUrl || '',
    foundedYear: startup.foundedYear || new Date().getFullYear(),
    headquartersCity: startup.headquartersCity || '',
    stage: startup.stage,
    employeeCount: startup.employeeCount?.toString() || '',
    founders: startup.founders.join(', '),
    logoUrl: startup.logoUrl || '',
    category: startup.category || '',
    businessType: startup.businessType || '',
    totalFundingInr: startup.totalFundingInr ? (Number(startup.totalFundingInr) / 100).toString() : '',
    fundingCurrency: 'INR',
  });

  const taglineCharLimit = 60;
  const descriptionCharLimit = 500;
  const taglineCharsRemaining = taglineCharLimit - (formData.tagline?.length || 0);
  const descriptionCharsRemaining = descriptionCharLimit - (formData.description?.length || 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Enforce character limits
    if (name === 'tagline' && value.length > taglineCharLimit) {
      return;
    }
    if (name === 'description' && value.length > descriptionCharLimit) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

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
      if (!formData.name || !formData.tagline || !formData.description || !formData.websiteUrl || !formData.category) {
        throw new Error('Please fill in all required fields');
      }

      const foundersArray = formData.founders
        .split(',')
        .map((f: string) => f.trim())
        .filter(Boolean);

      const result = await updateStartupAction(startup.id, {
        name: formData.name,
        tagline: formData.tagline,
        description: formData.description,
        websiteUrl: formData.websiteUrl,
        linkedinUrl: formData.linkedinUrl || undefined,
        twitterUrl: formData.twitterUrl || undefined,
        foundedYear: formData.foundedYear,
        headquartersCity: formData.headquartersCity || undefined,
        stage: formData.stage as any,
        employeeCount: formData.employeeCount ? parseInt(formData.employeeCount) : undefined,
        founders: foundersArray,
        logoUrl: formData.logoUrl || undefined,
        category: formData.category || undefined,
        businessType: formData.businessType || undefined,
        totalFundingInr: formData.totalFundingInr ? Math.round(parseFloat(formData.totalFundingInr) * 100) : undefined,
      });

      if (!result.success) {
        throw new Error(result.error || 'Update failed');
      }

      router.push('/founder/startups');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

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
          Logo
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
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            ({taglineCharsRemaining} characters remaining)
          </span>
        </label>
        <input
          type="text"
          id="tagline"
          name="tagline"
          value={formData.tagline}
          onChange={handleChange}
          required
          maxLength={taglineCharLimit}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
          placeholder="A short, catchy description"
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Keep it concise and compelling
          </p>
          <p className={`text-xs font-medium ${
            taglineCharsRemaining < 10 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {formData.tagline.length} / {taglineCharLimit}
          </p>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description <span className="text-red-500">*</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            ({descriptionCharsRemaining} characters remaining)
          </span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={6}
          maxLength={descriptionCharLimit}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
          placeholder="Describe your startup, what problem it solves, and what makes it unique..."
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Provide a clear and compelling description of your startup
          </p>
          <p className={`text-xs font-medium ${
            descriptionCharsRemaining < 50 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {formData.description.length} / {descriptionCharLimit}
          </p>
        </div>
      </div>

      {/* Category/Sector */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category / Sector <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
        >
          <option value="">Select a category</option>
          {STARTUP_CATEGORIES.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Choose the primary sector your startup operates in
        </p>
      </div>

      {/* Business Type */}
      <div>
        <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Business Model
        </label>
        <select
          id="businessType"
          name="businessType"
          value={formData.businessType}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
        >
          <option value="">Select business model</option>
          {BUSINESS_TYPES.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Select your primary business model (B2B, B2C, B2G, etc.)
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

      {/* Company Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="foundedYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Founded Year
          </label>
          <input
            type="number"
            id="foundedYear"
            name="foundedYear"
            value={formData.foundedYear}
            onChange={handleChange}
            min="1900"
            max={new Date().getFullYear()}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="stage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Funding Stage
          </label>
          <select
            id="stage"
            name="stage"
            value={formData.stage ?? ''}
            onChange={handleChange}
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
          <label htmlFor="employeeCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Team Size
          </label>
          <input
            type="number"
            id="employeeCount"
            name="employeeCount"
            value={formData.employeeCount}
            onChange={handleChange}
            min="1"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
            placeholder="e.g. 10"
          />
        </div>
      </div>

      {/* Funding Information */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Funding Information (Optional)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="totalFundingInr" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Total Funding Raised
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                ₹
              </span>
              <input
                type="number"
                id="totalFundingInr"
                name="totalFundingInr"
                value={formData.totalFundingInr}
                onChange={handleChange}
                min="0"
                step="100000"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
                placeholder="e.g. 10000000"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter amount in INR (e.g., 1 Crore = 10000000)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick Amount
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, totalFundingInr: '5000000' }))}
                className="px-3 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                ₹50 Lakhs
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, totalFundingInr: '10000000' }))}
                className="px-3 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                ₹1 Crore
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, totalFundingInr: '50000000' }))}
                className="px-3 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                ₹5 Crores
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, totalFundingInr: '100000000' }))}
                className="px-3 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                ₹10 Crores
              </button>
            </div>
          </div>
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

      {/* Founders */}
      <div>
        <label htmlFor="founders" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Founders
        </label>
        <input
          type="text"
          id="founders"
          name="founders"
          value={formData.founders}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
          placeholder="Comma-separated names, e.g. John Doe, Jane Smith"
        />
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
          disabled={loading}
          className="px-6 py-2 bg-brand hover:bg-brand/90 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Updating...' : 'Update Startup'}
        </button>
      </div>
    </form>
  );
}

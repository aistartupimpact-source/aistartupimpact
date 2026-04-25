'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Loader2, Plus } from 'lucide-react';
import { submitToolAction } from '@/app/founder/tools/actions';

const PRICING_MODELS = [
  'FREE',
  'FREEMIUM',
  'PAID',
  'ENTERPRISE',
  'OPEN_SOURCE',
];

export default function ToolForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    websiteUrl: '',
    affiliateUrl: '',
    pricingModel: 'FREEMIUM',
    pricingUrl: '',
    startingPrice: '',
    hasApi: false,
    hasMobileApp: false,
    launchYear: new Date().getFullYear(),
    features: '',
    useCases: '',
    logoUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value,
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

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (screenshots.length + files.length > 5) {
      setError('Maximum 5 screenshots allowed');
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload image files only');
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Each image must be less than 5MB');
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();
        setScreenshots(prev => [...prev, data.url]);
      } catch (err) {
        setError('Failed to upload screenshot');
        console.error(err);
      }
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.name || !formData.tagline || !formData.description || !formData.websiteUrl) {
        throw new Error('Please fill in all required fields');
      }

      // Parse features and use cases
      const featuresArray = formData.features
        .split('\n')
        .map(f => f.trim())
        .filter(Boolean);

      const useCasesArray = formData.useCases
        .split('\n')
        .map(u => u.trim())
        .filter(Boolean);

      const result = await submitToolAction({
        name: formData.name,
        tagline: formData.tagline,
        description: formData.description,
        websiteUrl: formData.websiteUrl,
        affiliateUrl: formData.affiliateUrl || undefined,
        pricingModel: formData.pricingModel as any,
        pricingUrl: formData.pricingUrl || undefined,
        startingPrice: formData.startingPrice ? parseFloat(formData.startingPrice) : undefined,
        hasApi: formData.hasApi,
        hasMobileApp: formData.hasMobileApp,
        launchYear: formData.launchYear,
        features: featuresArray,
        useCases: useCasesArray,
        logoUrl: formData.logoUrl || undefined,
        screenshotUrls: screenshots,
      });

      if (!result.success) {
        throw new Error(result.error || 'Submission failed');
      }

      router.push('/founder/tools');
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
            <p>Upload your tool logo</p>
            <p className="text-xs">PNG, JPG up to 5MB</p>
          </div>
        </div>
      </div>

      {/* Tool Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tool Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
          placeholder="e.g. ChatGPT"
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
          maxLength={200}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
          placeholder="A short, catchy description (max 200 characters)"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formData.tagline.length}/200 characters
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
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
          placeholder="Describe your tool, its features, and what makes it unique..."
        />
      </div>

      {/* URLs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            placeholder="https://yourtool.com"
          />
        </div>

        <div>
          <label htmlFor="affiliateUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Affiliate/Referral URL
          </label>
          <input
            type="url"
            id="affiliateUrl"
            name="affiliateUrl"
            value={formData.affiliateUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
            placeholder="https://yourtool.com?ref=..."
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="pricingModel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pricing Model
          </label>
          <select
            id="pricingModel"
            name="pricingModel"
            value={formData.pricingModel}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
          >
            {PRICING_MODELS.map(model => (
              <option key={model} value={model}>
                {model.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="startingPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Starting Price (USD/month)
          </label>
          <input
            type="number"
            id="startingPrice"
            name="startingPrice"
            value={formData.startingPrice}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
            placeholder="e.g. 9.99"
          />
        </div>

        <div>
          <label htmlFor="pricingUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pricing Page URL
          </label>
          <input
            type="url"
            id="pricingUrl"
            name="pricingUrl"
            value={formData.pricingUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
            placeholder="https://yourtool.com/pricing"
          />
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="hasApi"
            name="hasApi"
            checked={formData.hasApi}
            onChange={handleChange}
            className="w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand"
          />
          <label htmlFor="hasApi" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Has API
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="hasMobileApp"
            name="hasMobileApp"
            checked={formData.hasMobileApp}
            onChange={handleChange}
            className="w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand"
          />
          <label htmlFor="hasMobileApp" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Has Mobile App
          </label>
        </div>
      </div>

      {/* Launch Year */}
      <div>
        <label htmlFor="launchYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Launch Year
        </label>
        <input
          type="number"
          id="launchYear"
          name="launchYear"
          value={formData.launchYear}
          onChange={handleChange}
          min="1900"
          max={new Date().getFullYear()}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
        />
      </div>

      {/* Key Features */}
      <div>
        <label htmlFor="features" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Key Features
        </label>
        <textarea
          id="features"
          name="features"
          value={formData.features}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
          placeholder="One feature per line&#10;e.g. Natural language processing&#10;Real-time collaboration&#10;Advanced analytics"
        />
      </div>

      {/* Use Cases */}
      <div>
        <label htmlFor="useCases" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Use Cases
        </label>
        <textarea
          id="useCases"
          name="useCases"
          value={formData.useCases}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
          placeholder="One use case per line&#10;e.g. Content creation&#10;Customer support automation&#10;Data analysis"
        />
      </div>

      {/* Screenshots */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Screenshots (Max 5)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {screenshots.map((url, index) => (
            <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <img src={url} alt={`Screenshot ${index + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeScreenshot(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {screenshots.length < 5 && (
            <label className="aspect-video border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-brand transition-colors">
              <Plus className="w-6 h-6 text-gray-400" />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleScreenshotUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
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
          {loading ? 'Submitting...' : 'Submit for Review'}
        </button>
      </div>
    </form>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Upload, Loader2, Save, Plus, X } from 'lucide-react';
import { getToolsAction, getToolFAQsAction, updateToolAction, getCategoriesAction } from '../../actions';
import { uploadLogoAction } from '../../../media/actions';
import { FAQManager, type FAQ } from '@/components/shared/FAQManager';

const pricingModels = ['FREE', 'FREEMIUM', 'PAID', 'ENTERPRISE', 'OPEN_SOURCE'];
const listingTiers = ['STANDARD', 'PRIORITY', 'FEATURED'];
const statuses = ['PENDING', 'APPROVED', 'ARCHIVED'];

interface Tool {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  websiteUrl: string;
  affiliateUrl?: string;
  pricingModel: string;
  pricingUrl?: string;
  startingPrice?: number | null;
  avgRating: number;
  listingTier: string;
  status: string;
  categoryId: string;
  hasApi?: boolean;
  hasMobileApp?: boolean;
  launchYear?: number;
  founderNames?: string[];
  headquartersCountry?: string;
  screenshotUrls?: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function EditToolPage() {
  const router = useRouter();
  const params = useParams();
  const toolId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [screenshotUploading, setScreenshotUploading] = useState(false);
  const [logoPreviewError, setLogoPreviewError] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<Tool | null>(null);

  useEffect(() => {
    loadTool();
  }, [toolId]);

  const loadTool = async () => {
    setLoading(true);
    try {
      const [tools, cats] = await Promise.all([
        getToolsAction(),
        getCategoriesAction(),
      ]);
      
      const tool = tools.find((t: any) => t.id === toolId);
      
      if (!tool) {
        alert('Tool not found');
        router.push('/tools-dir');
        return;
      }
      
      setFormData(tool as Tool);
      setCategories(cats as Category[]);
      setScreenshots(tool.screenshotUrls || []);
      
      // Load FAQs
      setLoadingFaqs(true);
      try {
        const toolFaqs = await getToolFAQsAction(toolId);
        console.log('Loaded FAQs:', toolFaqs);
        setFaqs(toolFaqs as FAQ[]);
      } catch (faqError) {
        console.error('Error loading FAQs:', faqError);
        setFaqs([]);
      }
    } catch (error) {
      console.error('Error loading tool:', error);
      alert('Error loading tool');
    } finally {
      setLoading(false);
      setLoadingFaqs(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!formData) return;
    
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => prev ? { ...prev, [name]: (e.target as HTMLInputElement).checked } : null);
    } else if (name === 'startingPrice' || name === 'avgRating' || name === 'launchYear') {
      setFormData(prev => prev ? { ...prev, [name]: value ? parseFloat(value) : null } : null);
    } else {
      setFormData(prev => prev ? { ...prev, [name]: value } : null);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !formData) return;
    
    setLogoUploading(true);
    setLogoPreviewError(false);
    
    try {
      const fd = new FormData();
      fd.append('file', file);
      const result = await uploadLogoAction(fd);
      
      if (result.success && result.url) {
        setFormData(prev => prev ? { ...prev, logoUrl: result.url! } : null);
      } else {
        alert('Upload failed: ' + (result.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Upload error: ' + err.message);
    } finally {
      setLogoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (screenshots.length + files.length > 5) {
      alert('Maximum 5 screenshots allowed');
      return;
    }

    setScreenshotUploading(true);

    for (const file of files) {
      try {
        const fd = new FormData();
        fd.append('file', file);
        const result = await uploadLogoAction(fd);
        
        if (result.success && result.url) {
          setScreenshots(prev => [...prev, result.url!]);
        }
      } catch (err: any) {
        console.error('Screenshot upload error:', err);
      }
    }

    setScreenshotUploading(false);
    if (screenshotInputRef.current) screenshotInputRef.current.value = '';
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData || !formData.name || !formData.tagline || !formData.websiteUrl || !formData.categoryId) {
      alert('Please fill in all required fields');
      return;
    }
    
    setSaving(true);
    
    try {
      const founderNamesArray = Array.isArray(formData.founderNames)
        ? formData.founderNames
        : typeof formData.founderNames === 'string'
          ? (formData.founderNames as string).split(',').map(f => f.trim()).filter(Boolean)
          : [];

      const result = await updateToolAction(toolId, {
        name: formData.name,
        tagline: formData.tagline,
        description: formData.description,
        logoUrl: formData.logoUrl,
        websiteUrl: formData.websiteUrl,
        affiliateUrl: formData.affiliateUrl,
        categoryId: formData.categoryId,
        pricingModel: formData.pricingModel,
        pricingUrl: formData.pricingUrl,
        startingPrice: formData.startingPrice,
        hasApi: formData.hasApi,
        hasMobileApp: formData.hasMobileApp,
        launchYear: formData.launchYear,
        founderNames: founderNamesArray,
        headquartersCountry: formData.headquartersCountry,
        avgRating: formData.avgRating,
        listingTier: formData.listingTier,
        status: formData.status,
        screenshotUrls: screenshots,
        faqs: faqs.length > 0 ? faqs : undefined,
      });
      
      if (result.success) {
        router.push('/tools-dir');
        router.refresh();
      } else {
        alert('Error: ' + (result.error || 'Failed to update tool'));
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Tool not found</p>
      </div>
    );
  }

  const founderNamesStr = Array.isArray(formData.founderNames) 
    ? formData.founderNames.join(', ') 
    : formData.founderNames || '';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Edit Tool</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">
            Update tool information
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 space-y-6">
          <h2 className="font-sora font-bold text-lg text-navy dark:text-white">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">
                Tool Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field text-sm"
                placeholder="e.g. ChatGPT"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">
                Slug
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                disabled
                className="input-field text-sm bg-gray-50 dark:bg-gray-800"
                placeholder="e.g. chatgpt"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">
                Category *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="input-field text-sm"
              >
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">
                Tagline *
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                required
                maxLength={200}
                className="input-field text-sm"
                placeholder="A short, catchy description"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.tagline.length}/200 characters
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              maxLength={1000}
              className="input-field text-sm"
              placeholder="Detailed description of the tool..."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.description.length}/1000 characters
            </p>
          </div>
        </div>

        {/* Logo & URLs */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 space-y-6">
          <h2 className="font-sora font-bold text-lg text-navy dark:text-white">Logo & URLs</h2>
          
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">
              Logo
            </label>
            <div className="flex gap-2 items-start">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={logoUploading}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-50"
              >
                {logoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {logoUploading ? 'Uploading…' : 'Upload'}
              </button>
              <input
                type="url"
                name="logoUrl"
                value={formData.logoUrl || ''}
                onChange={(e) => { handleChange(e); setLogoPreviewError(false); }}
                className="input-field text-sm flex-1"
                placeholder="https://... or upload above"
              />
            </div>
            {formData.logoUrl && !logoPreviewError && (
              <div className="mt-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.logoUrl}
                  alt="Logo preview"
                  className="w-12 h-12 rounded-lg object-contain border border-gray-200 dark:border-gray-700 p-1 bg-white"
                  onError={() => setLogoPreviewError(true)}
                />
                <span className="text-xs text-gray-400 font-jakarta">Preview</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">
              Website URL *
            </label>
            <input
              type="url"
              name="websiteUrl"
              value={formData.websiteUrl}
              onChange={handleChange}
              required
              className="input-field text-sm"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">
              Affiliate/Referral URL
            </label>
            <input
              type="url"
              name="affiliateUrl"
              value={formData.affiliateUrl || ''}
              onChange={handleChange}
              className="input-field text-sm"
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 space-y-6">
          <h2 className="font-sora font-bold text-lg text-navy dark:text-white">Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">
                Pricing Model
              </label>
              <select
                name="pricingModel"
                value={formData.pricingModel}
                onChange={handleChange}
                className="input-field text-sm"
              >
                {pricingModels.map(p => (
                  <option key={p} value={p}>{p.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">
                Starting Price (USD/month)
              </label>
              <input
                type="number"
                name="startingPrice"
                value={formData.startingPrice ?? ''}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="input-field text-sm"
                placeholder="9.99"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">
                Pricing Page URL
              </label>
              <input
                type="url"
                name="pricingUrl"
                value={formData.pricingUrl || ''}
                onChange={handleChange}
                className="input-field text-sm"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Tool Details */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 space-y-6">
          <h2 className="font-sora font-bold text-lg text-navy dark:text-white">Tool Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">
                Launch Year
              </label>
              <input
                type="number"
                name="launchYear"
                value={formData.launchYear ?? ''}
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear()}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">
                Founder Names
              </label>
              <input
                type="text"
                name="founderNames"
                value={founderNamesStr}
                onChange={handleChange}
                className="input-field text-sm"
                placeholder="John Doe, Jane Smith"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">
                Headquarters
              </label>
              <input
                type="text"
                name="headquartersCountry"
                value={formData.headquartersCountry || ''}
                onChange={handleChange}
                className="input-field text-sm"
                placeholder="USA, India, etc."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="hasApi"
                checked={formData.hasApi || false}
                onChange={handleChange}
                className="w-4 h-4 text-brand bg-gray-100 border-gray-300 rounded focus:ring-brand"
              />
              <span className="text-sm font-medium text-navy dark:text-white font-jakarta">
                Has API
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="hasMobileApp"
                checked={formData.hasMobileApp || false}
                onChange={handleChange}
                className="w-4 h-4 text-brand bg-gray-100 border-gray-300 rounded focus:ring-brand"
              />
              <span className="text-sm font-medium text-navy dark:text-white font-jakarta">
                Has Mobile App
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">
                Rating
              </label>
              <input
                type="number"
                name="avgRating"
                value={formData.avgRating}
                onChange={handleChange}
                min="0"
                max="5"
                step="0.1"
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">
                Listing Tier
              </label>
              <select
                name="listingTier"
                value={formData.listingTier}
                onChange={handleChange}
                className="input-field text-sm"
              >
                {listingTiers.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-field text-sm"
              >
                {statuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Screenshots */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
          <h2 className="font-sora font-bold text-lg text-navy dark:text-white">Screenshots (Max 5)</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {screenshots.map((url, index) => (
              <div key={index} className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
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
                <input
                  ref={screenshotInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleScreenshotUpload}
                  disabled={screenshotUploading}
                />
                {screenshotUploading ? (
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                ) : (
                  <Plus className="w-6 h-6 text-gray-400" />
                )}
              </label>
            )}
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
          {loadingFaqs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-brand" />
              <span className="ml-2 text-sm text-gray-500">Loading FAQs...</span>
            </div>
          ) : (
            <FAQManager faqs={faqs} onChange={setFaqs} maxFaqs={10} />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-4 rounded-xl">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !formData.name || !formData.tagline || !formData.websiteUrl || !formData.categoryId}
            className="btn-brand text-sm flex items-center gap-2 disabled:opacity-50 px-6 py-2.5"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

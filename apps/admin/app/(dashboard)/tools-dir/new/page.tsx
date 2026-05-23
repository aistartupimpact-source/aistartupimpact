'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Loader2, Save, Plus, X } from 'lucide-react';
import { createToolAction, getCategoriesAction } from '../actions';
import { uploadLogoAction } from '../../media/actions';
import { FAQManager, type FAQ } from '@/components/shared/FAQManager';

const pricingModels = ['FREE', 'FREEMIUM', 'PAID', 'ENTERPRISE', 'OPEN_SOURCE'];

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function NewToolPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);
  
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [screenshotUploading, setScreenshotUploading] = useState(false);
  const [logoPreviewError, setLogoPreviewError] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    logoUrl: '',
    websiteUrl: '',
    affiliateUrl: '',
    categoryId: '',
    pricingModel: 'FREEMIUM',
    pricingUrl: '',
    startingPrice: null as number | null,
    hasApi: false,
    hasMobileApp: false,
    launchYear: new Date().getFullYear(),
    founderNames: '',
    headquartersCountry: '',
    avgRating: 0,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await getCategoriesAction();
      setCategories(cats as Category[]);
      if (cats.length > 0 && !formData.categoryId) {
        setFormData(prev => ({ ...prev, categoryId: cats[0].id }));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (name === 'startingPrice' || name === 'avgRating' || name === 'launchYear') {
      setFormData(prev => ({ ...prev, [name]: value ? parseFloat(value) : null }));
    } else if (name === 'name') {
      // Auto-generate slug from name
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, name: value, slug }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLogoUploading(true);
    setLogoPreviewError(false);
    
    try {
      const fd = new FormData();
      fd.append('file', file);
      const result = await uploadLogoAction(fd);
      
      if (result.success && result.url) {
        setFormData(prev => ({ ...prev, logoUrl: result.url! }));
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
    
    if (!formData.name || !formData.slug || !formData.tagline || !formData.websiteUrl || !formData.categoryId) {
      alert('Please fill in all required fields');
      return;
    }
    
    setSaving(true);
    
    try {
      const founderNamesArray = formData.founderNames
        .split(',')
        .map(f => f.trim())
        .filter(Boolean);

      const result = await createToolAction({
        name: formData.name,
        slug: formData.slug,
        tagline: formData.tagline,
        description: formData.description,
        logoUrl: formData.logoUrl,
        websiteUrl: formData.websiteUrl,
        affiliateUrl: formData.affiliateUrl || undefined,
        categoryId: formData.categoryId,
        pricingModel: formData.pricingModel,
        pricingUrl: formData.pricingUrl || undefined,
        startingPrice: formData.startingPrice,
        hasApi: formData.hasApi,
        hasMobileApp: formData.hasMobileApp,
        launchYear: formData.launchYear,
        founderNames: founderNamesArray.length > 0 ? founderNamesArray : undefined,
        headquartersCountry: formData.headquartersCountry || undefined,
        avgRating: formData.avgRating,
        screenshotUrls: screenshots,
        faqs: faqs.length > 0 ? faqs : undefined,
      });
      
      if (result.success) {
        router.push('/tools-dir');
        router.refresh();
      } else {
        alert('Error: ' + (result.error || 'Failed to create tool'));
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Add New Tool</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">
            Add a new AI tool to the directory
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
                Slug *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="input-field text-sm"
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
                value={formData.logoUrl}
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
              value={formData.affiliateUrl}
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
                value={formData.pricingUrl}
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
                value={formData.launchYear}
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
                value={formData.founderNames}
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
                value={formData.headquartersCountry}
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
                checked={formData.hasApi}
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
                checked={formData.hasMobileApp}
                onChange={handleChange}
                className="w-4 h-4 text-brand bg-gray-100 border-gray-300 rounded focus:ring-brand"
              />
              <span className="text-sm font-medium text-navy dark:text-white font-jakarta">
                Has Mobile App
              </span>
            </label>
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
          <FAQManager faqs={faqs} onChange={setFaqs} maxFaqs={10} />
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
            disabled={saving || !formData.name || !formData.slug || !formData.tagline || !formData.websiteUrl || !formData.categoryId}
            className="btn-brand text-sm flex items-center gap-2 disabled:opacity-50 px-6 py-2.5"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Creating...' : 'Create Tool'}
          </button>
        </div>
      </form>
    </div>
  );
}

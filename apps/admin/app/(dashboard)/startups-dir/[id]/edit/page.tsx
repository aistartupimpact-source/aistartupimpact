'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Upload, Loader2, Save, Crown } from 'lucide-react';
import { getStartupsAction, getStartupFAQsAction, updateStartupAction } from '../../actions';
import { uploadLogoAction } from '../../../media/actions';
import { FAQManager, type FAQ } from '@/components/shared/FAQManager';

const stages = ['IDEA', 'PRE_SEED', 'SEED', 'SERIES_A', 'SERIES_B', 'SERIES_C', 'GROWTH', 'PUBLIC'];

interface Startup {
  id: string;
  name: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  stage: string;
  headquartersCity?: string;
  isFeatured: boolean;
  foundedYear?: number | null;
  employeeCount?: number | null;
  impactScore?: number | null;
}

export default function EditStartupPage() {
  const router = useRouter();
  const params = useParams();
  const startupId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreviewError, setLogoPreviewError] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  
  const [formData, setFormData] = useState<Startup | null>(null);

  useEffect(() => {
    loadStartup();
  }, [startupId]);

  const loadStartup = async () => {
    setLoading(true);
    try {
      const startups = await getStartupsAction();
      const startup = startups.find((s: any) => s.id === startupId);
      
      if (!startup) {
        alert('Startup not found');
        router.push('/startups-dir');
        return;
      }
      
      setFormData(startup as Startup);
      
      // Load FAQs
      setLoadingFaqs(true);
      try {
        const startupFaqs = await getStartupFAQsAction(startupId);
        console.log('Loaded FAQs:', startupFaqs); // Debug log
        setFaqs(startupFaqs as FAQ[]);
      } catch (faqError) {
        console.error('Error loading FAQs:', faqError);
        // If table doesn't exist, just set empty array
        setFaqs([]);
      }
    } catch (error) {
      console.error('Error loading startup:', error);
      alert('Error loading startup');
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
    } else if (name === 'foundedYear' || name === 'employeeCount' || name === 'impactScore') {
      setFormData(prev => prev ? { ...prev, [name]: value ? parseInt(value) : null } : null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData || !formData.name || !formData.tagline) {
      alert('Name and tagline are required');
      return;
    }
    
    setSaving(true);
    
    try {
      const result = await updateStartupAction(startupId, {
        name: formData.name,
        tagline: formData.tagline,
        description: formData.description,
        logoUrl: formData.logoUrl,
        websiteUrl: formData.websiteUrl,
        linkedinUrl: formData.linkedinUrl,
        twitterUrl: formData.twitterUrl,
        stage: formData.stage,
        headquartersCity: formData.headquartersCity,
        isFeatured: formData.isFeatured,
        foundedYear: formData.foundedYear,
        employeeCount: formData.employeeCount,
        impactScore: formData.impactScore,
        faqs: faqs.length > 0 ? faqs : undefined,
      });
      
      if (result.success) {
        router.push('/startups-dir');
        router.refresh();
      } else {
        alert('Error: ' + (result.error || 'Failed to update startup'));
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
        <p className="text-gray-500">Startup not found</p>
      </div>
    );
  }

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
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Edit Startup</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">
            Update startup information
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
                Company Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field text-sm"
                placeholder="e.g. Sarvam AI"
              />
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
                className="input-field text-sm"
                placeholder="e.g. India-first foundation models"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">
                Stage
              </label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                className="input-field text-sm"
              >
                {stages.map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">
                Location
              </label>
              <input
                type="text"
                name="headquartersCity"
                value={formData.headquartersCity || ''}
                onChange={handleChange}
                className="input-field text-sm"
                placeholder="e.g. Bengaluru"
              />
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
              className="input-field text-sm"
              placeholder="Brief description of the startup..."
            />
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
              Website URL
            </label>
            <input
              type="url"
              name="websiteUrl"
              value={formData.websiteUrl || ''}
              onChange={handleChange}
              className="input-field text-sm"
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">
                LinkedIn URL
              </label>
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl || ''}
                onChange={handleChange}
                className="input-field text-sm"
                placeholder="https://linkedin.com/company/..."
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">
                Twitter/X URL
              </label>
              <input
                type="url"
                name="twitterUrl"
                value={formData.twitterUrl || ''}
                onChange={handleChange}
                className="input-field text-sm"
                placeholder="https://twitter.com/..."
              />
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 space-y-6">
          <h2 className="font-sora font-bold text-lg text-navy dark:text-white">Company Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">
                Founded Year
              </label>
              <input
                type="number"
                name="foundedYear"
                value={formData.foundedYear ?? ''}
                onChange={handleChange}
                className="input-field text-sm"
                placeholder="2023"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">
                Employees
              </label>
              <input
                type="number"
                name="employeeCount"
                value={formData.employeeCount ?? ''}
                onChange={handleChange}
                className="input-field text-sm"
                placeholder="50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">
                Impact Score
              </label>
              <input
                type="number"
                name="impactScore"
                value={formData.impactScore ?? ''}
                onChange={handleChange}
                min={1}
                max={100}
                className="input-field text-sm"
                placeholder="1-100"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-4 h-4 text-brand bg-gray-100 border-gray-300 rounded focus:ring-brand dark:focus:ring-brand dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <div>
                <span className="text-sm font-medium text-navy dark:text-white font-jakarta flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  Feature at Top
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta mt-0.5">
                  Featured startups appear at the top of the startup directory page
                </p>
              </div>
            </label>
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
            disabled={saving || !formData.name || !formData.tagline}
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

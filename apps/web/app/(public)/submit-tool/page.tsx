"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Search, LayoutTemplate, Briefcase, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';
import { submitFreeToolAction } from './actions';

interface ToolDraft {
  name: string;
  tagline: string;
  websiteUrl: string;
  logoUrl: string;
  description: string;
  idealUseCase: string;
  notAFitFor: string;
  categoryId: string;
  pricingModel: string;
  pricingUrl: string;
  startingPrice: string;
  hasApi: boolean;
  hasMobileApp: boolean;
  founderNames: string;
  hqCity: string;
}

const DEFAULT_DRAFT: ToolDraft = {
  name: '', tagline: '', websiteUrl: '', logoUrl: '', description: '',
  idealUseCase: '', notAFitFor: '', categoryId: '', pricingModel: 'FREEMIUM', pricingUrl: '',
  startingPrice: '', hasApi: false, hasMobileApp: false, founderNames: '', hqCity: ''
};

export default function SubmitToolWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<ToolDraft>(DEFAULT_DRAFT);
  const [loadingOg, setLoadingOg] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Hydrate draft from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('aiToolDraft');
    if (saved) {
      try {
        setDraft(JSON.parse(saved));
      } catch (e) { }
    }
  }, []);

  // Auto-save every 5 seconds if draft changes
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('aiToolDraft', JSON.stringify(draft));
    }, 5000);
    return () => clearTimeout(timer);
  }, [draft]);

  const fetchOgMeta = async (url: string) => {
    if (!url || !url.includes('.')) return;
    setLoadingOg(true);
    try {
      const res = await fetch('/api/og', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (res.ok) {
        setDraft(prev => ({
          ...prev,
          name: prev.name || data.title?.split(' - ')[0] || data.title,
          tagline: prev.tagline || data.description?.substring(0, 80),
          logoUrl: prev.logoUrl || data.logo
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingOg(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Quick validation
    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file (png, jpg, svg, webp)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Logo size must be less than 2MB");
      return;
    }

    setIsUploadingLogo(true);
    try {
      // 1. Get presigned URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const presignRes = await fetch(`${apiUrl}/v1/upload/presign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type })
      });
      const { presignedUrl, finalUrl } = await presignRes.json();

      if (!presignedUrl) throw new Error("Failed to secure upload URL");

      // 2. Put object to bucket
      const uploadRes = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        }
      });

      if (!uploadRes.ok) throw new Error("Cloudflare R2 Rejected the upload");

      // 3. Save URL to draft
      setDraft(prev => ({ ...prev, logoUrl: finalUrl }));
    } catch (error) {
      console.error("Upload failed", error);
      alert("Logo upload failed. Please try again or paste a URL.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Completeness Calculator
  const calculateCompleteness = () => {
    let score = 0;
    const fields = [
      draft.name, draft.tagline, draft.websiteUrl, draft.logoUrl,
      draft.description, draft.idealUseCase, draft.notAFitFor,
      draft.categoryId, draft.founderNames
    ];
    fields.forEach(f => { if (f && f.length > 2) score += 10; });
    if (draft.description.length > 300) score += 10;
    return Math.min(score, 100);
  };

  const completeness = calculateCompleteness();

  const handleFreeSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    const res: any = await submitFreeToolAction(draft);
    if (res?.success) {
      localStorage.removeItem('aiToolDraft');
      router.push(`/tools/${res.toolSlug}?submitted=true`);
    } else {
      setErrorMsg(res?.error || 'Unknown error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4">

        {/* Header & Completeness */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-sora font-extrabold text-3xl text-navy dark:text-white">List your AI Tool</h1>
            <p className="text-gray-500 font-jakarta mt-2 text-sm">Drafts are saved automatically to your browser.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className={`relative w-12 h-12 flex items-center justify-center rounded-full border-4 ${completeness >= 80 ? 'border-green-500' : 'border-brand'}`}>
              <span className="font-sora font-bold text-sm">{completeness}%</span>
            </div>
            <div>
              <p className="font-sora font-bold text-sm text-navy dark:text-white">Submission Score</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta mt-0.5">
                {completeness < 80 ? 'Score > 80 auto-publishes immediately. Add details!' : 'Excellent! Your tool will auto-publish.'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">

          {/* Progress Bar */}
          <div className="flex border-b border-gray-100 dark:border-gray-700">
            {['Core Identity', 'Positioning', 'Technical', 'Checkout'].map((label, idx) => (
              <div key={label} className={`flex-1 py-4 text-center text-xs font-bold uppercase tracking-wider ${step >= idx + 1 ? 'bg-brand/5 text-brand border-b-2 border-brand' : 'text-gray-400 border-b-2 border-transparent'}`}>
                {idx + 1}. {label}
              </div>
            ))}
          </div>

          <div className="p-8">
            {/* Step 1: Core Identity */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block font-sora font-bold text-sm text-navy dark:text-white mb-2">Website URL <span className="text-red-500">*</span></label>
                  <p className="text-xs text-gray-500 mb-2 font-jakarta">We'll automatically fetch your logo and description.</p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://yourtool.com"
                      className="input-field flex-1"
                      value={draft.websiteUrl}
                      onChange={e => setDraft({ ...draft, websiteUrl: e.target.value })}
                      onBlur={(e) => fetchOgMeta(e.target.value)}
                    />
                    {loadingOg && <span className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-500 animate-pulse">Scanning...</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-sora font-bold text-sm text-navy dark:text-white mb-2">Tool Name <span className="text-red-500">*</span></label>
                    <input type="text" className="input-field w-full" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block font-sora font-bold text-sm text-navy dark:text-white mb-2">Logo URL <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <input type="url" className="input-field w-full" placeholder="https://..." value={draft.logoUrl} onChange={e => setDraft({ ...draft, logoUrl: e.target.value })} />
                      <div className="relative overflow-hidden flex shrink-0">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full"
                          title="Upload logo from device"
                        />
                        <button className="bg-brand/10 hover:bg-brand/20 text-brand font-bold text-xs px-4 rounded-xl transition-colors min-w-[90px] flex items-center justify-center">
                          {isUploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-sora font-bold text-sm text-navy dark:text-white mb-2">One-liner Tagline <span className="text-red-500">*</span></label>
                  <p className="text-xs text-gray-500 mb-2 font-jakarta">Max 80 characters. Be specific, not buzzwordy.</p>
                  <input type="text" maxLength={80} className="input-field w-full" value={draft.tagline} onChange={e => setDraft({ ...draft, tagline: e.target.value })} />
                  <div className="text-right text-xs text-gray-400 mt-1">{draft.tagline.length}/80</div>
                </div>
              </div>
            )}

            {/* Step 2: Positioning */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block font-sora font-bold text-sm text-navy dark:text-white mb-2">Deep Description <span className="text-red-500">*</span></label>
                  <p className="text-xs text-gray-500 mb-2 font-jakarta">Markdown supported. Minimum 200 characters required for high AI score.</p>
                  <textarea rows={6} className="input-field w-full py-3" value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} />
                  <div className="text-right text-xs text-gray-400 mt-1">{draft.description.length} chars</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-sora font-bold text-sm text-navy dark:text-white mb-2">Ideal Use Case <span className="text-red-500">*</span></label>
                    <p className="text-xs text-gray-500 mb-2 font-jakarta">Who is this perfectly built for?</p>
                    <textarea rows={3} className="input-field w-full" value={draft.idealUseCase} onChange={e => setDraft({ ...draft, idealUseCase: e.target.value })} />
                  </div>
                  <div>
                    <label className="block font-sora font-bold text-sm text-navy dark:text-white mb-2">Not a fit for <span className="text-red-500">*</span></label>
                    <p className="text-xs text-gray-500 mb-2 font-jakarta">Self-awareness builds trust.</p>
                    <textarea rows={3} className="input-field w-full" value={draft.notAFitFor} onChange={e => setDraft({ ...draft, notAFitFor: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Technical & Pricing */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-sora font-bold text-sm text-navy dark:text-white mb-2">Pricing Model</label>
                    <select className="input-field w-full" value={draft.pricingModel} onChange={e => setDraft({ ...draft, pricingModel: e.target.value })}>
                      <option value="FREE">Free</option>
                      <option value="FREEMIUM">Freemium</option>
                      <option value="PAID">Paid</option>
                      <option value="OPEN_SOURCE">Open Source</option>
                      <option value="ENTERPRISE">Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-sora font-bold text-sm text-navy dark:text-white mb-2">Starting Price (USD)</label>
                    <input type="number" className="input-field w-full" placeholder="e.g. 15" value={draft.startingPrice} onChange={e => setDraft({ ...draft, startingPrice: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-sora font-bold text-sm text-navy dark:text-white mb-2">Pricing Page URL</label>
                    <p className="text-xs text-gray-500 mb-2 font-jakarta">Optional: If users can review pricing plans explicitly, paste the exact URL.</p>
                    <input type="url" className="input-field w-full" placeholder="https://yourtool.com/pricing" value={draft.pricingUrl} onChange={e => setDraft({ ...draft, pricingUrl: e.target.value })} />
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-navy dark:text-gray-300 font-jakarta">
                    <input type="checkbox" checked={draft.hasApi} onChange={e => setDraft({ ...draft, hasApi: e.target.checked })} className="w-4 h-4 rounded text-brand border-gray-300 focus:ring-brand" />
                    Has Developer API
                  </label>
                  <label className="flex items-center gap-2 text-sm text-navy dark:text-gray-300 font-jakarta">
                    <input type="checkbox" checked={draft.hasMobileApp} onChange={e => setDraft({ ...draft, hasMobileApp: e.target.checked })} className="w-4 h-4 rounded text-brand border-gray-300 focus:ring-brand" />
                    Has Mobile App
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <label className="block font-sora font-bold text-sm text-navy dark:text-white mb-2">Founder Names <span className="text-red-500">*</span></label>
                    <input type="text" className="input-field w-full" placeholder="John Doe, Jane Smith" value={draft.founderNames} onChange={e => setDraft({ ...draft, founderNames: e.target.value })} />
                  </div>
                  <div>
                    <label className="block font-sora font-bold text-sm text-navy dark:text-white mb-2">Headquarters City</label>
                    <input type="text" className="input-field w-full" placeholder="e.g. Bengaluru, IN" value={draft.hqCity} onChange={e => setDraft({ ...draft, hqCity: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Checkout */}
            {step === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center max-w-lg mx-auto mb-8">
                  <h2 className="font-sora font-bold text-2xl text-navy dark:text-white mb-2 tracking-tight">Select your Listing Tier</h2>
                  <p className="text-gray-500 font-jakarta text-sm">Join the top AI startups getting daily traffic and targeted investor visibility.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-start max-w-5xl mx-auto">

                  {/* Basic Tier */}
                  <div className="flex flex-col border border-gray-200 dark:border-gray-800 rounded-2xl p-6 bg-white dark:bg-gray-900/40 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
                    <h3 className="font-sora font-semibold text-lg text-navy dark:text-white">Basic</h3>
                    <p className="text-xs text-gray-500 font-jakarta mt-1 h-8">Essential directory exposure.</p>
                    <div className="mt-4 mb-6 flex items-baseline gap-1">
                      <span className="font-sora font-extrabold text-3xl text-navy dark:text-white">₹0</span>
                    </div>
                    <ul className="flex-1 space-y-3 font-jakarta text-[13px] text-gray-600 dark:text-gray-400 mb-6 border-t border-gray-100 dark:border-gray-800 pt-6">
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /> <span>Listed in <span className="font-semibold text-gray-900 dark:text-gray-200">/tools</span></span></li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /> <span>Standard review queue (5+ days)</span></li>
                    </ul>
                    {errorMsg && <p className="text-red-500 text-xs mb-3 text-center">{errorMsg}</p>}
                    <button onClick={handleFreeSubmit} disabled={isSubmitting} className="w-full text-sm font-semibold rounded-xl py-2.5 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-navy dark:text-white flex items-center justify-center gap-2 transition-colors">
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Basic'}
                    </button>
                  </div>

                  {/* Priority Tier */}
                  <div className="flex flex-col border-2 border-brand rounded-2xl p-6 bg-white dark:bg-gray-900 relative shadow-xl shadow-brand/5 md:-mt-4">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                      Recommended
                    </div>
                    <h3 className="font-sora font-semibold text-lg text-brand">Priority</h3>
                    <p className="text-xs text-gray-500 font-jakarta mt-1 h-8">Accelerate your growth and traffic.</p>
                    <div className="mt-4 mb-6 flex items-baseline gap-1">
                      <span className="font-sora font-extrabold text-3xl text-navy dark:text-white">₹299</span>
                      <span className="text-gray-400 text-xs font-jakarta lowercase">/once</span>
                    </div>
                    <ul className="flex-1 space-y-3 font-jakarta text-[13px] text-gray-700 dark:text-gray-300 mb-6 border-t border-brand/10 pt-6">
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" /> <span>Pinned to <span className="font-semibold">"Top Rated"</span></span></li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" /> <span><span className="font-semibold">Automated AI Fast-Track</span></span></li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" /> <span>Performance Dashboard</span></li>
                    </ul>
                    <button className="w-full bg-brand hover:bg-brand/90 text-white text-sm font-bold rounded-xl py-2.5 shadow-md shadow-brand/20 transition-all">
                      Checkout Priority
                    </button>
                  </div>

                  {/* Featured Tier */}
                  <div className="flex flex-col border border-gray-200 dark:border-gray-800 rounded-2xl p-6 bg-gray-50 dark:bg-gray-900/80 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
                    <h3 className="font-sora font-semibold text-lg text-indigo-600 dark:text-indigo-400">Featured Partner</h3>
                    <p className="text-xs text-gray-500 font-jakarta mt-1 h-8">Maximum ecosystem dominance.</p>
                    <div className="mt-4 mb-6 flex items-baseline gap-1">
                      <span className="font-sora font-extrabold text-3xl text-navy dark:text-white">₹999</span>
                      <span className="text-gray-400 text-xs font-jakarta lowercase">/once</span>
                    </div>
                    <ul className="flex-1 space-y-3 font-jakarta text-[13px] text-gray-700 dark:text-gray-300 mb-6 border-t border-gray-200 dark:border-gray-800 pt-6">
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" /> <span><span className="font-semibold text-indigo-600 dark:text-indigo-400">Featured Partner</span > rotator in landing page</span></li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" /> <span>Newsletter Highlight</span></li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" /> <span>Priority Support</span></li>
                    </ul>
                    <button className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 text-sm font-bold rounded-xl py-2.5 transition-colors">
                      Become a Partner
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between">
              {step > 1 ? (
                <button onClick={() => setStep(step - 1)} className="btn-secondary px-6">Back</button>
              ) : <div></div>}
              {step < 4 && (
                <button onClick={() => setStep(step + 1)} className="btn-brand px-6">
                  Next Step <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

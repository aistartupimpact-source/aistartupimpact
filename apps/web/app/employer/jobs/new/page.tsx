'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Briefcase } from 'lucide-react';

const JOB_CATEGORIES = [
  { value: 'AI_ENGINEER', label: 'AI Engineer' },
  { value: 'ML_ENGINEER', label: 'ML Engineer' },
  { value: 'LLM_ENGINEER', label: 'LLM Engineer' },
  { value: 'AI_RESEARCH_SCIENTIST', label: 'AI Research Scientist' },
  { value: 'DATA_SCIENTIST', label: 'Data Scientist' },
  { value: 'DATA_ENGINEER', label: 'Data Engineer' },
  { value: 'PROMPT_ENGINEER', label: 'Prompt Engineer' },
  { value: 'AI_PRODUCT_MANAGER', label: 'AI Product Manager' },
  { value: 'AI_DESIGNER', label: 'AI Designer' },
  { value: 'AI_SALES', label: 'AI Sales' },
  { value: 'AI_MARKETING', label: 'AI Marketing' },
  { value: 'AI_DEVREL', label: 'AI DevRel' },
  { value: 'AI_SOLUTIONS_ARCHITECT', label: 'AI Solutions Architect' },
  { value: 'AI_ETHICS', label: 'AI Ethics' },
  { value: 'ROBOTICS_ENGINEER', label: 'Robotics Engineer' },
  { value: 'COMPUTER_VISION', label: 'Computer Vision' },
  { value: 'NLP_ENGINEER', label: 'NLP Engineer' },
  { value: 'AI_INFRASTRUCTURE', label: 'AI Infrastructure' },
  { value: 'OTHER', label: 'Other' },
];

export default function PostJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: 'AI_ENGINEER',
    workType: 'REMOTE',
    location: '',
    city: '',
    country: '',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'USD',
    showSalary: true,
    experienceMin: '',
    experienceMax: '',
    skills: '',
    department: '',
    visaSponsorship: false,
    applicationType: 'INTERNAL',
    applicationUrl: '',
    applicationEmail: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/employer/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          salaryMin: form.salaryMin ? parseInt(form.salaryMin) : null,
          salaryMax: form.salaryMax ? parseInt(form.salaryMax) : null,
          experienceMin: form.experienceMin ? parseInt(form.experienceMin) : null,
          experienceMax: form.experienceMax ? parseInt(form.experienceMax) : null,
          skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to post job');
        return;
      }

      router.push('/employer/jobs');
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/employer/jobs" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </Link>
        <div>
          <h1 className="font-sora font-extrabold text-xl text-navy dark:text-white">Post a Job</h1>
          <p className="text-xs text-gray-500 font-jakarta mt-0.5">Fill in the details to publish your AI job listing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="card p-5 sm:p-6 space-y-4">
          <h2 className="font-sora font-bold text-sm text-navy dark:text-white">Job Details</h2>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Job Title *</label>
            <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Senior LLM Engineer" required className="input-field w-full" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Short Description</label>
            <input type="text" value={form.shortDescription} onChange={e => setForm(p => ({ ...p, shortDescription: e.target.value }))} placeholder="1-2 line summary for listing cards" maxLength={200} className="input-field w-full" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Full Description *</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Detailed job description, requirements, benefits..." required rows={8} className="input-field w-full resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Category *</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input-field w-full">
                {JOB_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Department</label>
              <input type="text" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} placeholder="Engineering" className="input-field w-full" />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card p-5 sm:p-6 space-y-4">
          <h2 className="font-sora font-bold text-sm text-navy dark:text-white">Location</h2>

          <div className="grid grid-cols-3 gap-3">
            {['REMOTE', 'HYBRID', 'ONSITE'].map(type => (
              <button key={type} type="button" onClick={() => setForm(p => ({ ...p, workType: type }))}
                className={`py-2.5 rounded-lg text-sm font-semibold font-jakarta border transition-colors ${form.workType === type ? 'bg-brand text-white border-brand' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
              >
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {form.workType !== 'REMOTE' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">City</label>
                <input type="text" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="San Francisco" className="input-field w-full" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Country</label>
                <input type="text" value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} placeholder="USA" className="input-field w-full" />
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.visaSponsorship} onChange={e => setForm(p => ({ ...p, visaSponsorship: e.target.checked }))} className="rounded border-gray-300" />
            <span className="text-sm text-gray-600 dark:text-gray-300 font-jakarta">Visa sponsorship available</span>
          </label>
        </div>

        {/* Compensation */}
        <div className="card p-5 sm:p-6 space-y-4">
          <h2 className="font-sora font-bold text-sm text-navy dark:text-white">Compensation</h2>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Min Salary</label>
              <input type="number" value={form.salaryMin} onChange={e => setForm(p => ({ ...p, salaryMin: e.target.value }))} placeholder="120000" className="input-field w-full" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Max Salary</label>
              <input type="number" value={form.salaryMax} onChange={e => setForm(p => ({ ...p, salaryMax: e.target.value }))} placeholder="180000" className="input-field w-full" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Currency</label>
              <select value={form.salaryCurrency} onChange={e => setForm(p => ({ ...p, salaryCurrency: e.target.value }))} className="input-field w-full">
                <option value="USD">USD</option>
                <option value="INR">INR</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.showSalary} onChange={e => setForm(p => ({ ...p, showSalary: e.target.checked }))} className="rounded border-gray-300" />
            <span className="text-sm text-gray-600 dark:text-gray-300 font-jakarta">Show salary on listing</span>
          </label>
        </div>

        {/* Experience & Skills */}
        <div className="card p-5 sm:p-6 space-y-4">
          <h2 className="font-sora font-bold text-sm text-navy dark:text-white">Requirements</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Min Experience (years)</label>
              <input type="number" value={form.experienceMin} onChange={e => setForm(p => ({ ...p, experienceMin: e.target.value }))} placeholder="2" min="0" className="input-field w-full" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Max Experience (years)</label>
              <input type="number" value={form.experienceMax} onChange={e => setForm(p => ({ ...p, experienceMax: e.target.value }))} placeholder="8" min="0" className="input-field w-full" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Skills (comma-separated)</label>
            <input type="text" value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} placeholder="Python, PyTorch, LLMs, Transformers" className="input-field w-full" />
          </div>
        </div>

        {/* Application Method */}
        <div className="card p-5 sm:p-6 space-y-4">
          <h2 className="font-sora font-bold text-sm text-navy dark:text-white">How to Apply</h2>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setForm(p => ({ ...p, applicationType: 'INTERNAL' }))}
              className={`py-2.5 rounded-lg text-sm font-semibold font-jakarta border transition-colors ${form.applicationType === 'INTERNAL' ? 'bg-brand text-white border-brand' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600'}`}>
              Apply on Platform
            </button>
            <button type="button" onClick={() => setForm(p => ({ ...p, applicationType: 'EXTERNAL' }))}
              className={`py-2.5 rounded-lg text-sm font-semibold font-jakarta border transition-colors ${form.applicationType === 'EXTERNAL' ? 'bg-brand text-white border-brand' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600'}`}>
              External Link / Email
            </button>
          </div>

          {form.applicationType === 'EXTERNAL' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Application URL</label>
                <input type="url" value={form.applicationUrl} onChange={e => setForm(p => ({ ...p, applicationUrl: e.target.value }))} placeholder="https://company.com/careers/job-123" className="input-field w-full" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Or Application Email</label>
                <input type="email" value={form.applicationEmail} onChange={e => setForm(p => ({ ...p, applicationEmail: e.target.value }))} placeholder="hiring@company.com" className="input-field w-full" />
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/employer/jobs" className="px-5 py-2.5 text-sm font-semibold font-jakarta text-gray-600 hover:text-gray-800">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="btn-brand flex items-center gap-2 px-6 py-2.5 text-sm disabled:opacity-50">
            <Briefcase className="w-4 h-4" />
            {loading ? 'Publishing...' : 'Publish Job'}
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [consent, setConsent] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedinUrl: '',
    portfolioUrl: '',
    githubUrl: '',
    resumeUrl: '',
    coverLetter: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!consent) {
      setError('Please agree to the privacy policy to submit your application.');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`/api/jobs/${slug}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, consent: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit application');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white mb-2">Application Submitted!</h1>
        <p className="text-sm text-gray-500 font-jakarta mb-6">
          Your application has been sent to the employer. They will review it and get back to you.
        </p>
        <Link href="/jobs" className="btn-brand text-sm px-5 py-2.5">Browse More Jobs</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/jobs/${slug}`} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </Link>
        <div>
          <h1 className="font-sora font-extrabold text-xl text-navy dark:text-white">Apply for this Position</h1>
          <p className="text-xs text-gray-500 font-jakarta mt-0.5">Fill in your details to submit your application</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-400">{error}</div>
        )}

        <div className="card p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Full Name *</label>
              <input type="text" value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} required className="input-field w-full" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required className="input-field w-full" placeholder="john@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Phone</label>
            <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="input-field w-full" placeholder="+91 9876543210" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Resume URL *</label>
            <input type="url" value={form.resumeUrl} onChange={e => setForm(p => ({ ...p, resumeUrl: e.target.value }))} required className="input-field w-full" placeholder="https://drive.google.com/..." />
            <p className="text-xs text-gray-400 font-jakarta mt-1">Link to your resume (Google Drive, Dropbox, or personal site)</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">LinkedIn</label>
              <input type="url" value={form.linkedinUrl} onChange={e => setForm(p => ({ ...p, linkedinUrl: e.target.value }))} className="input-field w-full" placeholder="https://linkedin.com/in/..." />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">GitHub</label>
              <input type="url" value={form.githubUrl} onChange={e => setForm(p => ({ ...p, githubUrl: e.target.value }))} className="input-field w-full" placeholder="https://github.com/..." />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Portfolio</label>
            <input type="url" value={form.portfolioUrl} onChange={e => setForm(p => ({ ...p, portfolioUrl: e.target.value }))} className="input-field w-full" placeholder="https://yoursite.com" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Cover Letter</label>
            <textarea value={form.coverLetter} onChange={e => setForm(p => ({ ...p, coverLetter: e.target.value }))} rows={5} className="input-field w-full resize-none" placeholder="Why are you a great fit for this role?" />
          </div>
        </div>

        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5 rounded border-gray-300" required />
          <span className="text-xs text-gray-500 dark:text-gray-400">I agree that my personal data will be processed for this job application in accordance with the <Link href="/privacy" className="text-brand hover:underline" target="_blank">Privacy Policy</Link>.</span>
        </label>

        <div className="flex justify-end">
          <button type="submit" disabled={loading || !consent} className="btn-brand flex items-center gap-2 px-6 py-3 text-sm disabled:opacity-50">
            <Send className="w-4 h-4" />
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}

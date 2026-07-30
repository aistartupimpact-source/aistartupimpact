'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`/api/employer/jobs/${jobId}`)
      .then(r => r.json())
      .then(data => {
        if (data.job) setForm(data.job);
        else setError('Job not found');
      })
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`/api/employer/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) setMessage('Job updated successfully');
      else {
        const data = await res.json();
        setError(data.error || 'Failed to update');
      }
    } catch {
      setError('Something went wrong');
    }
    setSaving(false);
  };

  const handleDeactivate = async () => {
    if (!confirm('Deactivate this job? It will be hidden from the public.')) return;
    try {
      await fetch(`/api/employer/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      });
      router.push('/employer/jobs');
    } catch {}
  };

  if (loading) return <div className="p-10 text-center text-gray-400 font-jakarta">Loading...</div>;
  if (!form) return <div className="p-10 text-center text-red-500 font-jakarta">{error || 'Job not found'}</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/employer/jobs" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </Link>
          <div>
            <h1 className="font-sora font-extrabold text-xl text-navy dark:text-white">Edit Job</h1>
            <p className="text-xs text-gray-500 font-jakarta mt-0.5">{form.title}</p>
          </div>
        </div>
        <button onClick={handleDeactivate} className="text-xs text-red-500 font-semibold hover:text-red-700 flex items-center gap-1">
          <Trash2 className="w-3.5 h-3.5" /> Deactivate
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-400">{error}</div>}
        {message && <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-700 dark:text-green-400">{message}</div>}

        <div className="card p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Job Title</label>
            <input type="text" value={form.title || ''} onChange={e => setForm((p: any) => ({ ...p, title: e.target.value }))} className="input-field w-full" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Short Description</label>
            <input type="text" value={form.shortDescription || ''} onChange={e => setForm((p: any) => ({ ...p, shortDescription: e.target.value }))} className="input-field w-full" maxLength={200} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Full Description</label>
            <textarea value={form.description || ''} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))} rows={8} className="input-field w-full resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Min Salary</label>
              <input type="number" value={form.salaryMin || ''} onChange={e => setForm((p: any) => ({ ...p, salaryMin: e.target.value ? parseInt(e.target.value) : null }))} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Max Salary</label>
              <input type="number" value={form.salaryMax || ''} onChange={e => setForm((p: any) => ({ ...p, salaryMax: e.target.value ? parseInt(e.target.value) : null }))} className="input-field w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Skills (comma-separated)</label>
            <input type="text" value={(form.skills || []).join(', ')} onChange={e => setForm((p: any) => ({ ...p, skills: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) }))} className="input-field w-full" />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-brand flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

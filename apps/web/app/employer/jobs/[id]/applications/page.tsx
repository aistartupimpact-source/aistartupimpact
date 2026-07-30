'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Star, ExternalLink, FileText, Linkedin, Github } from 'lucide-react';
import { clsx } from 'clsx';

const STATUS_COLORS: Record<string, string> = {
  APPLIED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  REVIEWED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  SHORTLISTED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  INTERVIEW: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  OFFER: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  HIRED: 'bg-brand/10 text-brand',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const STATUSES = ['APPLIED', 'REVIEWED', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'];

export default function JobApplicationsPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [applications, setApplications] = useState<any[]>([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/employer/jobs/${jobId}/applications`)
      .then(r => r.json())
      .then(data => {
        setApplications(data.applications || []);
        setJobTitle(data.jobTitle || '');
      })
      .finally(() => setLoading(false));
  }, [jobId]);

  const updateStatus = async (appId: string, status: string) => {
    setUpdating(appId);
    try {
      const res = await fetch(`/api/employer/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      }
    } catch {}
    setUpdating(null);
  };

  if (loading) return <div className="p-10 text-center text-gray-400 font-jakarta">Loading applications...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/employer/jobs" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </Link>
        <div>
          <h1 className="font-sora font-extrabold text-xl text-navy dark:text-white">Applications</h1>
          <p className="text-xs text-gray-500 font-jakarta mt-0.5">{jobTitle} — {applications.length} applicant{applications.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="card p-10 text-center">
          <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-sm text-gray-500 font-jakarta">No applications received yet for this job.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app: any) => (
            <div key={app.id} className="card p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                {/* Candidate info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-sora font-bold text-sm text-navy dark:text-white">{app.fullName}</h3>
                    <span className={clsx('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded', STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-500')}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-jakarta">{app.email}</p>
                  {app.phone && <p className="text-xs text-gray-400 font-jakarta mt-0.5">{app.phone}</p>}

                  {/* Links */}
                  <div className="flex items-center gap-3 mt-2">
                    {app.resumeUrl && (
                      <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-brand font-semibold hover:underline">
                        <FileText className="w-3 h-3" /> Resume
                      </a>
                    )}
                    {app.linkedinUrl && (
                      <a href={app.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        <Linkedin className="w-3 h-3" /> LinkedIn
                      </a>
                    )}
                    {app.githubUrl && (
                      <a href={app.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-gray-600 hover:underline">
                        <Github className="w-3 h-3" /> GitHub
                      </a>
                    )}
                    {app.portfolioUrl && (
                      <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-gray-600 hover:underline">
                        <ExternalLink className="w-3 h-3" /> Portfolio
                      </a>
                    )}
                  </div>

                  {app.coverLetter && (
                    <p className="text-xs text-gray-400 font-jakarta mt-2 line-clamp-2 italic">
                      &ldquo;{app.coverLetter}&rdquo;
                    </p>
                  )}
                </div>

                {/* Status dropdown */}
                <div className="shrink-0">
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app.id, e.target.value)}
                    disabled={updating === app.id}
                    className="text-xs font-jakarta border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 disabled:opacity-50"
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-400 font-jakarta mt-1 text-right">
                    {new Date(app.appliedAt + 'Z').toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

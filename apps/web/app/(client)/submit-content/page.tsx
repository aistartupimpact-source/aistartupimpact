'use client';

import { useState } from 'react';
import {
  FileEdit, Plus, Upload, Send, Save, Edit3, Trash2, X,
  CheckCircle, Clock, AlertCircle, Eye,
} from 'lucide-react';

interface Submission {
  id: string; title: string; subtitle: string; body: string;
  category: string; targetPlacement: string; status: string;
  submittedAt: string; views: number;
}

const categories = ['Founder Story', 'Funding News', 'Product Launch', 'Deep Dive', 'Opinion', 'Case Study'];
const placements = ['Hero Cover Story', 'Breaking Ticker', 'Latest Stories Card', 'Newsletter Featured', 'Funding Digest', 'No Preference'];

const initialSubmissions: Submission[] = [
  { id: '1', title: 'Sarvam AI — Series A Deep Dive: Building India\'s Language AI', subtitle: 'How Vivek Raghavan is reimagining NLP for Indian languages', body: 'Full article body content here...', category: 'Founder Story', targetPlacement: 'Hero Cover Story', status: 'PUBLISHED', submittedAt: 'Mar 2, 2025', views: 15420 },
  { id: '2', title: 'Sarvam AI\'s $41M Series A: What It Means for India\'s AI Stack', subtitle: 'Breaking down the landmark round and its implications', body: '', category: 'Funding News', targetPlacement: 'Breaking Ticker', status: 'PUBLISHED', submittedAt: 'Mar 1, 2025', views: 9200 },
  { id: '3', title: 'How We Built Sarvam\'s Indic Language Pipeline', subtitle: 'A technical deep dive into our multilingual architecture', body: '', category: 'Deep Dive', targetPlacement: 'Latest Stories Card', status: 'UNDER_REVIEW', submittedAt: 'Mar 7, 2025', views: 0 },
  { id: '4', title: 'Behind the Scenes: Sarvam AI\'s Data Strategy', subtitle: '', body: '', category: 'Case Study', targetPlacement: 'No Preference', status: 'DRAFT', submittedAt: 'Mar 8, 2025', views: 0 },
];

const statusColors: Record<string, string> = {
  PUBLISHED: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  UNDER_REVIEW: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  APPROVED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  REJECTED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

const statusIcons: Record<string, typeof CheckCircle> = {
  PUBLISHED: CheckCircle, UNDER_REVIEW: Clock, APPROVED: CheckCircle, DRAFT: FileEdit, REJECTED: AlertCircle,
};

const emptySubmission: Submission = { id: '', title: '', subtitle: '', body: '', category: 'Founder Story', targetPlacement: 'No Preference', status: 'DRAFT', submittedAt: '', views: 0 };

export default function SubmitContentPage() {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Submission | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openCreate = () => { setEditing({ ...emptySubmission, id: Date.now().toString() }); setModalOpen(true); };
  const openEdit = (s: Submission) => { if (s.status === 'DRAFT' || s.status === 'REJECTED') { setEditing({ ...s }); setModalOpen(true); } };

  const handleSaveDraft = () => {
    if (!editing) return;
    const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const saved = { ...editing, status: 'DRAFT', submittedAt: editing.submittedAt || now };
    const exists = submissions.find(s => s.id === saved.id);
    if (exists) setSubmissions(submissions.map(s => s.id === saved.id ? saved : s));
    else setSubmissions([saved, ...submissions]);
    setModalOpen(false); setEditing(null);
  };

  const handleSubmit = () => {
    if (!editing) return;
    const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const submitted = { ...editing, status: 'UNDER_REVIEW', submittedAt: now };
    const exists = submissions.find(s => s.id === submitted.id);
    if (exists) setSubmissions(submissions.map(s => s.id === submitted.id ? submitted : s));
    else setSubmissions([submitted, ...submissions]);
    setModalOpen(false); setEditing(null);
  };

  const handleDelete = (id: string) => { setSubmissions(submissions.filter(s => s.id !== id)); setDeleteConfirm(null); };

  const published = submissions.filter(s => s.status === 'PUBLISHED').length;
  const underReview = submissions.filter(s => s.status === 'UNDER_REVIEW').length;
  const drafts = submissions.filter(s => s.status === 'DRAFT').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Submit Content</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">Write and submit articles for publishing on AIStartupImpact</p>
        </div>
        <button onClick={openCreate} className="btn-brand text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> New Submission</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 text-center">
          <p className="font-sora font-extrabold text-xl text-green-600 dark:text-green-400">{published}</p>
          <p className="text-xs text-gray-400 font-jakarta mt-1">Published</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 text-center">
          <p className="font-sora font-extrabold text-xl text-yellow-600 dark:text-yellow-400">{underReview}</p>
          <p className="text-xs text-gray-400 font-jakarta mt-1">Under Review</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 text-center">
          <p className="font-sora font-extrabold text-xl text-gray-600 dark:text-gray-300">{drafts}</p>
          <p className="text-xs text-gray-400 font-jakarta mt-1">Drafts</p>
        </div>
      </div>

      <div className="space-y-3">
        {submissions.map((s) => {
          const StatusIcon = statusIcons[s.status] || Clock;
          const canEdit = s.status === 'DRAFT' || s.status === 'REJECTED';
          return (
            <div key={s.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 hover:border-brand/30 transition-colors group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-sora font-bold text-sm text-navy dark:text-white">{s.title}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[s.status]}`}>
                      <StatusIcon className="w-3 h-3" />{s.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {s.subtitle && <p className="text-xs text-gray-400 font-jakarta mt-1">{s.subtitle}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="badge-category text-[10px]">{s.category}</span>
                    <span className="text-xs text-gray-400 font-jakarta">{s.submittedAt}</span>
                    <span className="text-xs text-gray-400 font-jakarta">→ {s.targetPlacement}</span>
                    {s.views > 0 && <span className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center gap-1"><Eye className="w-3 h-3" /> {s.views.toLocaleString()} views</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {canEdit && <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><Edit3 className="w-3.5 h-3.5 text-gray-400" /></button>}
                  {canEdit && <button onClick={() => setDeleteConfirm(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" /></button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && editing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-sora font-bold text-lg text-navy dark:text-white">{submissions.find(s => s.id === editing.id) ? 'Edit Submission' : 'New Content Submission'}</h2>
              <button onClick={() => { setModalOpen(false); setEditing(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Title *</label>
                <input type="text" className="input-field text-sm" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Your headline..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Subtitle</label>
                <input type="text" className="input-field text-sm" value={editing.subtitle} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} placeholder="Brief description..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Category</label>
                  <select className="input-field text-sm" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>{categories.map(c => <option key={c}>{c}</option>)}</select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Target Placement</label>
                  <select className="input-field text-sm" value={editing.targetPlacement} onChange={(e) => setEditing({ ...editing, targetPlacement: e.target.value })}>{placements.map(p => <option key={p}>{p}</option>)}</select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Featured Image</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-brand transition-colors">
                  <Upload className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 font-jakarta">Click to upload cover image (16:9 recommended)</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Article Body *</label>
                <textarea className="input-field text-sm" rows={8} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} placeholder="Write your article content here... Supports markdown formatting." />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => { setModalOpen(false); setEditing(null); }} className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={handleSaveDraft} disabled={!editing.title} className="px-4 py-2.5 text-sm font-semibold border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center gap-2 disabled:opacity-50"><Save className="w-4 h-4" /> Save Draft</button>
              <button onClick={handleSubmit} disabled={!editing.title || !editing.body} className="btn-brand text-sm flex items-center gap-2 disabled:opacity-50"><Send className="w-4 h-4" /> Submit for Review</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-sora font-bold text-lg text-navy dark:text-white">Delete Submission?</h3>
            <p className="text-sm text-gray-500 font-jakarta mt-1">This action cannot be undone.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

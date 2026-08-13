'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Download, Loader2 } from 'lucide-react';

export default function EmployerSettingsPage() {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleExport = async () => {
    setExporting(true); setError('');
    try {
      const res = await fetch('/api/employer/export-data');
      if (!res.ok) { setError('Failed to export data'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `aistartupimpact-employer-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click(); URL.revokeObjectURL(url);
      setSuccess('Data exported successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to export data'); } finally { setExporting(false); }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (deleteConfirmation !== 'DELETE') { setError('Please type DELETE to confirm'); return; }
    if (!deletePassword) { setError('Password is required'); return; }
    setDeleting(true);
    try {
      const res = await fetch('/api/employer/delete-account', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Account deleted. Redirecting...');
        setTimeout(() => router.push('/'), 2000);
      } else { setError(data.error || 'Failed to delete account'); setDeleting(false); }
    } catch { setError('Failed to delete account'); setDeleting(false); }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-5 h-5 text-brand" />
        <h1 className="font-sora font-extrabold text-xl text-navy dark:text-white">Settings</h1>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2.5 rounded-lg text-sm font-jakarta bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 px-4 py-2.5 rounded-lg text-sm font-jakarta bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
          {success}
        </div>
      )}

      <div className="card p-5 sm:p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Email</label>
          <p className="text-[11px] text-gray-400 font-jakarta mt-1">Contact support to change your email</p>
        </div>

        {/* Data & Privacy */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <h3 className="font-sora font-bold text-sm text-navy dark:text-white mb-3">Data & Privacy</h3>
          <p className="text-xs text-gray-500 font-jakarta mb-3">
            Under the DPDP Act, you have the right to access and export your personal data, or delete your account entirely.
          </p>

          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-sm font-medium text-navy dark:text-white font-jakarta">Export your data</p>
              <p className="text-xs text-gray-500 font-jakarta">Download company profile, job listings, and applications as JSON</p>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              {exporting ? 'Exporting...' : 'Download'}
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <h3 className="font-sora font-bold text-sm text-red-600 dark:text-red-400 mb-3">Danger Zone</h3>
          <p className="text-xs text-gray-500 font-jakarta mb-3">
            Deleting your account will remove all your job listings and application data permanently.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-sm font-semibold text-red-600 hover:text-red-700 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-red-200 dark:border-red-800">
            <button
              onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteConfirmation(''); setError(''); }}
              className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
            </button>

            <div className="text-center mb-5">
              <div className="w-11 h-11 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
              </div>
              <h3 className="font-semibold text-lg text-red-600 dark:text-red-400 mb-1">Delete Employer Account</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">This action cannot be undone.</p>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
              <p className="text-xs text-red-800 dark:text-red-300 font-semibold mb-1">This will permanently delete:</p>
              <ul className="text-xs text-red-700 dark:text-red-400 space-y-0.5 list-disc list-inside">
                <li>Your company profile</li>
                <li>All job listings</li>
                <li>All applications received</li>
                <li>Newsletter subscription</li>
              </ul>
            </div>

            <form onSubmit={handleDelete} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Enter your password</label>
                <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} required placeholder="Your account password" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-jakarta" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type <span className="font-bold text-red-600">DELETE</span> to confirm</label>
                <input type="text" value={deleteConfirmation} onChange={(e) => setDeleteConfirmation(e.target.value)} required placeholder="DELETE" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-jakarta" />
              </div>
              <button type="submit" disabled={deleting || deleteConfirmation !== 'DELETE' || !deletePassword} className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {deleting ? 'Deleting Account...' : 'Delete My Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

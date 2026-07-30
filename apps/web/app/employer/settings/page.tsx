import { getEmployerSession } from '@/lib/employer-auth';
import { redirect } from 'next/navigation';
import { Settings } from 'lucide-react';

export default async function EmployerSettingsPage() {
  const session = await getEmployerSession();
  if (!session) redirect('/employer/login');

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-5 h-5 text-brand" />
        <h1 className="font-sora font-extrabold text-xl text-navy dark:text-white">Settings</h1>
      </div>

      <div className="card p-5 sm:p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Email</label>
          <input type="email" value={session.email} disabled className="input-field w-full bg-gray-50 dark:bg-gray-800 cursor-not-allowed" />
          <p className="text-[11px] text-gray-400 font-jakarta mt-1">Contact support to change your email</p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta mb-1.5">Plan</label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-navy dark:text-white font-jakarta">{session.plan}</span>
            <a href="/employer/promote" className="text-brand text-xs font-semibold hover:underline">Upgrade →</a>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <h3 className="font-sora font-bold text-sm text-navy dark:text-white mb-3">Danger Zone</h3>
          <p className="text-xs text-gray-500 font-jakarta mb-3">
            Deleting your account will remove all your job listings and application data permanently.
          </p>
          <button className="text-sm font-semibold text-red-600 hover:text-red-700 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

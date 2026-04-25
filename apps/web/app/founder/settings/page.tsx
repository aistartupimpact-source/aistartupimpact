import { requireFounderAuth } from '@/lib/founder-auth';
import { Settings as SettingsIcon, Bell, Lock, Eye, Mail } from 'lucide-react';

export default async function SettingsPage() {
  const session = await requireFounderAuth();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account preferences and security settings
        </p>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage how you receive notifications
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates via email</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 text-brand rounded focus:ring-brand" />
          </label>

          <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Submission Updates</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when your submissions are reviewed</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 text-brand rounded focus:ring-brand" />
          </label>

          <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Analytics Reports</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Weekly performance summaries</p>
            </div>
            <input type="checkbox" className="w-5 h-5 text-brand rounded focus:ring-brand" />
          </label>
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Privacy
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Control your profile visibility
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Public Profile</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Make your profile visible to others</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 text-brand rounded focus:ring-brand" />
          </label>

          <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Show Email</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Display email on public listings</p>
            </div>
            <input type="checkbox" className="w-5 h-5 text-brand rounded focus:ring-brand" />
          </label>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Security
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your account security
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <p className="font-medium text-gray-900 dark:text-white">Change Password</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Update your password</p>
          </button>

          <button className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Add an extra layer of security</p>
          </button>

          <button className="w-full text-left p-4 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <p className="font-medium text-red-600 dark:text-red-400">Delete Account</p>
            <p className="text-sm text-red-600/70 dark:text-red-400/70 mt-1">Permanently delete your account and data</p>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
              Need Help?
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Contact our support team at support@aistartupimpact.com for assistance with your account settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

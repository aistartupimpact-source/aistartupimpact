import { requireFounderAuth } from '@/lib/founder-auth';
import SecuritySection from './SecuritySection';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const session = await requireFounderAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage your account preferences and security settings
        </p>
      </div>

      {/* Notifications & Privacy */}
      <SettingsClient />

      {/* Security */}
      <SecuritySection />
    </div>
  );
}

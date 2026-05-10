'use client';

import { useState, useEffect } from 'react';
import { Bell, Eye, Mail } from 'lucide-react';
import Toggle from '@/components/Toggle';
import Toast from '@/components/Toast';

type ToastType = {
  type: 'success' | 'error' | 'info';
  message: string;
} | null;

interface SettingsData {
  emailNotifications: boolean;
  submissionUpdates: boolean;
  analyticsReports: boolean;
  publicProfile: boolean;
  showEmail: boolean;
}

export default function SettingsClient() {
  const [settings, setSettings] = useState<SettingsData>({
    emailNotifications: true,
    submissionUpdates: true,
    analyticsReports: false,
    publicProfile: true,
    showEmail: false,
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastType>(null);

  // Load settings from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/founder/settings');
        const data = await res.json();
        
        if (data.success) {
          setSettings(data.settings);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    
    loadSettings();
  }, []);

  const handleToggle = async (key: keyof SettingsData, value: boolean) => {
    // Optimistic update
    const previousSettings = { ...settings };
    setSettings(prev => ({ ...prev, [key]: value }));
    setLoading(true);

    try {
      const res = await fetch('/api/founder/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });

      const data = await res.json();

      if (data.success) {
        setToast({
          type: 'success',
          message: '✅ Settings updated successfully'
        });
      } else {
        // Revert on error
        setSettings(previousSettings);
        setToast({
          type: 'error',
          message: data.error || 'Failed to update settings'
        });
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      // Revert on error
      setSettings(previousSettings);
      setToast({
        type: 'error',
        message: 'Failed to update settings. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-400" />
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Notifications
              </h2>
            </div>
          </div>
        </div>
        <div className="p-4">

          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800 last:border-0">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Receive updates via email</p>
              </div>
              <Toggle
                enabled={settings.emailNotifications}
                onChange={(value) => handleToggle('emailNotifications', value)}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800 last:border-0">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Submission Updates</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Get notified when your submissions are reviewed</p>
              </div>
              <Toggle
                enabled={settings.submissionUpdates}
                onChange={(value) => handleToggle('submissionUpdates', value)}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800 last:border-0">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Analytics Reports</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Weekly performance summaries</p>
              </div>
              <Toggle
                enabled={settings.analyticsReports}
                onChange={(value) => handleToggle('analyticsReports', value)}
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-400" />
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Privacy
              </h2>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800 last:border-0">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Public Profile</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Make your profile visible to others</p>
              </div>
              <Toggle
                enabled={settings.publicProfile}
                onChange={(value) => handleToggle('publicProfile', value)}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800 last:border-0">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Show Email</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Display email on public listings</p>
              </div>
              <Toggle
                enabled={settings.showEmail}
                onChange={(value) => handleToggle('showEmail', value)}
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Need Help?
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Contact our support team at support@aistartupimpact.com for assistance with your account settings.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

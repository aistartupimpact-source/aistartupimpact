'use client';

import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface StatFormProps {
  action: (formData: FormData) => Promise<void>;
  initialData?: {
    metricKey: string;
    metricLabel: string;
    metricValue: string;
    metricChange?: string | null;
    metricIcon?: string | null;
    displayOrder?: number | null;
    isActive?: boolean | null;
  };
}

export default function StatForm({ action, initialData }: StatFormProps) {
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  return (
    <form action={action} className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 font-jakarta">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 font-sora">
            Statistic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Metric Key * (Unique identifier, e.g. total_startups)
              </label>
              <input
                type="text"
                name="metricKey"
                defaultValue={initialData?.metricKey}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="e.g. total_startups"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Label * (Display name, e.g. Total Startups)
              </label>
              <input
                type="text"
                name="metricLabel"
                defaultValue={initialData?.metricLabel}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="e.g. Total Startups"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Value * (e.g. 3,247+)
              </label>
              <input
                type="text"
                name="metricValue"
                defaultValue={initialData?.metricValue}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="e.g. 3,247+"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Change / Trend (Optional, e.g. +12% YoY)
              </label>
              <input
                type="text"
                name="metricChange"
                defaultValue={initialData?.metricChange ?? ''}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="e.g. +12% YoY"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Icon *
              </label>
              <select
                name="metricIcon"
                defaultValue={initialData?.metricIcon ?? 'rocket'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="rocket">Rocket</option>
                <option value="currency">Rupee / Currency</option>
                <option value="users">Users / Group</option>
                <option value="trophy">Trophy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Order (e.g. 1, 2, 3...)
              </label>
              <input
                type="number"
                name="displayOrder"
                defaultValue={initialData?.displayOrder ?? 0}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="e.g. 0"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active (display on the live dashboard)
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link
          href="/india-ai/stats"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel
        </Link>
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
        >
          <Save className="w-4 h-4" />
          Save Stat
        </button>
      </div>
    </form>
  );
}

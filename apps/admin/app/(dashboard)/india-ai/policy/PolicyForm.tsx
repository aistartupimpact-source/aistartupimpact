'use client';

import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface PolicyFormProps {
  action: (formData: FormData) => Promise<void>;
  initialData?: {
    title: string;
    source: string;
    date: Date;
    excerpt: string;
    link: string;
    category: string;
    impact: string;
    displayOrder: number;
    isActive: boolean;
  };
}

export default function PolicyForm({ action, initialData }: PolicyFormProps) {
  return (
    <form action={action} className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Policy Update Information
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              defaultValue={initialData?.title}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="MeitY Releases Draft AI Ethics Framework..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Source *
              </label>
              <select
                name="source"
                defaultValue={initialData?.source || 'MeitY'}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="MeitY">MeitY</option>
                <option value="NITI Aayog">NITI Aayog</option>
                <option value="Data Protection">Data Protection</option>
                <option value="AI Safety">AI Safety</option>
                <option value="Court">Court</option>
                <option value="Parliament">Parliament</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                name="category"
                defaultValue={initialData?.category || 'Policy'}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="Policy">Policy</option>
                <option value="Regulation">Regulation</option>
                <option value="Funding">Funding</option>
                <option value="Legal">Legal</option>
                <option value="Standards">Standards</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Impact *
              </label>
              <select
                name="impact"
                defaultValue={initialData?.impact || 'Medium'}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date *
              </label>
              <input
                type="date"
                name="date"
                defaultValue={initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : ''}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Link *
              </label>
              <input
                type="url"
                name="link"
                defaultValue={initialData?.link}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="https://meity.gov.in/..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Excerpt *
            </label>
            <textarea
              name="excerpt"
              defaultValue={initialData?.excerpt}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="Brief summary of the policy update..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Order
              </label>
              <input
                type="number"
                name="displayOrder"
                defaultValue={initialData?.displayOrder || 0}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Lower numbers appear first
              </p>
            </div>

            <div className="flex items-center pt-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={initialData?.isActive !== false}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active (visible on website)
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/india-ai/policy"
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel
        </Link>
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Update
        </button>
      </div>
    </form>
  );
}

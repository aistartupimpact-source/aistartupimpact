'use client';

import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface FounderFormProps {
  action: (formData: FormData) => Promise<void>;
  initialData?: any;
}

export default function FounderForm({ action, initialData }: FounderFormProps) {
  return (
    <form action={action} className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Founder Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Founder Name *
              </label>
              <input
                type="text"
                name="name"
                defaultValue={initialData?.name}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="Rahul Sharma"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Startup Name *
              </label>
              <input
                type="text"
                name="startupName"
                defaultValue={initialData?.startupName}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="Acme AI"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                name="category"
                defaultValue={initialData?.category || 'Featured'}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="Featured">Featured (This Week)</option>
                <option value="Hall of Fame">Hall of Fame (Most Successful)</option>
                <option value="Rising Star">Rising Star (₹10K placement)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Startup Slug (optional)
              </label>
              <input
                type="text"
                name="startupSlug"
                defaultValue={initialData?.startupSlug || ''}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="acme-ai"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Link to startup profile (if exists)
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Photo URL
            </label>
            <input
              type="url"
              name="photoUrl"
              defaultValue={initialData?.photoUrl || ''}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bio *
            </label>
            <textarea
              name="bio"
              defaultValue={initialData?.bio}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="Brief biography of the founder..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Achievement *
            </label>
            <textarea
              name="achievement"
              defaultValue={initialData?.achievement}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="Key achievements and milestones..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Funding Raised
              </label>
              <input
                type="text"
                name="fundingRaised"
                defaultValue={initialData?.fundingRaised || ''}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="₹50 Cr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                LinkedIn URL
              </label>
              <input
                type="url"
                name="linkedinUrl"
                defaultValue={initialData?.linkedinUrl || ''}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Twitter URL
              </label>
              <input
                type="url"
                name="twitterUrl"
                defaultValue={initialData?.twitterUrl || ''}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="https://twitter.com/..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Story URL
            </label>
            <input
              type="url"
              name="storyUrl"
              defaultValue={initialData?.storyUrl || ''}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="https://aistartupimpact.com/stories/..."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Link to full founder story article
            </p>
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

      <div className="flex items-center justify-between">
        <Link
          href="/india-ai/founders"
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
          Save Founder
        </button>
      </div>
    </form>
  );
}

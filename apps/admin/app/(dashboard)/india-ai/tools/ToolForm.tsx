'use client';

import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface ToolFormProps {
  action: (formData: FormData) => Promise<void>;
  initialData?: any;
}

export default function ToolForm({ action, initialData }: ToolFormProps) {
  return (
    <form action={action} className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tool Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                defaultValue={initialData?.name}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="Sarvam AI"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                name="category"
                defaultValue={initialData?.category || 'LLM'}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="LLM">LLM/Foundation Models</option>
                <option value="Conversational AI">Conversational AI</option>
                <option value="Vision AI">Vision AI</option>
                <option value="NLP">NLP Tools</option>
                <option value="Enterprise AI">Enterprise AI</option>
                <option value="Healthcare AI">Healthcare AI</option>
                <option value="FinTech AI">FinTech AI</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tagline *
            </label>
            <input
              type="text"
              name="tagline"
              defaultValue={initialData?.tagline}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="India's first full-stack AI platform"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              defaultValue={initialData?.description}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="Detailed description of the AI tool..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Logo URL
              </label>
              <input
                type="url"
                name="logoUrl"
                defaultValue={initialData?.logoUrl || ''}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website URL *
              </label>
              <input
                type="url"
                name="websiteUrl"
                defaultValue={initialData?.websiteUrl}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Founded Year
              </label>
              <input
                type="number"
                name="foundedYear"
                defaultValue={initialData?.foundedYear || ''}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="2023"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Funding Status
              </label>
              <input
                type="text"
                name="fundingStatus"
                defaultValue={initialData?.fundingStatus || ''}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="Seed, Series A, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Funding
              </label>
              <input
                type="text"
                name="totalFunding"
                defaultValue={initialData?.totalFunding || ''}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="₹10 Cr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Team Size
              </label>
              <input
                type="text"
                name="teamSize"
                defaultValue={initialData?.teamSize || ''}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="50-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Headquarters
            </label>
            <input
              type="text"
              name="headquarters"
              defaultValue={initialData?.headquarters || ''}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="Bangalore, India"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Key Features (one per line)
            </label>
            <textarea
              name="features"
              defaultValue={initialData?.features?.join('\n')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
              placeholder="Multilingual support&#10;Low-latency inference&#10;Custom model training"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter each feature on a new line
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Use Cases (one per line)
            </label>
            <textarea
              name="useCases"
              defaultValue={initialData?.useCases?.join('\n')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
              placeholder="Customer support automation&#10;Content generation&#10;Data analysis"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter each use case on a new line
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  name="isFeatured"
                  defaultChecked={initialData?.isFeatured}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Featured (₹25K/month)
                </span>
              </label>
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
          href="/india-ai/tools"
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
          Save Tool
        </button>
      </div>
    </form>
  );
}

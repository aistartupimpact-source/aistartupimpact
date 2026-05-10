import { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Edit, ExternalLink } from 'lucide-react';
import { neon } from '@neondatabase/serverless';
import { DeleteButton } from '../components/DeleteButton';

const sql = neon(process.env.DATABASE_URL!);

export const metadata: Metadata = {
  title: 'Policy Updates | Admin',
};

export default async function PolicyUpdatesPage() {
  // Use raw SQL to avoid Prisma DateTime serialization issues
  const updates = await sql`
    SELECT 
      id,
      title,
      source,
      category,
      impact,
      link,
      "displayOrder",
      date::text as date
    FROM "PolicyUpdate"
    ORDER BY "displayOrder" ASC, date DESC
  `;

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      'MeitY': 'bg-blue-100 text-blue-800',
      'NITI Aayog': 'bg-green-100 text-green-800',
      'Data Protection': 'bg-purple-100 text-purple-800',
      'AI Safety': 'bg-orange-100 text-orange-800',
      'Court': 'bg-red-100 text-red-800',
      'Parliament': 'bg-yellow-100 text-yellow-800',
    };
    return colors[source] || 'bg-gray-100 text-gray-800';
  };

  const getImpactColor = (impact: string) => {
    const colors: Record<string, string> = {
      'High': 'bg-red-100 text-red-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-800',
    };
    return colors[impact] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Policy Updates
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage AI policy news and government announcements
          </p>
        </div>
        <Link
          href="/india-ai/policy/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Update
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {updates.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Updates</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-red-600">
            {updates.filter(u => u.impact === 'High').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">High Impact</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600">
            {updates.filter(u => u.source === 'MeitY').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">MeitY</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600">
            {updates.filter(u => u.source === 'NITI Aayog').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">NITI Aayog</div>
        </div>
      </div>

      {/* Updates List */}
      {updates.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No policy updates found. Add your first update to get started.
          </p>
          <Link
            href="/india-ai/policy/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add First Update
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Impact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {updates.map((update) => (
                <tr key={update.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      <div className="font-medium text-gray-900 dark:text-white line-clamp-2">
                        {update.title}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSourceColor(update.source)}`}>
                      {update.source}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {update.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getImpactColor(update.impact)}`}>
                      {update.impact}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(update.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={update.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <Link
                        href={`/india-ai/policy/${update.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <DeleteButton
                        itemId={update.id}
                        itemName={update.title}
                        deleteEndpoint={`/api/india-ai/policy/${update.id}/delete`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

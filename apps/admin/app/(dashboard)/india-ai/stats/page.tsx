import { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { neon } from '@neondatabase/serverless';
import StatsTableRow from './StatsTableRow';

export const metadata: Metadata = {
  title: 'India AI Stats | Admin',
  description: 'Manage India AI live statistics',
};

async function getStats() {
  const sql = neon(process.env.DATABASE_URL!);
  const stats = await sql`
    SELECT * FROM "IndiaAIStats"
    ORDER BY "displayOrder" ASC, "createdAt" DESC
  `;
  return stats;
}

export default async function IndiaAIStatsPage() {
  const stats = await getStats();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            India AI Live Statistics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage the live counters displayed in the hero section
          </p>
        </div>
        <Link
          href="/india-ai/stats/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Stat
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Label
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Change
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Icon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {stats.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No statistics found. Add your first stat to get started.
                </td>
              </tr>
            ) : (
              stats.map((stat: any) => (
                <StatsTableRow key={stat.id} stat={stat} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

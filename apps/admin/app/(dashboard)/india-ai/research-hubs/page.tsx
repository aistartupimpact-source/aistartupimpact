import { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Edit, ExternalLink } from 'lucide-react';
import { neon } from '@neondatabase/serverless';
import { DeleteButton } from '../components/DeleteButton';

const sql = neon(process.env.DATABASE_URL!);

export const metadata: Metadata = {
  title: 'AI Research Institutions | Admin',
};

export default async function ResearchHubsPage() {
  const institutions = await sql`
    SELECT
      id, name, city, state, tag, category, "aiCentre",
      faculty, programs, "displayOrder", link, "isActive",
      "createdAt"::text as "createdAt"
    FROM "AIResearchInstitution"
    ORDER BY "displayOrder" ASC, "createdAt" DESC
  `;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            AI Research Institutions
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage research hubs, institutions, and talent centres
          </p>
        </div>
        <Link
          href="/india-ai/research-hubs/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Institution
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{institutions.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Institutions</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600">
            {institutions.filter(i => i.category === 'AI Centre').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">AI Centres</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600">
            {institutions.filter(i => i.category === 'Dedicated AI Dept').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Dedicated AI Depts</div>
        </div>
      </div>

      {institutions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No institutions found.</p>
          <Link
            href="/india-ai/research-hubs/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add First Institution
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Institution</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">AI Centre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {institutions.map((inst) => (
                <tr key={inst.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{inst.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{inst.city}, {inst.state}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{inst.tag}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      inst.category === 'AI Centre' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {inst.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {inst.aiCentre || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      inst.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {inst.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a href={inst.link} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 dark:text-gray-400">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <Link href={`/india-ai/research-hubs/${inst.id}/edit`} className="text-blue-600 hover:text-blue-900">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <DeleteButton itemId={inst.id} itemName={inst.name} deleteEndpoint={`/api/india-ai/research-hubs/${inst.id}/delete`} />
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

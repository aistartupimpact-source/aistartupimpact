import { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Edit, ExternalLink } from 'lucide-react';
import { neon } from '@neondatabase/serverless';
import { DeleteButton } from '../components/DeleteButton';

const sql = neon(process.env.DATABASE_URL!);

export const metadata: Metadata = {
  title: 'Government Schemes | Admin',
};

export default async function GovernmentSchemesPage() {
  // Use raw SQL to avoid Prisma DateTime serialization issues
  const schemes = await sql`
    SELECT 
      id,
      name,
      "shortName",
      category,
      state,
      "fundingAmount",
      status,
      "applicationDeadline",
      "applyLink",
      "displayOrder",
      "createdAt"::text as "createdAt"
    FROM "GovernmentScheme"
    ORDER BY "displayOrder" ASC, "createdAt" DESC
  `;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-red-100 text-red-800';
      case 'Rolling': return 'bg-blue-100 text-blue-800';
      case 'Coming Soon': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Central': return 'bg-blue-100 text-blue-800';
      case 'State': return 'bg-purple-100 text-purple-800';
      case 'Accelerator': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Government Schemes
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage AI funding schemes and programs
          </p>
        </div>
        <Link
          href="/india-ai/schemes/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Scheme
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {schemes.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Schemes</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600">
            {schemes.filter(s => s.status === 'Open').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Open</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600">
            {schemes.filter(s => s.category === 'Central').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Central</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600">
            {schemes.filter(s => s.category === 'State').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">State</div>
        </div>
      </div>

      {/* Schemes List */}
      {schemes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No schemes found. Add your first scheme to get started.
          </p>
          <Link
            href="/india-ai/schemes/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add First Scheme
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Scheme
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Funding
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {schemes.map((scheme) => (
                <tr key={scheme.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {scheme.shortName}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {scheme.name}
                      </div>
                      {scheme.state && (
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {scheme.state}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(scheme.category)}`}>
                      {scheme.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {scheme.fundingAmount}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(scheme.status)}`}>
                      {scheme.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {scheme.applicationDeadline}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={scheme.applyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <Link
                        href={`/india-ai/schemes/${scheme.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <DeleteButton
                        itemId={scheme.id}
                        itemName={scheme.shortName}
                        deleteEndpoint={`/api/india-ai/schemes/${scheme.id}/delete`}
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

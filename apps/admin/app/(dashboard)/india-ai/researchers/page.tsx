import { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Edit, ExternalLink, GraduationCap } from 'lucide-react';
import { neon } from '@neondatabase/serverless';
import { DeleteButton } from '../components/DeleteButton';

const sql = neon(process.env.DATABASE_URL!);

export const metadata: Metadata = {
  title: 'AI Researchers | Admin',
};

export default async function AIResearchersPage() {
  // Use raw SQL to avoid Prisma DateTime serialization issues
  const researchers = await sql`
    SELECT 
      id,
      name,
      university,
      position,
      "photoUrl",
      bio,
      "researchAreas",
      "notablePapers",
      "linkedinUrl",
      "googleScholarUrl",
      citations,
      "hIndex",
      "displayOrder",
      "isActive",
      "createdAt"::text as "createdAt"
    FROM "AIResearcher"
    ORDER BY "displayOrder" ASC, citations DESC
  `;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            AI Researchers
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage top AI researchers in India
          </p>
        </div>
        <Link
          href="/india-ai/researchers/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Researcher
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {researchers.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Researchers</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600">
            {researchers.filter(r => r.isActive).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600">
            {researchers.reduce((sum, r) => sum + r.citations, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Citations</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600">
            {Math.round(researchers.reduce((sum, r) => sum + r.hIndex, 0) / researchers.length || 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg h-Index</div>
        </div>
      </div>

      {/* Researchers List */}
      {researchers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No researchers found. Add your first researcher to get started.
          </p>
          <Link
            href="/india-ai/researchers/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add First Researcher
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {researchers.map((researcher) => (
            <div
              key={researcher.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                {researcher.photoUrl ? (
                  <img
                    src={researcher.photoUrl}
                    alt={researcher.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">
                    {researcher.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {researcher.position}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                    {researcher.university}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {researcher.citations.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Citations</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {researcher.hIndex}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">h-Index</div>
                </div>
              </div>

              {/* Research Areas */}
              {researcher.researchAreas.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Research Areas:</div>
                  <div className="flex flex-wrap gap-1">
                    {researcher.researchAreas.slice(0, 3).map((area: string, idx: number) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  {researcher.linkedinUrl && (
                    <a
                      href={researcher.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                      title="LinkedIn"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {researcher.googleScholarUrl && (
                    <a
                      href={researcher.googleScholarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                      title="Google Scholar"
                    >
                      <GraduationCap className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/india-ai/researchers/${researcher.id}/edit`}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <DeleteButton
                    itemId={researcher.id}
                    itemName={researcher.name}
                    deleteEndpoint={`/api/india-ai/researchers/${researcher.id}/delete`}
                  />
                </div>
              </div>

              {/* Status Badge */}
              {!researcher.isActive && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    Inactive
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

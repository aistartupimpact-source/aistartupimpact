import { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Edit, ExternalLink } from 'lucide-react';
import { neon } from '@neondatabase/serverless';
import { DeleteButton } from '../components/DeleteButton';

const sql = neon(process.env.DATABASE_URL!);

export const metadata: Metadata = {
  title: 'Indian AI Tools | Admin',
};

export default async function IndianAIToolsPage() {
  // Use raw SQL to avoid Prisma DateTime serialization issues
  const tools = await sql`
    SELECT 
      id,
      name,
      tagline,
      description,
      category,
      "logoUrl",
      "websiteUrl",
      headquarters,
      "fundingStatus",
      "isFeatured",
      "isActive",
      "displayOrder",
      "createdAt"::text as "createdAt"
    FROM "IndianAITool"
    ORDER BY "isFeatured" DESC, "displayOrder" ASC
  `;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'LLM': 'bg-purple-100 text-purple-800',
      'Conversational AI': 'bg-blue-100 text-blue-800',
      'Vision AI': 'bg-green-100 text-green-800',
      'NLP': 'bg-yellow-100 text-yellow-800',
      'Enterprise AI': 'bg-red-100 text-red-800',
      'Healthcare AI': 'bg-pink-100 text-pink-800',
      'FinTech AI': 'bg-indigo-100 text-indigo-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Indian AI Tools
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage Made in India AI products and tools
          </p>
        </div>
        <Link
          href="/india-ai/tools/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Tool
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {tools.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Tools</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-yellow-600">
            {tools.filter(t => t.isFeatured).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Featured</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600">
            {tools.filter(t => t.isActive).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600">
            {new Set(tools.map(t => t.category)).size}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
        </div>
      </div>

      {/* Tools Grid */}
      {tools.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No tools found. Add your first tool to get started.
          </p>
          <Link
            href="/india-ai/tools/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add First Tool
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Logo & Name */}
              <div className="flex items-start gap-4 mb-4">
                {tool.logoUrl ? (
                  <img
                    src={tool.logoUrl}
                    alt={tool.name}
                    className="w-12 h-12 rounded object-contain"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-gray-100 dark:bg-gray-700" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                    {tool.tagline}
                  </p>
                </div>
              </div>

              {/* Category & Featured */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(tool.category)}`}>
                  {tool.category}
                </span>
                {tool.isFeatured && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    ⭐ Featured
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                {tool.description}
              </p>

              {/* Metadata */}
              {(tool.headquarters || tool.fundingStatus) && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 space-y-1">
                  {tool.headquarters && <div>📍 {tool.headquarters}</div>}
                  {tool.fundingStatus && <div>💰 {tool.fundingStatus}</div>}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <a
                  href={tool.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/india-ai/tools/${tool.id}/edit`}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <DeleteButton
                    itemId={tool.id}
                    itemName={tool.name}
                    deleteEndpoint={`/api/india-ai/tools/${tool.id}/delete`}
                  />
                </div>
              </div>

              {/* Status Badge */}
              {!tool.isActive && (
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

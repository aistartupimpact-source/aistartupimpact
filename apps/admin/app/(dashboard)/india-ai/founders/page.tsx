import { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Edit, ExternalLink, User } from 'lucide-react';
import { neon } from '@neondatabase/serverless';
import { DeleteButton } from '../components/DeleteButton';

const sql = neon(process.env.DATABASE_URL!);

export const metadata: Metadata = {
  title: 'Featured Founders | Admin',
};

export default async function FeaturedFoundersPage() {
  // Use raw SQL to avoid Prisma DateTime serialization issues
  const founders = await sql`
    SELECT 
      id,
      name,
      "startupName",
      bio,
      achievement,
      category,
      "fundingRaised",
      "photoUrl",
      "linkedinUrl",
      "storyUrl",
      "isActive",
      "displayOrder",
      "createdAt"::text as "createdAt"
    FROM "FeaturedFounder"
    ORDER BY "displayOrder" ASC, "createdAt" DESC
  `;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Featured': 'bg-blue-100 text-blue-800',
      'Hall of Fame': 'bg-purple-100 text-purple-800',
      'Rising Star': 'bg-green-100 text-green-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Featured Founders
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage founder spotlight and success stories
          </p>
        </div>
        <Link
          href="/india-ai/founders/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Founder
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {founders.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Founders</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600">
            {founders.filter(f => f.category === 'Featured').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Featured</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600">
            {founders.filter(f => f.category === 'Hall of Fame').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Hall of Fame</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600">
            {founders.filter(f => f.category === 'Rising Star').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Rising Stars</div>
        </div>
      </div>

      {/* Founders Grid */}
      {founders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No founders found. Add your first founder to get started.
          </p>
          <Link
            href="/india-ai/founders/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add First Founder
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {founders.map((founder) => (
            <div
              key={founder.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                {founder.photoUrl ? (
                  <img
                    src={founder.photoUrl}
                    alt={founder.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">
                    {founder.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {founder.startupName}
                  </p>
                  {founder.fundingRaised && (
                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">
                      {founder.fundingRaised}
                    </p>
                  )}
                </div>
              </div>

              {/* Category Badge */}
              <div className="mb-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(founder.category)}`}>
                  {founder.category}
                  {founder.category === 'Rising Star' && ' (₹10K)'}
                </span>
              </div>

              {/* Bio */}
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
                {founder.bio}
              </p>

              {/* Achievement */}
              {founder.achievement && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Achievement:</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {founder.achievement}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  {founder.linkedinUrl && (
                    <a
                      href={founder.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                      title="LinkedIn"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {founder.storyUrl && (
                    <a
                      href={founder.storyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                      title="Story"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/india-ai/founders/${founder.id}/edit`}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <DeleteButton
                    itemId={founder.id}
                    itemName={founder.name}
                    deleteEndpoint={`/api/india-ai/founders/${founder.id}/delete`}
                  />
                </div>
              </div>

              {/* Status Badge */}
              {!founder.isActive && (
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

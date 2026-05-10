import { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Edit, Trash2, MapPin, Star } from 'lucide-react';
import { neon } from '@neondatabase/serverless';

export const metadata: Metadata = {
  title: 'India AI Cities | Admin',
  description: 'Manage India AI city ecosystem data',
};

async function getCities() {
  const sql = neon(process.env.DATABASE_URL!);
  const cities = await sql`
    SELECT * FROM "IndiaAICity"
    ORDER BY "displayOrder" ASC, "totalStartups" DESC
  `;
  return cities;
}

function formatCurrency(paise: number): string {
  const crores = paise / 10000000000;
  return `₹${crores.toFixed(0)}Cr`;
}

export default async function IndiaAICitiesPage() {
  const cities = await getCities();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            India AI Cities
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage city ecosystem data for the interactive map
          </p>
        </div>
        <Link
          href="/india-ai/cities/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add City
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {cities.map((city: any) => (
          <div
            key={city.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {city.cityName}
                </h3>
              </div>
              {city.isFeatured && (
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">State:</span>
                <span className="font-medium text-gray-900 dark:text-white">{city.state}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Startups:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {city.totalStartups.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Funding:</span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(city.totalFunding)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Location:</span>
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {city.latitude.toFixed(4)}, {city.longitude.toFixed(4)}
                </span>
              </div>
            </div>

            {city.topSectors && city.topSectors.length > 0 && (
              <div className="mb-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Top Sectors:</div>
                <div className="flex flex-wrap gap-1">
                  {city.topSectors.slice(0, 3).map((sector: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {sector}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  city.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {city.isActive ? 'Active' : 'Inactive'}
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/india-ai/cities/${city.id}/edit`}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ${city.cityName}?`)) {
                      // TODO: Implement delete
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {cities.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No cities found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Add your first city to start building the India AI map
          </p>
          <Link
            href="/india-ai/cities/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add First City
          </Link>
        </div>
      )}

      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
              City Data Tips
            </h3>
            <ul className="mt-2 text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Use accurate latitude/longitude for map positioning</li>
              <li>• Keep startup counts and funding amounts updated</li>
              <li>• Add top 3-5 sectors for each city</li>
              <li>• Featured cities appear prominently on the map</li>
              <li>• Premium placement is a revenue feature for startups</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

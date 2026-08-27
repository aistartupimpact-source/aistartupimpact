import { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Edit } from 'lucide-react';
import { neon } from '@neondatabase/serverless';
import { DeleteButton } from '../components/DeleteButton';

const sql = neon(process.env.DATABASE_URL!);

export const metadata: Metadata = {
  title: 'IndiaAI Mission Tracker | Admin',
};

function formatCr(val: string | number | bigint): string {
  const n = Number(val) / 10000000000;
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr`;
}

export default async function MissionTrackerPage() {
  const pillars = await sql`
    SELECT id, component, "budgetAllocated", "budgetDisbursed", "displayOrder", "isActive"
    FROM "IndiaAIMissionTracker"
    ORDER BY "displayOrder" ASC, "updatedAt" DESC
  `;

  const totalAllocated = pillars.filter(p => p.isActive).reduce((s, p) => s + Number(p.budgetAllocated), 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">IndiaAI Mission Tracker</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage the 7-pillar mission budget allocation ({formatCr(totalAllocated)} total)
          </p>
        </div>
        <Link
          href="/india-ai/mission-tracker/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Pillar
        </Link>
      </div>

      {pillars.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No mission pillars found.</p>
          <Link href="/india-ai/mission-tracker/new" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Add First Pillar
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pillar</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Allocated</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">% of Total</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {pillars.map((p) => {
                const pct = totalAllocated > 0 ? ((Number(p.budgetAllocated) / totalAllocated) * 100).toFixed(1) : '0';
                return (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{p.component}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Order: {p.displayOrder}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                      {formatCr(p.budgetAllocated)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-600 dark:text-gray-400">
                      {pct}%
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        p.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/india-ai/mission-tracker/${p.id}/edit`} className="text-blue-600 hover:text-blue-900">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <DeleteButton itemId={p.id} itemName={p.component} deleteEndpoint={`/api/india-ai/mission-tracker/${p.id}/delete`} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

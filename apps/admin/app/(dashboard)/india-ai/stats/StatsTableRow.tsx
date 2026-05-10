'use client';

import Link from 'next/link';
import { Edit, Trash2 } from 'lucide-react';

interface StatsTableRowProps {
  stat: any;
}

export default function StatsTableRow({ stat }: StatsTableRowProps) {
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this stat?')) {
      // TODO: Implement delete
      console.log('Delete stat:', stat.id);
    }
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        {stat.displayOrder}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {stat.metricLabel}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {stat.metricKey}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
          {stat.metricValue}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
        {stat.metricChange || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
        {stat.metricIcon || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            stat.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          {stat.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {new Date(stat.lastUpdated).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/india-ai/stats/${stat.id}/edit`}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Edit className="w-4 h-4" />
          </Link>
          <button
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

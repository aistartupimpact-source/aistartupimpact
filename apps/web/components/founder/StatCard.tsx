import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  href?: string;
}

export default function StatCard({ title, value, icon: Icon, trend, href }: StatCardProps) {
  const content = (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-4 h-4 text-gray-400" />
        {trend && (
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
        {title}
      </h3>
      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

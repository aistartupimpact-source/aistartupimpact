'use client';

import { Inbox, type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-base font-sora font-semibold text-navy dark:text-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta text-center max-w-sm">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 btn-brand px-5 py-2.5 rounded-lg text-sm font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function TableEmptyState({ colSpan, icon, title, description, action }: EmptyStateProps & { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <EmptyState icon={icon} title={title} description={description} action={action} />
      </td>
    </tr>
  );
}

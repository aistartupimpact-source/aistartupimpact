'use client';

import { usePathname } from 'next/navigation';
import { ChevronRight, Command, Bell, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export function AdminHeader() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2 text-sm font-jakarta">
        <span className="text-gray-400 dark:text-gray-500">Admin</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
        <span className="text-navy dark:text-white font-medium capitalize">
          {pathname?.split('/').pop() || 'Dashboard'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <Command className="w-3.5 h-3.5" />
          <span>Search...</span>
          <kbd className="text-[10px] bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </button>

        <button
          onClick={toggle}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-500" />
          )}
        </button>

        <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand rounded-full" />
        </button>
      </div>
    </header>
  );
}

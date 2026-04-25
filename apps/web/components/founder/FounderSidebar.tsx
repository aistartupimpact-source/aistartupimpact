'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Rocket,
  Wrench,
  BarChart3,
  Plus,
  User,
  Settings,
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/founder/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'My Startups',
    href: '/founder/startups',
    icon: Rocket,
  },
  {
    name: 'My Tools',
    href: '/founder/tools',
    icon: Wrench,
  },
  {
    name: 'Analytics',
    href: '/founder/analytics',
    icon: BarChart3,
  },
];

const quickActions = [
  {
    name: 'Submit Startup',
    href: '/founder/startups/new',
    icon: Plus,
  },
  {
    name: 'Submit Tool',
    href: '/founder/tools/new',
    icon: Plus,
  },
];

const bottomNav = [
  {
    name: 'Profile',
    href: '/founder/profile',
    icon: User,
  },
  {
    name: 'Settings',
    href: '/founder/settings',
    icon: Settings,
  },
];

export default function FounderSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/founder/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
      <div className="flex-1 flex flex-col">
        {/* Main Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}

          {/* Quick Actions */}
          <div className="pt-6">
            <p className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Quick Actions
            </p>
            {quickActions.map((item) => {
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Navigation */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
          {bottomNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

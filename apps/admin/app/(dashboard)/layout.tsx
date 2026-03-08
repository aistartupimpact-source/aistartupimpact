'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Image,
  Wrench,
  Building2,
  IndianRupee,
  Mail,
  Megaphone,
  Users,
  BarChart3,
  Settings,
  ChevronRight,
  Bell,
  Command,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const sidebarItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Articles', href: '/articles', icon: FileText },
  { label: 'Media Library', href: '/media', icon: Image },
  { type: 'divider' as const, label: 'Content' },
  { label: 'AI Tools', href: '/tools-dir', icon: Wrench },
  { label: 'Startups', href: '/startups-dir', icon: Building2 },
  { label: 'Funding', href: '/funding-dir', icon: IndianRupee },
  { type: 'divider' as const, label: 'Channels' },
  { label: 'Newsletter', href: '/newsletter-admin', icon: Mail },
  { label: 'Placements', href: '/placements', icon: Megaphone },
  { type: 'divider' as const, label: 'System' },
  { label: 'Users', href: '/users', icon: Users },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* ─── Sidebar ─────────────────────── */}
      <aside className="w-64 bg-navy dark:bg-gray-900 text-white flex flex-col shrink-0 border-r border-white/5 dark:border-gray-800">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/10 dark:border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="font-sora font-extrabold text-lg">
              <span className="text-brand">AI</span>
              <span className="text-white">SI</span>
            </span>
            <span className="text-gray-400 text-xs font-jakarta">Admin</span>
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {sidebarItems.map((item, i) => {
            if ('type' in item && item.type === 'divider') {
              return (
                <div key={i} className="pt-4 pb-2">
                  <span className="px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                    {item.label}
                  </span>
                </div>
              );
            }

            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = 'icon' in item ? item.icon : null;

            return (
              <Link
                key={item.label}
                href={item.href || '#'}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-jakarta font-medium transition-all duration-200 group ${isActive
                  ? 'bg-brand text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {Icon && <Icon className="w-4.5 h-4.5 shrink-0" />}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/10 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-brand text-sm font-bold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Admin User</p>
              <p className="text-xs text-gray-500 truncate">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm font-jakarta">
            <span className="text-gray-400 dark:text-gray-500">Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
            <span className="text-navy dark:text-white font-medium capitalize">
              {pathname?.split('/').pop() || 'Dashboard'}
            </span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Command Palette Trigger */}
            <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <Command className="w-3.5 h-3.5" />
              <span>Search...</span>
              <kbd className="text-[10px] bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
            </button>

            {/* Theme Toggle */}
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

            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand rounded-full" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">
          {children}
        </main>
      </div>
    </div>
  );
}

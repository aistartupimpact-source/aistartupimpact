'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FileEdit, BarChart3, Megaphone, CreditCard,
  ChevronRight, Moon, Sun, Bell, ExternalLink, Crown,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const sidebarItems = [
  { label: 'Dashboard', href: '/client-portal', icon: LayoutDashboard },
  { label: 'Submit Content', href: '/submit-content', icon: FileEdit },
  { label: 'My Analytics', href: '/my-analytics', icon: BarChart3 },
  { label: 'My Placements', href: '/my-placements', icon: Megaphone },
  { label: 'Billing', href: '/billing', icon: CreditCard },
];

export default function ClientLayout({
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
          <Link href="/client-portal" className="flex items-center gap-2">
            <span className="font-sora font-extrabold text-lg">
              <span className="text-brand">AI</span>
              <span className="text-white">SI</span>
            </span>
            <span className="text-xs font-jakarta px-2 py-0.5 bg-brand/20 text-brand rounded-full font-semibold">Client</span>
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-jakarta font-medium transition-all duration-200 ${isActive
                  ? 'bg-brand text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 pb-2">
            <span className="px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">Quick Links</span>
          </div>
          <Link href="/advertise" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-jakarta font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <ExternalLink className="w-4.5 h-4.5 shrink-0" />
            <span>View Plans</span>
          </Link>
        </nav>

        {/* Client Info */}
        <div className="p-4 border-t border-white/10 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-brand text-sm font-bold">S</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Sarvam AI</p>
              <div className="flex items-center gap-1">
                <Crown className="w-3 h-3 text-brand" />
                <p className="text-xs text-brand font-semibold">Premium</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm font-jakarta">
            <span className="text-gray-400 dark:text-gray-500">Client Portal</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
            <span className="text-navy dark:text-white font-medium capitalize">
              {pathname === '/client-portal' ? 'Dashboard' : pathname?.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggle} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-500" />}
            </button>
            <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand rounded-full" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">
          {children}
        </main>
      </div>
    </div>
  );
}

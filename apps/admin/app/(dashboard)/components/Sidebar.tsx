'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
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
  PlusCircle,
  Edit3,
  FolderOpen,
  Radio,
  Layers,
} from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  
  { type: 'divider' as const, label: 'Content' },
  { label: 'Articles', href: '/articles', icon: FileText },
  { label: 'Hero Slots', href: '/hero-slots', icon: Layers },
  { label: 'Media Library', href: '/media', icon: Image },
  { label: 'Tickers', href: '/tickers', icon: Radio },
  
  { type: 'divider' as const, label: 'Directories' },
  { label: 'AI Tools', href: '/tools-dir', icon: Wrench },
  { label: 'Startups', href: '/startups-dir', icon: Building2 },
  { label: 'Funding Digests', href: '/funding-dir', icon: IndianRupee },
  
  { type: 'divider' as const, label: 'Marketing' },
  { label: 'Subscribers', href: '/subscribers', icon: Users },
  { label: 'Newsletter', href: '/newsletter-admin', icon: Mail },
  { label: 'Placements', href: '/placements', icon: Megaphone },
  { label: 'Sponsors', href: '/sponsors', icon: Building2 },
  
  { type: 'divider' as const, label: 'System' },
  { label: 'Users', href: '/users', icon: Users },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function AdminSidebar({ session }: { session: any }) {
  const pathname = usePathname();
  const userName = session?.user?.name || "Admin User";
  const userRole = session?.user?.role?.replace(/_/g, ' ') || "SUPER ADMIN";
  const userInitials = userName.substring(0, 2).toUpperCase();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <aside className="w-64 bg-navy dark:bg-gray-900 text-white flex flex-col shrink-0 border-r border-white/5 dark:border-gray-800">
        <div className="h-16 flex items-center px-6 border-b border-white/10 dark:border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="font-sora font-extrabold text-lg">
              <span className="text-brand">A</span>
              <span className="text-white">SI</span>
            </span>
            <span className="text-gray-400 text-xs font-jakarta">Admin</span>
          </Link>
        </div>

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

        <div className="p-4 border-t border-white/10 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-brand/20 flex shrink-0 items-center justify-center text-brand text-sm font-bold">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-gray-500 truncate">{userRole}</p>
            </div>
          </div>
          <Link href="/api/auth/signout" className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>
    </div>
  );
}

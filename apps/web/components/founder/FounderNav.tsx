'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from '@/components/ProfileDropdown';

interface FounderNavProps {
  session: {
    userId: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

export default function FounderNav({ session }: FounderNavProps) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === '/founder/dashboard') return 'Dashboard';
    if (pathname === '/founder/startups') return 'My Startups';
    if (pathname === '/founder/tools') return 'My Tools';
    if (pathname === '/founder/analytics') return 'Analytics';
    if (pathname === '/founder/profile') return 'Profile';
    if (pathname === '/founder/settings') return 'Settings';
    if (pathname.includes('/claim')) return 'Claim Startup';
    return 'Founder Portal';
  };

  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 md:px-6 shrink-0">
      {/* Left: Mobile logo + Page title */}
      <div className="flex items-center gap-3">
        <Link href="/founder/dashboard" className="md:hidden flex items-center gap-2">
          <Image src="/logo-light.svg" alt="AI Startup Impact" width={24} height={24} sizes="24px" className="h-6 w-auto dark:hidden" />
          <Image src="/logo-dark.svg" alt="AI Startup Impact" width={24} height={24} sizes="24px" className="h-6 w-auto hidden dark:block" />
        </Link>
        <h1 className="hidden md:block text-sm font-sora font-bold text-navy dark:text-white">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={() => {
            const html = document.documentElement;
            const isDark = html.classList.contains('dark');
            html.classList.toggle('dark');
            localStorage.setItem('asi-theme', isDark ? 'light' : 'dark');
          }}
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          title="Toggle dark mode"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 dark:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 hidden dark:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
        </button>

        <NotificationDropdown />
        <ProfileDropdown user={{ name: session.name, email: session.email, avatar: session.avatar }} />
      </div>
    </header>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from '@/components/ProfileDropdown';
import ThemeToggle from '@/components/ThemeToggle';

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
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 md:px-6 shrink-0">
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
        <ThemeToggle />

        <NotificationDropdown />
        <ProfileDropdown user={{ name: session.name, email: session.email, avatar: session.avatar }} />
      </div>
    </header>
  );
}

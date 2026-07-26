'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 w-full">
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Left: Logo + Mobile Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {showMobileMenu ? <X className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
            </button>

            <Link href="/founder/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">AI</span>
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="font-bold text-gray-900 dark:text-white text-sm font-sora">
                  <span className="text-brand">AI </span>Startup Impact
                </span>
                <span className="text-[10px] text-gray-400 font-jakarta">Founder</span>
              </div>
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <NotificationDropdown />
            <ProfileDropdown user={{ name: session.name, email: session.email, avatar: session.avatar }} />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="px-4 py-3 space-y-1">
            <Link href="/founder/dashboard" className="block px-4 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setShowMobileMenu(false)}>
              Dashboard
            </Link>
            <Link href="/founder/startups" className="block px-4 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setShowMobileMenu(false)}>
              My Startups
            </Link>
            <Link href="/founder/tools" className="block px-4 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setShowMobileMenu(false)}>
              My Tools
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

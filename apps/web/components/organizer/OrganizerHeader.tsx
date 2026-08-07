"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, Search } from "lucide-react";
import ProfileDropdown from "@/components/ProfileDropdown";

interface Props {
  organizer: { name: string; email: string; company?: string; avatar?: string };
}

export default function OrganizerHeader({ organizer }: Props) {
  return (
    <header className="h-14 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 md:px-6 shrink-0">
      {/* Left: Mobile logo + Search */}
      <div className="flex items-center gap-3">
        <Link href="/organizer" className="md:hidden flex items-center gap-2">
          <Image src="/logo-light.svg" alt="AI Startup Impact" width={24} height={24} className="h-6 w-auto dark:hidden" />
          <Image src="/logo-dark.svg" alt="AI Startup Impact" width={24} height={24} className="h-6 w-auto hidden dark:block" />
        </Link>
        <div className="hidden md:block relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search..." className="w-56 pl-9 pr-4 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm font-jakarta text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand/20" />
        </div>
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

        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative">
          <Bell className="w-4 h-4" />
        </button>
        <ProfileDropdown user={{ name: organizer.name, email: organizer.email, avatar: organizer.avatar }} />
      </div>
    </header>
  );
}

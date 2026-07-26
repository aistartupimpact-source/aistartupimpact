"use client";

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
          <img src="/logo.png" alt="" className="h-7 w-auto" />
          <span className="text-xs font-sora font-bold text-navy dark:text-white">Events</span>
        </Link>
        <div className="hidden md:block relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search..." className="w-56 pl-9 pr-4 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm font-jakarta text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand/20" />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative">
          <Bell className="w-4 h-4" />
        </button>
        <ProfileDropdown user={{ name: organizer.name, email: organizer.email, avatar: organizer.avatar }} />
      </div>
    </header>
  );
}

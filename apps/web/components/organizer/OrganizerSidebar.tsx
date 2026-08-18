"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CalendarDays, Plus, Users, BarChart3,
  Settings, ChevronRight, Send, QrCode, Lock, HelpCircle,
} from "lucide-react";

interface Props {
  organizer: { name: string; email: string; company?: string };
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/organizer", icon: LayoutDashboard, exact: true },
  { type: "divider", label: "Events" },
  { label: "My Events", href: "/organizer/events", icon: CalendarDays },
  { label: "Create Event", href: "/organizer/events/create", icon: Plus },
  { type: "divider", label: "Management" },
  { label: "Attendees", href: "/organizer/attendees", icon: Users },
  { label: "Check-in", href: "/organizer/check-in", icon: QrCode },
  { label: "On-Site", href: "/organizer/on-site", icon: Users },
  { label: "Promote", href: "/organizer/promote", icon: Send, locked: true },
  { label: "Analytics", href: "/organizer/analytics", icon: BarChart3 },
  { type: "divider", label: "Account" },
  { label: "Team", href: "/organizer/team", icon: Users },
  { label: "Settings", href: "/organizer/settings", icon: Settings },
  { label: "Support", href: "/organizer/support", icon: HelpCircle },
];

export default function OrganizerSidebar({ organizer }: Props) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className="w-[240px] h-screen bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-gray-100 dark:border-gray-800">
        <Link href="/organizer" className="flex items-center gap-2.5">
          <Image src="/logo-light.svg" alt="AI Startup Impact" width={64} height={64} sizes="64px" className="h-16 w-auto dark:hidden" />
          <Image src="/logo-dark.svg" alt="AI Startup Impact" width={64} height={64} sizes="64px" className="h-16 w-auto hidden dark:block" />
          <span className="font-sora font-bold text-[13px] text-navy dark:text-white">
            AI Startup <span className="text-brand">Impact</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {NAV_ITEMS.map((item, i) => {
          if (item.type === "divider") {
            return (
              <p key={i} className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-3 pt-5 pb-1.5 font-jakarta">
                {item.label}
              </p>
            );
          }
          const Icon = item.icon!;
          const active = isActive(item.href!, item.exact);

          // Locked items (premium)
          if (item.locked) {
            return (
              <div
                key={item.href}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-jakarta font-medium text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60"
                title="Premium feature — coming soon"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-[18px] h-[18px] text-gray-300 dark:text-gray-600" />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span className="text-[9px] font-bold uppercase tracking-wide">Pro</span>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-jakarta font-medium transition-all duration-150 ${
                active
                  ? "bg-brand/8 text-brand font-semibold"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
            >
              <Icon className={`w-[18px] h-[18px] ${active ? "text-brand" : "text-gray-400 dark:text-gray-500"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Upgrade Card */}
      <div className="p-3">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand to-red-700 p-4">
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
          <div className="absolute -bottom-3 -left-3 w-12 h-12 bg-white/5 rounded-full blur-lg" />
          
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-1.5">
              <svg className="w-3.5 h-3.5 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <p className="text-[11px] font-sora font-bold text-white">Go Premium</p>
            </div>
            <p className="text-[10px] text-white/70 font-jakarta leading-relaxed mb-3">
              Promote events, priority listing & newsletter features.
            </p>
            <Link href="/organizer/promote" className="block w-full text-center bg-white text-brand text-[11px] font-bold font-jakarta py-2 rounded-lg hover:bg-white/90 transition-colors">
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

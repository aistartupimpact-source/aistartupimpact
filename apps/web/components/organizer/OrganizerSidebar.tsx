"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CalendarDays, Plus, Users, BarChart3,
  Settings, ChevronRight, Send, QrCode,
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
  { label: "Promote", href: "/organizer/promote", icon: Send },
  { label: "Analytics", href: "/organizer/analytics", icon: BarChart3 },
  { type: "divider", label: "Account" },
  { label: "Team", href: "/organizer/team", icon: Users },
  { label: "Settings", href: "/organizer/settings", icon: Settings },
];

export default function OrganizerSidebar({ organizer }: Props) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className="w-[220px] h-screen bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-gray-100 dark:border-gray-800">
        <Link href="/organizer" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="AI Startup Impact" className="h-8 w-auto" />
          <div>
            <p className="text-[11px] font-sora font-bold text-navy dark:text-white leading-tight">AI Startup Impact</p>
            <p className="text-[9px] text-gray-400 font-jakarta leading-tight">Events Dashboard</p>
          </div>
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

      {/* Bottom: empty - clean */}
    </aside>
  );
}

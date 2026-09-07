"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Users, BarChart3, Settings, QrCode, Send } from "lucide-react";

const NAV_ITEMS = [
  { href: "/organizer", icon: LayoutDashboard, label: "Home", exact: true },
  { href: "/organizer/events", icon: CalendarDays, label: "Events" },
  { href: "/organizer/check-in", icon: QrCode, label: "Check-in", highlight: true },
  { href: "/organizer/attendees", icon: Users, label: "People" },
  { href: "/organizer/settings", icon: Settings, label: "Settings" },
];

export default function OrganizerMobileNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-sticky bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 safe-area-pb">
      <div className="flex items-stretch justify-around h-14">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 px-3 min-w-[56px] transition-colors ${
                item.highlight
                  ? "text-brand"
                  : active
                  ? "text-brand"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {active && !item.highlight && (
                <span className="absolute top-0 left-2 right-2 h-[3px] bg-brand rounded-b" />
              )}
              {item.highlight ? (
                <span className="w-9 h-9 bg-brand rounded-full flex items-center justify-center -mt-3 shadow-lg shadow-brand/30">
                  <item.icon className="w-4 h-4 text-white" />
                </span>
              ) : (
                <item.icon className={`w-5 h-5 ${active ? "stroke-[2.2]" : ""}`} />
              )}
              <span className={`text-xs font-jakarta font-medium ${item.highlight ? "text-brand" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

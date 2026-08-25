'use client';

import Link from 'next/link';
import {
  LayoutDashboard, Briefcase, PlusCircle, Users, Building2,
  BarChart3, Megaphone, Settings, HelpCircle,
} from 'lucide-react';
import CollapsibleSidebar from '@/components/ui/CollapsibleSidebar';
import SidebarNav, { type NavItem } from '@/components/ui/SidebarNav';

interface Props {
  employer: {
    id: string;
    companyName: string;
    slug: string;
    email: string;
    plan: string;
  };
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/employer/dashboard', icon: LayoutDashboard, exact: true },
  { type: 'divider', label: 'Jobs' },
  { label: 'My Jobs', href: '/employer/jobs', icon: Briefcase },
  { label: 'Post a Job', href: '/employer/jobs/new', icon: PlusCircle },
  { label: 'Applications', href: '/employer/applications', icon: Users },
  { type: 'divider', label: 'Company' },
  { label: 'Company Profile', href: '/employer/company', icon: Building2 },
  { label: 'Analytics', href: '/employer/analytics', icon: BarChart3 },
  { label: 'Promote', href: '/employer/promote', icon: Megaphone },
  { type: 'divider', label: 'Account' },
  { label: 'Settings', href: '/employer/settings', icon: Settings },
  { label: 'Support', href: '/employer/support', icon: HelpCircle },
];

function UpgradeCard() {
  return (
    <Link href="/employer/promote" className="relative overflow-hidden rounded-lg bg-brand p-2.5 flex items-center gap-2.5 hover:opacity-95 transition-opacity block">
      <div className="absolute -top-3 -right-3 w-10 h-10 bg-white/10 rounded-full blur-lg" />
      <svg className="w-4 h-4 text-amber-300 shrink-0 relative" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <div className="relative">
        <p className="text-xs font-sora font-bold text-white leading-tight">Upgrade to Pro</p>
        <p className="text-[10px] text-white/60 font-jakarta leading-tight">Unlimited jobs & more</p>
      </div>
    </Link>
  );
}

function UpgradeIcon() {
  return (
    <Link href="/employer/settings" className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center hover:opacity-90 transition-opacity">
      <span className="text-[10px] font-sora font-bold text-white uppercase tracking-wide">Pro</span>
    </Link>
  );
}

export default function EmployerSidebar({ employer }: Props) {
  return (
    <CollapsibleSidebar logoHref="/employer/dashboard" bottomSlot={<UpgradeCard />} collapsedBottomSlot={<UpgradeIcon />}>
      <SidebarNav items={NAV_ITEMS} />
    </CollapsibleSidebar>
  );
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Bell, Search, ChevronDown, Building2, Settings, LogOut, ExternalLink } from 'lucide-react';

interface Props {
  employer: {
    companyName: string;
    email: string;
    slug: string;
    plan: string;
  };
}

export default function EmployerHeader({ employer }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  const handleLogout = async () => {
    await fetch('/api/employer/auth/logout', { method: 'POST' });
    window.location.href = '/employer/login';
  };

  // Page title from path
  const getPageTitle = () => {
    if (pathname === '/employer/dashboard') return 'Dashboard';
    if (pathname === '/employer/jobs/new') return 'Post a Job';
    if (pathname === '/employer/jobs') return 'My Jobs';
    if (pathname === '/employer/applications') return 'Applications';
    if (pathname === '/employer/company') return 'Company Profile';
    if (pathname === '/employer/analytics') return 'Analytics';
    if (pathname === '/employer/promote') return 'Promote';
    if (pathname === '/employer/settings') return 'Settings';
    if (pathname.includes('/applications')) return 'Applications';
    if (pathname.includes('/edit')) return 'Edit Job';
    return 'Employer Portal';
  };

  return (
    <header className="h-14 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 md:px-6 shrink-0">
      {/* Left: Mobile logo + Page title */}
      <div className="flex items-center gap-3">
        <Link href="/employer/dashboard" className="md:hidden flex items-center gap-2">
          <img src="/logo-light.svg" alt="AI Startup Impact" className="h-6 w-auto dark:hidden" />
          <img src="/logo-dark.svg" alt="AI Startup Impact" className="h-6 w-auto hidden dark:block" />
        </Link>
        <h1 className="hidden md:block text-sm font-sora font-bold text-navy dark:text-white">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* View public jobs */}
        <a
          href={`/jobs/company/${employer.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-[11px] font-jakarta font-medium text-gray-400 hover:text-brand transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <ExternalLink className="w-3 h-3" /> View Public Page
        </a>

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

        {/* Notification bell */}
        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative">
          <Bell className="w-4 h-4" />
        </button>

        {/* Profile dropdown */}
        <div ref={ref} className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-xs font-bold text-brand">
              {employer.companyName.charAt(0).toUpperCase()}
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-50 py-2">
              {/* Company info */}
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                <p className="text-xs font-semibold text-navy dark:text-white font-jakarta truncate">{employer.companyName}</p>
                <p className="text-[10px] text-gray-400 font-jakarta truncate">{employer.email}</p>
                {employer.plan !== 'FREE' && (
                  <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wide text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-1.5 py-0.5 rounded">
                    {employer.plan}
                  </span>
                )}
              </div>

              {/* Links */}
              <div className="py-1">
                <Link href="/employer/company" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-xs font-jakarta text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Building2 className="w-3.5 h-3.5" /> Company Profile
                </Link>
                <Link href="/employer/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-xs font-jakarta text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Settings className="w-3.5 h-3.5" /> Settings
                </Link>
                <a href={`/jobs/company/${employer.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-4 py-2 text-xs font-jakarta text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <ExternalLink className="w-3.5 h-3.5" /> View Public Page
                </a>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-100 dark:border-gray-800 py-1">
                <button onClick={handleLogout} className="flex items-center gap-2.5 px-4 py-2 text-xs font-jakarta text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 w-full">
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

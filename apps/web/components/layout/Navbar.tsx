'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search, X, Menu, Moon, Sun,
  Home, Newspaper, BookOpen, Wrench, Flag, Building2, TrendingUp, Users, Star,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import SearchOverlay from './SearchOverlay';

const mainNav = [
  { label: 'News', href: '/news' },
  { label: 'Stories', href: '/stories' },
  { label: 'Tools', href: '/tools' },
  { label: 'Startups', href: '/startups' },
  { label: 'Funding', href: '/funding' },
  { label: 'India AI', href: '/india-ai' },
];

const mobileNav = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'News', href: '/news', icon: Newspaper },
  { label: 'Stories', href: '/stories', icon: BookOpen },
  { label: 'Tools', href: '/tools', icon: Wrench },
  { label: 'Funding', href: '/funding', icon: TrendingUp },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu or search open
  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen, searchOpen]);

  return (
    <>
      {/* Search Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ─── Fixed Header ──────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800'
          : 'bg-white dark:bg-gray-950 border-b border-transparent'
          }`}
      >
        {/* Accent line */}
        <div className="h-[3px] bg-brand w-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1 shrink-0">
              <span className="font-sora font-extrabold text-lg sm:text-xl">
                <span className="text-brand">AI </span>
                <span className="text-navy dark:text-white">Startup Impact</span>
              </span>
            </Link>

            {/* Desktop Nav — hidden on mobile */}
            <nav className="hidden lg:flex items-center gap-1">
              {mainNav.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`px-3 py-2 text-sm font-jakarta font-medium rounded-lg transition-colors ${isActive
                      ? 'text-brand'
                      : 'text-gray-600 dark:text-gray-400 hover:text-navy dark:hover:text-white'
                      }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggle}
                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {/* For Founders dropdown */}
              <div className="relative group hidden md:block">
                <button className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-bold text-sm bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-md">
                  For Founders
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                  <Link href="/auth/login"
                    className="flex items-center gap-3 px-4 py-3.5 text-sm font-jakarta font-medium text-navy dark:text-white hover:bg-brand/5 dark:hover:bg-brand/10 transition-colors border-b border-gray-100 dark:border-gray-800">
                    <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center shrink-0">
                      <Users className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-brand">Founder Login</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Access your dashboard</p>
                    </div>
                  </Link>
                  <Link href="/submit-tool"
                    className="flex items-center gap-3 px-4 py-3.5 text-sm font-jakarta font-medium text-navy dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800">
                    <div className="w-7 h-7 rounded-lg bg-black dark:bg-white flex items-center justify-center shrink-0">
                      <Wrench className="w-3.5 h-3.5 text-white dark:text-black" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-navy dark:text-white">Submit AI Tool</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Get listed in directory</p>
                    </div>
                  </Link>
                  <Link href="/submit-startup"
                    className="flex items-center gap-3 px-4 py-3.5 text-sm font-jakarta font-medium text-navy dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-gray-700 dark:bg-gray-600 flex items-center justify-center shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-navy dark:text-white">List Your Startup</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Feature your company</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Subscribe CTA — hidden on small mobile */}
              <Link
                href="/newsletter"
                className="btn-brand text-xs sm:text-sm hidden sm:inline-flex px-3 py-1.5"
              >
                Newsletter
              </Link>

              {/* Mobile hamburger — visible below lg */}
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Mobile Full-Screen Nav ─────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-white dark:bg-gray-950 lg:hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 dark:border-gray-800">
            <span className="font-sora font-extrabold text-lg">
              <span className="text-brand">AI</span>
              <span className="text-navy dark:text-white">SI</span>
            </span>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <nav className="px-4 py-6 space-y-1 overflow-y-auto max-h-[calc(100vh-56px)]">
            {mainNav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center px-4 py-3.5 rounded-xl text-base font-jakarta font-medium transition-colors ${pathname === item.href
                  ? 'bg-brand/10 text-brand'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile Founder CTAs */}
            <div className="pt-4 px-4 space-y-2">
              <Link href="/auth/login" onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-brand text-white font-bold text-sm font-jakarta transition-colors hover:bg-brand/90">
                Founder Login
              </Link>
              <Link href="/auth/signup" onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-brand text-brand font-bold text-sm font-jakarta hover:bg-brand hover:text-white transition-colors">
                Create Account
              </Link>
              <Link href="/submit-tool" onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-sm font-jakarta transition-colors hover:bg-gray-800 dark:hover:bg-gray-100">
                Submit AI Tool
              </Link>
              <Link href="/submit-startup" onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white text-black dark:text-white font-bold text-sm font-jakarta hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                List Your Startup
              </Link>
              <Link href="/newsletter" onClick={() => setMobileOpen(false)}
                className="btn-brand w-full text-center">
                Newsletter
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* ─── Mobile Bottom Tab Bar ──────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 lg:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-14">
          {mobileNav.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 min-w-[56px] ${isActive
                  ? 'text-brand'
                  : 'text-gray-400 dark:text-gray-500'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium font-jakarta">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

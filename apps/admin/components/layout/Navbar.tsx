'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search, X, Menu, Moon, Sun,
  Home, Newspaper, BookOpen, Wrench, Flag,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const mainNav = [
  { label: 'News', href: '/news' },
  { label: 'Stories', href: '/stories' },
  { label: 'Tools', href: '/tools' },
  { label: 'Funding', href: '/funding' },
  { label: 'India AI', href: '/india-ai' },
];

const mobileNav = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'News', href: '/news', icon: Newspaper },
  { label: 'Stories', href: '/stories', icon: BookOpen },
  { label: 'Tools', href: '/tools', icon: Wrench },
  { label: 'India AI', href: '/india-ai', icon: Flag },
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

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen, searchOpen]);

  return (
    <>
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
                <span className="text-brand">AI</span>
                <span className="text-navy dark:text-white">StartupImpact</span>
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

              {/* Subscribe CTA — hidden on small mobile */}
              <Link
                href="/newsletter"
                className="btn-brand text-xs sm:text-sm hidden sm:inline-flex"
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

            {/* Mobile Newsletter CTA */}
            <div className="pt-4 px-4">
              <Link
                href="/newsletter"
                onClick={() => setMobileOpen(false)}
                className="btn-brand w-full text-center"
              >
                Newsletter
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* ─── Search Overlay ─────────────────────────── */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-950 w-full max-w-2xl mx-auto mt-20 sm:mt-32 rounded-2xl shadow-2xl overflow-hidden mx-4 sm:mx-auto">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search articles, tools, startups..."
                className="flex-1 text-base font-jakarta text-navy dark:text-white placeholder:text-gray-400 bg-transparent focus:outline-none"
                autoFocus
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-3 font-jakarta">
                Trending
              </p>
              <div className="flex flex-wrap gap-2">
                {['GPT-5', 'AI Regulation India', 'LLM Fine-tuning', 'Cursor AI', 'Krutrim'].map(
                  (t) => (
                    <button key={t} className="pill text-xs">
                      {t}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
          <div className="absolute inset-0 -z-10" onClick={() => setSearchOpen(false)} />
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

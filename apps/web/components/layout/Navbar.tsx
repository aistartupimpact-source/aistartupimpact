'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search, X, Menu, Moon, Sun,
  Home, Newspaper, BookOpen, Wrench, Flag, Building2, TrendingUp, Users, Star, LogOut, UserCircle, Bookmark,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import SearchOverlay from './SearchOverlay';
import SignInModal from '@/components/auth/SignInModal';

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
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggle } = useTheme();

  // Fetch user session
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user/session');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/user/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
      
      {/* Sign In Modal */}
      <SignInModal isOpen={signInModalOpen} onClose={() => setSignInModalOpen(false)} />

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

              {/* User Profile or Sign In */}
              {!loading && (
                <>
                  {user ? (
                    <div className="relative group hidden md:block">
                      {/* Profile Icon Button */}
                      <button 
                        className="p-1 rounded-full hover:ring-2 hover:ring-gray-200 dark:hover:ring-gray-700 transition-all duration-200"
                        aria-label="User menu"
                      >
                        <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                          {user.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={user.avatar} 
                              alt={user.name || 'User'} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                          )}
                        </div>
                      </button>
                      
                      {/* Dropdown Menu - Clean Minimal Style */}
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-1">
                        {/* Menu Items */}
                        <div className="py-1.5">
                          <Link 
                            href="/profile"
                            className="flex items-center gap-3 px-4 py-2.5 text-[15px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <UserCircle className="w-[18px] h-[18px] text-gray-600 dark:text-gray-400" />
                            <span>My Profile</span>
                          </Link>
                          
                          <Link 
                            href="/profile#saved"
                            className="flex items-center gap-3 px-4 py-2.5 text-[15px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <Bookmark className="w-[18px] h-[18px] text-gray-600 dark:text-gray-400" />
                            <span>Saved Items</span>
                          </Link>
                          
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-[15px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full text-left"
                          >
                            <LogOut className="w-[18px] h-[18px] text-gray-600 dark:text-gray-400" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSignInModalOpen(true)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-bold text-sm bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-md hidden md:inline-flex"
                    >
                      Sign In
                    </button>
                  )}
                </>
              )}

              {/* Subscribe CTA — hidden on small mobile */}
              <Link
                href="/newsletter"
                className="bg-brand hover:bg-brand-600 text-white font-bold font-jakarta px-6 py-2.5 text-sm rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-brand/25 hidden sm:inline-flex items-center justify-center"
              >
                Subscribe
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

            {/* Mobile User Section */}
            <div className="pt-4 px-4 space-y-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={user.avatar} 
                          alt={user.name || 'User'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <Link href="/profile" onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-brand text-white font-bold text-sm font-jakarta transition-colors hover:bg-brand/90">
                    <UserCircle className="w-5 h-5" />
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-red-600 text-red-600 font-bold text-sm font-jakarta hover:bg-red-600 hover:text-white transition-colors">
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      setSignInModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-brand text-white font-bold text-sm font-jakarta transition-colors hover:bg-brand/90">
                    Sign In
                  </button>
                  <Link href="/submit-tool" onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-sm font-jakarta transition-colors hover:bg-gray-800 dark:hover:bg-gray-100">
                    Submit AI Tool
                  </Link>
                  <Link href="/submit-startup" onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white text-black dark:text-white font-bold text-sm font-jakarta hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                    List Your Startup
                  </Link>
                </>
              )}
              <Link href="/newsletter" onClick={() => setMobileOpen(false)}
                className="btn-brand w-full text-center">
                Subscribe
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

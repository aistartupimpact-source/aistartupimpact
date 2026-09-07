'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users, TrendingUp, Sparkles, Zap, Calendar, Briefcase,
  BarChart3, Ticket, UsersRound, FileSearch, Building2, Target,
} from 'lucide-react';

const TABS = [
  {
    id: 'founders',
    label: 'For Founders',
    icon: Users,
    accent: 'brand',
    badge: 'For Founders',
    headline: "Get Discovered by India's Top VCs, Buyers & 5,000+ AI Founders",
    description: 'List your AI tool or startup and get in front of the investors, enterprise buyers, and founders who are actively looking for what you built.',
    ctaPrimary: { label: 'Create Free Account', href: '/auth/signup' },
    ctaSecondary: { label: 'Founder Login', href: '/auth/login' },
    trust: { count: '500+', label: 'AI founders' },
    benefits: [
      { icon: TrendingUp, title: 'Real-Time Analytics', desc: 'Track views, clicks, and engagement', color: 'brand' },
      { icon: Sparkles, title: 'Premium Visibility', desc: 'Featured in newsletter & homepage', color: 'purple' },
      { icon: Zap, title: 'Easy Management', desc: 'Update listings anytime from dashboard', color: 'blue' },
    ],
  },
  {
    id: 'organizers',
    label: 'Host Events',
    icon: Calendar,
    accent: 'purple',
    badge: 'For Event Hosts',
    headline: 'Host & Manage AI Events That Reach 10,000+ Attendees',
    description: "Create, promote, and manage AI events with built-in registration, ticketing, and team tools — all backed by India's largest AI community.",
    ctaPrimary: { label: 'Create Event Free', href: '/organizer/signup' },
    ctaSecondary: { label: 'Event Host Login', href: '/organizer/login' },
    trust: { count: '200+', label: 'events hosted' },
    benefits: [
      { icon: BarChart3, title: 'Event Dashboard', desc: 'Real-time RSVPs, check-ins & analytics', color: 'purple' },
      { icon: Ticket, title: 'Tickets & Registration', desc: 'Free & paid tickets with QR check-in', color: 'brand' },
      { icon: UsersRound, title: 'Team Collaboration', desc: 'Invite staff & assign event roles', color: 'blue' },
    ],
  },
  {
    id: 'employers',
    label: 'Post AI Jobs',
    icon: Briefcase,
    accent: 'blue',
    badge: 'For AI Hiring',
    headline: "Hire Top AI Talent From India's Largest AI Community",
    description: 'Post AI jobs and reach thousands of qualified engineers, researchers, and product builders actively looking for their next role.',
    ctaPrimary: { label: 'Post a Job Free', href: '/employer/signup' },
    ctaSecondary: { label: 'Hiring Dashboard', href: '/employer/login' },
    trust: { count: '100+', label: 'companies hiring' },
    benefits: [
      { icon: FileSearch, title: 'Smart Job Listings', desc: 'AI-categorized for maximum reach', color: 'blue' },
      { icon: Target, title: 'Applicant Tracking', desc: 'Review, shortlist & manage candidates', color: 'brand' },
      { icon: Building2, title: 'Employer Branding', desc: 'Company profile seen by 10K+ visitors', color: 'purple' },
    ],
  },
] as const;

const COLOR_MAP: Record<string, { bg: string; text: string; hoverBorder: string; shadow: string; gradientFrom: string }> = {
  brand: {
    bg: 'from-red-500/20 via-red-500/15 to-red-500/10',
    text: 'text-red-500',
    hoverBorder: 'hover:border-red-500/50 dark:hover:border-red-500/50',
    shadow: 'hover:shadow-red-500/10',
    gradientFrom: 'from-red-500/5',
  },
  purple: {
    bg: 'from-purple-500/20 via-purple-500/15 to-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    hoverBorder: 'hover:border-purple-500/50 dark:hover:border-purple-500/50',
    shadow: 'hover:shadow-purple-500/10',
    gradientFrom: 'from-purple-500/5',
  },
  blue: {
    bg: 'from-blue-500/20 via-blue-500/15 to-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    hoverBorder: 'hover:border-blue-500/50 dark:hover:border-blue-500/50',
    shadow: 'hover:shadow-blue-500/10',
    gradientFrom: 'from-blue-500/5',
  },
};

const ACCENT_STYLES: Record<string, { tabActive: string; dot: string; btnPrimary: string; btnShadow: string }> = {
  brand: {
    tabActive: 'border-red-500 text-red-500',
    dot: 'bg-red-500',
    btnPrimary: 'from-red-500 via-red-500 to-red-500/90 hover:shadow-red-500/40',
    btnShadow: 'shadow-red-500/10',
  },
  purple: {
    tabActive: 'border-purple-500 text-purple-600 dark:text-purple-400',
    dot: 'bg-purple-500',
    btnPrimary: 'from-purple-600 via-purple-500 to-purple-500/90 hover:shadow-purple-500/40',
    btnShadow: 'shadow-purple-500/10',
  },
  blue: {
    tabActive: 'border-blue-500 text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500',
    btnPrimary: 'from-blue-600 via-blue-500 to-blue-500/90 hover:shadow-blue-500/40',
    btnShadow: 'shadow-blue-500/10',
  },
};

export default function HomeCTA() {
  const [activeIdx, setActiveIdx] = useState(0);
  const tab = TABS[activeIdx];
  const accent = ACCENT_STYLES[tab.accent];

  return (
    <section className="py-8 sm:py-10 relative overflow-clip">
      <div className="absolute inset-0 bg-gradient-to-br from-red-100/80 via-purple-50/60 to-blue-100/80 dark:from-red-500/10 dark:via-purple-500/10 dark:to-blue-500/10" />
      {/* Light mode textures */}
      <div className="absolute inset-0 dark:hidden z-[1]" style={{
        backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)`,
        backgroundSize: '20px 20px'
      }} />
      <div className="absolute inset-0 dark:hidden z-[1]" style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />
      {/* Dark mode textures */}
      <div className="absolute inset-0 hidden dark:block z-[1]" style={{
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)`,
        backgroundSize: '20px 20px'
      }} />
      <div className="absolute inset-0 hidden dark:block z-[1]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />
      {/* Corner gradient glows — same tones as section bg, intensified */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-red-200/80 dark:bg-red-500/20 rounded-full blur-[80px] z-20 pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-100/80 dark:bg-purple-500/20 rounded-full blur-[80px] z-20 pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-200/80 dark:bg-blue-500/20 rounded-full blur-[80px] z-20 pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-red-100/80 dark:bg-red-500/15 rounded-full blur-[80px] z-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Tabs */}
          <div className="flex items-center justify-center gap-1 mb-6">
            {TABS.map((t, i) => {
              const isActive = i === activeIdx;
              const style = ACCENT_STYLES[t.accent];
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveIdx(i)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold font-jakarta uppercase tracking-wider border-b-2 transition-all ${
                    isActive
                      ? style.tabActive
                      : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.label}</span>
                  <span className="sm:hidden">{t.label.replace('For ', '')}</span>
                </button>
              );
            })}
          </div>

          {/* Card with extended corner lines */}
          <div className="relative">
            <div className="absolute -top-10 left-0 w-px h-10 bg-gradient-to-t from-gray-300 dark:from-gray-600 to-transparent" />
            <div className="absolute top-0 -left-10 h-px w-10 bg-gradient-to-l from-gray-300 dark:from-gray-600 to-transparent" />
            <div className="absolute -top-10 right-0 w-px h-10 bg-gradient-to-t from-gray-300 dark:from-gray-600 to-transparent" />
            <div className="absolute top-0 -right-10 h-px w-10 bg-gradient-to-r from-gray-300 dark:from-gray-600 to-transparent" />
            <div className="absolute -bottom-10 left-0 w-px h-10 bg-gradient-to-b from-gray-300 dark:from-gray-600 to-transparent" />
            <div className="absolute bottom-0 -left-10 h-px w-10 bg-gradient-to-l from-gray-300 dark:from-gray-600 to-transparent" />
            <div className="absolute -bottom-10 right-0 w-px h-10 bg-gradient-to-b from-gray-300 dark:from-gray-600 to-transparent" />
            <div className="absolute bottom-0 -right-10 h-px w-10 bg-gradient-to-r from-gray-300 dark:from-gray-600 to-transparent" />

            <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/60 dark:border-gray-800/60 shadow-2xl p-6 sm:p-8 overflow-hidden">
              <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" style={{
                backgroundImage: `linear-gradient(rgba(239, 68, 68, 0.3) 1px, transparent 1px),
                                 linear-gradient(90deg, rgba(239, 68, 68, 0.3) 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }} />

              <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
                {/* Left: Header & CTA */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-full mb-3">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${accent.dot}`} />
                    <tab.icon className={`w-3.5 h-3.5 ${COLOR_MAP[tab.accent]?.text || 'text-red-500'}`} />
                    <span className={`text-xs font-bold uppercase tracking-wider font-jakarta ${COLOR_MAP[tab.accent]?.text || 'text-red-500'}`}>
                      {tab.badge}
                    </span>
                  </div>
                  <h2 className="font-sora font-extrabold text-xl sm:text-2xl lg:text-3xl text-gray-900 dark:text-white leading-tight mb-2">
                    {tab.headline}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-jakarta leading-relaxed mb-5">
                    {tab.description}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                    <Link
                      href={tab.ctaPrimary.href}
                      className={`group inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r ${accent.btnPrimary} text-white font-bold text-sm font-jakarta hover:shadow-xl transition-all hover:scale-105 w-full sm:w-auto relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <span className="relative z-10">{tab.ctaPrimary.label}</span>
                    </Link>
                    <Link
                      href={tab.ctaSecondary.href}
                      className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-sm font-jakarta hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-lg transition-all w-full sm:w-auto"
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.ctaSecondary.label}</span>
                    </Link>
                  </div>

                  <div className="flex items-center justify-center lg:justify-start gap-2 mt-4">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-white dark:border-gray-900" />
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white dark:border-gray-900" />
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white dark:border-gray-900" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-jakarta">
                      Trusted by <span className={`font-bold ${COLOR_MAP[tab.accent]?.text || 'text-red-500'}`}>{tab.trust.count}</span> {tab.trust.label}
                    </p>
                  </div>
                </div>

                {/* Right: Benefits */}
                <div className="flex-1 grid grid-cols-1 gap-3 w-full">
                  {tab.benefits.map((b) => {
                    const c = COLOR_MAP[b.color] || COLOR_MAP.brand;
                    return (
                      <div
                        key={b.title}
                        className={`group relative flex items-start gap-3 bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 p-3.5 border border-gray-200 dark:border-gray-700 ${c.hoverBorder} transition-all hover:shadow-lg ${c.shadow} overflow-hidden`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${c.gradientFrom} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm relative z-10`}>
                          <b.icon className={`w-4 h-4 ${c.text}`} />
                        </div>
                        <div className="relative z-10">
                          <h3 className="font-sora font-bold text-xs text-gray-900 dark:text-white mb-0.5">
                            {b.title}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-jakarta leading-snug">
                            {b.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

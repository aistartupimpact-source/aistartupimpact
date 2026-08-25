'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Announcement {
  text: string;
  mobileText?: string;
  link: string;
  emoji: string;
}

const FALLBACK_ANNOUNCEMENTS: Announcement[] = [
  { emoji: '🚀', text: 'Submit your AI startup — Get discovered by VCs & buyers', mobileText: 'Submit your AI startup', link: '/submit-startup' },
  { emoji: '🛠️', text: 'List your AI tool — Reach 5,000+ professionals', mobileText: 'List your AI tool', link: '/submit-tool' },
  { emoji: '📢', text: 'Post a job — Hire top AI talent in India', mobileText: 'Post a job — Hire AI talent', link: '/employer/signup' },
  { emoji: '🎯', text: 'Upcoming AI events — Register now', mobileText: 'AI events — Register now', link: '/events' },
];

export default function AnnouncementBar() {
  const [items, setItems] = useState<Announcement[]>(FALLBACK_ANNOUNCEMENTS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch('/api/announcements/active');
      if (!res.ok) return;
      const data = await res.json();
      if (data.announcements?.length > 0) {
        setItems(data.announcements);
        setActiveIndex(0);
      }
    } catch {
      // keep fallback
    }
  }, []);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % items.length);
        setIsVisible(true);
      }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) return null;

  const current = items[activeIndex];

  return (
    <div className="fixed top-0 left-0 right-0 z-[250] h-[36px] bg-gradient-to-r from-navy-800 via-navy-700 to-navy-800 border-b border-white/10 flex items-center justify-center">
      <Link
        href={current.link}
        className={`font-jakarta text-xs font-medium text-white flex items-center gap-1.5 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span>{current.emoji}</span>
        <span className="hidden sm:inline">{current.text}</span>
        <span className="sm:hidden">{current.mobileText || current.text}</span>
        <span className="ml-1 text-brand">→</span>
      </Link>
    </div>
  );
}

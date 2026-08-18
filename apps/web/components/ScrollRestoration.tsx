'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const STORAGE_KEY = 'scroll-positions';
const MAX_RESTORE_TIME = 3000;
const RETRY_INTERVAL = 100;

function getScrollMap(): Record<string, number> {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveScroll(path: string, y: number) {
  const map = getScrollMap();
  map[path] = y;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export default function ScrollRestoration() {
  const pathname = usePathname();
  const restoringUntil = useRef(0);

  useEffect(() => {
    const saved = getScrollMap()[pathname];
    if (!saved || saved < 10) return;

    restoringUntil.current = Date.now() + MAX_RESTORE_TIME;
    let timer: ReturnType<typeof setTimeout>;

    function tryRestore() {
      if (Date.now() > restoringUntil.current) {
        restoringUntil.current = 0;
        return;
      }

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

      if (maxScroll >= saved) {
        window.scrollTo(0, saved);
        restoringUntil.current = 0;
        return;
      }

      timer = setTimeout(tryRestore, RETRY_INTERVAL);
    }

    tryRestore();

    return () => {
      clearTimeout(timer);
      restoringUntil.current = 0;
    };
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      if (restoringUntil.current > 0) return;
      saveScroll(pathname, window.scrollY);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  return null;
}

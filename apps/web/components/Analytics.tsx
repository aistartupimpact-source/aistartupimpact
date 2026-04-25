'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view on mount and pathname change
    const trackView = async () => {
      try {
        await fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pathname }),
        });
      } catch (error) {
        // Silently fail
        console.error('Analytics error:', error);
      }
    };

    trackView();
  }, [pathname]);

  return null; // This component doesn't render anything
}

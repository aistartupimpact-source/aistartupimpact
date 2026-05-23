'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view on mount and pathname change
    const trackView = async () => {
      try {
        const response = await fetch('/api/track/pageview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pathname }),
        });

        if (!response.ok) {
          console.error('Analytics tracking failed:', response.status, response.statusText);
        }
      } catch (error) {
        // Silently fail in production, but log in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Analytics error:', error);
        }
      }
    };

    trackView();
  }, [pathname]);

  return null; // This component doesn't render anything
}

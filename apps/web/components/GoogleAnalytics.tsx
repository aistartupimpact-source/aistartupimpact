'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import ConsentManager from '@/lib/consent-manager';

interface GoogleAnalyticsProps {
  measurementId: string;
}

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Listen for consent changes and update GA consent mode
    const manager = ConsentManager.getInstance();

    const unsubscribeAnalytics = manager.onConsent('analytics', (state) => {
      if ((window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          analytics_storage: state.analytics ? 'granted' : 'denied',
        });
      }
    });

    const unsubscribeMarketing = manager.onConsent('marketing', (state) => {
      if ((window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          ad_storage: state.marketing ? 'granted' : 'denied',
          ad_user_data: state.marketing ? 'granted' : 'denied',
          ad_personalization: state.marketing ? 'granted' : 'denied',
        });
      }
    });

    return () => {
      unsubscribeAnalytics();
      unsubscribeMarketing();
    };
  }, [measurementId]);

  // Track page views on route changes
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      (window as any).gtag &&
      measurementId &&
      measurementId !== 'G-XXXXXXXXXX'
    ) {
      (window as any).gtag('config', measurementId, {
        page_path: pathname,
      });
    }
  }, [pathname, measurementId]);

  if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
    return null;
  }

  return (
    <>
      {/* 
        Initialize dataLayer and Google Consent Mode v2 BEFORE the GA script loads.
        This must run synchronously so consent defaults are set before any tracking.
      */}
      <Script
        id="ga-consent-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('consent', 'default', {
              analytics_storage: 'denied',
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              wait_for_update: 500
            });
            gtag('js', new Date());
          `,
        }}
      />
      {/* Load the GA library */}
      <Script
        id="ga-script"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        onLoad={() => {
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('config', measurementId, {
              page_path: window.location.pathname,
              send_page_view: true,
            });
          }
        }}
      />
    </>
  );
}

'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import ConsentManager from '@/lib/consent-manager';

interface GoogleAnalyticsProps {
  measurementId: string;
}

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  useEffect(() => {
    // Initialize Google Consent Mode v2 with default deny
    if (typeof window !== 'undefined') {
      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(args);
      }
      (window as any).gtag = gtag;

      gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        wait_for_update: 500,
      });

      gtag('js', new Date());
      gtag('config', measurementId, {
        page_path: window.location.pathname,
      });

      // Listen for consent changes
      const manager = ConsentManager.getInstance();
      
      const unsubscribeAnalytics = manager.onConsent('analytics', (state) => {
        gtag('consent', 'update', {
          analytics_storage: state.analytics ? 'granted' : 'denied',
        });
      });

      const unsubscribeMarketing = manager.onConsent('marketing', (state) => {
        gtag('consent', 'update', {
          ad_storage: state.marketing ? 'granted' : 'denied',
          ad_user_data: state.marketing ? 'granted' : 'denied',
          ad_personalization: state.marketing ? 'granted' : 'denied',
        });
      });

      return () => {
        unsubscribeAnalytics();
        unsubscribeMarketing();
      };
    }
  }, [measurementId]);

  if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
    </>
  );
}

'use client';

import { useEffect } from 'react';

interface AnalyticsTrackerProps {
  entityType: 'TOOL' | 'STARTUP';
  entityId: string;
}

export default function AnalyticsTracker({ entityType, entityId }: AnalyticsTrackerProps) {
  useEffect(() => {
    const trackView = async () => {
      try {
        await fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entityType,
            entityId,
            eventType: 'VIEW',
          }),
        });
      } catch (error) {
        console.error('Failed to track view:', error);
      }
    };

    trackView();
  }, [entityType, entityId]);

  return null;
}

export async function trackClick(
  entityType: 'TOOL' | 'STARTUP',
  entityId: string
) {
  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType,
        entityId,
        eventType: 'CLICK',
      }),
    });
  } catch (error) {
    console.error('Failed to track click:', error);
  }
}

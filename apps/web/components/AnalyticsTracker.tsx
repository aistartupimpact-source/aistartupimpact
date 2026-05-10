'use client';

import { useEffect } from 'react';

interface AnalyticsTrackerProps {
  entityType: 'TOOL' | 'STARTUP';
  entityId: string;
  ownerId: string | null;
}

export default function AnalyticsTracker({ entityType, entityId, ownerId }: AnalyticsTrackerProps) {
  useEffect(() => {
    // Only track if there's an owner
    if (!ownerId) return;

    // Track view on mount
    const trackView = async () => {
      try {
        await fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entityType,
            entityId,
            eventType: 'VIEW',
            ownerId,
          }),
        });
      } catch (error) {
        console.error('Failed to track view:', error);
      }
    };

    trackView();
  }, [entityType, entityId, ownerId]);

  return null; // This component doesn't render anything
}

/**
 * Track click events
 */
export async function trackClick(
  entityType: 'TOOL' | 'STARTUP',
  entityId: string,
  ownerId: string | null
) {
  if (!ownerId) return;

  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType,
        entityId,
        eventType: 'CLICK',
        ownerId,
      }),
    });
  } catch (error) {
    console.error('Failed to track click:', error);
  }
}

'use client';

import { useEffect } from 'react';
import { trackInteraction } from '@/lib/track';

export default function TrackView({
  entityType,
  entityId,
  categoryId,
}: {
  entityType: string;
  entityId: string;
  categoryId?: string;
}) {
  useEffect(() => {
    trackInteraction({ action: 'view', entityType, entityId, categoryId });
  }, [entityType, entityId, categoryId]);

  return null;
}

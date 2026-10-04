export function trackInteraction(data: {
  action: string;
  entityType: string;
  entityId?: string;
  categoryId?: string;
  metadata?: Record<string, any>;
}) {
  if (typeof window === 'undefined') return;
  fetch('/api/user/interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    keepalive: true,
  }).catch(() => {});
}

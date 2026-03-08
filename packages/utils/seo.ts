/**
 * Truncate SEO title to max 60 characters.
 */
export function truncateSeoTitle(title: string, max = 60): string {
  if (title.length <= max) return title;
  return title.substring(0, max - 3).trim() + '...';
}

/**
 * Truncate SEO description to max 160 characters.
 */
export function truncateSeoDescription(description: string, max = 160): string {
  if (description.length <= max) return description;
  return description.substring(0, max - 3).trim() + '...';
}

/**
 * Generate a canonical URL from slug and base URL.
 */
export function generateCanonicalUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

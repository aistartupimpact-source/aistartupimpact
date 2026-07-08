/**
 * SEO-friendly slug generation for startups.
 * "Sivi AI" → "sivi-ai"
 * Collision: "sivi-ai" → "sivi-ai-2" → "sivi-ai-3"
 * No random hashes.
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\./g, '')            // remove dots (e.g. "Builder.ai" → "Builderai")
    .replace(/[^a-z0-9\s-]/g, '') // strip remaining special chars
    .replace(/\s+/g, '-')         // spaces → hyphens
    .replace(/-+/g, '-')          // collapse multiple hyphens
    .replace(/^-|-$/g, '');       // trim edge hyphens
}

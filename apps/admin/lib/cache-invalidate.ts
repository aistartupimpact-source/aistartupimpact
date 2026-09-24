/**
 * Cache invalidation helper for admin actions.
 * Deletes specific keys from Upstash Redis when admin makes changes.
 * Uses REST API directly (no @upstash/redis dependency needed).
 */

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const WEB_REDIS_URL = process.env.WEB_UPSTASH_REDIS_REST_URL;
const WEB_REDIS_TOKEN = process.env.WEB_UPSTASH_REDIS_REST_TOKEN;
const CACHE_VERSION = process.env.NEXT_BUILD_ID || process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || 'v1';

/**
 * Invalidate tool-related cache keys after admin actions.
 * Call this after tool approve/update/delete/archive.
 */
export async function invalidateToolCache(slug?: string): Promise<void> {
  const keys = [
    'tool:trending',
    'tool:recent',
    'tool:editors-picks',
    'tool:featured',
    'tool:upvoted-month',
    'homepage:stats',
  ];
  if (slug) keys.push(`tool:detail:${slug}`);
  await deleteKeys(keys);
}

/**
 * Invalidate startup-related cache keys.
 */
export async function invalidateStartupCache(slug?: string): Promise<void> {
  const keys = [
    'startup:featured',
    'startup:recent',
    'homepage:stats',
  ];
  if (slug) keys.push(`startup:detail:${slug}`);
  await deleteKeys(keys);
}

/**
 * Invalidate category/tag cache keys.
 */
export async function invalidateTaxonomyCache(): Promise<void> {
  await deleteKeys(['tool:categories', 'tool:tag-groups', 'tool:tag-map']);
}

export async function invalidateToolTagsCache(toolId: string): Promise<void> {
  await deleteKeys([`tool:tags:${toolId}`]);
}

async function deleteKeys(keys: string[]): Promise<void> {
  const fullKeys = keys.map(k => `${CACHE_VERSION}:${k}`);
  const targets = [
    { url: REDIS_URL, token: REDIS_TOKEN },
    { url: WEB_REDIS_URL, token: WEB_REDIS_TOKEN },
  ];
  await Promise.all(
    targets.map(async ({ url, token }) => {
      if (!url || !token) return;
      try {
        await fetch(`${url}/del/${fullKeys.join('/')}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Silent failure — cache will expire naturally via TTL
      }
    })
  );
}

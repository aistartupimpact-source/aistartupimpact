/**
 * Industry-grade caching layer using Upstash Redis.
 * 
 * Features:
 * - Stale-while-revalidate (SWR) pattern
 * - Distributed lock to prevent cache stampede
 * - Graceful fallthrough on Redis failure
 * - Cache versioning for schema migrations
 * - Runtime type validation on deserialization
 * - Lock cleanup on fetcher failure
 * - Single retry on write failure
 */

import { Redis } from '@upstash/redis';

// Initialize Redis client (lazy — only connects when first used)
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    console.warn('[cache] Upstash Redis not configured — operating without cache');
    return null;
  }
  redis = new Redis({ url, token });
  return redis;
}

// Bump this on schema changes to invalidate all cached data
const CACHE_VERSION = 'v1';

interface CacheOptions {
  /** Primary TTL in seconds — data is "fresh" for this long */
  ttl: number;
  /** Extra seconds to serve stale data while revalidating in background */
  staleTtl?: number;
  /** Log cache hits/misses (useful for debugging, disable in production) */
  log?: boolean;
}

interface CacheEntry<T> {
  data: T;
  ts: number; // timestamp when cached
}

/**
 * Cache wrapper with SWR, stampede protection, and graceful fallthrough.
 * 
 * @param key - Cache key (auto-prefixed with version)
 * @param options - TTL and SWR configuration
 * @param fetcher - Async function to fetch fresh data from DB
 * @returns Cached or fresh data
 */
export async function cached<T>(
  key: string,
  options: CacheOptions,
  fetcher: () => Promise<T>
): Promise<T> {
  const client = getRedis();
  if (!client) return fetcher(); // No Redis — direct DB query

  const fullKey = `${CACHE_VERSION}:${key}`;
  const lockKey = `lock:${fullKey}`;

  try {
    // 1. Try cache hit
    const entry = await client.get<CacheEntry<T>>(fullKey);

    if (entry && isValidEntry(entry)) {
      const ageSeconds = (Date.now() - entry.ts) / 1000;

      // Fresh — serve immediately
      if (ageSeconds < options.ttl) {
        if (options.log) console.log(`[cache] HIT ${key} (age: ${Math.round(ageSeconds)}s)`);
        return entry.data;
      }

      // Stale but within staleTtl — serve stale, mark for revalidation
      // Note: On Vercel, we can't do true background revalidation without waitUntil/after.
      // Instead, we serve stale and let the NEXT request (after lock expires) rebuild.
      // This is the safest approach for serverless.
      if (options.staleTtl && ageSeconds < options.ttl + options.staleTtl) {
        if (options.log) console.log(`[cache] STALE ${key} (age: ${Math.round(ageSeconds)}s)`);

        // Try to acquire lock — if we get it, rebuild inline (fast path)
        // If we don't, serve stale (another request or next request will rebuild)
        const lockAcquired = await client.set(lockKey, '1', { nx: true, ex: 30 });

        if (lockAcquired) {
          // We got the lock — rebuild inline and return fresh data
          try {
            const freshData = await fetcher();
            await setWithRetry(client, fullKey, { data: freshData, ts: Date.now() }, options.ttl + (options.staleTtl || 60));
            return freshData;
          } finally {
            await client.del(lockKey).catch(() => {}); // Always release lock (point 3)
          }
        }

        // Didn't get lock — serve stale (another process is rebuilding)
        return entry.data;
      }
    }

    // 2. Cache miss or fully expired — rebuild
    // Acquire lock to prevent stampede (point 1)
    const lockAcquired = await client.set(lockKey, '1', { nx: true, ex: 30 });

    if (!lockAcquired && entry && isValidEntry(entry)) {
      // Another process is rebuilding — serve stale if available
      if (options.log) console.log(`[cache] LOCKED ${key} — serving stale`);
      return entry.data;
    }

    // Fetch from database
    try {
      const data = await fetcher();
      const totalTtl = options.ttl + (options.staleTtl || 60);
      await setWithRetry(client, fullKey, { data, ts: Date.now() }, totalTtl);
      if (options.log) console.log(`[cache] MISS ${key} (rebuilt)`);
      return data;
    } finally {
      // Always release lock even if fetcher throws (point 3)
      await client.del(lockKey).catch(() => {});
    }

  } catch (error) {
    // Point 2: Redis failure — gracefully fall through to database
    // This catch covers ALL Redis errors (connection, timeout, parsing)
    console.error(`[cache] FALLTHROUGH ${key}:`, (error as Error).message?.slice(0, 100));
    return fetcher();
  }
}

/**
 * Write with single retry on failure (point 2 — transient network blips).
 */
async function setWithRetry<T>(client: Redis, key: string, value: T, ttlSeconds: number): Promise<void> {
  try {
    await client.set(key, value, { ex: ttlSeconds });
  } catch (firstError) {
    // Single retry after 100ms
    await new Promise(resolve => setTimeout(resolve, 100));
    try {
      await client.set(key, value, { ex: ttlSeconds });
    } catch {
      // Give up silently — next request will rebuild
      console.warn(`[cache] Write failed for ${key} after retry`);
    }
  }
}

/**
 * Runtime validation of cached entry shape (point 4).
 * Protects against corrupted or schema-mismatched data.
 */
function isValidEntry<T>(entry: unknown): entry is CacheEntry<T> {
  if (!entry || typeof entry !== 'object') return false;
  const e = entry as Record<string, unknown>;
  return 'data' in e && 'ts' in e && typeof e.ts === 'number';
}

// ─── Invalidation Helpers ────────────────────────────────────────────────────

/**
 * Delete a cache key (lazy invalidation — next read rebuilds).
 */
export async function invalidateCache(key: string): Promise<void> {
  const client = getRedis();
  if (!client) return;
  try {
    await client.del(`${CACHE_VERSION}:${key}`);
  } catch {}
}

/**
 * Delete multiple cache keys at once.
 */
export async function invalidateMany(keys: string[]): Promise<void> {
  const client = getRedis();
  if (!client) return;
  try {
    const fullKeys = keys.map(k => `${CACHE_VERSION}:${k}`);
    await client.del(...fullKeys);
  } catch {}
}

/**
 * Write-through: immediately store new data in cache (point 8).
 * Safer than invalidate for cases where we know the new value.
 */
export async function writeThrough<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
  const client = getRedis();
  if (!client) return;
  try {
    await client.set(`${CACHE_VERSION}:${key}`, { data, ts: Date.now() }, { ex: ttlSeconds + 60 });
  } catch {}
}

// ─── Cache Key Constants ─────────────────────────────────────────────────────

export const CACHE_KEYS = {
  TOOL_CATEGORIES: 'tool-categories',
  TAG_GROUPS: 'tag-groups',
  TOOL_TAG_MAP: 'tool-tag-map',
  TOOLS_DIRECTORY: 'tools-directory',
  TRENDING_TOOLS: 'trending-tools',
  UPVOTED_MONTH: 'upvoted-month',
  RECENTLY_ADDED: 'recently-added',
  EDITOR_PICKS: 'editor-picks',
  STARTUPS_DIRECTORY: 'startups-directory',
  HOMEPAGE_STATS: 'homepage-stats',
  toolDetail: (slug: string) => `tool:${slug}`,
  startupDetail: (slug: string) => `startup:${slug}`,
  toolTags: (toolId: string) => `tool-tags:${toolId}`,
} as const;

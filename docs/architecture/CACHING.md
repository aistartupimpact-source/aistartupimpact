# Caching Architecture

Production-grade caching layer using Upstash Redis with SWR, stampede protection, and auto-invalidation.

---

## Philosophy

- **PostgreSQL is the source of truth** — Redis is an acceleration layer only
- **If Redis is flushed**, the app continues working (just slower)
- **If Redis is down**, all queries fall through to the database gracefully
- **No wildcard invalidation** — explicit key lists only

---

## Implementation

**File**: `apps/web/lib/cache.ts`

### Core Function

```typescript
export async function cached<T>(
  key: string,
  options: CacheOptions,
  fetcher: () => Promise<T>
): Promise<T>
```

### Options
```typescript
interface CacheOptions {
  ttl: number;        // Primary TTL in seconds
  staleTtl?: number;  // Extra seconds to serve stale while revalidating
  compress?: boolean;  // Force compression (auto for > 50KB)
  metrics?: boolean;   // Track hit/miss metrics
}
```

---

## Patterns

### Stale-While-Revalidate (SWR)

```
Request → Redis lookup
  │
  ├─ Fresh (age < TTL) → Return immediately ✓
  │
  ├─ Stale (TTL < age < TTL + staleTtl)
  │     → Return stale data immediately ✓
  │     → One process acquires lock (SETNX)
  │     → Rebuilds cache in background
  │
  └─ Expired (age > TTL + staleTtl) → Treat as miss
        → Acquire lock → Fetch from DB → Store → Return
```

### Stampede Protection

When a key expires and N requests arrive simultaneously:
- First request: acquires lock via `SET lockKey "1" NX EX 30`
- Other requests: serve stale data or wait for rebuild
- Lock auto-expires after 30 seconds (safety net)
- Lock is released in `finally` block after rebuild

### TTL Jitter

```typescript
// ±15% randomization prevents synchronized expiration
const jitter = 0.85 + Math.random() * 0.3; // 0.85 to 1.15
const finalTtl = Math.round(totalTtl * jitter);
```

---

## Cache Versioning

```typescript
const CACHE_VERSION = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || 'v1';
```

- Every key is prefixed: `{CACHE_VERSION}:{key}`
- On deploy, new commit SHA → all old keys become orphaned
- Old keys expire naturally via TTL (no manual cleanup needed)
- **Result**: Zero-downtime cache invalidation on every deploy

---

## Cached Queries

| Key | TTL | Stale TTL | Data |
|-----|-----|-----------|------|
| `tool:categories` | 1 hour | 5 min | Tool category tree |
| `tool:tag-groups` | 1 hour | 5 min | Tag groups + tags |
| `tool:tag-map` | 1 hour | 5 min | Tool → tag mappings |
| `tool:trending` | 10 min | 2 min | Trending tools (clicks) |
| `tool:upvoted-month` | 10 min | 2 min | Most upvoted this month |
| `tool:recent` | 5 min | 1 min | Recently added tools |
| `tool:editors-picks` | 30 min | 5 min | Editor's pick collection |
| `tool:featured` | 30 min | 5 min | Featured tools |
| `startup:featured` | 30 min | 5 min | Featured startups |
| `startup:recent` | 5 min | 1 min | Recent startups |
| `homepage:stats` | 15 min | 3 min | Platform statistics |

---

## Key Constants

```typescript
export const CK = {
  TOOL_CATEGORIES: 'tool:categories',
  TAG_GROUPS: 'tool:tag-groups',
  TOOL_TAG_MAP: 'tool:tag-map',
  TRENDING: 'tool:trending',
  UPVOTED_MONTH: 'tool:upvoted-month',
  RECENT_TOOLS: 'tool:recent',
  EDITORS_PICKS: 'tool:editors-picks',
  HOMEPAGE_STATS: 'homepage:stats',
  // Parameterized
  toolsPage: (hash, page) => `tools:${hash}:p${page}`,
};
```

---

## Invalidation

### Explicit Key Deletion
```typescript
import { invalidateCache } from '@/lib/cache';
await invalidateCache('tool:trending', 'tool:recent');
```

### Write-Through (for immediate updates)
```typescript
import { writeThrough } from '@/lib/cache';
await writeThrough('tool:detail:my-tool', updatedData, 3600);
```

### Admin Invalidation
```typescript
// apps/admin/lib/cache-invalidate.ts
export async function invalidateToolCache() {
  await invalidateCache(
    CK.TOOL_CATEGORIES, CK.TAG_GROUPS, CK.TOOL_TAG_MAP,
    CK.TRENDING, CK.UPVOTED_MONTH, CK.RECENT_TOOLS, CK.EDITORS_PICKS
  );
}
```

---

## Failure Handling

```typescript
try {
  const raw = await client.get(fullKey);
  // ... cache logic
} catch (error) {
  // Redis failure → fall through to database
  trackMetric(null, key, 'error');
  console.error(`[cache] ERROR ${key}`);
  return fetcher(); // Always returns data
}
```

**Redis write failures**: Single retry after 100ms, then silently fail.

---

## Metrics

Tracked via Redis HASH at key `cache:metrics`:
- `hit:{prefix}` — Cache hits by key prefix
- `miss:{prefix}` — Cache misses
- `stale:{prefix}` — Stale serves (SWR)
- `error:{prefix}` — Redis errors

Read metrics:
```typescript
import { getCacheMetrics } from '@/lib/cache';
const metrics = await getCacheMetrics();
// { "hit:tool": 1542, "miss:tool": 23, "stale:tool": 89, "error:tool": 2 }
```

---

## ISR + Redis (Dual Caching)

| Layer | Caches | Invalidation |
|-------|--------|-------------|
| Next.js ISR | Full rendered HTML | `revalidatePath()` or time-based |
| Redis | Database query results | Explicit `invalidateCache()` |

Both work together:
1. ISR serves cached HTML (very fast)
2. When ISR revalidates, Server Component runs → Redis serves data (medium fast)
3. When Redis misses, database query runs (slower but still < 1s)

---

## Configuration (Upstash)

| Setting | Value |
|---------|-------|
| Provider | Upstash Redis |
| Protocol | REST API (HTTP) |
| Region | Global (single-region write) |
| Max memory | Plan-dependent |
| Eviction | `noeviction` (keys expire via TTL) |
| URL | `UPSTASH_REDIS_REST_URL` env var |
| Token | `UPSTASH_REDIS_REST_TOKEN` env var |

---

## Related Documents

- [Request Flow](./REQUEST_FLOW.md) — Where caching sits in the pipeline
- [System Overview](./SYSTEM_OVERVIEW.md) — Full architecture
- [Infrastructure: Upstash](../infrastructure/UPSTASH.md) — Service configuration

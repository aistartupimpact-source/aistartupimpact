# Upstash Redis

Caching and rate limiting service.

---

## Configuration

| Property | Value |
|----------|-------|
| Provider | Upstash |
| Protocol | REST API (HTTP-based) |
| Region | Global (single write region) |
| Eviction | `noeviction` (keys expire via TTL) |
| Max memory | Plan-dependent |

---

## Environment Variables

```env
UPSTASH_REDIS_REST_URL=https://rare-titmouse-169041.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

---

## Usage

| Use Case | Implementation |
|----------|---------------|
| Query caching | `apps/web/lib/cache.ts` — SWR pattern |
| Rate limiting | `@upstash/ratelimit` — Sliding window |
| Cache metrics | HASH at `cache:metrics` |
| Stampede locks | SETNX with 30s TTL |

---

## Key Namespaces

All keys are prefixed with deployment version: `{commit_sha}:{key}`

| Prefix | Content |
|--------|---------|
| `tool:*` | Tool-related cached data |
| `startup:*` | Startup cached data |
| `homepage:*` | Homepage statistics |
| `search:*` | Search suggestions |
| `lk:*` | Stampede protection locks |
| `cache:metrics` | Hit/miss/stale/error counters |

---

## Monitoring

Via Upstash Dashboard:
- Commands per second
- Memory usage (MB)
- Hit rate
- Latency (P50, P99)
- Daily command count

---

## Failure Behavior

If Upstash is unreachable:
- All cached queries fall through to PostgreSQL
- Rate limiting fails open (allows requests)
- App continues working, just slower
- Errors logged to Sentry

---

## Cost

| Plan | Memory | Price |
|------|--------|-------|
| Free | 256MB | $0 |
| Pay-as-you-go | Unlimited | $0.2/100K commands |

---

## Related Documents

- [Caching Architecture](../architecture/CACHING.md) — Full implementation
- [Rate Limiting](../security/RATE_LIMITING.md) — Anti-abuse
- [Environment Variables](./ENVIRONMENT.md) — Credentials

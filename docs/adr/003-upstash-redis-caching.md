# ADR-003: Upstash Redis for Caching Layer

## Status
Accepted

## Date
2025-07-01

## Context
The platform was hitting Neon PostgreSQL directly on every page load. With growing traffic, homepage and directory pages needed caching to reduce DB load and improve response times. The caching solution needed to work in Vercel's serverless environment (no persistent connections).

## Decision
Use Upstash Redis (REST API) as a caching acceleration layer with:
- Stale-While-Revalidate (SWR) pattern
- Stampede protection via SETNX distributed locks
- TTL jitter (±15%) to prevent synchronized expiration
- Deployment-based versioning (auto-invalidate on deploy)
- Graceful fallthrough to database on Redis failure
- PostgreSQL remains the source of truth

## Alternatives Considered
| Option | Pros | Cons |
|--------|------|------|
| Next.js `unstable_cache` | Built-in, no infra | Limited control, no SWR, no stampede protection |
| Vercel KV (Upstash) | Integrated with Vercel | Higher cost, same Upstash under the hood |
| Redis Cloud (managed) | TCP connection, lower latency | Requires persistent connections (bad for serverless) |
| Upstash Redis (REST) | HTTP-based, serverless-native | Slightly higher latency than TCP Redis |
| No caching (ISR only) | Simplest | Doesn't help with data queries inside ISR |

## Consequences

### Positive
- 10-30ms cache reads (vs 100-300ms DB queries)
- Zero-configuration cache invalidation on deploy
- Graceful degradation (Redis down → app still works)
- Industry-grade stampede protection
- Metrics tracking for observability
- Cost-effective (~$10/month for current traffic)

### Negative
- Additional infrastructure dependency
- REST API adds ~10ms overhead vs TCP Redis
- JSON serialization loses Date objects (must handle)
- Cache debugging requires checking Redis state
- Must manually invalidate on admin mutations

### Risks
- Stale data served during SWR window (acceptable for non-critical data)
- Memory limits on free/low tiers could cause evictions

## Related
- [Caching Architecture](../architecture/CACHING.md) — Full implementation details
- `apps/web/lib/cache.ts` — Implementation file
- `apps/admin/lib/cache-invalidate.ts` — Admin invalidation helpers

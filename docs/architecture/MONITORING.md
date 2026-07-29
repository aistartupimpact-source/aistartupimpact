# Monitoring & Observability

How the platform is monitored in production.

---

## Tools

| Tool | Purpose | Dashboard |
|------|---------|-----------|
| Sentry | Error tracking, performance | sentry.io |
| Vercel Analytics | Web Vitals, traffic | Vercel Dashboard |
| Google Analytics 4 | User behavior, acquisition | analytics.google.com |
| Upstash Dashboard | Redis metrics (memory, ops, latency) | console.upstash.com |
| Neon Dashboard | DB performance, connections, storage | console.neon.tech |
| Cloudflare Analytics | CDN hits, threats, bandwidth | dash.cloudflare.com |
| Custom metrics | Cache hit/miss rates | Redis HASH `cache:metrics` |

---

## Error Tracking (Sentry)

Configuration: `@sentry/nextjs` in both web and admin apps.

```javascript
// Captured automatically:
// - Unhandled exceptions
// - Unhandled promise rejections
// - API route errors (500s)
// - Client-side rendering errors

// Manual capture:
import * as Sentry from '@sentry/nextjs';
Sentry.captureException(error);
```

Key settings:
- Source maps uploaded on build (hidden from users)
- Environment: `production` / `preview`
- DSN: `NEXT_PUBLIC_SENTRY_DSN` env var

---

## Application Metrics

### Cache Metrics (Custom)
Stored in Redis HASH at `cache:metrics`:
```
hit:tool       → 15420
miss:tool      → 230
stale:tool     → 890
error:tool     → 3
hit:startup    → 8200
miss:startup   → 120
```

Read via admin API or `getCacheMetrics()` function.

### Page Analytics
- `PageView` table tracks: path, sessionHash, referrer, device, createdAt
- Used for: monthly visitor count, popular pages, traffic sources

### Tool Analytics
- `ToolTraffic` — Daily aggregate per tool
- `AffiliateClick` — Outbound click tracking
- `ToolUpvote` — Engagement tracking

---

## Alerts (Recommended)

| Condition | Channel | Priority |
|-----------|---------|----------|
| Error rate > 10/min | Slack + Email | P1 |
| Homepage returns 5xx | SMS + Slack | P1 |
| Redis memory > 80% | Email | P2 |
| Build failure | GitHub notification | P3 |
| Slow queries > 5s | Email (weekly digest) | P3 |

---

## Dashboards

### What to Monitor Daily
- Sentry: New errors in last 24h
- Vercel: Deploy status, build time
- Traffic: Page views trend

### What to Monitor Weekly
- Upstash: Memory usage trend, hit rate
- Neon: Active connections, slow queries
- Cache metrics: Hit rate should be > 80%

---

## Structured Logging

```typescript
// API routes log errors:
console.error('[POST /api/tools/upvote]', error.message);

// Sentry captures full stack trace automatically
// No console.log in production (only console.error for actual errors)
```

---

## Related Documents

- [Health Checks](../operations/HEALTH_CHECKS.md) — Endpoints to monitor
- [Incident Response](../operations/INCIDENT_RESPONSE.md) — When alerts fire
- [Caching](./CACHING.md) — Cache metrics detail

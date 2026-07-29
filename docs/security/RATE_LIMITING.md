# Rate Limiting

Anti-abuse protection using Upstash Ratelimit.

---

## Implementation

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  analytics: true,
});
```

---

## Limits by Endpoint

| Endpoint | Limit | Window | Identifier | Purpose |
|----------|-------|--------|-----------|---------|
| Login | 10 | 15 min | IP | Prevent brute force |
| Signup | 5 | 1 hour | IP | Prevent mass registration |
| Upvote | 20 | 24 hours | User ID | Prevent vote manipulation |
| Review submit | 5 | 1 hour | User ID | Prevent spam |
| Newsletter subscribe | 5 | 1 hour | IP | Prevent abuse |
| Search | 30 | 1 minute | IP | Prevent scraping |
| File upload | 10 | 1 hour | User ID | Prevent storage abuse |
| Contact form | 3 | 1 hour | IP | Prevent spam |

---

## Response on Limit

```json
HTTP 429 Too Many Requests
{
  "error": "Rate limit exceeded. Try again later."
}
```

Headers included:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Anti-Gaming Rules (Upvotes)

| Rule | Value | Rationale |
|------|-------|-----------|
| Account age | 24+ hours | Prevents disposable account spam |
| Daily cap | 20 upvotes/day | Limits automated voting |
| One per tool | Unique constraint | Prevents double-voting |
| Threshold display | Hidden below 5 | Reduces gaming incentive |

---

## Algorithm

**Sliding Window** — Provides smooth rate limiting without harsh reset cliffs.

Example: 10 requests per 60 seconds
- Request at T+0: allowed (1/10)
- Request at T+30: allowed (2/10)
- Request at T+59: allowed (3/10)
- Window slides continuously, old requests drop off

---

## Bypasses

- Admin API routes: no rate limiting (authenticated, trusted)
- Health check endpoints: exempt
- Static assets: served by CDN (not rate limited)
- Webhook endpoints: separate higher limits

---

## Related Documents

- [Security Overview](./OVERVIEW.md) — Full security posture
- [Backend Overview](../backend/OVERVIEW.md) — Where rate limiting is applied
- [Infrastructure: Upstash](../infrastructure/UPSTASH.md) — Redis configuration

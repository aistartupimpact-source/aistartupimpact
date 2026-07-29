# Request Flow

How a request travels from the user's browser to the database and back.

---

## Public Page Load (Server Component)

```
┌──────────┐     ┌────────────┐     ┌─────────┐     ┌──────────┐
│  Browser │────▶│ Cloudflare │────▶│  Vercel  │────▶│ Next.js  │
│          │     │  CDN/WAF   │     │  Edge    │     │  Server  │
└──────────┘     └────────────┘     └─────────┘     └────┬─────┘
                                                          │
                         ┌────────────────────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ ISR Cache Check     │
              │ (stale? revalidate) │
              └──────────┬──────────┘
                         │ miss
                         ▼
              ┌─────────────────────┐
              │ Redis Cache Check   │
              │ (Upstash SWR)       │
              └──────────┬──────────┘
                         │ miss
                         ▼
              ┌─────────────────────┐
              │ Neon PostgreSQL     │
              │ (query via Prisma   │
              │  or @neondatabase)  │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ Store in Redis      │
              │ (with TTL + jitter) │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ Render HTML (RSC)   │
              │ Stream to client    │
              └─────────────────────┘
```

### Timing Budget
| Step | Target |
|------|--------|
| Cloudflare → Vercel | < 50ms |
| ISR cache hit | < 10ms (instant) |
| Redis cache hit | < 30ms |
| DB query (simple) | < 100ms |
| DB query (complex join) | < 300ms |
| Full page render (uncached) | < 1000ms |
| Full page render (cached) | < 200ms |

---

## API Route (Mutation)

```
┌──────────┐     ┌──────────────────────────────────────────┐
│  Browser │────▶│ POST /api/tools/[id]/upvote              │
│  (fetch) │     └──────────────────────────────────────────┘
                              │
                              ▼
                 ┌───────────────────────┐
                 │ 1. Read JWT cookie    │
                 │    (user-token)       │
                 └───────────┬───────────┘
                              │
                              ▼
                 ┌───────────────────────┐
                 │ 2. Verify JWT         │
                 │    (jose.jwtVerify)   │
                 └───────────┬───────────┘
                              │ 401 if invalid
                              ▼
                 ┌───────────────────────┐
                 │ 3. Business checks    │
                 │    - Account age 24h  │
                 │    - Daily cap 20     │
                 └───────────┬───────────┘
                              │ 403/429 if failed
                              ▼
                 ┌───────────────────────┐
                 │ 4. Database mutation  │
                 │    (INSERT/DELETE)    │
                 └───────────┬───────────┘
                              │
                              ▼
                 ┌───────────────────────┐
                 │ 5. Cache invalidation │
                 │    (explicit keys)    │
                 └───────────┬───────────┘
                              │
                              ▼
                 ┌───────────────────────┐
                 │ 6. Return JSON        │
                 │    { count, upvoted } │
                 └───────────────────────┘
```

---

## Server Action (Admin/Founder Form)

```
┌───────────────┐     ┌────────────────────────────┐
│ Form Submit   │────▶│ Server Action (POST)       │
│ (React)       │     │ apps/admin/.../actions.ts   │
└───────────────┘     └──────────────┬─────────────┘
                                      │
                                      ▼
                      ┌──────────────────────────┐
                      │ 1. Auth check (session)  │
                      │ 2. Input validation      │
                      │ 3. Database mutation      │
                      │ 4. Audit log write        │
                      │ 5. Cache invalidation     │
                      │ 6. revalidatePath()       │
                      └──────────────┬───────────┘
                                      │
                                      ▼
                      ┌──────────────────────────┐
                      │ Return { success, error } │
                      │ UI updates automatically  │
                      └──────────────────────────┘
```

---

## Caching Layers

```
Request arrives
  │
  ├─ Layer 1: Cloudflare CDN (static assets, ISR pages)
  │     TTL: Set by Cache-Control headers
  │
  ├─ Layer 2: Next.js ISR Cache (page-level)
  │     TTL: export const revalidate = 60 (per page)
  │
  ├─ Layer 3: Upstash Redis (data-level)
  │     TTL: 5min–1hr with ±15% jitter
  │     Pattern: Stale-While-Revalidate
  │     Lock: SETNX stampede protection
  │
  └─ Layer 4: Neon PostgreSQL (source of truth)
        Always accurate, slower
```

### Cache Miss Cascade
If all layers miss → DB query → store in Redis → render → ISR caches page → CDN caches static

### Cache Invalidation
- **Deploy**: Automatic (cache version = git commit SHA)
- **Admin action**: Explicit key deletion via `invalidateCache()`
- **ISR**: `revalidatePath()` or time-based expiry

---

## File Upload Flow

```
┌──────────┐     ┌──────────────────┐     ┌─────────────┐
│  Browser │────▶│ POST /api/media  │────▶│ Validate    │
│  (File)  │     │   /upload        │     │ type + size │
└──────────┘     └──────────────────┘     └──────┬──────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │ Upload to R2    │
                                          │ (S3 putObject)  │
                                          └────────┬────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │ Return public   │
                                          │ URL (CDN)       │
                                          └─────────────────┘
```

---

## Search Flow

```
User types query
  │
  ▼
GET /api/search?q=artificial+intelligence
  │
  ├─ Build tsquery: to_tsquery('english', 'artificial & intelligence')
  │
  ├─ Query tables with searchVector:
  │     SELECT * FROM "AiTool"
  │     WHERE "searchVector" @@ tsquery
  │     ORDER BY ts_rank("searchVector", tsquery) DESC
  │
  ├─ Also search: Startup, Article (parallel)
  │
  └─ Return merged, ranked results
```

---

## Error Propagation

```
Database Error (e.g. constraint violation)
  │
  ▼
Caught in try/catch (API route or server action)
  │
  ▼
Logged: console.error → Sentry captures
  │
  ▼
User sees: { "error": "Something went wrong" } + HTTP 500
  │
  ▼
(Never expose internal error details to the client)
```

---

## Related Documents

- [System Overview](./SYSTEM_OVERVIEW.md) — Architecture diagram
- [Caching](./CACHING.md) — Redis strategy details
- [Authentication](./AUTHENTICATION.md) — Auth mechanisms

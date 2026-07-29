# Deployment Architecture

How code gets from git to production.

---

## Platform

| Service | Role |
|---------|------|
| GitHub | Source control, CI |
| GitHub Actions | Lint + build checks |
| Vercel | Hosting, deployment, serverless |
| Cloudflare | DNS, CDN, WAF, DDoS protection |

---

## Deployment Pipeline

```
Developer pushes to branch
  │
  ▼
GitHub Actions CI (.github/workflows/ci.yml)
  ├─ Job 1: Lint & Type Check
  │    npm ci → prisma generate → turbo run lint
  │
  └─ Job 2: Build (depends on Job 1)
       npm ci → prisma generate → turbo run build
  │
  ▼ (on PR)
Vercel Preview Deploy
  → Unique URL per PR
  → Full app deployed to preview environment
  → Team can test before merge
  │
  ▼ (merge to main)
Vercel Production Deploy
  → Auto-triggered on push to main
  → Atomic deployment (zero downtime)
  → Cache auto-invalidated (new VERCEL_GIT_COMMIT_SHA)
```

---

## Build Process

```bash
# What Vercel runs:
prisma generate --schema=packages/database/prisma/schema.prisma
next build
```

Build output:
- Static pages (pre-rendered)
- Dynamic pages (server-rendered on demand)
- API routes (serverless functions)
- Middleware (edge functions)

**Build time**: ~80 seconds for the web app

---

## Environment Configuration

### Vercel Dashboard
Each app has environment variables configured per environment:
- **Production**: Real secrets, production DB
- **Preview**: Same as production (or staging DB)
- **Development**: Not used (local dev uses `.env`)

### Critical Variables for Deploy
```
DATABASE_URL          → Neon pooled connection
DIRECT_URL            → Neon direct connection
NEXTAUTH_SECRET       → Auth encryption
UPSTASH_REDIS_REST_URL → Cache
UPSTASH_REDIS_REST_TOKEN → Cache auth
R2_*                  → Storage
RESEND_API_KEY        → Email
GOOGLE_CLIENT_ID      → OAuth
GOOGLE_CLIENT_SECRET  → OAuth
```

---

## Zero-Downtime Deployment

Vercel's deployment model:
1. New deployment builds in isolation
2. Once build succeeds, traffic switches atomically
3. Old deployment stays available for instant rollback
4. No connection draining needed (serverless)

---

## Rollback

### Instant Rollback
- Vercel Dashboard → Deployments → Select previous → "Redeploy"
- Takes effect in < 5 seconds
- No rebuild needed (reuses previous build artifacts)

### When to Rollback
- Production errors spike in Sentry
- Health check fails (`/api/health` returns non-200)
- Critical feature broken post-deploy

---

## Preview Deployments

Every PR gets a preview URL:
- Format: `https://aistartupimpact-{hash}.vercel.app`
- Uses production environment variables
- Full-stack deployment (not just frontend)
- Auto-deleted after PR is merged/closed

---

## Domains

| Domain | Points To |
|--------|-----------|
| `aistartupimpact.com` | Vercel (via Cloudflare proxy) |
| `www.aistartupimpact.com` | Redirect → apex |
| Admin domain | Vercel (separate project) |

DNS is managed in Cloudflare with proxy enabled (orange cloud).

---

## Cache Invalidation on Deploy

The Redis cache uses `VERCEL_GIT_COMMIT_SHA` as a key prefix:
```
abc12345:tool:categories
abc12345:tool:trending
```

On new deploy, the SHA changes → all old keys become unreachable → they expire via TTL. No manual cache clearing needed.

---

## Database Migrations

Migrations must be applied BEFORE the new code goes live:

```bash
# Run from local machine or CI:
npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma
```

**Important**: Additive migrations (new columns, new tables) are safe. Destructive migrations (drop column, rename) need coordination.

---

## Post-Deploy Checklist

- [ ] Visit homepage — loads correctly
- [ ] Check Sentry — no new error spike
- [ ] Test critical flow (search, tool detail, upvote)
- [ ] Verify Redis caching working (check metrics)
- [ ] Monitor for 15 minutes

---

## CI Configuration

```yaml
# .github/workflows/ci.yml
jobs:
  lint-and-typecheck:
    - npm ci
    - prisma generate
    - turbo run lint

  build:
    needs: lint-and-typecheck
    - npm ci
    - prisma generate
    - turbo run build
```

All env vars have dummy/placeholder values in CI (DB never connected during build).

---

## Related Documents

- [System Overview](./SYSTEM_OVERVIEW.md) — Full architecture
- [Caching](./CACHING.md) — Auto-invalidation on deploy
- [Environment Variables](../infrastructure/ENVIRONMENT.md) — All env vars
- [Operations: Deployment](../operations/DEPLOYMENT.md) — Step-by-step procedures

# Vercel Configuration

Hosting and deployment platform details.

---

## Project Setup

| Property | Value |
|----------|-------|
| Framework | Next.js (auto-detected) |
| Root Directory | `apps/web` (web), `apps/admin` (admin) |
| Build Command | `prisma generate && next build` |
| Output Directory | `.next` |
| Node.js Version | 20.x |
| Region | Auto (iad1 by default) |

---

## Environments

| Environment | Trigger | URL |
|-------------|---------|-----|
| Production | Push to `main` | aistartupimpact.com |
| Preview | Any PR | `*.vercel.app` |
| Development | Local only | localhost:3000/3001 |

---

## Build Configuration

From `turbo.json`:
- Build task depends on `^build` (packages built first)
- Environment variables explicitly listed for build access
- Outputs: `.next/**` (cached by Turborepo)
- Cache: Turborepo remote caching via Vercel

---

## Limits (Relevant)

| Limit | Value |
|-------|-------|
| Serverless function timeout | 10s (Hobby) / 60s (Pro) |
| Max function size | 50MB compressed |
| Bandwidth | 100GB/month (Hobby) |
| Build time | 45 min max |
| Preview deployments | Unlimited |
| Concurrent builds | 1 (Hobby) / 12 (Pro) |

---

## Domain Configuration

- DNS managed in Cloudflare (proxied, orange cloud)
- Vercel DNS records: CNAME to `cname.vercel-dns.com`
- SSL: Managed by Vercel (auto-renewal)
- Redirect: www → apex (configured in Vercel)

---

## Environment Variables

Set via Vercel Dashboard → Settings → Environment Variables.
See [ENVIRONMENT.md](./ENVIRONMENT.md) for complete catalog.

Critical for production:
- `DATABASE_URL`, `DIRECT_URL`
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- All `R2_*` variables
- `RESEND_API_KEY`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`

---

## Related Documents

- [Deployment Architecture](../architecture/DEPLOYMENT.md) — Pipeline details
- [Operations: Deployment](../operations/DEPLOYMENT.md) — Procedures

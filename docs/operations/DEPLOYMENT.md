# Deployment Procedures

Step-by-step guide for deploying to production.

---

## Standard Deployment (Auto)

Every push to `main` triggers an automatic Vercel deployment:

1. Merge PR to `main`
2. Vercel detects push → starts build
3. Build: `prisma generate` → `next build` (~80s)
4. Atomic swap: traffic moves to new deployment
5. Cache auto-invalidated (new `VERCEL_GIT_COMMIT_SHA`)

**No manual steps required for standard deploys.**

---

## Pre-Deploy Checklist

- [ ] CI passes (lint + build on GitHub Actions)
- [ ] PR reviewed and approved
- [ ] Database migrations applied (if schema changed)
- [ ] Environment variables synced on Vercel (if new ones added)
- [ ] No known breaking changes in PR description

---

## Database Migration Deploy

If the PR includes schema changes:

```bash
# 1. Apply migration to production DB BEFORE merging
npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma

# 2. Verify migration applied successfully
npx prisma migrate status --schema=packages/database/prisma/schema.prisma

# 3. Then merge PR (code expects new schema)
```

> ⚠️ Always apply migrations before deploying new code that depends on them.

---

## Post-Deploy Verification

After deployment completes (check Vercel dashboard):

1. Visit https://aistartupimpact.com — homepage loads
2. Check a tool detail page — data renders
3. Check Sentry — no new error spike
4. Test search — returns results
5. Monitor for 15 minutes

---

## Manual Redeploy

If you need to trigger a deploy without code changes:

- **Vercel Dashboard** → Project → Deployments → "Redeploy" on latest
- **CLI**: `npx vercel --prod` (requires Vercel CLI login)

---

## Rollback

If something breaks after deploy:

1. Go to Vercel Dashboard → Deployments
2. Find the last known-good deployment
3. Click "..." → "Promote to Production"
4. Takes effect in < 5 seconds
5. Investigate the issue on the broken build

---

## Environment Variable Updates

When adding new env vars:

1. Add to `.env.example` with description
2. Add to `turbo.json` → `tasks.build.env` (if needed at build time)
3. Add to Vercel Dashboard (Production + Preview environments)
4. Add to `docs/infrastructure/ENVIRONMENT.md`
5. Deploy (may need redeploy for vars to take effect)

---

## Related Documents

- [Architecture: Deployment](../architecture/DEPLOYMENT.md) — How the pipeline works
- [Environment Variables](../infrastructure/ENVIRONMENT.md) — Full catalog
- [Incident Response](./INCIDENT_RESPONSE.md) — When things go wrong

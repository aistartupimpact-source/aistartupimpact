# Common Issues

Developer FAQ — quick fixes for frequently encountered problems.

---

## Build & Startup

### `MODULE_NOT_FOUND` on dev server start
**Cause**: Stale `.next` cache from previous build.
```bash
rm -rf apps/web/.next apps/admin/.next
npm run dev
```

### Prisma client errors (`Cannot find module '@prisma/client'`)
**Cause**: Client not generated after schema change.
```bash
npx prisma generate --schema=packages/database/prisma/schema.prisma
```

### Port already in use
**Cause**: Previous server didn't shut down cleanly.
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or for all dev ports:
lsof -ti:3000,3001,4000 | xargs kill -9
```

### Environment variables not loading
**Cause**: Missing `.env` file or `dotenv-cli` issue.
- Check `.env` exists at project root
- Check `apps/web/.env.local` if web-specific overrides needed
- Restart dev server after changing env vars

---

## Database

### `Environment variable not found: DATABASE_URL`
**Cause**: `.env` not configured or Prisma can't find it.
```bash
# Ensure .env has DATABASE_URL
cat .env | grep DATABASE_URL

# For Prisma commands, specify schema:
npx prisma studio --schema=packages/database/prisma/schema.prisma
```

### Migration fails with `relation already exists`
**Cause**: Migration partially applied or manually modified DB.
```bash
# Check migration status
npx prisma migrate status --schema=packages/database/prisma/schema.prisma

# If stuck, mark as applied:
npx prisma migrate resolve --applied "migration_name" --schema=packages/database/prisma/schema.prisma
```

### Timestamps display wrong timezone
**Cause**: DB stores UTC without 'Z' suffix. JS parses as local time.
```typescript
// ✗ Wrong — parses as local time
new Date('2025-01-15 10:30:00')

// ✓ Correct — force UTC parsing, display as IST
new Date('2025-01-15 10:30:00' + 'Z')
  .toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
```

---

## Authentication

### Founder login redirect loop
**Cause**: `onboardingCompleted` is false but user already completed onboarding.
- Check `FounderUser` record in DB: is `onboardingCompleted` set to `true`?
- Middleware at `apps/web/middleware.ts` enforces this check

### Admin can't log in (`signIn callback returned false`)
**Cause**: User email not registered in the `User` table.
- Admin must be pre-registered by a SUPER_ADMIN
- Check: `SELECT * FROM "User" WHERE email = '...'`

### Cookie not persisting
**Cause**: `Secure` flag on cookie but accessing via HTTP (not HTTPS) locally.
- Local dev uses HTTP — cookies still work because `Secure` is only set in production
- If testing production build locally, use `localhost` (exempt from Secure requirement)

---

## Caching

### Stale data showing after admin action
**Cause**: Redis cache not invalidated.
- Ensure server action calls `invalidateToolCache()` or `invalidateCache()`
- Force refresh: deploy (new commit SHA invalidates all keys)
- Check: admin `actions.ts` includes cache invalidation

### Cache not working (all requests hit DB)
**Cause**: Missing `UPSTASH_REDIS_REST_URL` env var.
- Check: `apps/web/.env.local` has both Upstash vars
- Without Redis, app falls through to DB (works, just slower)

---

## Styling

### Tailwind classes not applying
**Cause**: New class not in Tailwind's content scan paths.
- Ensure file is in a scanned directory (check `tailwind.config.ts` → `content`)
- Restart dev server (Tailwind JIT recompiles)
- Dynamic class names (template literals) won't work — use `clsx()` instead

---

## Deployment

### Build fails on Vercel but works locally
**Cause**: Missing env var on Vercel, or TypeScript error masked by incremental build.
- Check Vercel build logs for specific error
- Ensure all env vars from `turbo.json` → `tasks.build.env` are set on Vercel
- Run clean build locally: `rm -rf apps/web/.next && npm run build`

### Preview deploy shows different data
**Cause**: Preview uses same production DB but might have stale Redis cache.
- Preview deploys get their own commit SHA → fresh cache
- If data differs, check if there's a `DATABASE_URL` override for preview

---

## Related Documents

- [Development Setup](../development/SETUP.md) — Full setup guide
- [Environment Variables](../infrastructure/ENVIRONMENT.md) — All env vars
- [Runbooks](../operations/RUNBOOKS.md) — Operational procedures

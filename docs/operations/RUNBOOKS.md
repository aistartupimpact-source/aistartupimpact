# Runbooks

Step-by-step procedures for common operational tasks.

---

## 1. Clear Redis Cache (All Keys)

When: Stale data persisting despite admin actions.

```bash
# Option A: Deploy (auto-invalidates via new commit SHA)
git commit --allow-empty -m "chore: cache bust" && git push origin main

# Option B: Via Upstash dashboard
# → Data Browser → FLUSHDB (nuclear option — use sparingly)

# Option C: Invalidate specific keys programmatically
# Call from admin dashboard or via API
```

---

## 2. Clear Specific Cache Keys

```typescript
// In admin server action or API route:
import { invalidateCache } from '@/lib/cache';
await invalidateCache('tool:trending', 'tool:recent', 'tool:categories');
```

---

## 3. Rollback Vercel Deployment

When: Bad deploy causing errors.

1. Go to https://vercel.com → Project → Deployments
2. Find the last known-good deployment (green check, before the bad one)
3. Click "..." menu → "Promote to Production"
4. Confirm → live in < 5 seconds
5. Investigate the broken deployment separately

---

## 4. Rotate a Secret

When: Secret compromised or routine rotation.

1. Generate new secret: `openssl rand -hex 32`
2. Update in Vercel Dashboard → Settings → Environment Variables
3. Update in local `.env` file
4. Trigger redeploy: Vercel → Deployments → Redeploy latest
5. Verify app works with new secret
6. Invalidate old secret (if applicable — e.g., revoke API key)

---

## 5. Restore Database from Backup

When: Accidental data deletion or corruption.

1. Go to Neon Dashboard → Project → Branches
2. Use "Point-in-time Recovery" → select timestamp before the issue
3. Creates a new branch with data at that point
4. Verify data in the recovery branch
5. Option A: Update `DATABASE_URL` to point to recovery branch
6. Option B: Export specific tables and import into production

---

## 6. Force Reindex Search Vectors

When: Search returning stale or missing results.

```sql
-- Run via psql or Prisma Studio SQL tab:

-- Reindex all tools
UPDATE "AiTool" SET "searchVector" =
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(tagline, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'C');

-- Reindex all startups
UPDATE "Startup" SET "searchVector" =
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(tagline, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'C');
```

---

## 7. Disable a User Account

When: Abuse, spam, or security concern.

```sql
-- Disable web user
UPDATE "WebUser" SET "isActive" = false WHERE email = 'spam@example.com';

-- Disable founder
UPDATE "FounderUser" SET status = 'SUSPENDED' WHERE email = 'bad@example.com';
```

---

## 8. Emergency Maintenance Mode

When: Need to take site offline for major work.

1. Vercel Dashboard → Project → Settings → General
2. Enable "Maintenance Mode" (shows maintenance page)
3. Or: Deploy a static maintenance page to `main`
4. Perform maintenance
5. Redeploy normal code or disable maintenance mode

---

## 9. Database Migration Failure Recovery

When: `prisma migrate deploy` fails in production.

1. **Don't panic** — failed migrations are rolled back automatically
2. Check error: is it a syntax error, constraint violation, or timeout?
3. Fix the migration SQL in a new migration file
4. Test locally: `prisma migrate dev`
5. Re-run: `prisma migrate deploy`

If migration partially applied (rare):
1. Check `_prisma_migrations` table for failed entry
2. Mark as rolled back: `UPDATE "_prisma_migrations" SET "rolled_back_at" = NOW() WHERE ...`
3. Fix and retry

---

## 10. Upstash Redis Memory Alert

When: Redis memory approaching plan limit.

1. Check Upstash Dashboard → Memory usage
2. Identify large keys: Dashboard → Data Browser → sort by size
3. Options:
   - Delete unused keys manually
   - Reduce TTL on large cached payloads
   - Upgrade Upstash plan
   - Review if cache cardinality is too high (too many parameterized keys)

---

## Related Documents

- [Deployment](./DEPLOYMENT.md) — Deploy procedures
- [Incident Response](./INCIDENT_RESPONSE.md) — When to use runbooks
- [Caching](../architecture/CACHING.md) — How cache works

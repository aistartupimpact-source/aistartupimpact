# Backup Strategy

How data is backed up and can be restored.

---

## Database (Neon PostgreSQL)

| Method | Frequency | Retention | Recovery |
|--------|-----------|-----------|----------|
| Point-in-time recovery | Continuous | 7 days (free) / 30 days (Pro) | < 5 min |
| Branch snapshot | On-demand | Until deleted | Instant |
| Manual pg_dump | Weekly (recommended) | As stored | Manual restore |

### Point-in-Time Recovery
1. Neon Dashboard → Project → Branches
2. "Create Branch" → select date/time
3. New branch created with data at that point
4. Verify → switch `DATABASE_URL` if needed

### Manual Backup
```bash
pg_dump $DATABASE_URL --format=custom --file=backup-$(date +%Y%m%d).dump
```

---

## Media (Cloudflare R2)

| Method | Status | Notes |
|--------|--------|-------|
| Cross-region replication | Not configured | Future improvement |
| Manual backup | Not automated | Low risk (media is supplementary) |

R2 objects are durable (11 nines) but not backed up externally. If critical, implement cross-region replication or periodic `aws s3 sync` to secondary bucket.

---

## Redis (Upstash)

| Method | Status | Notes |
|--------|--------|-------|
| Backup | Not needed | Redis is a cache, not source of truth |
| Recovery | Rebuild from DB | Cache rebuilds automatically on miss |

If Redis is flushed, the app continues working. Cache rebuilds organically as pages are visited.

---

## Secrets

| Where | Backup Method |
|-------|--------------|
| Vercel env vars | Documented in password manager |
| `.env` files | Not committed to git (local only) |
| API keys | Recorded in team password manager |

---

## Recovery Targets

| Metric | Target |
|--------|--------|
| RPO (Recovery Point Objective) | 24 hours (Neon) |
| RTO (Recovery Time Objective) | 1 hour |
| Test frequency | Quarterly |

---

## Related Documents

- [Neon PostgreSQL](./NEON.md) — Database service
- [Disaster Recovery](../architecture/DISASTER_RECOVERY.md) — Full DR plan
- [Runbooks](../operations/RUNBOOKS.md) — Restore procedures

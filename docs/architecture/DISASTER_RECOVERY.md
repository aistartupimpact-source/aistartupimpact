# Disaster Recovery

Procedures for recovering from data loss or major outages.

---

## Recovery Objectives

| Metric | Target |
|--------|--------|
| RPO (Recovery Point Objective) | 24 hours |
| RTO (Recovery Time Objective) | 1 hour |

---

## Failure Scenarios

### Database Loss
- **Cause**: Accidental deletion, migration failure, Neon outage
- **Recovery**: Neon point-in-time recovery (< 5 min to create branch)
- **Data loss**: Up to last consistent point (continuous WAL archiving)
- **Procedure**: See [Runbooks → Restore Database](../operations/RUNBOOKS.md)

### Redis Loss (Cache Flush)
- **Cause**: Upstash outage, accidental FLUSHDB, memory eviction
- **Impact**: Temporary performance degradation (all queries hit DB)
- **Recovery**: Automatic — cache rebuilds on first access per key
- **Data loss**: None (Redis is not source of truth)

### Media Storage Loss (R2)
- **Cause**: Accidental bucket deletion (extremely unlikely)
- **Impact**: Broken images across the site
- **Recovery**: No automated backup currently — manual restore from original sources
- **Mitigation**: R2 has 11 nines durability; implement cross-region replication as insurance

### Complete Deployment Failure
- **Cause**: Vercel outage, bad configuration
- **Recovery**: Wait for Vercel status.vercel.com or rollback to previous deployment
- **Impact**: Site unavailable until resolved
- **Mitigation**: Status page monitoring, Vercel auto-failover

### Secret Compromise
- **Cause**: Leaked env vars, compromised credentials
- **Recovery**: Rotate all secrets immediately (see Runbooks)
- **Impact**: Potential unauthorized access
- **Procedure**: Rotate → Redeploy → Audit access logs

---

## Recovery Procedures

### 1. Restore Database to Point in Time
```
1. Neon Dashboard → Project → Branches
2. "Create Branch" → select recovery timestamp
3. Verify data in new branch (connect via psql)
4. If correct:
   a. Update DATABASE_URL to new branch endpoint
   b. Redeploy applications
   c. OR: pg_dump new branch → pg_restore to production
5. Verify application works with restored data
```

### 2. Rebuild from Scratch (Worst Case)
```
1. Create new Neon project in same region
2. Run migrations: prisma migrate deploy
3. Restore data from latest pg_dump backup
4. Update all connection strings
5. Redeploy all applications
6. Verify functionality
```

---

## Testing DR

- **Quarterly**: Test Neon point-in-time recovery on a branch
- **Annually**: Full restore drill (create new project, restore, verify)
- **After each change**: Test that backup procedures still work

---

## Related Documents

- [Backups](../infrastructure/BACKUPS.md) — Backup schedules
- [Runbooks](../operations/RUNBOOKS.md) — Step-by-step procedures
- [Neon](../infrastructure/NEON.md) — Database service

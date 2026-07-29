# Maintenance

Scheduled maintenance procedures and windows.

---

## Maintenance Types

| Type | Frequency | Downtime | Notification |
|------|-----------|----------|-------------|
| Dependency updates | Weekly | None (auto-deploy) | None needed |
| Database migrations | As needed | None (additive) | Team only |
| Redis plan upgrade | Rare | None | Team only |
| Major infrastructure change | Rare | Possible (< 5 min) | Team + users |

---

## Routine Maintenance

### Weekly
- Review and merge Dependabot PRs
- Check Sentry for recurring errors
- Review Upstash memory usage

### Monthly
- Audit unused Redis keys
- Review slow query logs (Neon)
- Check SSL certificate expiry (auto-renewed by Cloudflare)
- Review and clean up old preview deployments

### Quarterly
- Full documentation audit (check for stale docs)
- Security dependency audit (`npm audit`)
- Database index optimization review
- Backup restore test (verify Neon point-in-time recovery works)

---

## Database Maintenance

### Adding Indexes (Zero Downtime)
```sql
-- Use CONCURRENTLY to avoid table locks:
CREATE INDEX CONCURRENTLY idx_name ON "TableName" ("column");
```

### Large Data Migrations
1. Run migration as background script (not blocking deploy)
2. Process in batches (1000 rows at a time)
3. Monitor DB CPU/memory during execution
4. Verify data integrity after completion

---

## Related Documents

- [Deployment](./DEPLOYMENT.md) — Deploy procedures
- [Runbooks](./RUNBOOKS.md) — Operational procedures
- [Database Overview](../database/OVERVIEW.md) — Migration workflow

# Neon PostgreSQL

Primary database service configuration.

---

## Configuration

| Property | Value |
|----------|-------|
| Provider | Neon (serverless PostgreSQL) |
| Version | PostgreSQL 16 |
| Region | ap-southeast-1 (Singapore) |
| Pooling | PgBouncer (via pooled connection string) |
| Auto-suspend | After 5 min inactivity |
| Auto-scale | Compute scales with load |

---

## Connection Strings

```env
# Pooled (for application queries — goes through PgBouncer)
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Direct (for migrations, Prisma Studio — bypasses pooler)
DIRECT_URL="postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

---

## Features Used

| Feature | Usage |
|---------|-------|
| Connection pooling | All app queries via pooled URL |
| Point-in-time recovery | Disaster recovery (last 7 days) |
| Branching | Development (create branch per feature — optional) |
| Auto-suspend | Cost savings on low traffic |
| Auto-scale | Handle traffic spikes |

---

## Performance

| Metric | Typical |
|--------|---------|
| Simple query | 10–50ms |
| Complex join | 50–200ms |
| Full-text search | 30–100ms |
| Cold start (after suspend) | 300–500ms (first connection) |

---

## Backups

- **Automatic**: Point-in-time recovery (7 days on free, 30 days on Pro)
- **Manual**: `pg_dump` for explicit backups
- **Branching**: Create a branch = instant snapshot

---

## Monitoring

Via Neon Dashboard:
- Active connections
- Query performance (slow query log)
- Storage usage
- Compute hours consumed

---

## Related Documents

- [Database Overview](../database/OVERVIEW.md) — Schema, conventions, workflow
- [Disaster Recovery](../architecture/DISASTER_RECOVERY.md) — Restore procedures

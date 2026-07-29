# Database Troubleshooting

Common database issues and their resolutions.

---

## Connection Issues

### `Connection refused` / `ECONNREFUSED`
- Verify `DATABASE_URL` is correct (check for typos)
- Check Neon project status: console.neon.tech
- Neon may be suspended (auto-suspends after 5 min inactivity)
- First connection after suspend takes 300-500ms (cold start)

### `Too many connections`
- Ensure using pooled URL (`-pooler` in hostname) for app queries
- Direct URL should only be used for migrations/studio
- Check for connection leaks (unclosed Prisma clients)

### `SSL connection required`
- Ensure `?sslmode=require` at end of connection string
- Neon requires SSL for all connections

---

## Migration Issues

### `Migration failed: relation "X" already exists`
```bash
# Mark migration as applied without running it:
npx prisma migrate resolve --applied "20250728_migration_name" \
  --schema=packages/database/prisma/schema.prisma
```

### `Migration failed: column "X" does not exist`
- Schema might be out of sync with DB
- Run `npx prisma db pull` to check actual DB state
- Create corrective migration

### `Cannot drop column / table` (data loss)
- Prisma warns before destructive operations
- Create a backup branch in Neon first
- Apply migration with `--force` if intentional (last resort)

---

## Query Performance

### Slow queries (> 500ms)
1. Run `EXPLAIN ANALYZE` on the query:
```sql
EXPLAIN ANALYZE SELECT ... FROM "AiTool" WHERE ...;
```
2. Check if appropriate index exists
3. Look for: Seq Scan (bad), Index Scan (good)
4. Add missing index if needed

### N+1 query problem
- Use Prisma `include` for related data in one query
- Or use raw SQL with JOINs for complex relationships
- Never query in a loop

### Full-text search slow
- Verify GIN index exists on `searchVector` column
- Check query uses `@@` operator (index-compatible)
- Simplify `to_tsquery` (fewer terms = faster)

---

## Data Issues

### Soft-deleted records appearing in results
- Ensure all queries include: `WHERE "deletedAt" IS NULL`
- Check admin views: they intentionally show deleted items

### Counts don't match between admin and public
- Public pages filter by: `isApproved = true AND deletedAt IS NULL`
- Admin pages show all records (including pending and deleted)
- About page stats should match public filters

### Enum value not valid
- Error: `Invalid value for argument "status". Expected ToolApprovalStatus`
- Check Prisma schema for valid enum values
- After adding new enum values, run `prisma migrate dev`

---

## Prisma-Specific

### `PrismaClientKnownRequestError: P2002` (Unique constraint)
- Attempted to create a duplicate (e.g., same slug, same email)
- Handle with try/catch and return user-friendly error

### `PrismaClientValidationError`
- Wrong field types or missing required fields
- Check Prisma schema for field requirements
- Ensure proper enum casting in raw SQL: `'APPROVED'::"ToolApprovalStatus"`

---

## Related Documents

- [Database Overview](../database/OVERVIEW.md) — Setup and conventions
- [Runbooks](../operations/RUNBOOKS.md) — Recovery procedures
- [Common Issues](./COMMON_ISSUES.md) — General troubleshooting

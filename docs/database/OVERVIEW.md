# Database Overview

AI Startup Impact uses Neon PostgreSQL as its primary data store with Prisma ORM for type-safe access.

---

## Infrastructure

| Property | Value |
|----------|-------|
| Provider | Neon (serverless PostgreSQL) |
| Region | ap-southeast-1 (Singapore) |
| Version | PostgreSQL 16 |
| ORM | Prisma 5.x (with `driverAdapters` preview) |
| Tables | 80+ models |
| Indexes | 474+ |
| Connection | Pooled (via `DATABASE_URL`) + Direct (via `DIRECT_URL`) |

---

## Connection Strings

```env
# Pooled connection (for application queries)
DATABASE_URL="postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Direct connection (for migrations and Prisma Studio)
DIRECT_URL="postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

The pooled connection goes through Neon's connection proxy (PgBouncer) for connection reuse. The direct connection bypasses pooling — required for DDL operations (migrations).

---

## Schema Location

```
packages/database/prisma/schema.prisma
```

The Prisma client is generated as `@aistartupimpact/database` and shared across all apps.

---

## Key Conventions

| Convention | Standard |
|-----------|----------|
| IDs | `cuid` (collision-resistant, sortable) |
| Timestamps | `createdAt` (default now()), `updatedAt` (@updatedAt) |
| Soft deletes | `deletedAt DateTime?` (null = active) |
| Enums | PascalCase values: `APPROVED`, `PENDING`, `REJECTED` |
| Booleans | `is`-prefixed: `isApproved`, `isFeatured`, `isVerified` |
| Money | `BigInt` (stored as paise/cents), displayed formatted |
| Foreign keys | `onDelete: Cascade` for owned, `SetNull` for references |
| Search | `searchVector` tsvector column + GIN index |

---

## Table Groups

| Group | Key Tables | Purpose |
|-------|-----------|---------|
| Users | User, Founder, EventOrganizer | Account management |
| Startups | Startup, FundingRound, StartupBusinessCategory | Startup directory |
| Tools | AiTool, ToolCategory, ToolSystemTag, ToolSystemTagMapping | Tool directory |
| Events | Event, EventRegistration, EventOrganizer | Events platform |
| Content | Article, NewsletterSubscriber | News + newsletter |
| Reviews | ToolReview, ToolReviewResponse | Tool feedback |
| Engagement | ToolUpvote, SavedTool, ToolClick | User interactions |
| Admin | AuditLog, User (roles) | Administration |
| Ads | AdCampaign, AdCreative, AdClick, AdImpression | Advertising |

---

## Migration Workflow

### Creating a Migration
```bash
npx prisma migrate dev --schema=packages/database/prisma/schema.prisma --name descriptive_name
```

### Applying in Production
```bash
npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma
```

### Migration Naming
Format: `YYYYMMDD_description`
- `20250728_missing_indexes`
- `20250715_add_tool_upvote_table`
- `20250701_startup_business_categories`

### Rollback
Prisma doesn't support automatic rollback. To reverse:
1. Create a new migration that undoes the change
2. Or restore from Neon point-in-time recovery

---

## Full-Text Search

Tables with search vectors:
- `Startup.searchVector` — name, tagline, description
- `AiTool.searchVector` — name, description, tagline

```sql
-- Query example
SELECT * FROM "Startup"
WHERE "searchVector" @@ to_tsquery('english', 'artificial & intelligence')
ORDER BY ts_rank("searchVector", to_tsquery('english', 'artificial & intelligence')) DESC;
```

Auto-update trigger refreshes `searchVector` on INSERT/UPDATE.

---

## Timezone Handling

> ⚠️ Important: Database stores timestamps in UTC but WITHOUT the 'Z' suffix.
> JavaScript `new Date('2025-01-15 10:30:00')` parses as LOCAL time (wrong).
> Always append 'Z': `new Date('2025-01-15 10:30:00' + 'Z')`
> Display with: `toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })`

---

## Viewing Data

```bash
# Prisma Studio (visual browser)
npx prisma studio --schema=packages/database/prisma/schema.prisma

# Raw SQL via psql
psql $DATABASE_URL
```

---

## Performance Notes

- 474+ indexes cover all major query patterns
- `EXPLAIN ANALYZE` for slow queries
- Avoid `SELECT *` — specify columns
- Use raw SQL (`prisma.$queryRaw`) for complex joins
- Use Prisma client for simple CRUD
- Connection pooling handles serverless cold starts

---

## Related Documents

- [Schema (ERD)](./SCHEMA.md) — Table relationships diagram
- [Indexes](./INDEXES.md) — Index strategy and catalog
- [Conventions](./CONVENTIONS.md) — Naming and type standards
- [Environment Variables](../infrastructure/ENVIRONMENT.md) — Connection strings

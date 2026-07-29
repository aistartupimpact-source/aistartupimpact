# ADR-002: Neon PostgreSQL as Primary Database

## Status
Accepted

## Date
2024-06-01

## Context
We needed a PostgreSQL database that works well with serverless deployment (Vercel), supports connection pooling, and minimizes operational overhead. The platform is read-heavy with moderate write volumes.

## Decision
Use Neon PostgreSQL (ap-southeast-1 region) with:
- Pooled connection for application queries (`DATABASE_URL`)
- Direct connection for migrations (`DIRECT_URL`)
- Prisma ORM for type-safe access
- `@neondatabase/serverless` for raw SQL in API routes

## Alternatives Considered
| Option | Pros | Cons |
|--------|------|------|
| Supabase | Auth, storage, realtime built-in | Vendor lock-in, heavier abstraction |
| PlanetScale (MySQL) | Branching, generous free tier | MySQL (not PostgreSQL), limited features |
| Railway PostgreSQL | Simple setup | No connection pooling, no branching |
| Neon | Serverless, branching, pooling, auto-scale | Newer service, fewer regions |
| Self-hosted PG | Full control | Operational burden, no auto-scale |

## Consequences

### Positive
- Serverless-compatible (HTTP driver, connection pooling)
- Auto-suspend on inactivity (cost savings)
- Database branching for development
- PostgreSQL features: tsvector full-text search, GIN indexes, JSONB
- Point-in-time recovery
- Scales automatically

### Negative
- Cold start latency (~300ms on first connection after suspend)
- Limited to supported regions
- Dependent on Neon's uptime (no self-hosted fallback)
- `@neondatabase/serverless` uses HTTP, slightly higher latency than TCP

## Related
- [Database Overview](../database/OVERVIEW.md)
- [Environment Variables](../infrastructure/ENVIRONMENT.md) — Connection strings

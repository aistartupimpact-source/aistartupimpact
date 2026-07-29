# ADR-001: Turborepo Monorepo Structure

## Status
Accepted

## Date
2024-06-01

## Context
The platform has 3 applications (web, admin, API) sharing database schema, types, and utilities. We needed a strategy for code organization that supports shared code without the overhead of publishing packages to a registry.

## Decision
Use Turborepo with npm workspaces to manage all applications and shared packages in a single repository.

Structure:
- `apps/web` — Public website + founder/organizer dashboards
- `apps/admin` — Internal admin dashboard
- `apps/api` — Express REST API
- `packages/database` — Shared Prisma schema + client

## Alternatives Considered
| Option | Pros | Cons |
|--------|------|------|
| Separate repos | Independent deploys, isolated CI | Code duplication, schema sync issues |
| Nx monorepo | Powerful, incremental builds | Complex config, steeper learning curve |
| Turborepo | Simple, fast, good Vercel integration | Less granular than Nx |
| Lerna | Mature, well-known | Slower, maintenance mode |

## Consequences

### Positive
- Single `npm install` for all apps
- Shared types and database client via `@aistartupimpact/database`
- Parallel builds with Turborepo caching
- Single CI pipeline covers everything
- Atomic commits across apps when schema changes

### Negative
- Larger git clone size
- All apps share the same Node.js version requirement
- Vercel project setup slightly more complex (monorepo config)

## Related
- `turbo.json` — Pipeline configuration
- `package.json` (root) — Workspace definitions

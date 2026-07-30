# Testing Strategy

Testing approach and goals for AI Startup Impact.

---

## Testing Pyramid

```
        ┌───────────┐
        │  E2E (5%) │  ← Critical user flows only
        ├───────────┤
        │Integration│  ← API routes, DB operations (20%)
        │  (20%)    │
        ├───────────┤
        │   Unit    │  ← Business logic, utilities (75%)
        │  (75%)    │
        └───────────┘
```

---

## Current State

| Type | Status | Coverage |
|------|--------|----------|
| Unit tests | ✅ Implemented | 30 tests (cache, seo, seo-utils) |
| Integration tests | Planned (Milestone 2) | 0% |
| E2E tests | Planned (Milestone 3) | 0% |
| Smoke tests | ✅ Written (post-deploy) | 6 checks |
| Manual QA | Active | Ad-hoc before deploys |
| Type checking | ✅ Active | 100% (TypeScript strict) |
| Lint | ✅ Active | 100% (ESLint on CI) |
| Build verification | ✅ Active | 100% (CI builds on every PR) |
| Security scan | ✅ Active | npm audit in CI |

---

## Recommended Test Stack

| Tool | Purpose | Status |
|------|---------|--------|
| Vitest 2.x | Unit + integration testing (fast, TS-native) | ✅ Installed |
| Playwright | E2E browser testing | Planned |
| MSW | API mocking for component tests | Installed |
| Testing Library | Component testing | Installed |

---

## What to Test First (Priority)

### P1 — Business Logic
- Upvote toggle logic (count, limits, constraints)
- Auth token verification
- Cache SWR logic (fresh vs stale vs expired)
- Search query building
- Permission checks (canDelete, role validation)

### P2 — API Routes
- Upvote endpoint (auth, limits, toggle)
- Newsletter subscribe (validation, rate limit)
- Search endpoint (query parsing, results)
- Media upload (type/size validation)

### P3 — E2E Flows
- Homepage → search → tool detail → upvote
- Founder: login → submit tool → see in dashboard
- Admin: login → approve tool → appears publicly

---

## Test File Conventions

```
apps/web/
├── lib/
│   ├── cache.ts
│   └── cache.test.ts          ← Unit test next to source
├── app/api/tools/[id]/upvote/
│   ├── route.ts
│   └── route.test.ts          ← Integration test
└── __tests__/
    └── e2e/
        └── tool-upvote.spec.ts ← E2E test
```

---

## Running Tests

```bash
# Unit + Integration (from root)
npm test

# From web app directly
cd apps/web && npx vitest --run

# Watch mode (during development)
cd apps/web && npx vitest

# Smoke tests (requires running server)
cd apps/web && npm run test:smoke
```

---

## CI Integration

Current CI (`.github/workflows/ci.yml`):
- ✅ Lint & type check
- ✅ Unit & Integration tests (`npm test`)
- ✅ Security scan (`npm audit`)
- ✅ Build all apps
- Tests must pass before build job runs

---

## Related Documents

- [Unit Testing](./UNIT_TESTING.md) — Patterns and examples
- [E2E Testing](./E2E_TESTING.md) — Browser testing setup
- [Development Setup](../development/SETUP.md) — Local environment

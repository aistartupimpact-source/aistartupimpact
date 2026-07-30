# Testing Plan — AI Startup Impact

> Industry-standard testing strategy. Visual Regression postponed until UI stabilizes.

---

## Testing Principles

1. Test business logic before UI
2. Prefer integration tests over excessive mocking
3. Every production bug must result in a regression test
4. Tests must be deterministic and independent
5. Keep tests fast enough for CI (unit suite < 30s, integration < 2min)
6. Avoid testing framework internals — test behavior, not implementation
7. Minimize flaky tests — quarantine within 24h, fix within 48h
8. Test the contract, not the code — inputs and outputs matter

---

## Test Environments

| Environment | Purpose | Tests Run |
|-------------|---------|-----------|
| Local | Developer testing during development | Unit, Integration |
| CI (GitHub Actions) | Pull Request verification | Unit, Integration, Lint, Build, Security |
| Staging (Preview Deploy) | Pre-production validation | E2E, Smoke |
| Production | Post-deploy verification | Smoke tests, Health checks |

---

## Tool Stack

| Layer | Tool | Rationale |
|-------|------|-----------|
| Unit | Vitest | Fast, TS-native, Jest-compatible |
| Component | Testing Library | Tests user behavior |
| Integration | Vitest (direct route handler imports) | No external server needed |
| E2E | Playwright | Cross-browser, auto-wait, reliable |
| Performance | Lighthouse CI + k6 | Web Vitals + load testing |
| Security | Semgrep (SAST) + npm audit + gitleaks | Layered scanning |
| Accessibility | axe-core via Playwright | WCAG 2.1 AA automation |
| Mocking | MSW (Mock Service Worker) | Network-level interception |
| Coverage | Vitest c8/istanbul | Enforced in CI |

---

## Browser Support Matrix

| Browser | Status | E2E Testing |
|---------|--------|-------------|
| Chrome | Primary | ✅ Always |
| Edge | Supported | ✅ CI |
| Firefox | Supported | ✅ CI |
| Safari | Supported | ✅ CI (WebKit) |

---

## Folder Structure

```
apps/web/
├── __tests__/
│   ├── unit/                ← Pure function + utility tests
│   ├── integration/         ← API route handler tests
│   ├── e2e/                 ← Playwright browser tests
│   ├── smoke/               ← Post-deploy smoke tests
│   ├── fixtures/            ← Reusable test data
│   ├── mocks/               ← MSW handlers, mock implementations
│   ├── helpers/             ← Test utilities (createMockRequest, etc.)
│   └── data/                ← Static JSON test payloads
├── vitest.config.ts
├── vitest.integration.config.ts
├── playwright.config.ts
└── setupTests.ts

apps/admin/
├── __tests__/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
└── vitest.config.ts
```

---

## Test Data Strategy

| Concern | Approach |
|---------|----------|
| Seed data | Factory functions: `createMockTool()`, `createMockStartup()`, `createMockUser()` |
| Fixtures | Static JSON for known scenarios |
| DB isolation | Each test uses transaction rollback |
| Mock users | Predefined JWT tokens per auth type |
| Cleanup | `afterEach` resets state; no test depends on another |
| Factories | Composable: `createMockTool({ status: 'APPROVED', upvoteCount: 10 })` |

---

## Risk-Based Testing Priority

| Risk Level | Features | Coverage Goal |
|-----------|----------|---------------|
| **Critical** | Authentication, Permissions, Delete access, Tool/Startup submission | 95%+ |
| **High** | Search, SEO, Newsletter, Events, Upvotes, Cache layer | 85%+ |
| **Medium** | About, Contact, Static pages, Stories, India AI | 70%+ |
| **Low** | Dark mode, Footer links, Social icons | Manual QA only |

---

## Coverage Thresholds (Enforced in CI)

**Global minimum**:
```
Lines:      80%
Statements: 80%
Functions:  80%
Branches:   70%
```

**Critical modules (per-file enforcement)**:
| Module | Target |
|--------|--------|
| `lib/cache.ts` | 95% |
| `lib/founder-auth.ts` | 95% |
| `lib/organizer-auth/` | 95% |
| `admin/lib/audit-log.ts` | 95% |
| Upvote route | 95% |
| Auth routes | 95% |

---

## Performance Budgets

| Metric | Budget |
|--------|--------|
| JS bundle (shared) | < 200 KB |
| API P95 latency | < 500 ms |
| DB query (critical) | < 100 ms |
| Image size | < 300 KB |
| CLS | < 0.1 |
| LCP | < 2.5s |
| Lighthouse Performance | ≥ 90 |
| Time to Interactive | < 3.8s |

---

## Testing Ownership

| Area | Owner |
|------|-------|
| Unit Tests | Feature developer |
| Integration Tests | Feature developer |
| E2E Tests | Platform team |
| Security | Engineering |
| Performance | Engineering |
| Accessibility | Engineering + QA |
| Smoke Tests | Platform team (automated) |

---

## CI Quality Gates

| Check | Required to Merge | Enforcement |
|-------|-------------------|-------------|
| TypeScript compile | ✅ Yes | CI blocks |
| ESLint | ✅ Yes | CI blocks |
| Unit tests pass | ✅ Yes | CI blocks |
| Integration tests pass | ✅ Yes | CI blocks |
| Build succeeds | ✅ Yes | CI blocks |
| Security scan | ✅ Yes | CI blocks |
| Coverage ≥ threshold | ✅ Yes | CI blocks |
| Performance budget | ⚠️ Warning | PR comment |
| E2E tests | Main branch only | Post-merge |
| Accessibility | ⚠️ Warning | PR comment |

---

## Smoke Tests (Post-Deploy)

Run immediately after every deployment. Must complete in < 60 seconds.

| Check | Expected |
|-------|----------|
| Homepage returns 200 | HTML renders |
| `/api/health` returns healthy | `{ status: "ok" }` |
| Database connection | Query succeeds |
| Auth endpoint responds | `/api/user/session` → 200 |
| Search endpoint responds | `/api/search?q=test` → 200 |
| Newsletter endpoint accepts | POST with valid email → 200 |
| Redis connectivity | Cache read succeeds |

---

## Disaster Recovery Testing

| Scenario | Test Procedure | Frequency |
|----------|---------------|-----------|
| Database restore | Neon point-in-time recovery to branch → verify data | Quarterly |
| Backup restore | pg_dump restore to test branch → verify integrity | Quarterly |
| Env var recovery | Rebuild from password manager → redeploy → verify | Annually |
| Cloudflare outage | Bypass proxy → verify direct Vercel access | Annually |
| Vercel rollback | Promote previous deployment → verify site works | After incidents |
| Redis loss | Flush Redis → verify app degrades gracefully | Quarterly |

---

## Dependency Update Testing

When dependencies are upgraded:
1. Run full CI pipeline (lint + build + unit + integration)
2. Execute critical E2E flows (tool discovery, search, auth)
3. Compare Lighthouse scores (flag > 5 point regression)
4. Review bundle size changes (flag > 10% growth)
5. Run `npm audit` to verify no new vulnerabilities introduced

---

## Release Validation Checklist

Before each production release:
- [ ] All CI checks pass (lint, build, tests, security)
- [ ] No high-severity security findings
- [ ] Coverage thresholds met
- [ ] Lighthouse budgets satisfied
- [ ] Database migrations verified (if applicable)
- [ ] Env vars synced on Vercel (if new ones)
- [ ] Rollback plan confirmed (previous deploy identified)
- [ ] Smoke tests pass post-deploy

---

## Flaky Test Policy

| Step | Action | SLA |
|------|--------|-----|
| 1. Detect | Test fails intermittently in CI | — |
| 2. Mark | Add `@flaky` tag, document in issue | Same day |
| 3. Remove from required CI | Move to separate "flaky" job (non-blocking) | Same day |
| 4. Fix | Investigate root cause, make deterministic | 48 hours |
| 5. Re-enable | Remove `@flaky` tag, restore to required CI | After fix verified |

Common flaky causes: timing issues, shared state, network dependencies, date/time.

---

## Regression Policy

> No production bug is considered resolved until an automated regression test has been added that reproduces and verifies the fix.

Workflow:
1. Bug reported → reproduce manually
2. Write a failing test that demonstrates the bug
3. Fix the code → test now passes
4. Both fix and test merged in the same PR
5. Bug marked as resolved only after PR is deployed

---

## Definition of Done (Every Feature)

- [ ] Feature implemented and working
- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] Unit tests added for new business logic
- [ ] Integration tests updated for new/changed APIs
- [ ] Documentation updated
- [ ] Performance acceptable (no Lighthouse regression)
- [ ] Security reviewed (no secrets, parameterized queries)
- [ ] Accessibility verified (keyboard nav, axe scan)
- [ ] Tested on mobile viewport (375px)

---

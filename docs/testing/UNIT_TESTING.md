# Unit Testing

Patterns and guidelines for unit tests.

---

## Setup (Vitest)

```bash
# Install
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Run
npx vitest         # Watch mode
npx vitest --run   # Single run (for CI)
```

---

## What to Unit Test

| Category | Examples |
|----------|---------|
| Utility functions | `formatCurrency()`, `buildFilterHash()`, `fmt()` |
| Business logic | Upvote eligibility, permission checks, validation |
| Cache logic | TTL jitter calculation, key generation, serialization |
| SEO helpers | Schema generation, metadata building |
| Data transforms | API response formatting, date parsing |

---

## Test Pattern

```typescript
// lib/cache.test.ts
import { describe, it, expect } from 'vitest';
import { buildFilterHash } from './cache';

describe('buildFilterHash', () => {
  it('returns "default" for no active filters', () => {
    expect(buildFilterHash({})).toBe('default');
  });

  it('returns null for more than 2 active filters', () => {
    expect(buildFilterHash({ a: 'x', b: 'y', c: 'z' })).toBeNull();
  });

  it('sorts params alphabetically', () => {
    expect(buildFilterHash({ sort: 'name', category: 'ai' }))
      .toBe('category=ai&sort=name');
  });

  it('ignores "all" values', () => {
    expect(buildFilterHash({ category: 'all', sort: 'name' }))
      .toBe('sort=name');
  });
});
```

---

## Mocking

```typescript
import { vi } from 'vitest';

// Mock environment variables
vi.stubEnv('DATABASE_URL', 'postgresql://test');

// Mock modules
vi.mock('@neondatabase/serverless', () => ({
  neon: () => vi.fn().mockResolvedValue([]),
}));

// Mock fetch
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ success: true }),
});
```

---

## Conventions

- Test files: `*.test.ts` next to the source file
- Describe blocks: match function/module name
- Test names: describe behavior, not implementation
- One assertion per test (prefer focused tests)
- No database calls in unit tests (mock them)

---

## Related Documents

- [Testing Strategy](./STRATEGY.md) — Overall approach
- [Coding Standards](../development/CODING_STANDARDS.md) — Code conventions

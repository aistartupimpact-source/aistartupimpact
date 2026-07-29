# E2E Testing

Browser-based end-to-end testing with Playwright.

---

## Setup

```bash
# Install
npm install -D @playwright/test
npx playwright install

# Run
npx playwright test              # All tests
npx playwright test --ui         # Interactive mode
npx playwright test --project=chromium  # Single browser
```

---

## Critical Flows to Test

| Flow | Steps |
|------|-------|
| Tool discovery | Homepage → Tools page → Filter → Detail page |
| Tool upvote | Login → Tool detail → Click upvote → Count updates |
| Startup browse | Startups page → Search → Filter by city → Detail |
| Founder submit tool | Login (Google) → Submit form → See in dashboard |
| Newsletter subscribe | Footer form → Enter email → Success message |
| Admin approve | Login → Tools manage → Approve → Appears publicly |

---

## Test Pattern

```typescript
import { test, expect } from '@playwright/test';

test('user can search for AI tools', async ({ page }) => {
  await page.goto('/tools');
  
  // Search
  await page.getByPlaceholder('Search AI tools').fill('chatbot');
  await page.keyboard.press('Enter');
  
  // Results appear
  await expect(page.getByText('ChatGPT')).toBeVisible();
});

test('upvote requires authentication', async ({ page }) => {
  await page.goto('/tools/chatgpt');
  
  // Click upvote without being logged in
  await page.getByRole('button', { name: /upvote/i }).click();
  
  // Should show login prompt
  await expect(page.getByText('Login required')).toBeVisible();
});
```

---

## Configuration

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './__tests__/e2e',
  baseURL: 'http://localhost:3000',
  use: {
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true,
  },
});
```

---

## CI Integration

Run E2E only on `main` branch (not on every PR — too slow):

```yaml
# In .github/workflows/ci.yml (future addition)
e2e:
  if: github.ref == 'refs/heads/main'
  steps:
    - run: npx playwright install --with-deps
    - run: npx playwright test
```

---

## Related Documents

- [Testing Strategy](./STRATEGY.md) — Overall approach
- [Development Setup](../development/SETUP.md) — Running locally

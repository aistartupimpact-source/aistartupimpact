import { test, expect } from '@playwright/test';

test.describe('Smoke tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/AI Startup Impact/i);
  });

  test('homepage has navigation', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav, header');
    await expect(nav.first()).toBeVisible();
  });

  test('homepage has footer', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('no console errors on homepage', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const realErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('hydration') && !e.includes('Warning:')
    );
    expect(realErrors).toHaveLength(0);
  });

  test('meta description exists', async ({ page }) => {
    await page.goto('/');
    const desc = page.locator('meta[name="description"]');
    await expect(desc).toHaveAttribute('content', /.+/);
  });

  test('404 page renders for unknown route', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345');
    expect(response?.status()).toBe(404);
  });

  test('key public pages return 200', async ({ page }) => {
    const publicPages = ['/about', '/jobs', '/startups', '/events', '/funding', '/search'];
    for (const path of publicPages) {
      const response = await page.goto(path);
      expect(response?.status(), `${path} should return 200`).toBe(200);
    }
  });
});

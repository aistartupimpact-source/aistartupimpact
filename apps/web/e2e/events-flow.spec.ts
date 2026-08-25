import { test, expect } from '@playwright/test';

test.describe('Events flow', () => {
  test('events page loads', async ({ page }) => {
    const response = await page.goto('/events');
    expect(response?.status()).toBe(200);
  });

  test('events page has content', async ({ page }) => {
    await page.goto('/events');
    await page.waitForLoadState('domcontentloaded');
    const body = await page.textContent('body');
    expect(
      body?.toLowerCase().includes('event') || body?.toLowerCase().includes('upcoming')
    ).toBeTruthy();
  });

  test('event detail page loads for valid slug', async ({ page }) => {
    await page.goto('/events');
    await page.waitForLoadState('domcontentloaded');
    const eventLink = page.locator('a[href*="/events/"]').first();
    if (await eventLink.isVisible().catch(() => false)) {
      const href = await eventLink.getAttribute('href');
      if (href && !href.includes('/my')) {
        await eventLink.click();
        await page.waitForLoadState('domcontentloaded');
        expect(page.url()).toContain('/events/');
      }
    }
  });

  test('funding page loads', async ({ page }) => {
    const response = await page.goto('/funding');
    expect(response?.status()).toBe(200);
  });

  test('funding page shows dashboard content', async ({ page }) => {
    await page.goto('/funding');
    await page.waitForLoadState('domcontentloaded');
    const body = await page.textContent('body');
    expect(
      body?.toLowerCase().includes('funding') || body?.toLowerCase().includes('investment')
    ).toBeTruthy();
  });
});

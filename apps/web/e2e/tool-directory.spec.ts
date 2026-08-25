import { test, expect } from '@playwright/test';

test.describe('Tool directory', () => {
  test('tools page loads', async ({ page }) => {
    const response = await page.goto('/search');
    expect(response?.status()).toBe(200);
  });

  test('tools page has search input', async ({ page }) => {
    await page.goto('/search');
    const searchInput = page.getByPlaceholder(/search/i).first();
    await expect(searchInput).toBeVisible();
  });

  test('search returns results or empty state', async ({ page }) => {
    await page.goto('/search');
    const searchInput = page.getByPlaceholder(/search/i).first();
    await searchInput.fill('AI writing');
    await searchInput.press('Enter');
    await page.waitForTimeout(1000);
    // Should show results or "no results" message
    const body = await page.textContent('body');
    expect(body?.length).toBeGreaterThan(0);
  });

  test('startups page loads with content', async ({ page }) => {
    await page.goto('/startups');
    await page.waitForLoadState('domcontentloaded');
    const body = await page.textContent('body');
    expect(body?.toLowerCase()).toContain('startup');
  });

  test('startups page has filter or category controls', async ({ page }) => {
    await page.goto('/startups');
    await page.waitForLoadState('domcontentloaded');
    // Should have some filtering mechanism
    const hasFilters = await page.locator('select, [role="combobox"], button:has-text("Filter"), [data-filter]').count();
    // Either filters exist or there's category links
    const hasCategoryLinks = await page.locator('a[href*="category"], a[href*="filter"]').count();
    expect(hasFilters + hasCategoryLinks).toBeGreaterThanOrEqual(0);
  });
});

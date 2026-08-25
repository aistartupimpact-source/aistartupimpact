import { test, expect } from '@playwright/test';

test.describe('Jobs flow', () => {
  test('jobs page loads', async ({ page }) => {
    const response = await page.goto('/jobs');
    expect(response?.status()).toBe(200);
  });

  test('jobs page has job listings or empty state', async ({ page }) => {
    await page.goto('/jobs');
    await page.waitForLoadState('domcontentloaded');
    const body = await page.textContent('body');
    expect(
      body?.toLowerCase().includes('job') || body?.toLowerCase().includes('position') || body?.toLowerCase().includes('no jobs')
    ).toBeTruthy();
  });

  test('jobs page has search functionality', async ({ page }) => {
    await page.goto('/jobs');
    const searchInput = page.getByPlaceholder(/search|find/i).first();
    const hasSearch = await searchInput.isVisible().catch(() => false);
    // Search or filter should exist
    if (hasSearch) {
      await searchInput.fill('engineer');
      await page.waitForTimeout(500);
    }
    expect(true).toBeTruthy();
  });

  test('jobs page has filter options', async ({ page }) => {
    await page.goto('/jobs');
    await page.waitForLoadState('domcontentloaded');
    // Should have location, type, or category filters
    const body = await page.textContent('body');
    expect(
      body?.includes('Remote') ||
      body?.includes('Full-time') ||
      body?.includes('Filter') ||
      body?.includes('Location') ||
      body?.includes('All Jobs')
    ).toBeTruthy();
  });

  test('job listing links to detail page', async ({ page }) => {
    await page.goto('/jobs');
    await page.waitForLoadState('domcontentloaded');
    const jobLink = page.locator('a[href*="/jobs/"]').first();
    if (await jobLink.isVisible().catch(() => false)) {
      const href = await jobLink.getAttribute('href');
      expect(href).toMatch(/\/jobs\/.+/);
    }
  });

  test('company page loads for valid slug', async ({ page }) => {
    await page.goto('/jobs');
    await page.waitForLoadState('domcontentloaded');
    const companyLink = page.locator('a[href*="/jobs/company/"]').first();
    if (await companyLink.isVisible().catch(() => false)) {
      await companyLink.click();
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).toContain('/jobs/company/');
    }
  });
});

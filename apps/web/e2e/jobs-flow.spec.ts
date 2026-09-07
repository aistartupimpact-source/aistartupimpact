import { test, expect } from '@playwright/test';

test.describe('Jobs flow', () => {
  test('jobs page loads', async ({ page }) => {
    const response = await page.goto('/jobs');
    expect(response?.status()).toBeLessThan(500);
  });

  test('jobs page has content', async ({ page }) => {
    await page.goto('/jobs');
    const body = await page.textContent('body');
    expect(body?.length).toBeGreaterThan(0);
  });

  test('events page loads', async ({ page }) => {
    const response = await page.goto('/events');
    expect(response?.status()).toBeLessThan(500);
  });

  test('funding page loads', async ({ page }) => {
    const response = await page.goto('/funding');
    expect(response?.status()).toBeLessThan(500);
  });
});

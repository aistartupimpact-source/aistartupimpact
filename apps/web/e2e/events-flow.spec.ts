import { test, expect } from '@playwright/test';

test.describe('Events & Funding pages', () => {
  test('events page loads', async ({ page }) => {
    const response = await page.goto('/events');
    expect(response?.status()).toBeLessThan(500);
  });

  test('funding page loads', async ({ page }) => {
    const response = await page.goto('/funding');
    expect(response?.status()).toBeLessThan(500);
  });

  test('news page loads', async ({ page }) => {
    const response = await page.goto('/news');
    expect(response?.status()).toBeLessThan(500);
  });

  test('newsletter page loads', async ({ page }) => {
    const response = await page.goto('/newsletter');
    expect(response?.status()).toBeLessThan(500);
  });
});

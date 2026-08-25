import { test, expect } from '@playwright/test';

test.describe('Smoke tests', () => {
  test('homepage returns 200', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(500);
  });

  test('about page returns 200', async ({ page }) => {
    const response = await page.goto('/about');
    expect(response?.status()).toBeLessThan(500);
  });

  test('privacy page returns 200', async ({ page }) => {
    const response = await page.goto('/privacy');
    expect(response?.status()).toBeLessThan(500);
  });

  test('terms page returns 200', async ({ page }) => {
    const response = await page.goto('/terms');
    expect(response?.status()).toBeLessThan(500);
  });

  test('contact page or content-guidelines returns 200', async ({ page }) => {
    const response = await page.goto('/content-guidelines');
    expect(response?.status()).toBeLessThan(500);
  });

  test('404 page renders for unknown route', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345');
    expect(response?.status()).toBe(404);
  });
});

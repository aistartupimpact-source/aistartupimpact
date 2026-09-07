import { test, expect } from '@playwright/test';

test.describe('Organizer portal', () => {
  test('organizer landing page loads', async ({ page }) => {
    const response = await page.goto('/organizer');
    expect(response?.status()).toBeLessThan(500);
  });

  test('organizer events does not return 500', async ({ page }) => {
    const response = await page.goto('/organizer/events');
    expect(response?.status()).toBeLessThan(500);
  });

  test('organizer attendees does not return 500', async ({ page }) => {
    const response = await page.goto('/organizer/attendees');
    expect(response?.status()).toBeLessThan(500);
  });

  test('organizer check-in does not return 500', async ({ page }) => {
    const response = await page.goto('/organizer/check-in');
    expect(response?.status()).toBeLessThan(500);
  });

  test('organizer settings does not return 500', async ({ page }) => {
    const response = await page.goto('/organizer/settings');
    expect(response?.status()).toBeLessThan(500);
  });

  test('organizer login has email field', async ({ page }) => {
    await page.goto('/organizer/login');
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
  });

  test('organizer login has password field', async ({ page }) => {
    await page.goto('/organizer/login');
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });
});

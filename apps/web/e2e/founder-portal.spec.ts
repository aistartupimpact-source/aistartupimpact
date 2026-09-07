import { test, expect } from '@playwright/test';

test.describe('Founder portal', () => {
  test('founder landing page loads', async ({ page }) => {
    const response = await page.goto('/founder');
    expect(response?.status()).toBeLessThan(500);
  });

  test('founder dashboard does not return 500', async ({ page }) => {
    const response = await page.goto('/founder/dashboard');
    expect(response?.status()).toBeLessThan(500);
  });

  test('founder startups does not return 500', async ({ page }) => {
    const response = await page.goto('/founder/startups');
    expect(response?.status()).toBeLessThan(500);
  });

  test('founder content does not return 500', async ({ page }) => {
    const response = await page.goto('/founder/content');
    expect(response?.status()).toBeLessThan(500);
  });

  test('founder team does not return 500', async ({ page }) => {
    const response = await page.goto('/founder/team');
    expect(response?.status()).toBeLessThan(500);
  });

  test('founder settings does not return 500', async ({ page }) => {
    const response = await page.goto('/founder/settings');
    expect(response?.status()).toBeLessThan(500);
  });

  test('founder onboarding does not return 500', async ({ page }) => {
    const response = await page.goto('/founder/onboarding');
    expect(response?.status()).toBeLessThan(500);
  });

  test('login page has email input', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
  });
});

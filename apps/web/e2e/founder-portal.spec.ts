import { test, expect } from '@playwright/test';

test.describe('Founder portal', () => {
  test.describe('unauthenticated access', () => {
    test('founder landing page loads', async ({ page }) => {
      const response = await page.goto('/founder');
      expect(response?.status()).toBeLessThan(400);
    });

    test('founder dashboard requires auth', async ({ page }) => {
      await page.goto('/founder/dashboard');
      await page.waitForTimeout(1000);
      const url = page.url();
      // Should redirect to login or show auth wall
      const body = await page.textContent('body');
      expect(
        url.includes('login') ||
        url.includes('auth') ||
        body?.includes('Sign in') ||
        body?.includes('Log in')
      ).toBeTruthy();
    });

    test('founder startups page requires auth', async ({ page }) => {
      await page.goto('/founder/startups');
      await page.waitForTimeout(1000);
      const url = page.url();
      const body = await page.textContent('body');
      expect(
        url.includes('login') || url.includes('auth') ||
        body?.includes('Sign in') || body?.includes('Log in') ||
        body?.includes('Unauthorized')
      ).toBeTruthy();
    });

    test('founder content page requires auth', async ({ page }) => {
      await page.goto('/founder/content');
      await page.waitForTimeout(1000);
      const url = page.url();
      const body = await page.textContent('body');
      expect(
        url.includes('login') || url.includes('auth') ||
        body?.includes('Sign in') || body?.includes('Log in')
      ).toBeTruthy();
    });

    test('founder team page requires auth', async ({ page }) => {
      await page.goto('/founder/team');
      await page.waitForTimeout(1000);
      const url = page.url();
      const body = await page.textContent('body');
      expect(
        url.includes('login') || url.includes('auth') ||
        body?.includes('Sign in') || body?.includes('Log in')
      ).toBeTruthy();
    });

    test('founder analytics page requires auth', async ({ page }) => {
      await page.goto('/founder/analytics');
      await page.waitForTimeout(1000);
      const url = page.url();
      const body = await page.textContent('body');
      expect(
        url.includes('login') || url.includes('auth') ||
        body?.includes('Sign in') || body?.includes('Log in')
      ).toBeTruthy();
    });

    test('founder settings page requires auth', async ({ page }) => {
      await page.goto('/founder/settings');
      await page.waitForTimeout(1000);
      const url = page.url();
      const body = await page.textContent('body');
      expect(
        url.includes('login') || url.includes('auth') ||
        body?.includes('Sign in') || body?.includes('Log in')
      ).toBeTruthy();
    });

    test('founder profile page requires auth', async ({ page }) => {
      await page.goto('/founder/profile');
      await page.waitForTimeout(1000);
      const url = page.url();
      const body = await page.textContent('body');
      expect(
        url.includes('login') || url.includes('auth') ||
        body?.includes('Sign in') || body?.includes('Log in')
      ).toBeTruthy();
    });
  });

  test.describe('login form', () => {
    test('login page has email input', async ({ page }) => {
      await page.goto('/auth/login');
      await expect(page.getByPlaceholder(/email/i).first()).toBeVisible();
    });

    test('login page has founder tab', async ({ page }) => {
      await page.goto('/auth/login');
      const body = await page.textContent('body');
      expect(
        body?.includes('Founder') || body?.includes('founder')
      ).toBeTruthy();
    });

    test('onboarding page requires auth', async ({ page }) => {
      await page.goto('/founder/onboarding');
      await page.waitForTimeout(1000);
      const url = page.url();
      const body = await page.textContent('body');
      expect(
        url.includes('login') || url.includes('auth') ||
        body?.includes('Sign in') || body?.includes('Log in')
      ).toBeTruthy();
    });
  });
});

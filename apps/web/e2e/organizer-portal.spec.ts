import { test, expect } from '@playwright/test';

test.describe('Organizer portal', () => {
  test.describe('unauthenticated access', () => {
    test('organizer landing page loads', async ({ page }) => {
      const response = await page.goto('/organizer');
      expect(response?.status()).toBeLessThan(400);
    });

    test('organizer events page requires auth', async ({ page }) => {
      await page.goto('/organizer/events');
      await page.waitForTimeout(1000);
      const url = page.url();
      const body = await page.textContent('body');
      expect(
        url.includes('login') || url.includes('auth') ||
        body?.includes('Sign in') || body?.includes('Log in')
      ).toBeTruthy();
    });

    test('organizer attendees page requires auth', async ({ page }) => {
      await page.goto('/organizer/attendees');
      await page.waitForTimeout(1000);
      const url = page.url();
      const body = await page.textContent('body');
      expect(
        url.includes('login') || url.includes('auth') ||
        body?.includes('Sign in') || body?.includes('Log in')
      ).toBeTruthy();
    });

    test('organizer check-in page requires auth', async ({ page }) => {
      await page.goto('/organizer/check-in');
      await page.waitForTimeout(1000);
      const url = page.url();
      const body = await page.textContent('body');
      expect(
        url.includes('login') || url.includes('auth') ||
        body?.includes('Sign in') || body?.includes('Log in')
      ).toBeTruthy();
    });

    test('organizer analytics requires auth', async ({ page }) => {
      await page.goto('/organizer/analytics');
      await page.waitForTimeout(1000);
      const url = page.url();
      const body = await page.textContent('body');
      expect(
        url.includes('login') || url.includes('auth') ||
        body?.includes('Sign in') || body?.includes('Log in')
      ).toBeTruthy();
    });

    test('organizer team page requires auth', async ({ page }) => {
      await page.goto('/organizer/team');
      await page.waitForTimeout(1000);
      const url = page.url();
      const body = await page.textContent('body');
      expect(
        url.includes('login') || url.includes('auth') ||
        body?.includes('Sign in') || body?.includes('Log in')
      ).toBeTruthy();
    });

    test('organizer settings requires auth', async ({ page }) => {
      await page.goto('/organizer/settings');
      await page.waitForTimeout(1000);
      const url = page.url();
      const body = await page.textContent('body');
      expect(
        url.includes('login') || url.includes('auth') ||
        body?.includes('Sign in') || body?.includes('Log in')
      ).toBeTruthy();
    });

    test('organizer profile requires auth', async ({ page }) => {
      await page.goto('/organizer/profile');
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
    test('organizer login page has email field', async ({ page }) => {
      await page.goto('/organizer/login');
      await expect(page.getByPlaceholder(/email/i).first()).toBeVisible();
    });

    test('organizer login has password field', async ({ page }) => {
      await page.goto('/organizer/login');
      await expect(page.locator('input[type="password"]').first()).toBeVisible();
    });

    test('organizer login has signup option', async ({ page }) => {
      await page.goto('/organizer/login');
      const body = await page.textContent('body');
      expect(
        body?.includes('Sign up') || body?.includes('Create') || body?.includes('Register')
      ).toBeTruthy();
    });
  });
});

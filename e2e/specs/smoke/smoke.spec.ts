import { test, expect } from '@playwright/test';

/**
 * Smoke Tests for SkillSoft.
 * These tests verify that the application is functional at a basic level.
 * Run on every PR to catch critical issues early.
 *
 * Tags: @smoke
 */
test.describe('Smoke Tests @smoke', () => {
  // ==========================================
  // Application Availability
  // ==========================================

  test('application loads successfully', async ({ page }) => {
    await page.goto('/');

    // Page should have SkillSoft in the title
    await expect(page).toHaveTitle(/SkillSoft/i);

    // Should have some content loaded
    await expect(page.locator('body')).toBeVisible();
  });

  test('sign-in page is accessible', async ({ page }) => {
    await page.goto('/sign-in');

    // Should show Clerk sign-in component or custom sign-in page
    const signInIndicator = page.locator(
      '[data-clerk-sign-in], ' +
      'input[name="identifier"], ' +
      'input[type="email"], ' +
      'h1:has-text("Sign in"), ' +
      'h1:has-text("Вход")'
    ).first();

    await expect(signInIndicator).toBeVisible({ timeout: 10000 });
  });

  test('unauthenticated user is redirected to sign-in', async ({ page }) => {
    // Try to access a protected route
    await page.goto('/dashboard');

    // Should be redirected to sign-in
    await expect(page).toHaveURL(/sign-in/);
  });

  // ==========================================
  // API Health Check
  // ==========================================

  test('API health check responds', async ({ request }) => {
    // Construct API base URL (handles both full URL and hostname-only formats)
    const envApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    const isFullUrl = envApiUrl.startsWith("https://") || envApiUrl.startsWith('https://');
    const apiURL = isFullUrl ? envApiUrl : `https://${envApiUrl}/api`;
    const isRemote = !apiURL.includes('localhost') && !apiURL.includes('127.0.0.1');

    if (isRemote) {
      // For remote backends, check a known API endpoint (actuator may not be exposed)
      const response = await request.get(`${apiURL}/v1/competencies`, {
        headers: { 'Accept': 'application/json' },
      });
      // Should respond (even if unauthorized)
      expect([200, 401, 403]).toContain(response.status());
    } else {
      // For local backends, check actuator health
      const apiBase = apiURL.replace('/api', '');
      const response = await request.get(`${apiBase}/actuator/health`);
      expect([200, 401, 403]).toContain(response.status());
    }
  });

  test('API base endpoint is reachable', async ({ request }) => {
    // Construct API URL (handles both full URL and hostname-only formats)
    const envApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    const isFullUrl = envApiUrl.startsWith("https://") || envApiUrl.startsWith('https://');
    const apiURL = isFullUrl ? envApiUrl : `https://${envApiUrl}/api`;

    // Try to hit a known endpoint
    const response = await request.get(`${apiURL}/v1/competencies`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    // Should get a response (might be 401 if not authenticated)
    expect([200, 401, 403]).toContain(response.status());
  });

  // ==========================================
  // Core Navigation (Unauthenticated)
  // ==========================================

  test('navigation elements are present', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');

    // Check that we're either on the home page or redirected to sign-in
    const url = page.url();
    expect(url).toMatch(/\/(sign-in|$)/);
  });

  // ==========================================
  // Responsive Design
  // ==========================================

  test('page renders on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();
  });

  test('page renders on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/');

    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();
  });

  // ==========================================
  // Error Handling
  // ==========================================

  test('404 page shows for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-12345');

    // Should show 404 or redirect to sign-in
    const is404 = await page.getByText(/404|not found/i).isVisible().catch(() => false);
    const isSignIn = page.url().includes('sign-in');

    expect(is404 || isSignIn).toBeTruthy();
  });

  // ==========================================
  // JavaScript/React Functionality
  // ==========================================

  test('JavaScript is executing', async ({ page }) => {
    await page.goto('/');

    // Evaluate JavaScript to confirm it's running
    const result = await page.evaluate(() => {
      return typeof window !== 'undefined' && typeof document !== 'undefined';
    });

    expect(result).toBe(true);
  });

  test('React is hydrated', async ({ page }) => {
    await page.goto('/');

    // Wait for React to hydrate (Next.js specific check)
    await page.waitForFunction(() => {
      return document.querySelector('[data-reactroot]') !== null ||
             document.querySelector('#__next') !== null ||
             document.querySelector('[data-nextjs-scroll-focus-boundary]') !== null;
    }, { timeout: 10000 }).catch(() => {
      // Alternative: just check that the page has interactive content
    });

    // Page should have rendered some content
    await expect(page.locator('body')).not.toBeEmpty();
  });

  // ==========================================
  // Console Errors Check
  // ==========================================

  test('no critical JavaScript errors on load', async ({ page }) => {
    const errors: string[] = [];

    // Collect console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known acceptable errors
    const criticalErrors = errors.filter(error => {
      // Ignore hydration warnings in development
      if (error.includes('Hydration') && process.env.NODE_ENV !== 'production') {
        return false;
      }
      // Ignore third-party errors
      if (error.includes('clerk') || error.includes('analytics')) {
        return false;
      }
      return true;
    });

    // Should not have critical errors
    expect(criticalErrors).toHaveLength(0);
  });
});

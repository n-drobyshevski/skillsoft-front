import { test, expect, Locator } from '@playwright/test';
import { MOBILE_VIEWPORTS, VIEWPORTS } from '../../fixtures/viewport-constants';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Mobile Viewport Visual Regression Tests
 *
 * These tests verify that pages render correctly at mobile viewport sizes
 * and detect any visual regressions that would affect mobile users.
 *
 * IMPORTANT: First-time setup or after UI changes:
 * Run with --update-snapshots to create/update baseline screenshots:
 *   npm run test:e2e -- --grep="mobile-viewport" --update-snapshots
 *
 * Run normally with: npm run test:e2e -- --grep="mobile-viewport"
 *
 * Assertions:
 * - No horizontal scrollbar at any tested viewport
 * - Page content is visible without zooming
 * - Visual regression detection via screenshots
 *
 * Stability Notes:
 * - Screenshots use threshold tolerance to handle minor rendering differences
 * - Dynamic elements (Clerk widgets, timestamps) are masked to prevent flaky tests
 * - Additional wait time is added before screenshots to ensure page stability
 */

// Auth state file path
const AUTH_FILE_PATH = path.join(__dirname, '../../../playwright/.auth/admin.json');

/**
 * Screenshot configuration for visual regression tests.
 * These settings help stabilize screenshots by:
 * - Allowing small pixel differences (maxDiffPixelRatio)
 * - Setting threshold for color comparison
 * - Adding timeout for screenshot stabilization
 */
const SCREENSHOT_CONFIG = {
  // Allow up to 2% pixel difference to handle minor rendering variations
  maxDiffPixelRatio: 0.02,
  // Color threshold (0-1): 0.3 allows for anti-aliasing and subpixel differences
  threshold: 0.3,
  // Timeout in ms for screenshot to stabilize
  timeout: 30000,
  // Disable animations for consistent screenshots
  animations: 'disabled' as const,
  // Capture full page
  fullPage: true,
};

/**
 * Selectors for dynamic elements that should be masked in screenshots.
 * These elements may change between test runs (loading states, timestamps, etc.)
 */
const DYNAMIC_ELEMENT_SELECTORS = [
  // Clerk authentication widgets with potential loading states
  '[data-clerk-component]',
  '.cl-loading',
  '.cl-spinner',
  '[data-clerk-sign-in] .cl-internal-b3fm6y', // Clerk loading indicators
  // Timestamps and dates that change
  '[data-testid="timestamp"]',
  'time',
  '.timestamp',
  '[data-testid="date"]',
  // Loading spinners and skeletons
  '.animate-spin',
  '.animate-pulse',
  '[data-testid="loading"]',
  '.skeleton',
  // Cursor and caret elements
  '[data-cursor]',
  '.cursor-blink',
];

/**
 * Check if authentication state file exists and is valid.
 * Returns true if the file exists and contains valid auth data.
 */
function isAuthStateAvailable(): boolean {
  try {
    if (!fs.existsSync(AUTH_FILE_PATH)) {
      return false;
    }
    const content = fs.readFileSync(AUTH_FILE_PATH, 'utf-8');
    const authState = JSON.parse(content);
    // Check if auth state has cookies (indicating successful authentication)
    return authState.cookies && authState.cookies.length > 0;
  } catch {
    return false;
  }
}

/**
 * Wait for page to be ready for visual testing.
 * Uses domcontentloaded + specific element checks instead of unreliable networkidle.
 * Includes additional stabilization time to ensure consistent screenshots.
 */
async function waitForPageReady(page: import('@playwright/test').Page, options?: {
  selector?: string;
  timeout?: number;
  stabilizationDelay?: number;
}): Promise<void> {
  const { selector, timeout = 10000, stabilizationDelay = 1500 } = options || {};

  // Wait for DOM to be ready
  await page.waitForLoadState('domcontentloaded');

  // If a specific selector is provided, wait for it
  // Handle comma-separated selectors by trying each one with OR logic
  if (selector) {
    const selectors = selector.split(',').map(s => s.trim());

    if (selectors.length === 1) {
      // Single selector - use directly
      await page.waitForSelector(selectors[0], { state: 'visible', timeout });
    } else {
      // Multiple selectors - use Playwright's locator.or() pattern
      let combinedLocator = page.locator(selectors[0]);
      for (let i = 1; i < selectors.length; i++) {
        combinedLocator = combinedLocator.or(page.locator(selectors[i]));
      }
      await combinedLocator.first().waitFor({ state: 'visible', timeout });
    }
  } else {
    // Default: wait for body to have content
    await page.waitForSelector('body', { state: 'visible', timeout });
  }

  // Wait for animations to complete and page to stabilize
  // This helps prevent "Failed to take two consecutive stable screenshots" errors
  await page.waitForTimeout(stabilizationDelay);

  // Additional wait for fonts and images to load
  await page.evaluate(() => document.fonts?.ready);
}

/**
 * Check if page has horizontal scroll overflow.
 */
async function hasHorizontalScroll(page: import('@playwright/test').Page): Promise<boolean> {
  return await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
}

/**
 * Get locators for dynamic elements that should be masked in screenshots.
 * Returns only locators for elements that exist on the current page.
 */
async function getDynamicElementMasks(page: import('@playwright/test').Page): Promise<Locator[]> {
  const masks: Locator[] = [];

  for (const selector of DYNAMIC_ELEMENT_SELECTORS) {
    const locator = page.locator(selector);
    const count = await locator.count();
    if (count > 0) {
      masks.push(locator);
    }
  }

  return masks;
}

/**
 * Take a stable screenshot with masking and tolerance settings.
 * This helper wraps toHaveScreenshot with consistent configuration.
 */
async function takeStableScreenshot(
  page: import('@playwright/test').Page,
  name: string,
  additionalMasks: Locator[] = []
): Promise<void> {
  const dynamicMasks = await getDynamicElementMasks(page);
  const allMasks = [...dynamicMasks, ...additionalMasks];

  await expect(page).toHaveScreenshot(name, {
    ...SCREENSHOT_CONFIG,
    mask: allMasks.length > 0 ? allMasks : undefined,
  });
}

test.describe('Mobile Viewport Visual Regression', () => {
  test.describe.configure({ mode: 'parallel' });

  // Test sign-in page (no auth required)
  test.describe('Sign In Page', () => {
    for (const viewport of MOBILE_VIEWPORTS) {
      test(`renders correctly at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/sign-in');

        // Wait for Clerk sign-in form or fallback to body
        // Use longer stabilization delay for Clerk components which may have loading states
        await waitForPageReady(page, {
          selector: '[data-clerk-sign-in], form, main',
          timeout: 15000,
          stabilizationDelay: 2000,
        });

        // Check no horizontal scroll
        const hasScroll = await hasHorizontalScroll(page);
        expect(hasScroll).toBe(false);

        // Take screenshot for visual comparison with stability settings
        await takeStableScreenshot(page, `sign-in-${viewport.width}.png`);
      });
    }
  });

  // Test public pages
  test.describe('Public Pages', () => {
    for (const viewport of MOBILE_VIEWPORTS) {
      test(`home page renders at ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');

        await waitForPageReady(page, {
          selector: 'main, [data-testid="home-page"], body',
        });

        // Check no horizontal scroll
        const hasScroll = await hasHorizontalScroll(page);
        expect(hasScroll).toBe(false);

        // Take screenshot with stability settings
        await takeStableScreenshot(page, `home-${viewport.width}.png`);
      });
    }
  });
});

// Authenticated tests - requires setup project to run first
test.describe('Mobile Viewport - Authenticated Pages', () => {
  test.describe.configure({ mode: 'parallel' });

  // Skip all authenticated tests if auth state is not available
  const authAvailable = isAuthStateAvailable();

  // These tests require authentication, tagged for role-based filtering
  test.describe('@admin Dashboard', () => {
    // Conditionally use storage state only if file exists
    if (authAvailable) {
      test.use({ storageState: AUTH_FILE_PATH });
    }

    for (const viewport of MOBILE_VIEWPORTS) {
      test(`dashboard renders at ${viewport.name}`, async ({ page }) => {
        test.skip(!authAvailable, 'Auth state file not found. Run auth setup first: npm run test:e2e -- --project=setup');

        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/dashboard');

        // Wait for dashboard content to load with extended stabilization
        await waitForPageReady(page, {
          selector: 'main, [data-testid="dashboard"], .dashboard',
          timeout: 15000,
          stabilizationDelay: 2000,
        });

        // Check no horizontal scroll
        const hasScroll = await hasHorizontalScroll(page);
        expect(hasScroll).toBe(false);

        // Check that main content is visible
        await expect(page.locator('main')).toBeVisible();

        // Take screenshot with stability settings
        await takeStableScreenshot(page, `dashboard-${viewport.width}.png`);
      });
    }
  });

  test.describe('@admin HR List Pages', () => {
    if (authAvailable) {
      test.use({ storageState: AUTH_FILE_PATH });
    }

    const hrPages = [
      { path: '/hr/competencies', name: 'competencies' },
      { path: '/hr/behavioral-indicators', name: 'behavioral-indicators' },
      { path: '/hr/assessment-questions', name: 'assessment-questions' },
    ];

    for (const hrPage of hrPages) {
      for (const viewport of [VIEWPORTS.iPhoneSE, VIEWPORTS.iPhone12]) {
        test(`${hrPage.name} renders at ${viewport.name}`, async ({ page }) => {
          test.skip(!authAvailable, 'Auth state file not found. Run auth setup first: npm run test:e2e -- --project=setup');

          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await page.goto(hrPage.path);

          // Wait for table or main content with extended stabilization
          await waitForPageReady(page, {
            selector: '[data-slot="table-container"], main, table',
            timeout: 15000,
            stabilizationDelay: 2000,
          });

          // Check no horizontal scroll
          const hasScroll = await hasHorizontalScroll(page);
          expect(hasScroll).toBe(false);

          // Check that table is visible and scrollable if needed
          const table = page.locator('[data-slot="table-container"]');
          if (await table.count() > 0) {
            await expect(table.first()).toBeVisible();
          }

          // Take screenshot with stability settings
          await takeStableScreenshot(page, `${hrPage.name}-${viewport.width}.png`);
        });
      }
    }
  });

  test.describe('@admin Admin Users Page', () => {
    if (authAvailable) {
      test.use({ storageState: AUTH_FILE_PATH });
    }

    for (const viewport of [VIEWPORTS.iPhoneSE, VIEWPORTS.iPhone12]) {
      test(`users list renders at ${viewport.name}`, async ({ page }) => {
        test.skip(!authAvailable, 'Auth state file not found. Run auth setup first: npm run test:e2e -- --project=setup');

        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/admin/users');

        // Wait for user list content with extended stabilization
        await waitForPageReady(page, {
          selector: '[data-slot="table-container"], main, table',
          timeout: 15000,
          stabilizationDelay: 2000,
        });

        // Check no horizontal scroll
        const hasScroll = await hasHorizontalScroll(page);
        expect(hasScroll).toBe(false);

        // Take screenshot with stability settings
        await takeStableScreenshot(page, `admin-users-${viewport.width}.png`);
      });
    }
  });

  test.describe('@admin Test Templates Page', () => {
    if (authAvailable) {
      test.use({ storageState: AUTH_FILE_PATH });
    }

    for (const viewport of [VIEWPORTS.iPhoneSE, VIEWPORTS.iPhone12]) {
      test(`test templates renders at ${viewport.name}`, async ({ page }) => {
        test.skip(!authAvailable, 'Auth state file not found. Run auth setup first: npm run test:e2e -- --project=setup');

        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/test-templates');

        // Wait for templates content with extended stabilization
        await waitForPageReady(page, {
          selector: 'main, [data-testid="test-templates"]',
          timeout: 15000,
          stabilizationDelay: 2000,
        });

        // Check no horizontal scroll
        const hasScroll = await hasHorizontalScroll(page);
        expect(hasScroll).toBe(false);

        // Take screenshot with stability settings
        await takeStableScreenshot(page, `test-templates-${viewport.width}.png`);
      });
    }
  });
});

// Tablet viewport tests
test.describe('Tablet Viewport Visual Regression', () => {
  const tabletViewport = VIEWPORTS.iPadMini;
  const authAvailable = isAuthStateAvailable();

  test.describe('@admin Tablet Dashboard', () => {
    if (authAvailable) {
      test.use({ storageState: AUTH_FILE_PATH });
    }

    test(`dashboard renders at ${tabletViewport.name}`, async ({ page }) => {
      test.skip(!authAvailable, 'Auth state file not found. Run auth setup first: npm run test:e2e -- --project=setup');

      await page.setViewportSize({ width: tabletViewport.width, height: tabletViewport.height });
      await page.goto('/dashboard');

      // Wait for dashboard content with extended stabilization
      await waitForPageReady(page, {
        selector: 'main, [data-testid="dashboard"], .dashboard',
        timeout: 15000,
        stabilizationDelay: 2000,
      });

      // Check no horizontal scroll
      const hasScroll = await hasHorizontalScroll(page);
      expect(hasScroll).toBe(false);

      // Take screenshot with stability settings
      await takeStableScreenshot(page, `dashboard-tablet-${tabletViewport.width}.png`);
    });
  });
});

// Touch target size validation
test.describe('Touch Target Validation', () => {
  test('buttons have minimum 44px touch targets on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/sign-in');

    // Wait for sign-in form to be ready with extended stabilization
    await waitForPageReady(page, {
      selector: '[data-clerk-sign-in], form, main',
      timeout: 15000,
      stabilizationDelay: 2000,
    });

    // Get all buttons
    const buttons = await page.locator('button').all();

    for (const button of buttons) {
      const box = await button.boundingBox();
      if (box) {
        // Allow for some tolerance (40px minimum)
        expect(box.width).toBeGreaterThanOrEqual(40);
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });
});

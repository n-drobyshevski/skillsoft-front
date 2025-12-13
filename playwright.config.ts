import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.e2e.local
dotenv.config({ path: path.resolve(__dirname, '.env.e2e.local') });

/**
 * Playwright configuration for SkillSoft E2E tests.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory
  testDir: './e2e/specs',

  // Output directory for test artifacts
  outputDir: './test-results',

  // Run tests in parallel within files
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry failed tests (2 retries in CI, none locally)
  retries: process.env.CI ? 2 : 0,

  // Limit parallel workers (fewer in CI for stability)
  workers: process.env.CI ? 2 : 4,

  // Maximum number of test failures before stopping (prevent runaway failures in CI)
  maxFailures: process.env.CI ? 10 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: './playwright-report' }],
    ['json', { outputFile: './test-results/results.json' }],
    ['list'],
    ...(process.env.CI ? [['github'] as const] : []),
  ],

  // Global test timeout (60 seconds per test)
  timeout: 60 * 1000,

  // Expect timeout for assertions
  expect: {
    timeout: 10 * 1000,
  },

  // Shared settings for all projects
  use: {
    // Base URL for all tests
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    // Collect trace on first retry
    trace: 'on-first-retry',

    // Screenshot only on failure
    screenshot: 'only-on-failure',

    // Video recording on failure
    video: 'retain-on-failure',

    // Default viewport
    viewport: { width: 1280, height: 720 },

    // Action timeout
    actionTimeout: 15 * 1000,

    // Navigation timeout
    navigationTimeout: 30 * 1000,

    // Use data-testid for locators
    testIdAttribute: 'data-testid',
  },

  // Global setup and teardown
  globalSetup: require.resolve('./e2e/global-setup'),
  globalTeardown: require.resolve('./e2e/global-teardown'),

  // Projects configuration
  projects: [
    // ==========================================
    // Setup projects - run authentication first
    // ==========================================
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: { storageState: undefined },
    },

    // ==========================================
    // Smoke tests - quick verification
    // ==========================================
    {
      name: 'smoke',
      testMatch: /smoke\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // ==========================================
    // Authenticated tests by role
    // ==========================================
    {
      name: 'chromium-admin',
      testMatch: /.*\.spec\.ts/,
      testIgnore: /smoke\/.*\.spec\.ts/,
      grep: /@admin/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'chromium-editor',
      testMatch: /.*\.spec\.ts/,
      testIgnore: /smoke\/.*\.spec\.ts/,
      grep: /@editor/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/editor.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'chromium-user',
      testMatch: /.*\.spec\.ts/,
      testIgnore: /smoke\/.*\.spec\.ts/,
      grep: /@user/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // ==========================================
    // Cross-browser testing (smoke tests only)
    // ==========================================
    {
      name: 'firefox',
      testMatch: /smoke\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit',
      testMatch: /smoke\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Safari'],
      },
    },

    // ==========================================
    // Mobile viewport testing
    // ==========================================
    {
      name: 'mobile-chrome',
      testMatch: /smoke\/.*\.spec\.ts/,
      use: {
        ...devices['Pixel 5'],
        hasTouch: true,
      },
    },
    {
      name: 'mobile-safari',
      testMatch: /smoke\/.*\.spec\.ts/,
      use: {
        ...devices['iPhone 12'],
        hasTouch: true,
      },
    },
  ],

  // Web server configuration - starts Next.js dev server
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});

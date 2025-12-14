import { test as setup, expect, type Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Authentication setup for E2E tests.
 * Logs in as different user roles and saves the authentication state.
 * This runs before other tests and allows them to skip the login step.
 */

// Storage state file paths
const authDir = path.join(__dirname, '../playwright/.auth');
const adminAuthFile = path.join(authDir, 'admin.json');
const editorAuthFile = path.join(authDir, 'editor.json');
const userAuthFile = path.join(authDir, 'user.json');

// Ensure auth directory exists
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

// Configure setup tests to run serially
setup.describe.configure({ mode: 'serial' });

/**
 * Helper function to perform Clerk login.
 */
async function clerkLogin(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  // Navigate to sign-in page
  await page.goto('/sign-in');

  // Wait for Clerk sign-in form to be visible
  await page.waitForSelector('[data-clerk-sign-in]', { timeout: 30000 }).catch(() => {
    // Fallback: look for the email input directly
  });

  // Fill email
  const emailInput = page.locator('input[name="identifier"], input[type="email"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill(email);

  // Click continue or submit button
  const continueButton = page.getByRole('button', { name: /continue/i });
  if (await continueButton.isVisible()) {
    await continueButton.click();
  }

  // Wait for password field
  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill(password);

  // Submit login
  const submitButton = page.getByRole('button', { name: /continue|sign in|log in/i });
  await submitButton.click();

  // Wait for successful authentication - redirect to dashboard
  await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 30000 });

  // Verify we're logged in by checking for user button or similar indicator
  await expect(page.locator('[data-testid="user-button"], [data-testid="user-menu"], .cl-userButton-root').first()).toBeVisible({ timeout: 10000 });
}

// ==========================================
// Setup: Authenticate as Admin
// ==========================================
setup('authenticate as admin', async ({ page }) => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('⚠️  Admin credentials not found in environment variables.');
    console.warn('   Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD in .env.e2e.local');
    // Create empty auth file to allow tests to run (they'll redirect to login)
    await page.context().storageState({ path: adminAuthFile });
    return;
  }

  console.log(`🔐 Authenticating as admin: ${email}`);

  try {
    await clerkLogin(page, email, password);
    console.log('✅ Admin authentication successful');
  } catch (error) {
    console.error('❌ Admin authentication failed:', error);
    // Save empty state so tests can detect unauthenticated state
  }

  // Save authentication state
  await page.context().storageState({ path: adminAuthFile });
  console.log(`💾 Admin auth state saved to: ${adminAuthFile}`);
});

// ==========================================
// Setup: Authenticate as Editor
// ==========================================
setup('authenticate as editor', async ({ page }) => {
  const email = process.env.E2E_EDITOR_EMAIL;
  const password = process.env.E2E_EDITOR_PASSWORD;

  if (!email || !password) {
    console.warn('⚠️  Editor credentials not found in environment variables.');
    console.warn('   Set E2E_EDITOR_EMAIL and E2E_EDITOR_PASSWORD in .env.e2e.local');
    await page.context().storageState({ path: editorAuthFile });
    return;
  }

  console.log(`🔐 Authenticating as editor: ${email}`);

  try {
    await clerkLogin(page, email, password);
    console.log('✅ Editor authentication successful');
  } catch (error) {
    console.error('❌ Editor authentication failed:', error);
  }

  // Save authentication state
  await page.context().storageState({ path: editorAuthFile });
  console.log(`💾 Editor auth state saved to: ${editorAuthFile}`);
});

// ==========================================
// Setup: Authenticate as User
// ==========================================
setup('authenticate as user', async ({ page }) => {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;

  if (!email || !password) {
    console.warn('⚠️  User credentials not found in environment variables.');
    console.warn('   Set E2E_USER_EMAIL and E2E_USER_PASSWORD in .env.e2e.local');
    await page.context().storageState({ path: userAuthFile });
    return;
  }

  console.log(`🔐 Authenticating as user: ${email}`);

  try {
    await clerkLogin(page, email, password);
    console.log('✅ User authentication successful');
  } catch (error) {
    console.error('❌ User authentication failed:', error);
  }

  // Save authentication state
  await page.context().storageState({ path: userAuthFile });
  console.log(`💾 User auth state saved to: ${userAuthFile}`);
});

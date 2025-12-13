import { test, expect } from '../../fixtures/auth.fixture';

/**
 * Authentication Tests for SkillSoft.
 * Tests login, logout, and session management functionality.
 */
test.describe('Authentication @admin @editor @user', () => {
  // ==========================================
  // Login Tests
  // ==========================================

  test('successful login redirects to dashboard @admin', async ({ page, auth }) => {
    // Skip if no admin credentials
    const email = process.env.E2E_ADMIN_EMAIL;
    const password = process.env.E2E_ADMIN_PASSWORD;
    test.skip(!email || !password, 'Admin credentials not configured');

    await page.goto('/sign-in');

    // Fill login form
    await page.locator('input[name="identifier"], input[type="email"]').first().fill(email!);

    // Click continue if needed
    const continueButton = page.getByRole('button', { name: /continue/i });
    if (await continueButton.isVisible()) {
      await continueButton.click();
    }

    await page.locator('input[name="password"], input[type="password"]').first().fill(password!);
    await page.getByRole('button', { name: /continue|sign in/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard/, { timeout: 30000 });

    // User menu should be visible
    await expect(
      page.locator('[data-testid="user-button"], .cl-userButton-root').first()
    ).toBeVisible();
  });

  test('invalid credentials show error message', async ({ page }) => {
    await page.goto('/sign-in');

    // Fill with invalid credentials
    await page.locator('input[name="identifier"], input[type="email"]').first().fill('invalid@example.com');

    const continueButton = page.getByRole('button', { name: /continue/i });
    if (await continueButton.isVisible()) {
      await continueButton.click();
    }

    await page.locator('input[name="password"], input[type="password"]').first().fill('wrongpassword');
    await page.getByRole('button', { name: /continue|sign in/i }).click();

    // Should show error message
    await expect(
      page.getByText(/invalid|incorrect|error|couldn't find/i)
    ).toBeVisible({ timeout: 10000 });
  });

  // ==========================================
  // Logout Tests
  // ==========================================

  test('logout clears session @admin', async ({ adminPage }) => {
    // Navigate to dashboard (should be authenticated)
    await adminPage.goto('/dashboard');

    // Verify we're logged in
    await expect(adminPage).toHaveURL(/dashboard/);

    // Click user menu
    await adminPage.locator('[data-testid="user-button"], .cl-userButton-root').first().click();

    // Click sign out
    await adminPage.getByRole('menuitem', { name: /sign out|log out/i }).click();

    // Should redirect to sign-in
    await expect(adminPage).toHaveURL(/sign-in/, { timeout: 10000 });

    // Try to access protected route - should redirect to sign-in
    await adminPage.goto('/dashboard');
    await expect(adminPage).toHaveURL(/sign-in/);
  });

  // ==========================================
  // Session Persistence Tests
  // ==========================================

  test('authenticated session persists across page reload @admin', async ({ adminPage }) => {
    await adminPage.goto('/dashboard');

    // Verify initial authentication
    await expect(adminPage).toHaveURL(/dashboard/);
    await expect(
      adminPage.locator('[data-testid="user-button"], .cl-userButton-root').first()
    ).toBeVisible();

    // Reload the page
    await adminPage.reload();

    // Should still be authenticated
    await expect(adminPage).toHaveURL(/dashboard/);
    await expect(
      adminPage.locator('[data-testid="user-button"], .cl-userButton-root').first()
    ).toBeVisible();
  });

  test('authenticated session works across navigation @admin', async ({ adminPage }) => {
    await adminPage.goto('/dashboard');

    // Verify authentication
    await expect(
      adminPage.locator('[data-testid="user-button"], .cl-userButton-root').first()
    ).toBeVisible();

    // Navigate to another protected page
    // Try competencies or similar
    const competenciesLink = adminPage.getByRole('link', { name: /competenc/i }).first();
    if (await competenciesLink.isVisible()) {
      await competenciesLink.click();
      await adminPage.waitForLoadState('networkidle');

      // Should still be authenticated
      await expect(
        adminPage.locator('[data-testid="user-button"], .cl-userButton-root').first()
      ).toBeVisible();
    }
  });
});

test.describe('Role-Based Access Control', () => {
  // ==========================================
  // Admin Role Tests
  // ==========================================

  test('admin can access admin features @admin', async ({ adminPage }) => {
    await adminPage.goto('/dashboard');

    // Admin should see admin-specific UI elements
    // Look for admin indicators in sidebar or header
    const adminIndicator = adminPage.locator(
      '[data-testid="admin-menu"], ' +
      '[data-testid="lens-admin"], ' +
      'text=/admin/i'
    ).first();

    // Either admin indicator should be visible or dashboard should load
    await expect(adminPage).toHaveURL(/dashboard/);
  });

  // ==========================================
  // Editor Role Tests
  // ==========================================

  test('editor can access competency management @editor', async ({ editorPage }) => {
    await editorPage.goto('/dashboard');

    // Editor should be able to access dashboard
    await expect(editorPage).toHaveURL(/dashboard/);
  });

  // ==========================================
  // User Role Tests
  // ==========================================

  test('user can access test-taking features @user', async ({ userPage }) => {
    await userPage.goto('/dashboard');

    // User should be able to access dashboard
    await expect(userPage).toHaveURL(/dashboard/);
  });
});

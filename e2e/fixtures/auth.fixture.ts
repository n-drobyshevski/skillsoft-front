import { test as base, expect, Page, BrowserContext } from '@playwright/test';
import * as path from 'path';

/**
 * Authentication fixture types.
 */
type AuthFixtures = {
  /** Page authenticated as admin */
  adminPage: Page;
  /** Page authenticated as editor */
  editorPage: Page;
  /** Page authenticated as regular user */
  userPage: Page;
  /** Authentication helper */
  auth: AuthHelper;
};

/**
 * Authentication helper class for managing auth state in tests.
 */
class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Login as admin user.
   */
  async loginAsAdmin(): Promise<void> {
    await this.login(
      process.env.E2E_ADMIN_EMAIL!,
      process.env.E2E_ADMIN_PASSWORD!
    );
  }

  /**
   * Login as editor user.
   */
  async loginAsEditor(): Promise<void> {
    await this.login(
      process.env.E2E_EDITOR_EMAIL!,
      process.env.E2E_EDITOR_PASSWORD!
    );
  }

  /**
   * Login as regular user.
   */
  async loginAsUser(): Promise<void> {
    await this.login(
      process.env.E2E_USER_EMAIL!,
      process.env.E2E_USER_PASSWORD!
    );
  }

  /**
   * Perform login with given credentials.
   */
  private async login(email: string, password: string): Promise<void> {
    await this.page.goto('/sign-in');

    // Fill email
    const emailInput = this.page.locator('input[name="identifier"], input[type="email"]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill(email);

    // Click continue if visible
    const continueButton = this.page.getByRole('button', { name: /continue/i });
    if (await continueButton.isVisible()) {
      await continueButton.click();
    }

    // Fill password
    const passwordInput = this.page.locator('input[name="password"], input[type="password"]').first();
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.fill(password);

    // Submit
    await this.page.getByRole('button', { name: /continue|sign in/i }).click();

    // Wait for redirect
    await this.page.waitForURL(/\/(dashboard|home|$)/, { timeout: 30000 });
  }

  /**
   * Logout current user.
   */
  async logout(): Promise<void> {
    const userButton = this.page.locator('[data-testid="user-button"], .cl-userButton-root').first();
    await userButton.click();
    await this.page.getByRole('menuitem', { name: /sign out|log out/i }).click();
    await this.page.waitForURL(/sign-in/);
  }

  /**
   * Check if user is logged in.
   */
  async isLoggedIn(): Promise<boolean> {
    const userButton = this.page.locator('[data-testid="user-button"], .cl-userButton-root').first();
    return userButton.isVisible();
  }

  /**
   * Switch to a different role by logging out and logging in.
   */
  async switchRole(role: 'admin' | 'editor' | 'user'): Promise<void> {
    await this.logout();

    switch (role) {
      case 'admin':
        await this.loginAsAdmin();
        break;
      case 'editor':
        await this.loginAsEditor();
        break;
      case 'user':
        await this.loginAsUser();
        break;
    }
  }
}

/**
 * Extended test fixture with authentication helpers.
 */
export const test = base.extend<AuthFixtures>({
  /**
   * Page authenticated as admin.
   * Uses storage state from auth setup.
   */
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.join(__dirname, '../../playwright/.auth/admin.json'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  /**
   * Page authenticated as editor.
   * Uses storage state from auth setup.
   */
  editorPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.join(__dirname, '../../playwright/.auth/editor.json'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  /**
   * Page authenticated as regular user.
   * Uses storage state from auth setup.
   */
  userPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.join(__dirname, '../../playwright/.auth/user.json'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  /**
   * Authentication helper for the current page.
   */
  auth: async ({ page }, use) => {
    const auth = new AuthHelper(page);
    await use(auth);
  },
});

export { expect };

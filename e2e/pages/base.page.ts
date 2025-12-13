import { Page, Locator, expect } from '@playwright/test';

/**
 * Base Page Object class that provides common functionality for all pages.
 * All page objects should extend this class.
 */
export abstract class BasePage {
  readonly page: Page;

  // ==========================================
  // Common Layout Elements
  // ==========================================
  readonly header: Locator;
  readonly sidebar: Locator;
  readonly mainContent: Locator;
  readonly breadcrumb: Locator;
  readonly userButton: Locator;

  // ==========================================
  // Common UI Components
  // ==========================================
  readonly loadingSpinner: Locator;
  readonly loadingOverlay: Locator;
  readonly toastNotification: Locator;
  readonly dialogOverlay: Locator;
  readonly confirmDialog: Locator;

  constructor(page: Page) {
    this.page = page;

    // Layout elements
    this.header = page.locator('[data-testid="app-header"], header').first();
    this.sidebar = page.locator('[data-testid="app-sidebar"], [data-testid="sidebar"]').first();
    this.mainContent = page.locator('main, [role="main"]').first();
    this.breadcrumb = page.locator('[data-testid="breadcrumb"], nav[aria-label="breadcrumb"]').first();
    this.userButton = page.locator('[data-testid="user-button"], .cl-userButton-root').first();

    // Loading states
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"], [data-testid="loading"]');
    this.loadingOverlay = page.locator('[data-testid="loading-overlay"]');

    // Notifications
    this.toastNotification = page.locator('[data-sonner-toast], [role="alert"]');

    // Dialogs
    this.dialogOverlay = page.locator('[data-state="open"][role="dialog"]');
    this.confirmDialog = page.locator('[data-testid="confirm-dialog"], [role="alertdialog"]');
  }

  // ==========================================
  // Abstract Methods (must be implemented)
  // ==========================================

  /**
   * Navigate to this page. Must be implemented by subclasses.
   */
  abstract goto(): Promise<void>;

  // ==========================================
  // Navigation Methods
  // ==========================================

  /**
   * Navigate to a specific path.
   */
  async navigateTo(path: string): Promise<void> {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  /**
   * Go back to the previous page.
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
    await this.waitForPageLoad();
  }

  /**
   * Reload the current page.
   */
  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  // ==========================================
  // Wait Methods
  // ==========================================

  /**
   * Wait for the page to fully load (network idle).
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.waitForLoadingComplete();
  }

  /**
   * Wait for any loading indicators to disappear.
   */
  async waitForLoadingComplete(): Promise<void> {
    // Wait for loading spinner to disappear if present
    if (await this.loadingSpinner.isVisible()) {
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 30000 });
    }
    // Wait for loading overlay to disappear if present
    if (await this.loadingOverlay.isVisible()) {
      await this.loadingOverlay.waitFor({ state: 'hidden', timeout: 30000 });
    }
  }

  /**
   * Wait for a specific amount of time (use sparingly).
   */
  async wait(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  // ==========================================
  // Toast/Notification Methods
  // ==========================================

  /**
   * Wait for a toast notification with specific text.
   */
  async waitForToast(message: string | RegExp, timeout = 5000): Promise<void> {
    await expect(this.toastNotification.filter({ hasText: message })).toBeVisible({ timeout });
  }

  /**
   * Wait for a success toast notification.
   */
  async waitForSuccessToast(timeout = 5000): Promise<void> {
    await expect(
      this.toastNotification.filter({
        hasText: /success|saved|created|updated|deleted/i,
      })
    ).toBeVisible({ timeout });
  }

  /**
   * Wait for an error toast notification.
   */
  async waitForErrorToast(timeout = 5000): Promise<void> {
    await expect(
      this.toastNotification.filter({
        hasText: /error|failed|invalid/i,
      })
    ).toBeVisible({ timeout });
  }

  /**
   * Dismiss any visible toast notifications.
   */
  async dismissToast(): Promise<void> {
    const closeButton = this.toastNotification.getByRole('button', { name: /close|dismiss/i });
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  }

  // ==========================================
  // Dialog Methods
  // ==========================================

  /**
   * Wait for a dialog to be visible.
   */
  async waitForDialog(): Promise<void> {
    await expect(this.dialogOverlay).toBeVisible({ timeout: 5000 });
  }

  /**
   * Close the currently open dialog.
   */
  async closeDialog(): Promise<void> {
    const closeButton = this.dialogOverlay.getByRole('button', { name: /close|cancel|x/i });
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
    await expect(this.dialogOverlay).not.toBeVisible();
  }

  /**
   * Confirm a confirmation dialog.
   */
  async confirmDialog(): Promise<void> {
    const confirmButton = this.page.getByRole('button', { name: /confirm|yes|delete|remove|ok/i });
    await confirmButton.click();
    await expect(this.confirmDialog).not.toBeVisible();
  }

  /**
   * Cancel a confirmation dialog.
   */
  async cancelDialog(): Promise<void> {
    const cancelButton = this.page.getByRole('button', { name: /cancel|no/i });
    await cancelButton.click();
    await expect(this.confirmDialog).not.toBeVisible();
  }

  // ==========================================
  // Header/Navigation Methods
  // ==========================================

  /**
   * Click a link in the header.
   */
  async clickHeaderLink(linkName: string): Promise<void> {
    await this.header.getByRole('link', { name: linkName }).click();
    await this.waitForPageLoad();
  }

  /**
   * Click a link in the sidebar.
   */
  async clickSidebarLink(linkName: string): Promise<void> {
    await this.sidebar.getByRole('link', { name: linkName }).click();
    await this.waitForPageLoad();
  }

  /**
   * Click the user menu button.
   */
  async openUserMenu(): Promise<void> {
    await this.userButton.click();
  }

  /**
   * Sign out the current user.
   */
  async signOut(): Promise<void> {
    await this.openUserMenu();
    await this.page.getByRole('menuitem', { name: /sign out|log out/i }).click();
    await this.page.waitForURL(/sign-in/);
  }

  // ==========================================
  // Assertion Helpers
  // ==========================================

  /**
   * Assert that the page has a specific title.
   */
  async expectPageTitle(title: string | RegExp): Promise<void> {
    await expect(this.page).toHaveTitle(title);
  }

  /**
   * Assert that the page URL matches a pattern.
   */
  async expectURL(url: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(url);
  }

  /**
   * Assert that the main heading contains specific text.
   */
  async expectHeading(text: string | RegExp): Promise<void> {
    await expect(this.page.getByRole('heading', { level: 1 })).toHaveText(text);
  }

  /**
   * Assert that the page is accessible (basic checks).
   */
  async expectAccessible(): Promise<void> {
    // Check for main landmark
    await expect(this.page.locator('main, [role="main"]').first()).toBeVisible();

    // Check for h1
    await expect(this.page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  }

  // ==========================================
  // Screenshot/Debug Methods
  // ==========================================

  /**
   * Take a screenshot of the current page.
   */
  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }

  /**
   * Get the current page URL.
   */
  getURL(): string {
    return this.page.url();
  }

  /**
   * Get the current page title.
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }
}

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Test Templates Page Object
 * Handles interactions with /test-templates (listing and browsing)
 */
export class TestTemplatesPage extends BasePage {
  // ==========================================
  // Locators - Page Header
  // ==========================================
  readonly pageTitle: Locator;
  readonly createTemplateButton: Locator;
  readonly historyButton: Locator;

  // ==========================================
  // Locators - Template Grid/List
  // ==========================================
  readonly templatesGrid: Locator;
  readonly templateCards: Locator;
  readonly emptyState: Locator;

  // ==========================================
  // Locators - Search & Filters
  // ==========================================
  readonly searchInput: Locator;
  readonly filterDropdown: Locator;
  readonly categoryFilter: Locator;
  readonly statusFilter: Locator;

  // ==========================================
  // Locators - Existing Session Dialog
  // ==========================================
  readonly existingSessionDialog: Locator;
  readonly continueSessionButton: Locator;
  readonly startNewSessionButton: Locator;
  readonly abandonSessionButton: Locator;

  constructor(page: Page) {
    super(page);

    // Page header
    this.pageTitle = page.getByRole('heading', { level: 1 });
    this.createTemplateButton = page.getByRole('link', { name: /create|new.*template/i }).first();
    this.historyButton = page.getByRole('link', { name: /history|my.*test/i }).first();

    // Template grid
    this.templatesGrid = page.locator('[data-testid="templates-grid"], .templates-grid, .grid').first();
    this.templateCards = page.locator('[data-testid="template-card"], .template-card, [role="article"]');
    this.emptyState = page.locator('[data-testid="empty-state"], .empty-state').first();

    // Search & filters
    this.searchInput = page.getByPlaceholder(/search|поиск/i).first();
    this.filterDropdown = page.locator('[data-testid="filter-dropdown"]').first();
    this.categoryFilter = page.locator('[data-testid="category-filter"]').first();
    this.statusFilter = page.locator('[data-testid="status-filter"]').first();

    // Existing session dialog
    this.existingSessionDialog = page.locator('[role="dialog"]:has-text("session"), [role="alertdialog"]:has-text("сессия")');
    this.continueSessionButton = page.getByRole('button', { name: /continue|продолжить/i });
    this.startNewSessionButton = page.getByRole('button', { name: /start new|начать заново/i });
    this.abandonSessionButton = page.getByRole('button', { name: /abandon|отменить/i });
  }

  // ==========================================
  // Navigation
  // ==========================================

  async goto(): Promise<void> {
    await this.navigateTo('/test-templates');
  }

  async gotoHistory(): Promise<void> {
    await this.navigateTo('/test-templates/history');
  }

  async gotoCreate(): Promise<void> {
    await this.navigateTo('/test-templates/new');
  }

  // ==========================================
  // Template Listing Methods
  // ==========================================

  /**
   * Get the count of visible template cards
   */
  async getTemplateCount(): Promise<number> {
    await this.waitForLoadingComplete();
    return this.templateCards.count();
  }

  /**
   * Get a template card by name
   */
  getTemplateCard(name: string): Locator {
    return this.templateCards.filter({ hasText: name });
  }

  /**
   * Click on a template card to view details
   */
  async openTemplate(name: string): Promise<void> {
    const card = this.getTemplateCard(name);
    await card.click();
    await this.waitForPageLoad();
  }

  /**
   * Click the start test button on a template card
   */
  async startTest(templateName: string): Promise<void> {
    const card = this.getTemplateCard(templateName);
    const startButton = card.getByRole('button', { name: /start|begin|начать/i });
    await startButton.click();
    // May trigger existing session dialog or redirect
    await this.page.waitForLoadState('networkidle');
  }

  // ==========================================
  // Search & Filter Methods
  // ==========================================

  /**
   * Search for templates by name
   */
  async searchTemplates(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    await this.waitForLoadingComplete();
  }

  /**
   * Clear the search input
   */
  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
    await this.waitForLoadingComplete();
  }

  // ==========================================
  // Session Dialog Methods
  // ==========================================

  /**
   * Check if the existing session dialog is visible
   */
  async isExistingSessionDialogVisible(): Promise<boolean> {
    return this.existingSessionDialog.isVisible();
  }

  /**
   * Continue an existing session from the dialog
   */
  async continueExistingSession(): Promise<void> {
    await expect(this.existingSessionDialog).toBeVisible({ timeout: 5000 });
    await this.continueSessionButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Start a new session (abandoning existing one) from the dialog
   */
  async startNewSession(): Promise<void> {
    await expect(this.existingSessionDialog).toBeVisible({ timeout: 5000 });
    await this.startNewSessionButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Close the existing session dialog
   */
  async closeExistingSessionDialog(): Promise<void> {
    await this.closeDialog();
  }

  // ==========================================
  // Template CRUD Methods (Admin/Editor)
  // ==========================================

  /**
   * Click the create new template button
   */
  async clickCreateTemplate(): Promise<void> {
    await this.createTemplateButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Get the edit button for a template
   */
  getEditButton(templateName: string): Locator {
    return this.getTemplateCard(templateName).getByRole('button', { name: /edit|редактировать/i });
  }

  /**
   * Get the delete button for a template
   */
  getDeleteButton(templateName: string): Locator {
    return this.getTemplateCard(templateName).getByRole('button', { name: /delete|удалить/i });
  }

  // ==========================================
  // Assertions
  // ==========================================

  /**
   * Assert the templates page is loaded
   */
  async expectPageLoaded(): Promise<void> {
    await expect(this.pageTitle).toBeVisible();
    await this.waitForLoadingComplete();
  }

  /**
   * Assert a specific template is visible
   */
  async expectTemplateVisible(name: string): Promise<void> {
    await expect(this.getTemplateCard(name)).toBeVisible();
  }

  /**
   * Assert a specific template is not visible
   */
  async expectTemplateNotVisible(name: string): Promise<void> {
    await expect(this.getTemplateCard(name)).not.toBeVisible();
  }

  /**
   * Assert the template count
   */
  async expectTemplateCount(count: number): Promise<void> {
    await expect(this.templateCards).toHaveCount(count);
  }

  /**
   * Assert at least one template is visible
   */
  async expectTemplatesExist(): Promise<void> {
    const count = await this.getTemplateCount();
    expect(count).toBeGreaterThan(0);
  }

  /**
   * Assert the empty state is shown
   */
  async expectEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
  }

  /**
   * Assert the existing session dialog is visible
   */
  async expectExistingSessionDialog(): Promise<void> {
    await expect(this.existingSessionDialog).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert create button visibility based on role
   */
  async expectCreateButtonForRole(role: 'admin' | 'editor' | 'user'): Promise<void> {
    if (role === 'admin' || role === 'editor') {
      await expect(this.createTemplateButton).toBeVisible();
    } else {
      await expect(this.createTemplateButton).not.toBeVisible();
    }
  }
}

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Dashboard Page Object
 * Handles interactions with the main dashboard at /dashboard
 */
export class DashboardPage extends BasePage {
  // ==========================================
  // Locators - Stats Cards
  // ==========================================
  readonly statsSection: Locator;
  readonly competenciesStatCard: Locator;
  readonly indicatorsStatCard: Locator;
  readonly questionsStatCard: Locator;
  readonly testsStatCard: Locator;

  // ==========================================
  // Locators - Quick Actions
  // ==========================================
  readonly quickActionsSection: Locator;
  readonly createCompetencyButton: Locator;
  readonly viewTestsButton: Locator;
  readonly manageUsersButton: Locator;

  // ==========================================
  // Locators - Recent Activity
  // ==========================================
  readonly recentActivitySection: Locator;
  readonly activityList: Locator;

  // ==========================================
  // Locators - Charts/Visualizations
  // ==========================================
  readonly chartsSection: Locator;
  readonly competencyChart: Locator;

  constructor(page: Page) {
    super(page);

    // Stats cards
    this.statsSection = page.locator('[data-testid="stats-section"], .stats-section, section:has-text("Overview")').first();
    this.competenciesStatCard = page.locator('[data-testid="stat-competencies"], .stat-card:has-text("Competenc")').first();
    this.indicatorsStatCard = page.locator('[data-testid="stat-indicators"], .stat-card:has-text("Indicator")').first();
    this.questionsStatCard = page.locator('[data-testid="stat-questions"], .stat-card:has-text("Question")').first();
    this.testsStatCard = page.locator('[data-testid="stat-tests"], .stat-card:has-text("Test")').first();

    // Quick actions
    this.quickActionsSection = page.locator('[data-testid="quick-actions"], .quick-actions').first();
    this.createCompetencyButton = page.getByRole('link', { name: /create.*competenc|new.*competenc/i }).first();
    this.viewTestsButton = page.getByRole('link', { name: /view.*test|browse.*test/i }).first();
    this.manageUsersButton = page.getByRole('link', { name: /manage.*user|user.*management/i }).first();

    // Recent activity
    this.recentActivitySection = page.locator('[data-testid="recent-activity"], .recent-activity').first();
    this.activityList = page.locator('[data-testid="activity-list"], .activity-list').first();

    // Charts
    this.chartsSection = page.locator('[data-testid="charts-section"], .charts-section').first();
    this.competencyChart = page.locator('[data-testid="competency-chart"], .recharts-responsive-container').first();
  }

  // ==========================================
  // Navigation
  // ==========================================

  async goto(): Promise<void> {
    await this.navigateTo('/dashboard');
  }

  // ==========================================
  // Stats Methods
  // ==========================================

  /**
   * Get the value of a stat card by label
   */
  async getStatValue(statName: 'competencies' | 'indicators' | 'questions' | 'tests'): Promise<string> {
    const statCard = {
      competencies: this.competenciesStatCard,
      indicators: this.indicatorsStatCard,
      questions: this.questionsStatCard,
      tests: this.testsStatCard,
    }[statName];

    const valueLocator = statCard.locator('.stat-value, [data-testid="stat-value"], .text-2xl, .text-3xl').first();
    return valueLocator.textContent() ?? '';
  }

  /**
   * Check if stats are loaded
   */
  async waitForStatsToLoad(): Promise<void> {
    // Wait for at least one stat card to be visible
    await this.page.waitForSelector('[data-testid="stat-competencies"], .stat-card', {
      state: 'visible',
      timeout: 10000
    });
    await this.waitForLoadingComplete();
  }

  // ==========================================
  // Quick Actions
  // ==========================================

  /**
   * Click the create competency quick action
   */
  async clickCreateCompetency(): Promise<void> {
    await this.createCompetencyButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Click the view tests quick action
   */
  async clickViewTests(): Promise<void> {
    await this.viewTestsButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Click the manage users quick action
   */
  async clickManageUsers(): Promise<void> {
    await this.manageUsersButton.click();
    await this.waitForPageLoad();
  }

  // ==========================================
  // Assertions
  // ==========================================

  /**
   * Assert dashboard is loaded with content
   */
  async expectDashboardLoaded(): Promise<void> {
    await expect(this.mainContent).toBeVisible();
    await this.waitForStatsToLoad();
  }

  /**
   * Assert specific stat value
   */
  async expectStatValue(statName: 'competencies' | 'indicators' | 'questions' | 'tests', expectedValue: string | RegExp): Promise<void> {
    const value = await this.getStatValue(statName);
    if (typeof expectedValue === 'string') {
      expect(value).toContain(expectedValue);
    } else {
      expect(value).toMatch(expectedValue);
    }
  }

  /**
   * Assert quick actions are visible based on role
   */
  async expectQuickActionsForRole(role: 'admin' | 'editor' | 'user'): Promise<void> {
    if (role === 'admin') {
      await expect(this.manageUsersButton).toBeVisible();
    }
    if (role === 'admin' || role === 'editor') {
      await expect(this.createCompetencyButton).toBeVisible();
    }
    await expect(this.viewTestsButton).toBeVisible();
  }

  /**
   * Assert charts are loaded
   */
  async expectChartsLoaded(): Promise<void> {
    await expect(this.competencyChart).toBeVisible({ timeout: 15000 });
  }
}

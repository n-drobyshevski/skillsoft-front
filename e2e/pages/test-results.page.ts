import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Test Results Page Object
 * Handles interactions with /test-templates/results/[resultId]
 */
export class TestResultsPage extends BasePage {
  // ==========================================
  // Locators - Page Header
  // ==========================================
  readonly pageTitle: Locator;
  readonly testName: Locator;
  readonly completionDate: Locator;
  readonly backToTemplatesButton: Locator;

  // ==========================================
  // Locators - Overall Score
  // ==========================================
  readonly overallScoreSection: Locator;
  readonly overallScore: Locator;
  readonly overallScoreLabel: Locator;
  readonly scorePercentage: Locator;

  // ==========================================
  // Locators - Competency Breakdown
  // ==========================================
  readonly competencyBreakdownSection: Locator;
  readonly competencyScoreCards: Locator;
  readonly competencyProgressBars: Locator;

  // ==========================================
  // Locators - Big Five Profile (Overview tests)
  // ==========================================
  readonly bigFiveSection: Locator;
  readonly bigFiveRadarChart: Locator;
  readonly bigFiveDimensionScores: Locator;

  // ==========================================
  // Locators - Question Details
  // ==========================================
  readonly questionDetailsSection: Locator;
  readonly questionDetailCards: Locator;
  readonly showDetailsButton: Locator;

  // ==========================================
  // Locators - Job Fit (JobFit tests)
  // ==========================================
  readonly jobFitSection: Locator;
  readonly jobFitScore: Locator;
  readonly benchmarkComparison: Locator;
  readonly gapAnalysis: Locator;

  // ==========================================
  // Locators - Team Fit (TeamFit tests)
  // ==========================================
  readonly teamFitSection: Locator;
  readonly teamFitScore: Locator;
  readonly teamCompatibility: Locator;
  readonly escoSkillMapping: Locator;

  // ==========================================
  // Locators - Actions
  // ==========================================
  readonly downloadReportButton: Locator;
  readonly shareResultsButton: Locator;
  readonly retakeTestButton: Locator;

  constructor(page: Page) {
    super(page);

    // Page header
    this.pageTitle = page.getByRole('heading', { level: 1 });
    this.testName = page.locator('[data-testid="test-name"], .test-name').first();
    this.completionDate = page.locator('[data-testid="completion-date"], .completion-date').first();
    this.backToTemplatesButton = page.getByRole('link', { name: /back|назад|templates|шаблоны/i }).first();

    // Overall score
    this.overallScoreSection = page.locator('[data-testid="overall-score-section"], .overall-score').first();
    this.overallScore = page.locator('[data-testid="overall-score"], .score-value, .text-4xl, .text-5xl').first();
    this.overallScoreLabel = page.locator('[data-testid="score-label"]').first();
    this.scorePercentage = page.locator('[data-testid="score-percentage"]').first();

    // Competency breakdown
    this.competencyBreakdownSection = page.locator('[data-testid="competency-breakdown"], .competency-breakdown').first();
    this.competencyScoreCards = page.locator('[data-testid="competency-score"], .competency-score-card');
    this.competencyProgressBars = page.locator('[role="progressbar"]');

    // Big Five profile
    this.bigFiveSection = page.locator('[data-testid="big-five-section"], .big-five-profile').first();
    this.bigFiveRadarChart = page.locator('[data-testid="big-five-chart"], .recharts-polar-grid').first();
    this.bigFiveDimensionScores = page.locator('[data-testid="big-five-dimension"]');

    // Question details
    this.questionDetailsSection = page.locator('[data-testid="question-details"], .question-details').first();
    this.questionDetailCards = page.locator('[data-testid="question-detail-card"]');
    this.showDetailsButton = page.getByRole('button', { name: /show.*detail|подробн/i }).first();

    // Job Fit
    this.jobFitSection = page.locator('[data-testid="job-fit-section"], .job-fit').first();
    this.jobFitScore = page.locator('[data-testid="job-fit-score"]').first();
    this.benchmarkComparison = page.locator('[data-testid="benchmark-comparison"]').first();
    this.gapAnalysis = page.locator('[data-testid="gap-analysis"]').first();

    // Team Fit
    this.teamFitSection = page.locator('[data-testid="team-fit-section"], .team-fit').first();
    this.teamFitScore = page.locator('[data-testid="team-fit-score"]').first();
    this.teamCompatibility = page.locator('[data-testid="team-compatibility"]').first();
    this.escoSkillMapping = page.locator('[data-testid="esco-mapping"]').first();

    // Actions
    this.downloadReportButton = page.getByRole('button', { name: /download|скачать/i }).first();
    this.shareResultsButton = page.getByRole('button', { name: /share|поделиться/i }).first();
    this.retakeTestButton = page.getByRole('button', { name: /retake|пройти.*заново/i }).first();
  }

  // ==========================================
  // Navigation
  // ==========================================

  async goto(resultId: string = ''): Promise<void> {
    await this.navigateTo(`/test-templates/results/${resultId}`);
  }


  // ==========================================
  // Score Methods
  // ==========================================

  /**
   * Get the overall score value
   */
  async getOverallScore(): Promise<string> {
    return await this.overallScore.textContent() ?? '';
  }

  /**
   * Get the overall score as a number (percentage)
   */
  async getOverallScoreValue(): Promise<number> {
    const scoreText = await this.getOverallScore();
    const match = scoreText.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Get competency scores
   */
  async getCompetencyScores(): Promise<{ name: string; score: string }[]> {
    const scores: { name: string; score: string }[] = [];
    const count = await this.competencyScoreCards.count();

    for (let i = 0; i < count; i++) {
      const card = this.competencyScoreCards.nth(i);
      const name = await card.locator('.competency-name, [data-testid="competency-name"]').textContent() ?? '';
      const score = await card.locator('.competency-score, [data-testid="competency-score-value"]').textContent() ?? '';
      scores.push({ name, score });
    }

    return scores;
  }

  /**
   * Get Big Five dimension scores
   */
  async getBigFiveScores(): Promise<{ dimension: string; score: string }[]> {
    const scores: { dimension: string; score: string }[] = [];
    const count = await this.bigFiveDimensionScores.count();

    for (let i = 0; i < count; i++) {
      const item = this.bigFiveDimensionScores.nth(i);
      const dimension = await item.locator('.dimension-name, [data-testid="dimension-name"]').textContent() ?? '';
      const score = await item.locator('.dimension-score, [data-testid="dimension-score"]').textContent() ?? '';
      scores.push({ dimension, score });
    }

    return scores;
  }

  // ==========================================
  // Details Methods
  // ==========================================

  /**
   * Expand question details if collapsed
   */
  async showQuestionDetails(): Promise<void> {
    try {
      if (await this.showDetailsButton.isVisible()) {
        await this.showDetailsButton.click();
        await this.page.waitForSelector('[data-testid="question-detail-card"]', { state: 'visible' });
      }
    } catch {
      // Details might already be shown or not available
    }
  }

  /**
   * Get the count of question details
   */
  async getQuestionDetailCount(): Promise<number> {
    await this.showQuestionDetails();
    return this.questionDetailCards.count();
  }

  // ==========================================
  // Action Methods
  // ==========================================

  /**
   * Click download report
   */
  async downloadReport(): Promise<void> {
    await this.downloadReportButton.click();
  }

  /**
   * Click share results
   */
  async shareResults(): Promise<void> {
    await this.shareResultsButton.click();
  }

  /**
   * Click retake test
   */
  async retakeTest(): Promise<void> {
    await this.retakeTestButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Click back to templates
   */
  async backToTemplates(): Promise<void> {
    await this.backToTemplatesButton.click();
    await this.waitForPageLoad();
  }

  // ==========================================
  // Test Type Detection
  // ==========================================

  /**
   * Check if this is an Overview test result
   */
  async isOverviewTest(): Promise<boolean> {
    try {
      return await this.bigFiveSection.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if this is a JobFit test result
   */
  async isJobFitTest(): Promise<boolean> {
    try {
      return await this.jobFitSection.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if this is a TeamFit test result
   */
  async isTeamFitTest(): Promise<boolean> {
    try {
      return await this.teamFitSection.isVisible();
    } catch {
      return false;
    }
  }

  // ==========================================
  // Assertions
  // ==========================================

  /**
   * Assert the results page is loaded
   */
  async expectResultsLoaded(): Promise<void> {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.overallScoreSection).toBeVisible({ timeout: 10000 });
  }

  /**
   * Assert overall score is within range
   */
  async expectOverallScoreInRange(min: number, max: number): Promise<void> {
    const score = await this.getOverallScoreValue();
    expect(score).toBeGreaterThanOrEqual(min);
    expect(score).toBeLessThanOrEqual(max);
  }

  /**
   * Assert competency breakdown is visible
   */
  async expectCompetencyBreakdownVisible(): Promise<void> {
    await expect(this.competencyBreakdownSection).toBeVisible();
    const count = await this.competencyScoreCards.count();
    expect(count).toBeGreaterThan(0);
  }

  /**
   * Assert Big Five profile is visible (Overview tests)
   */
  async expectBigFiveProfileVisible(): Promise<void> {
    await expect(this.bigFiveSection).toBeVisible();
    await expect(this.bigFiveRadarChart).toBeVisible();
  }

  /**
   * Assert Job Fit analysis is visible (JobFit tests)
   */
  async expectJobFitAnalysisVisible(): Promise<void> {
    await expect(this.jobFitSection).toBeVisible();
    await expect(this.benchmarkComparison).toBeVisible();
  }

  /**
   * Assert Team Fit analysis is visible (TeamFit tests)
   */
  async expectTeamFitAnalysisVisible(): Promise<void> {
    await expect(this.teamFitSection).toBeVisible();
    await expect(this.teamCompatibility).toBeVisible();
  }

  /**
   * Assert question details can be viewed
   */
  async expectQuestionDetailsAvailable(): Promise<void> {
    const count = await this.getQuestionDetailCount();
    expect(count).toBeGreaterThan(0);
  }
}

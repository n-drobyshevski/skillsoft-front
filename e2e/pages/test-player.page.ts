import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Test Player Page Object
 * Handles interactions with /test-templates/take/[sessionId] (immersive test taking)
 *
 * This is the most complex page object as it handles:
 * - Question display (multiple types: Likert, MCQ, SJT, Open Text, Behavioral)
 * - Answer selection/input
 * - Navigation (next, previous)
 * - Progress tracking
 * - Timer management
 * - Completion and abandonment dialogs
 */
export class TestPlayerPage extends BasePage {
  // ==========================================
  // Locators - Session Header
  // ==========================================
  readonly sessionHeader: Locator;
  readonly progressBar: Locator;
  readonly progressText: Locator;
  readonly timerDisplay: Locator;
  readonly exitButton: Locator;

  // ==========================================
  // Locators - Question Card
  // ==========================================
  readonly questionCard: Locator;
  readonly questionNumber: Locator;
  readonly questionText: Locator;
  readonly scenarioText: Locator;
  readonly questionTypeBadge: Locator;

  // ==========================================
  // Locators - Answer Options (Likert)
  // ==========================================
  readonly likertScale: Locator;
  readonly likertOptions: Locator;

  // ==========================================
  // Locators - Answer Options (MCQ/SJT)
  // ==========================================
  readonly answerOptions: Locator;

  // ==========================================
  // Locators - Text Input (Open Text/Behavioral)
  // ==========================================
  readonly textInput: Locator;
  readonly charCounter: Locator;

  // ==========================================
  // Locators - Navigation Footer
  // ==========================================
  readonly navigationFooter: Locator;
  readonly backButton: Locator;
  readonly nextButton: Locator;
  readonly completeButton: Locator;
  readonly keyboardHint: Locator;

  // ==========================================
  // Locators - Dialogs
  // ==========================================
  readonly completionDialog: Locator;
  readonly completionConfirmButton: Locator;
  readonly completionCancelButton: Locator;

  readonly abandonDialog: Locator;
  readonly abandonConfirmButton: Locator;
  readonly abandonCancelButton: Locator;

  readonly timeoutDialog: Locator;
  readonly viewResultsButton: Locator;

  // ==========================================
  // Locators - Validation
  // ==========================================
  readonly validationError: Locator;
  readonly validationTooltip: Locator;

  constructor(page: Page) {
    super(page);

    // Session header
    this.sessionHeader = page.locator('[data-testid="session-header"], header').first();
    this.progressBar = page.locator('[data-testid="progress-bar"], [role="progressbar"], .progress-bar').first();
    this.progressText = page.locator('[data-testid="progress-text"]').first();
    this.timerDisplay = page.locator('[data-testid="timer"], .timer, :has-text(":")').filter({ hasText: /\d+:\d+/ }).first();
    this.exitButton = page.getByRole('button', { name: /exit|выйти|close|закрыть/i }).first();

    // Question card
    this.questionCard = page.locator('[data-testid="question-card"], .question-card, [class*="Card"]').first();
    this.questionNumber = page.locator('[data-testid="question-number"], .question-number').first();
    this.questionText = page.locator('h2, [data-testid="question-text"]').first();
    this.scenarioText = page.locator('[role="note"], [data-testid="scenario"], .scenario').first();
    this.questionTypeBadge = page.locator('[data-testid="question-type"], .question-type-badge').first();

    // Likert scale answers
    this.likertScale = page.locator('[data-testid="likert-scale"], .likert-scale').first();
    this.likertOptions = page.locator('[aria-pressed], [data-testid="likert-option"], button:has-text(/^[1-5]$/)');

    // MCQ/SJT answer options
    this.answerOptions = page.locator('[data-testid="answer-option"], [aria-pressed], button:has([class*="rounded-full"])');

    // Text input
    this.textInput = page.locator('textarea, [data-testid="text-input"]').first();
    this.charCounter = page.locator('[data-testid="char-counter"], .char-counter, :has-text(/\\d+ \\/ \\d+/)').first();

    // Navigation footer
    this.navigationFooter = page.locator('footer, [data-testid="navigation-footer"]').first();
    this.backButton = page.getByRole('button', { name: /back|назад|previous/i }).first();
    this.nextButton = page.getByRole('button', { name: /next|далее|вперёд/i }).first();
    this.completeButton = page.getByRole('button', { name: /complete|завершить|finish/i }).first();

    this.keyboardHint = page.locator('kbd, [data-testid="keyboard-hint"]').first();

    // Completion dialog
    this.completionDialog = page.locator('[role="dialog"]:has-text("complet"), [role="dialog"]:has-text("завершить")');
    this.completionConfirmButton = this.completionDialog.getByRole('button', { name: /confirm|complete|завершить/i });
    this.completionCancelButton = this.completionDialog.getByRole('button', { name: /cancel|отмена/i });

    // Abandon dialog
    this.abandonDialog = page.locator('[role="dialog"]:has-text("exit"), [role="alertdialog"]:has-text("выйти")');
    this.abandonConfirmButton = this.abandonDialog.getByRole('button', { name: /exit|выйти|abandon/i });
    this.abandonCancelButton = this.abandonDialog.getByRole('button', { name: /continue|продолжить/i });

    // Timeout dialog
    this.timeoutDialog = page.locator('[role="dialog"]:has-text("time"), [role="alertdialog"]:has-text("время")');
    this.viewResultsButton = this.timeoutDialog.getByRole('button', { name: /result|результат/i });

    // Validation
    this.validationError = page.locator('[data-testid="validation-error"], .validation-error, [aria-invalid="true"]');
    this.validationTooltip = page.locator('[role="tooltip"]');
  }

  // ==========================================
  // Navigation
  // ==========================================

  async goto(sessionId: string = ''): Promise<void> {
    await this.navigateTo(`/test-templates/take/${sessionId}`);
  }

  // ==========================================
  // Progress & Timer Methods
  // ==========================================

  /**
   * Get the current progress percentage
   */
  async getProgress(): Promise<number> {
    const progressText = await this.progressText.textContent();
    if (progressText) {
      // Parse "3/10" format
      const match = progressText.match(/(\d+)\s*\/\s*(\d+)/);
      if (match) {
        return (parseInt(match[1]) / parseInt(match[2])) * 100;
      }
    }
    // Try to get from aria-valuenow
    const ariaValue = await this.progressBar.getAttribute('aria-valuenow');
    return ariaValue ? parseFloat(ariaValue) : 0;
  }

  /**
   * Get the current question number
   */
  async getCurrentQuestionNumber(): Promise<number> {
    const text = await this.progressText.textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Get total questions count
   */
  async getTotalQuestions(): Promise<number> {
    const text = await this.progressText.textContent();
    const match = text?.match(/\d+\s*\/\s*(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Get remaining time (if timed test)
   */
  async getTimeRemaining(): Promise<string | null> {
    try {
      if (await this.timerDisplay.isVisible()) {
        return this.timerDisplay.textContent();
      }
      return null;
    } catch {
      return null;
    }
  }

  // ==========================================
  // Question Methods
  // ==========================================

  /**
   * Get the question text
   */
  async getQuestionText(): Promise<string> {
    return await this.questionText.textContent() ?? '';
  }

  /**
   * Get the scenario text (for SJT questions)
   */
  async getScenarioText(): Promise<string | null> {
    try {
      if (await this.scenarioText.isVisible()) {
        return await this.scenarioText.textContent();
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get the question type from the badge
   */
  async getQuestionType(): Promise<string> {
    return await this.questionTypeBadge.textContent() ?? '';
  }

  // ==========================================
  // Answer Methods - Likert Scale
  // ==========================================

  /**
   * Select a Likert scale value (1-5)
   */
  async selectLikertValue(value: number): Promise<void> {
    const option = this.likertOptions.filter({ hasText: String(value) }).first();
    await option.click();
  }

  /**
   * Get the currently selected Likert value
   */
  async getSelectedLikertValue(): Promise<number | null> {
    const selected = this.likertOptions.filter({ has: this.page.locator('[aria-pressed="true"]') });
    const text = await selected.textContent();
    return text ? parseInt(text) : null;
  }

  // ==========================================
  // Answer Methods - MCQ/SJT
  // ==========================================

  /**
   * Select an answer option by index (0-based)
   */
  async selectOptionByIndex(index: number): Promise<void> {
    const option = this.answerOptions.nth(index);
    await option.click();
  }

  /**
   * Select an answer option by text content
   */
  async selectOptionByText(text: string): Promise<void> {
    const option = this.answerOptions.filter({ hasText: text });
    await option.click();
  }

  /**
   * Select an answer option by label (A, B, C, D)
   */
  async selectOptionByLabel(label: string): Promise<void> {
    const option = this.page.locator(`button:has-text("${label}")`).first();
    await option.click();
  }

  /**
   * Get the count of answer options
   */
  async getOptionCount(): Promise<number> {
    return this.answerOptions.count();
  }

  /**
   * Check if an option is selected
   */
  async isOptionSelected(index: number): Promise<boolean> {
    const option = this.answerOptions.nth(index);
    const ariaPressed = await option.getAttribute('aria-pressed');
    return ariaPressed === 'true';
  }

  // ==========================================
  // Answer Methods - Text Input
  // ==========================================

  /**
   * Enter text in the text input
   */
  async enterTextAnswer(text: string): Promise<void> {
    await this.textInput.fill(text);
  }

  /**
   * Get the current text answer
   */
  async getTextAnswer(): Promise<string> {
    return await this.textInput.inputValue();
  }

  /**
   * Get character count
   */
  async getCharCount(): Promise<{ current: number; min: number }> {
    const counterText = await this.charCounter.textContent() ?? '0 / 0';
    const match = counterText.match(/(\d+)\s*\/\s*(\d+)/);
    return {
      current: match ? parseInt(match[1]) : 0,
      min: match ? parseInt(match[2]) : 0,
    };
  }

  // ==========================================
  // Navigation Methods
  // ==========================================

  /**
   * Click the next button
   */
  async clickNext(): Promise<void> {
    // Check if it's the complete button instead
    if (await this.completeButton.isVisible()) {
      await this.completeButton.click();
    } else {
      await this.nextButton.click();
    }
    await this.waitForLoadingComplete();
  }

  /**
   * Click the back button
   */
  async clickBack(): Promise<void> {
    await this.backButton.click();
    await this.waitForLoadingComplete();
  }

  /**
   * Click the exit button (opens abandon dialog)
   */
  async clickExit(): Promise<void> {
    await this.exitButton.click();
  }

  /**
   * Check if back navigation is enabled
   */
  async isBackEnabled(): Promise<boolean> {
    const disabled = await this.backButton.getAttribute('disabled');
    return disabled === null;
  }

  /**
   * Check if next/complete is enabled
   */
  async isNextEnabled(): Promise<boolean> {
    const nextDisabled = await this.nextButton.getAttribute('disabled');
    const completeDisabled = await this.completeButton.getAttribute('disabled');

    if (await this.completeButton.isVisible()) {
      return completeDisabled === null;
    }
    return nextDisabled === null;
  }

  /**
   * Check if this is the last question
   */
  async isLastQuestion(): Promise<boolean> {
    return this.completeButton.isVisible();
  }

  // ==========================================
  // Dialog Methods
  // ==========================================

  /**
   * Confirm completion in the completion dialog
   */
  async confirmCompletion(): Promise<void> {
    await expect(this.completionDialog).toBeVisible({ timeout: 5000 });
    await this.completionConfirmButton.click();
    await this.page.waitForURL(/result/);
  }

  /**
   * Cancel completion dialog
   */
  async cancelCompletion(): Promise<void> {
    await expect(this.completionDialog).toBeVisible({ timeout: 5000 });
    await this.completionCancelButton.click();
  }

  /**
   * Confirm abandonment in the abandon dialog
   */
  async confirmAbandon(): Promise<void> {
    await expect(this.abandonDialog).toBeVisible({ timeout: 5000 });
    await this.abandonConfirmButton.click();
    await this.page.waitForURL(/test-templates/);
  }

  /**
   * Cancel abandon dialog
   */
  async cancelAbandon(): Promise<void> {
    await expect(this.abandonDialog).toBeVisible({ timeout: 5000 });
    await this.abandonCancelButton.click();
  }

  /**
   * Handle timeout dialog (view results)
   */
  async handleTimeout(): Promise<void> {
    await expect(this.timeoutDialog).toBeVisible({ timeout: 5000 });
    await this.viewResultsButton.click();
    await this.page.waitForURL(/result/);
  }

  // ==========================================
  // High-Level Test Flow Methods
  // ==========================================

  /**
   * Answer the current question and proceed to next
   * Automatically detects question type
   */
  async answerAndProceed(answer: string | number): Promise<void> {
    // Determine question type and answer accordingly
    if (await this.textInput.isVisible()) {
      await this.enterTextAnswer(String(answer));
    } else if (typeof answer === 'number') {
      await this.selectLikertValue(answer);
    } else {
      await this.selectOptionByText(answer);
    }

    await this.clickNext();
  }

  /**
   * Complete a test by answering all questions with default answers
   */
  async completeTestWithDefaults(): Promise<void> {
    while (!(await this.isLastQuestion())) {
      // Answer based on question type
      if (await this.textInput.isVisible()) {
        await this.enterTextAnswer('This is a test answer with sufficient length to pass validation requirements.');
      } else if (await this.likertOptions.first().isVisible()) {
        await this.selectLikertValue(3); // Middle value
      } else {
        await this.selectOptionByIndex(0); // First option
      }
      await this.clickNext();
    }

    // Last question
    if (await this.textInput.isVisible()) {
      await this.enterTextAnswer('This is a test answer with sufficient length to pass validation requirements.');
    } else if (await this.likertOptions.first().isVisible()) {
      await this.selectLikertValue(3);
    } else {
      await this.selectOptionByIndex(0);
    }

    await this.clickNext(); // Opens completion dialog
    await this.confirmCompletion();
  }

  // ==========================================
  // Assertions
  // ==========================================

  /**
   * Assert the test player is loaded
   */
  async expectPlayerLoaded(): Promise<void> {
    await expect(this.questionCard).toBeVisible({ timeout: 10000 });
    await expect(this.questionText).toBeVisible();
  }

  /**
   * Assert the current question number
   */
  async expectQuestionNumber(num: number): Promise<void> {
    const current = await this.getCurrentQuestionNumber();
    expect(current).toBe(num);
  }

  /**
   * Assert an answer is selected
   */
  async expectAnswerSelected(): Promise<void> {
    const hasSelection = await this.page.locator('[aria-pressed="true"]').isVisible();
    const hasText = await this.textInput.isVisible() && (await this.textInput.inputValue()).length > 0;
    expect(hasSelection || hasText).toBeTruthy();
  }

  /**
   * Assert next button is enabled
   */
  async expectNextEnabled(): Promise<void> {
    const isEnabled = await this.isNextEnabled();
    expect(isEnabled).toBeTruthy();
  }

  /**
   * Assert next button is disabled
   */
  async expectNextDisabled(): Promise<void> {
    const isEnabled = await this.isNextEnabled();
    expect(isEnabled).toBeFalsy();
  }

  /**
   * Assert validation error is shown
   */
  async expectValidationError(): Promise<void> {
    await expect(this.validationError).toBeVisible();
  }

  /**
   * Assert completion dialog is visible
   */
  async expectCompletionDialog(): Promise<void> {
    await expect(this.completionDialog).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert abandon dialog is visible
   */
  async expectAbandonDialog(): Promise<void> {
    await expect(this.abandonDialog).toBeVisible({ timeout: 5000 });
  }
}

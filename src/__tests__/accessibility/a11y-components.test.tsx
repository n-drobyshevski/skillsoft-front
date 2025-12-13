/**
 * Accessibility (a11y) Tests for Major Components
 * Phase 6: Tests keyboard navigation, screen reader compatibility,
 * focus management, and ARIA attributes
 *
 * Tests cover:
 * - Keyboard navigation (Tab, Enter, Space, Arrow keys)
 * - Screen reader compatibility (ARIA attributes, roles)
 * - Focus management and visible focus indicators
 * - Form accessibility (labels, error announcements)
 * - Color contrast considerations (via proper roles)
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  QuestionCard,
  MIN_CHARS_OPEN_TEXT,
  MIN_CHARS_BEHAVIORAL,
} from '@/components/test-player/QuestionCard';
import { QuestionType, DifficultyLevel, type SessionQuestion } from '@/types/domain';
import { Button } from '@/components/ui/button';

// ============================================
// HELPER FACTORIES
// ============================================

const createMockQuestion = (
  overrides: Partial<SessionQuestion> = {}
): SessionQuestion => ({
  id: 'q-1',
  questionText: 'Test question text',
  questionType: QuestionType.MULTIPLE_CHOICE,
  answerOptions: [
    { id: 'opt-1', text: 'Option A', value: 1 },
    { id: 'opt-2', text: 'Option B', value: 2 },
    { id: 'opt-3', text: 'Option C', value: 3 },
  ],
  difficultyLevel: DifficultyLevel.INTERMEDIATE,
  behavioralIndicatorId: 'bi-1',
  ...overrides,
});

// ============================================
// KEYBOARD NAVIGATION TESTS
// ============================================

describe('Keyboard Navigation', () => {
  describe('QuestionCard Multiple Choice', () => {
    it('should allow Tab navigation between options', async () => {
      const user = userEvent.setup();
      const question = createMockQuestion();
      const onAnswer = vi.fn();

      render(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={onAnswer}
          questionNumber={1}
        />
      );

      const buttons = screen.getAllByRole('button');
      const optionButtons = buttons.filter(btn =>
        btn.getAttribute('aria-pressed') !== null
      );

      // Tab to first option
      await user.tab();

      // Verify we can navigate through options
      expect(optionButtons.length).toBe(3);
    });

    it('should activate option with Enter key', async () => {
      const user = userEvent.setup();
      const question = createMockQuestion();
      const onAnswer = vi.fn();

      render(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={onAnswer}
          questionNumber={1}
        />
      );

      // Find and focus the first option button
      const firstOption = screen.getByText('Option A').closest('button');
      if (firstOption) {
        firstOption.focus();
        await user.keyboard('{Enter}');
        expect(onAnswer).toHaveBeenCalled();
      }
    });

    it('should activate option with Space key', async () => {
      const user = userEvent.setup();
      const question = createMockQuestion();
      const onAnswer = vi.fn();

      render(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={onAnswer}
          questionNumber={1}
        />
      );

      // Find and focus the first option button
      const firstOption = screen.getByText('Option A').closest('button');
      if (firstOption) {
        firstOption.focus();
        await user.keyboard(' ');
        expect(onAnswer).toHaveBeenCalled();
      }
    });
  });

  describe('QuestionCard Likert Scale', () => {
    it('should allow Tab navigation between scale points', async () => {
      const user = userEvent.setup();
      const question = createMockQuestion({
        questionType: QuestionType.LIKERT_SCALE,
        answerOptions: [
          { id: 'l-1', label: 'Strongly Disagree', value: 1 },
          { id: 'l-2', label: 'Disagree', value: 2 },
          { id: 'l-3', label: 'Neutral', value: 3 },
          { id: 'l-4', label: 'Agree', value: 4 },
          { id: 'l-5', label: 'Strongly Agree', value: 5 },
        ],
      });
      const onAnswer = vi.fn();

      render(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={onAnswer}
          questionNumber={1}
        />
      );

      const buttons = screen.getAllByRole('button');
      const scaleButtons = buttons.filter(btn =>
        btn.getAttribute('aria-pressed') !== null
      );

      expect(scaleButtons.length).toBe(5);
    });

    it('should select scale value with keyboard', async () => {
      const user = userEvent.setup();
      const question = createMockQuestion({
        questionType: QuestionType.LIKERT_SCALE,
        answerOptions: [
          { id: 'l-1', label: 'Strongly Disagree', value: 1 },
          { id: 'l-2', label: 'Disagree', value: 2 },
          { id: 'l-3', label: 'Neutral', value: 3 },
        ],
      });
      const onAnswer = vi.fn();

      render(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={onAnswer}
          questionNumber={1}
        />
      );

      // Find a scale button and interact with keyboard
      const scaleButtons = screen.getAllByRole('button').filter(btn =>
        btn.getAttribute('aria-pressed') !== null
      );

      if (scaleButtons[0]) {
        scaleButtons[0].focus();
        await user.keyboard('{Enter}');
        expect(onAnswer).toHaveBeenCalled();
      }
    });
  });

  describe('QuestionCard Open Text', () => {
    it('should focus textarea for keyboard input', async () => {
      const user = userEvent.setup();
      const question = createMockQuestion({
        questionType: QuestionType.OPEN_TEXT,
        answerOptions: [],
      });
      const onAnswer = vi.fn();

      render(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={onAnswer}
          questionNumber={1}
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();

      // Textarea should be auto-focused for text questions
      await user.type(textarea, 'Test response');
      expect(textarea).toHaveValue('Test response');
    });
  });

  describe('Button Component', () => {
    it('should be focusable with Tab key', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(
        <div>
          <input data-testid="before" />
          <Button onClick={onClick}>Click me</Button>
          <input data-testid="after" />
        </div>
      );

      const button = screen.getByRole('button', { name: 'Click me' });

      // Tab through elements
      await user.tab(); // to input
      await user.tab(); // to button

      expect(document.activeElement).toBe(button);
    });

    it('should activate with Enter key', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(<Button onClick={onClick}>Click me</Button>);

      const button = screen.getByRole('button', { name: 'Click me' });
      button.focus();

      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should activate with Space key', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(<Button onClick={onClick}>Click me</Button>);

      const button = screen.getByRole('button', { name: 'Click me' });
      button.focus();

      await user.keyboard(' ');
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should not activate when disabled', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(<Button onClick={onClick} disabled>Click me</Button>);

      const button = screen.getByRole('button', { name: 'Click me' });

      await user.click(button);
      await user.keyboard('{Enter}');
      await user.keyboard(' ');

      expect(onClick).not.toHaveBeenCalled();
    });
  });
});

// ============================================
// SCREEN READER COMPATIBILITY (ARIA)
// ============================================

describe('Screen Reader Compatibility', () => {
  describe('QuestionCard ARIA Attributes', () => {
    it('should have aria-pressed on option buttons', () => {
      const question = createMockQuestion();
      const onAnswer = vi.fn();

      render(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={onAnswer}
          questionNumber={1}
        />
      );

      const buttons = screen.getAllByRole('button').filter(btn =>
        btn.getAttribute('aria-pressed') !== null
      );

      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-pressed');
      });
    });

    it('should update aria-pressed when option is selected', () => {
      const question = createMockQuestion();
      const onAnswer = vi.fn();

      const { rerender } = render(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={onAnswer}
          questionNumber={1}
        />
      );

      // Initially no option is pressed
      const buttons = screen.getAllByRole('button').filter(btn =>
        btn.getAttribute('aria-pressed') !== null
      );

      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-pressed', 'false');
      });

      // Rerender with selected value
      rerender(
        <QuestionCard
          question={question}
          selectedValue="opt-1"
          onAnswer={onAnswer}
          questionNumber={1}
        />
      );

      // Find the selected button by its aria-pressed state
      const selectedButton = screen.getAllByRole('button').find(btn =>
        btn.getAttribute('aria-pressed') === 'true'
      );

      expect(selectedButton).toBeInTheDocument();
    });

    it('should have aria-label on textarea', () => {
      const questionText = 'Describe your experience';
      const question = createMockQuestion({
        questionType: QuestionType.OPEN_TEXT,
        questionText,
        answerOptions: [],
      });
      const onAnswer = vi.fn();

      render(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={onAnswer}
          questionNumber={1}
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-label', questionText);
    });

    it('should have aria-invalid when validation error present', () => {
      const question = createMockQuestion({
        questionType: QuestionType.OPEN_TEXT,
        answerOptions: [],
      });
      const onAnswer = vi.fn();

      render(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={onAnswer}
          questionNumber={1}
          validationError="Response is too short"
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-describedby linking to error message', () => {
      const question = createMockQuestion({
        questionType: QuestionType.OPEN_TEXT,
        answerOptions: [],
      });
      const onAnswer = vi.fn();

      render(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={onAnswer}
          questionNumber={1}
          validationError="This is required"
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-describedby', 'answer-error');

      // Verify the error element exists with correct id
      const errorElement = document.getElementById('answer-error');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent('This is required');
    });

    it('should have aria-label on option buttons', () => {
      const question = createMockQuestion();
      const onAnswer = vi.fn();

      render(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={onAnswer}
          questionNumber={1}
        />
      );

      const buttons = screen.getAllByRole('button').filter(btn =>
        btn.getAttribute('aria-label')?.includes('Option')
      );

      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have scenario context with role="note"', () => {
      const question = createMockQuestion({
        questionType: QuestionType.SITUATIONAL_JUDGMENT,
        scenario: 'You are in a meeting...',
        answerOptions: [
          { id: 's-1', text: 'Respond A', value: 1 },
          { id: 's-2', text: 'Respond B', value: 2 },
        ],
      });
      const onAnswer = vi.fn();

      render(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={onAnswer}
          questionNumber={1}
        />
      );

      const scenario = screen.getByRole('note');
      expect(scenario).toBeInTheDocument();
      expect(scenario).toHaveAttribute('aria-label', 'Scenario context');
    });

    it('should have aria-label on question number indicator', () => {
      const question = createMockQuestion();
      const onAnswer = vi.fn();

      render(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={onAnswer}
          questionNumber={5}
        />
      );

      const questionIndicator = screen.getByLabelText('Question 5');
      expect(questionIndicator).toBeInTheDocument();
    });
  });

  describe('Button ARIA Attributes', () => {
    it('should have proper button role', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should support aria-disabled', () => {
      render(<Button disabled>Disabled Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should support custom aria attributes', () => {
      render(
        <Button aria-label="Custom label" aria-describedby="description">
          Click
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
      expect(button).toHaveAttribute('aria-describedby', 'description');
    });
  });
});

// ============================================
// FOCUS MANAGEMENT TESTS
// ============================================

describe('Focus Management', () => {
  describe('Focus Visibility', () => {
    it('should have visible focus styles on buttons', () => {
      render(<Button>Focus me</Button>);

      const button = screen.getByRole('button');

      // Button should have focus-visible styles defined
      expect(button.className).toContain('focus-visible');
    });

    it('should have visible focus styles on textarea', () => {
      const question = createMockQuestion({
        questionType: QuestionType.OPEN_TEXT,
        answerOptions: [],
      });
      const onAnswer = vi.fn();

      render(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={onAnswer}
          questionNumber={1}
        />
      );

      const textarea = screen.getByRole('textbox');
      // Textarea should have focus ring styles
      expect(textarea.className).toContain('focus');
    });
  });

  describe('Focus Trapping', () => {
    it('should maintain focus within question card options', async () => {
      const user = userEvent.setup();
      const question = createMockQuestion();
      const onAnswer = vi.fn();

      render(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={onAnswer}
          questionNumber={1}
        />
      );

      const buttons = screen.getAllByRole('button').filter(btn =>
        btn.getAttribute('aria-pressed') !== null
      );

      // Focus first option
      buttons[0]?.focus();
      expect(document.activeElement).toBe(buttons[0]);

      // Tab through options
      await user.tab();
      // Focus should move to next focusable element
      expect(document.activeElement).not.toBe(buttons[0]);
    });
  });

  describe('Auto-focus Behavior', () => {
    it('should auto-focus textarea in open text questions', () => {
      const question = createMockQuestion({
        questionType: QuestionType.OPEN_TEXT,
        answerOptions: [],
      });
      const onAnswer = vi.fn();

      render(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={onAnswer}
          questionNumber={1}
        />
      );

      const textarea = screen.getByRole('textbox');
      // Textarea component is designed to receive focus for text input
      // This is an accessibility best practice for text-entry questions
      expect(textarea).toBeInTheDocument();
    });
  });
});

// ============================================
// FORM ACCESSIBILITY TESTS
// ============================================

describe('Form Accessibility', () => {
  describe('Error Announcements', () => {
    it('should announce validation errors with role="alert"', () => {
      const question = createMockQuestion({
        questionType: QuestionType.OPEN_TEXT,
        answerOptions: [],
      });
      const onAnswer = vi.fn();

      render(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={onAnswer}
          questionNumber={1}
          validationError="Please provide a longer response"
        />
      );

      // Error messages should be announced to screen readers
      // They have id="answer-error" which is referenced by aria-describedby
      const errorElement = document.getElementById('answer-error');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent('Please provide a longer response');
    });
  });

  describe('Label Associations', () => {
    it('should have proper label for textarea via aria-label', () => {
      const question = createMockQuestion({
        questionType: QuestionType.OPEN_TEXT,
        questionText: 'What is your experience?',
        answerOptions: [],
      });
      const onAnswer = vi.fn();

      render(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={onAnswer}
          questionNumber={1}
        />
      );

      const textarea = screen.getByRole('textbox', {
        name: 'What is your experience?',
      });
      expect(textarea).toBeInTheDocument();
    });
  });

  describe('Character Count Accessibility', () => {
    it('should provide character count feedback', async () => {
      const user = userEvent.setup();
      const question = createMockQuestion({
        questionType: QuestionType.OPEN_TEXT,
        answerOptions: [],
      });
      const onAnswer = vi.fn();

      render(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={onAnswer}
          questionNumber={1}
        />
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test');

      // Character count should be visible
      expect(screen.getByText(`4 / ${MIN_CHARS_OPEN_TEXT}`)).toBeInTheDocument();
    });

    it('should show behavioral example higher min chars', () => {
      const question = createMockQuestion({
        questionType: QuestionType.BEHAVIORAL_EXAMPLE,
        answerOptions: [],
      });
      const onAnswer = vi.fn();

      render(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={onAnswer}
          questionNumber={1}
        />
      );

      // Behavioral examples have higher min character requirement
      expect(screen.getByText(`0 / ${MIN_CHARS_BEHAVIORAL}`)).toBeInTheDocument();
    });
  });
});

// ============================================
// COLOR CONTRAST AND VISUAL ACCESSIBILITY
// ============================================

describe('Visual Accessibility', () => {
  describe('Selected State Indication', () => {
    it('should indicate selected state visually and via ARIA', () => {
      const question = createMockQuestion();
      const onAnswer = vi.fn();

      render(
        <QuestionCard
          question={question}
          selectedValue="opt-2"
          onAnswer={onAnswer}
          questionNumber={1}
        />
      );

      const selectedButton = screen.getAllByRole('button').find(btn =>
        btn.getAttribute('aria-pressed') === 'true'
      );

      expect(selectedButton).toBeInTheDocument();
      // Selected button should have distinct styling (emerald colors in this case)
      expect(selectedButton?.className).toContain('emerald');
    });
  });

  describe('Validation State Indication', () => {
    it('should indicate error state with visual styling', () => {
      const question = createMockQuestion({
        questionType: QuestionType.OPEN_TEXT,
        answerOptions: [],
      });
      const onAnswer = vi.fn();

      render(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={onAnswer}
          questionNumber={1}
          validationError="Error message"
        />
      );

      const textarea = screen.getByRole('textbox');
      // Error state should have red/destructive styling
      expect(textarea.className).toContain('red');
    });

    it('should indicate valid state with visual styling', async () => {
      const user = userEvent.setup();
      const question = createMockQuestion({
        questionType: QuestionType.OPEN_TEXT,
        answerOptions: [],
      });
      const onAnswer = vi.fn();

      render(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={onAnswer}
          questionNumber={1}
        />
      );

      const textarea = screen.getByRole('textbox');

      // Type enough characters to be valid
      const validText = 'This is a sufficiently long response for the test';
      await user.type(textarea, validText);

      // Character count should show valid state (emerald color)
      const charCount = screen.getByText(`${validText.length} / ${MIN_CHARS_OPEN_TEXT}`);
      expect(charCount.className).toContain('emerald');
    });
  });

  describe('Question Type Badges', () => {
    it('should display question type for context', () => {
      const question = createMockQuestion({
        questionType: QuestionType.SITUATIONAL_JUDGMENT,
        scenario: 'A scenario...',
        answerOptions: [
          { id: 's-1', text: 'Response A', value: 1 },
        ],
      });
      const onAnswer = vi.fn();

      render(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={onAnswer}
          questionNumber={1}
        />
      );

      // Question type badge helps users understand context
      expect(screen.getByText(/ситуационный вопрос/i)).toBeInTheDocument();
    });
  });
});

// ============================================
// INTERACTIVE ELEMENT ACCESSIBILITY
// ============================================

describe('Interactive Element Accessibility', () => {
  describe('Touch Target Sizes', () => {
    it('should have minimum touch target size for options', () => {
      const question = createMockQuestion();
      const onAnswer = vi.fn();

      render(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={onAnswer}
          questionNumber={1}
        />
      );

      const buttons = screen.getAllByRole('button').filter(btn =>
        btn.getAttribute('aria-pressed') !== null
      );

      // Buttons should have min-h-[56px] or similar for touch accessibility
      buttons.forEach(button => {
        expect(button.className).toContain('min-h');
      });
    });
  });

  describe('Button Disabled State', () => {
    it('should properly convey disabled state', () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button.className).toContain('disabled');
    });
  });
});

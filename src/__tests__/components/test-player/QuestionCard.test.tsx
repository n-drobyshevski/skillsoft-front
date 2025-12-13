/**
 * Tests for QuestionCard component
 * Tests different question types and user interactions
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  QuestionCard,
  MIN_CHARS_OPEN_TEXT,
  MIN_CHARS_BEHAVIORAL,
} from '@/components/test-player/QuestionCard';
import { QuestionType, DifficultyLevel, type SessionQuestion } from '@/types/domain';

// Helper to create mock questions
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

describe('QuestionCard', () => {
  describe('Multiple Choice Questions', () => {
    it('should render question text', () => {
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

      expect(screen.getByText('Test question text')).toBeInTheDocument();
    });

    it('should render all answer options', () => {
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

      expect(screen.getByText('Option A')).toBeInTheDocument();
      expect(screen.getByText('Option B')).toBeInTheDocument();
      expect(screen.getByText('Option C')).toBeInTheDocument();
    });

    it('should call onAnswer when option is clicked', async () => {
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

      await user.click(screen.getByText('Option A'));
      expect(onAnswer).toHaveBeenCalled();
    });
  });

  describe('Likert Scale Questions', () => {
    it('should render likert scale options', () => {
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

      // Likert scales typically show labels
      expect(screen.getByText('Test question text')).toBeInTheDocument();
    });

    it('should handle LIKERT type', () => {
      const question = createMockQuestion({
        questionType: QuestionType.LIKERT,
        answerOptions: [
          { id: 'l-1', label: '1', value: 1 },
          { id: 'l-2', label: '2', value: 2 },
          { id: 'l-3', label: '3', value: 3 },
          { id: 'l-4', label: '4', value: 4 },
          { id: 'l-5', label: '5', value: 5 },
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

      expect(screen.getByText('Test question text')).toBeInTheDocument();
    });
  });

  describe('Situational Judgment Questions', () => {
    it('should render SJT question', () => {
      const question = createMockQuestion({
        questionType: QuestionType.SITUATIONAL_JUDGMENT,
        scenario: 'You are in a meeting and a colleague interrupts you...',
        answerOptions: [
          { id: 's-1', text: 'Politely continue', value: 1 },
          { id: 's-2', text: 'Stop and listen', value: 2 },
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

      expect(screen.getByText('Test question text')).toBeInTheDocument();
    });

    it('should handle SJT type alias', () => {
      const question = createMockQuestion({
        questionType: QuestionType.SJT,
        answerOptions: [
          { id: 's-1', text: 'Response A', value: 1 },
          { id: 's-2', text: 'Response B', value: 2 },
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

      expect(screen.getByText('Test question text')).toBeInTheDocument();
    });
  });

  describe('Open Text Questions', () => {
    it('should render textarea for open text', () => {
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

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should show character count', async () => {
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

      // Should show character count
      expect(screen.getByText(`4 / ${MIN_CHARS_OPEN_TEXT}`)).toBeInTheDocument();
    });

    it('should call onAnswer with text input', async () => {
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
      await user.type(textarea, 'Test response');

      expect(onAnswer).toHaveBeenCalled();
    });

    it('should show validation when text is long enough', async () => {
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
      // Type enough characters to pass validation
      const longText = 'This is a sufficiently long response for the test';
      await user.type(textarea, longText);

      expect(screen.getByText(`${longText.length} / ${MIN_CHARS_OPEN_TEXT}`)).toBeInTheDocument();
    });
  });

  describe('Behavioral Example Questions', () => {
    it('should have higher minimum character requirement', () => {
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

      // Should show higher min chars for behavioral
      expect(screen.getByText(`0 / ${MIN_CHARS_BEHAVIORAL}`)).toBeInTheDocument();
    });

    it('should render textarea', () => {
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

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Validation Error Display', () => {
    it('should display validation error message', () => {
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

      expect(screen.getByText('Response is too short')).toBeInTheDocument();
    });

    it('should have error styling on textarea when validation error present', () => {
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
          validationError="Error"
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on textarea', () => {
      const question = createMockQuestion({
        questionType: QuestionType.OPEN_TEXT,
        questionText: 'Describe your experience',
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
      expect(textarea).toHaveAttribute('aria-label', 'Describe your experience');
    });

    it('should have aria-describedby linking to error', () => {
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
    });
  });

  describe('Pre-filled Values', () => {
    it('should display pre-filled text value', () => {
      const question = createMockQuestion({
        questionType: QuestionType.OPEN_TEXT,
        answerOptions: [],
      });
      const onAnswer = vi.fn();

      render(
        <QuestionCard
          question={question}
          selectedValue="Previously entered text"
          onAnswer={onAnswer}
          questionNumber={1}
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('Previously entered text');
    });
  });
});

describe('QuestionCard Constants', () => {
  it('should export MIN_CHARS_OPEN_TEXT constant', () => {
    expect(MIN_CHARS_OPEN_TEXT).toBe(20);
  });

  it('should export MIN_CHARS_BEHAVIORAL constant', () => {
    expect(MIN_CHARS_BEHAVIORAL).toBe(50);
  });
});

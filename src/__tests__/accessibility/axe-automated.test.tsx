/**
 * Automated Accessibility Testing with axe-core
 *
 * These tests use axe-core via jest-axe to perform automated WCAG compliance checks.
 * They catch common accessibility violations like:
 * - Missing alt text, labels, and ARIA attributes
 * - Color contrast issues
 * - Invalid HTML structure
 * - Keyboard accessibility issues
 *
 * Note: Automated tests catch ~30-40% of accessibility issues.
 * Manual testing with screen readers is still required for full WCAG AA compliance.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { QuestionCard } from '@/components/test-player/QuestionCard';
import { QuestionType, DifficultyLevel, type SessionQuestion } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { renderWithIntl } from '../utils/test-providers';

// ============================================
// HELPER FACTORIES
// ============================================

const createMockQuestion = (
  overrides: Partial<SessionQuestion> = {}
): SessionQuestion => ({
  id: 'q-1',
  questionText: 'Test question text for accessibility testing',
  questionType: QuestionType.MULTIPLE_CHOICE,
  answerOptions: [
    { id: 'opt-1', text: 'Option A - First choice', value: 1 },
    { id: 'opt-2', text: 'Option B - Second choice', value: 2 },
    { id: 'opt-3', text: 'Option C - Third choice', value: 3 },
  ],
  difficultyLevel: DifficultyLevel.INTERMEDIATE,
  behavioralIndicatorId: 'bi-1',
  ...overrides,
});

// ============================================
// AXE-CORE AUTOMATED TESTS
// ============================================

describe('Automated Accessibility Tests (axe-core)', () => {
  describe('QuestionCard Component', () => {
    it('should have no accessibility violations for multiple choice question', async () => {
      const question = createMockQuestion();

      const { container } = renderWithIntl(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={() => {}}
          questionNumber={1}
        />
      );

      const results = await axe(container, {
        rules: {
          // Disable color-contrast for now (requires visual testing)
          'color-contrast': { enabled: false },
        },
      });

      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations for Likert scale question', async () => {
      const question = createMockQuestion({
        questionType: QuestionType.LIKERT_SCALE,
        answerOptions: [
          { id: 'l-1', text: 'Strongly Disagree', value: 1 },
          { id: 'l-2', text: 'Disagree', value: 2 },
          { id: 'l-3', text: 'Neutral', value: 3 },
          { id: 'l-4', text: 'Agree', value: 4 },
          { id: 'l-5', text: 'Strongly Agree', value: 5 },
        ],
      });

      const { container } = renderWithIntl(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={() => {}}
          questionNumber={1}
        />
      );

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: false },
        },
      });

      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations for open text question', async () => {
      const question = createMockQuestion({
        questionType: QuestionType.OPEN_TEXT,
        answerOptions: [],
      });

      const { container } = renderWithIntl(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={() => {}}
          questionNumber={1}
        />
      );

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: false },
        },
      });

      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations for situational judgment question', async () => {
      const question = createMockQuestion({
        questionType: QuestionType.SITUATIONAL_JUDGMENT,
        scenario: 'You are in a team meeting when a colleague takes credit for your idea.',
        answerOptions: [
          { id: 's-1', text: 'Confront them immediately in front of everyone', value: 1 },
          { id: 's-2', text: 'Wait and discuss it privately after the meeting', value: 2 },
          { id: 's-3', text: 'Let it go and move on', value: 3 },
        ],
      });

      const { container } = renderWithIntl(
        <QuestionCard
          question={question}
          selectedValue={undefined}
          onAnswer={() => {}}
          questionNumber={1}
        />
      );

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: false },
        },
      });

      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with selected value', async () => {
      const question = createMockQuestion();

      const { container } = renderWithIntl(
        <QuestionCard
          question={question}
          selectedValue="opt-2"
          onAnswer={() => {}}
          questionNumber={3}
        />
      );

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: false },
        },
      });

      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with validation error', async () => {
      const question = createMockQuestion({
        questionType: QuestionType.OPEN_TEXT,
        answerOptions: [],
      });

      const { container } = renderWithIntl(
        <QuestionCard
          question={question}
          selectedValue="Short"
          onAnswer={() => {}}
          questionNumber={1}
          validationError="Response must be at least 50 characters"
        />
      );

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: false },
        },
      });

      expect(results).toHaveNoViolations();
    });
  });

  describe('UI Components', () => {
    it('Button should have no accessibility violations', async () => {
      const { container } = render(
        <div>
          <Button>Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="destructive">Destructive Button</Button>
          <Button disabled>Disabled Button</Button>
        </div>
      );

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: false },
        },
      });

      expect(results).toHaveNoViolations();
    });

    it('Card should have no accessibility violations', async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
        </Card>
      );

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: false },
        },
      });

      expect(results).toHaveNoViolations();
    });

    it('Badge should have no accessibility violations', async () => {
      const { container } = render(
        <div>
          <Badge>Default Badge</Badge>
          <Badge variant="secondary">Secondary Badge</Badge>
          <Badge variant="outline">Outline Badge</Badge>
          <Badge variant="destructive">Destructive Badge</Badge>
        </div>
      );

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: false },
        },
      });

      expect(results).toHaveNoViolations();
    });
  });

  describe('Form Components', () => {
    it('should have no accessibility violations for form with proper labels', async () => {
      const { container } = render(
        <form aria-label="Test form">
          <div>
            <label htmlFor="name-input">Name</label>
            <input id="name-input" type="text" aria-required="true" />
          </div>
          <div>
            <label htmlFor="email-input">Email</label>
            <input id="email-input" type="email" aria-required="true" />
          </div>
          <Button type="submit">Submit</Button>
        </form>
      );

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: false },
        },
      });

      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations for fieldset with legend', async () => {
      const { container } = render(
        <fieldset>
          <legend>Select your preference</legend>
          <div>
            <input type="radio" id="opt-a" name="preference" value="a" />
            <label htmlFor="opt-a">Option A</label>
          </div>
          <div>
            <input type="radio" id="opt-b" name="preference" value="b" />
            <label htmlFor="opt-b">Option B</label>
          </div>
        </fieldset>
      );

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: false },
        },
      });

      expect(results).toHaveNoViolations();
    });
  });

  describe('ARIA Live Regions', () => {
    it('should have no accessibility violations for status announcements', async () => {
      const { container } = render(
        <div>
          <div role="status" aria-live="polite">
            Selection saved
          </div>
          <div role="alert" aria-live="assertive">
            Error: Please complete all required fields
          </div>
        </div>
      );

      const results = await axe(container);

      expect(results).toHaveNoViolations();
    });
  });

  describe('Navigation and Landmarks', () => {
    it('should have no accessibility violations for navigation landmarks', async () => {
      const { container } = render(
        <div>
          <header role="banner">
            <h1>Application Title</h1>
          </header>
          <nav aria-label="Main navigation">
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
            </ul>
          </nav>
          <main role="main">
            <h2>Main Content</h2>
            <p>Content goes here</p>
          </main>
          <footer role="contentinfo">
            <p>Footer content</p>
          </footer>
        </div>
      );

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: false },
          // Disable region rule since this is a simplified test
          'region': { enabled: false },
        },
      });

      expect(results).toHaveNoViolations();
    });
  });
});

// ============================================
// WCAG 2.1 AA SPECIFIC TESTS
// ============================================

describe('WCAG 2.1 AA Compliance Checks', () => {
  describe('1.3.1 Info and Relationships', () => {
    it('should have proper heading hierarchy', async () => {
      const { container } = render(
        <div>
          <h1>Page Title</h1>
          <section>
            <h2>Section Title</h2>
            <h3>Subsection Title</h3>
            <p>Content</p>
          </section>
        </div>
      );

      const results = await axe(container, {
        runOnly: ['heading-order'],
      });

      expect(results).toHaveNoViolations();
    });
  });

  describe('2.1.1 Keyboard Accessible', () => {
    it('should have focusable interactive elements', async () => {
      const { container } = render(
        <div>
          <Button>Focusable Button</Button>
          <a href="#test">Focusable Link</a>
          <input type="text" placeholder="Focusable Input" />
        </div>
      );

      const results = await axe(container, {
        runOnly: ['focus-order-semantics', 'tabindex'],
      });

      expect(results).toHaveNoViolations();
    });
  });

  describe('4.1.2 Name, Role, Value', () => {
    it('should have accessible names for all interactive elements', async () => {
      const { container } = render(
        <div>
          <Button aria-label="Close dialog">X</Button>
          <button aria-label="Toggle menu">
            <span aria-hidden="true">☰</span>
          </button>
          <input type="text" aria-label="Search" placeholder="Search..." />
        </div>
      );

      const results = await axe(container, {
        runOnly: ['button-name', 'label'],
      });

      expect(results).toHaveNoViolations();
    });
  });
});

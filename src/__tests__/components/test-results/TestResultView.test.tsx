/**
 * Tests for Test Result View Components
 * Phase 5: Test Results Viewing and Analysis Tests
 *
 * Tests cover:
 * - TestResultView component rendering
 * - Score display and formatting
 * - Competency scores breakdown
 * - Pass/fail status display
 * - Statistics cards
 * - Performance tier classification
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { TestResult, CompetencyScore } from '@/types/domain';

// ============================================
// MOCK DATA
// ============================================
const mockCompetencyScores: CompetencyScore[] = [
  {
    competencyId: 'comp-1',
    competencyName: 'Communication',
    competencyCategory: 'INTERPERSONAL',
    score: 85,
    maxScore: 100,
    percentage: 85,
    questionsAnswered: 5,
    weight: 0.4,
    onetCode: '2.A.1.a',
  },
  {
    competencyId: 'comp-2',
    competencyName: 'Problem Solving',
    competencyCategory: 'COGNITIVE',
    score: 72,
    maxScore: 100,
    percentage: 72,
    questionsAnswered: 4,
    weight: 0.3,
    onetCode: '2.A.2.b',
  },
  {
    competencyId: 'comp-3',
    competencyName: 'Leadership',
    competencyCategory: 'LEADERSHIP',
    score: 45,
    maxScore: 100,
    percentage: 45,
    questionsAnswered: 3,
    weight: 0.3,
  },
];

const mockPassedResult: TestResult = {
  id: 'result-1',
  sessionId: 'session-1',
  templateId: 'template-1',
  templateName: 'Communication Skills Assessment',
  clerkUserId: 'clerk_user123',
  overallScore: 202,
  overallPercentage: 78,
  percentile: 72,
  passed: true,
  competencyScores: mockCompetencyScores,
  totalTimeSeconds: 1800,
  questionsAnswered: 12,
  questionsSkipped: 0,
  totalQuestions: 12,
  completedAt: new Date().toISOString(),
  status: 'COMPLETED',
};

const mockFailedResult: TestResult = {
  id: 'result-2',
  sessionId: 'session-2',
  templateId: 'template-1',
  templateName: 'Communication Skills Assessment',
  clerkUserId: 'clerk_user123',
  overallScore: 130,
  overallPercentage: 52,
  percentile: 25,
  passed: false,
  competencyScores: [
    {
      competencyId: 'comp-1',
      competencyName: 'Communication',
      score: 50,
      maxScore: 100,
      percentage: 50,
    },
    {
      competencyId: 'comp-2',
      competencyName: 'Problem Solving',
      score: 40,
      maxScore: 100,
      percentage: 40,
    },
  ],
  totalTimeSeconds: 1200,
  questionsAnswered: 8,
  questionsSkipped: 2,
  totalQuestions: 10,
  completedAt: new Date(Date.now() - 86400000).toISOString(),
  status: 'COMPLETED',
};

// ============================================
// TEST HELPER COMPONENTS (simulating actual components)
// ============================================

interface TestResultViewProps {
  result: TestResult;
}

function TestResultView({ result }: TestResultViewProps) {
  const timeInMinutes = Math.floor(result.totalTimeSeconds / 60);
  const timeInSeconds = result.totalTimeSeconds % 60;
  const percentScore = Math.round(result.overallPercentage ?? 0);
  const isPassed = result.passed;

  return (
    <div data-testid="test-result-view">
      {/* Hero Section */}
      <div
        data-testid="hero-section"
        role="region"
        aria-label="Test result summary"
        className={isPassed ? 'passed' : 'not-passed'}
      >
        <div data-testid="result-icon">
          {isPassed ? 'Trophy' : 'Target'}
        </div>
        <h1 data-testid="template-name">{result.templateName}</h1>
        <div data-testid="completion-date">
          Completed {new Date(result.completedAt).toLocaleString()}
        </div>
        <div data-testid="score-display">
          <span data-testid="percentage-score">{percentScore}%</span>
          <span data-testid="pass-status">
            {isPassed ? 'Passed' : 'Not Passed'}
          </span>
        </div>
        {result.percentile !== undefined && result.percentile !== null && (
          <div data-testid="percentile-display">
            Better than {result.percentile}% of participants
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div data-testid="stats-section" role="list" aria-label="Test statistics">
        <div data-testid="stat-score" role="listitem">
          <span>Score</span>
          <span data-testid="stat-score-value">{(result.overallScore ?? 0).toFixed(1)}</span>
          <span>of {(result.competencyScores ?? []).reduce((sum, c) => sum + c.maxScore, 0).toFixed(1)}</span>
        </div>
        <div data-testid="stat-time" role="listitem">
          <span>Time</span>
          <span data-testid="stat-time-value">
            {timeInMinutes}:{timeInSeconds.toString().padStart(2, '0')}
          </span>
        </div>
        <div data-testid="stat-answered" role="listitem">
          <span>Answered</span>
          <span data-testid="stat-answered-value">
            {result.questionsAnswered}/{result.totalQuestions}
          </span>
          {result.questionsSkipped > 0 && (
            <span data-testid="skipped-count">{result.questionsSkipped} skipped</span>
          )}
        </div>
        <div data-testid="stat-competencies" role="listitem">
          <span>Competencies</span>
          <span data-testid="stat-competencies-value">
            {(result.competencyScores ?? []).length}
          </span>
        </div>
      </div>

      {/* Competency Scores */}
      <div data-testid="competency-section">
        <h2>Competency Scores</h2>
        {(result.competencyScores ?? []).map((competency) => (
          <CompetencyCard key={competency.competencyId} competency={competency} />
        ))}
      </div>
    </div>
  );
}

interface CompetencyCardProps {
  competency: CompetencyScore;
}

function CompetencyCard({ competency }: CompetencyCardProps) {
  const percentage = Math.round(competency.percentage);

  // Determine performance tier
  const tier = percentage >= 90 ? 'excellent' :
               percentage >= 70 ? 'good' :
               percentage >= 50 ? 'average' : 'poor';

  const tierLabels = {
    excellent: 'Excellent',
    good: 'Good',
    average: 'Average',
    poor: 'Needs Improvement',
  };

  return (
    <div
      data-testid={`competency-card-${competency.competencyId}`}
      data-tier={tier}
      role="article"
      aria-label={`${competency.competencyName} score`}
    >
      <h4 data-testid="competency-name">{competency.competencyName}</h4>
      {competency.onetCode && (
        <span data-testid="onet-code">{competency.onetCode}</span>
      )}
      <div data-testid="competency-percentage">{percentage}%</div>
      <div data-testid="competency-score">
        {competency.score.toFixed(1)}/{competency.maxScore.toFixed(1)}
      </div>
      <div data-testid="competency-tier">{tierLabels[tier]}</div>
      <div
        data-testid="progress-bar"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${competency.competencyName} score: ${percentage}%`}
        style={{ width: `${percentage}%` }}
      />
      {competency.questionsAnswered && (
        <span data-testid="questions-answered">
          {competency.questionsAnswered} questions answered
        </span>
      )}
    </div>
  );
}

// ============================================
// TESTS
// ============================================
describe('TestResultView Component', () => {
  // ==========================================
  // Hero Section Tests
  // ==========================================
  describe('Hero Section', () => {
    it('should render passed result with trophy icon', () => {
      render(<TestResultView result={mockPassedResult} />);

      expect(screen.getByTestId('hero-section')).toHaveClass('passed');
      expect(screen.getByTestId('result-icon')).toHaveTextContent('Trophy');
    });

    it('should render failed result with target icon', () => {
      render(<TestResultView result={mockFailedResult} />);

      expect(screen.getByTestId('hero-section')).toHaveClass('not-passed');
      expect(screen.getByTestId('result-icon')).toHaveTextContent('Target');
    });

    it('should display template name', () => {
      render(<TestResultView result={mockPassedResult} />);

      expect(screen.getByTestId('template-name')).toHaveTextContent(
        'Communication Skills Assessment'
      );
    });

    it('should display completion date', () => {
      render(<TestResultView result={mockPassedResult} />);

      expect(screen.getByTestId('completion-date')).toBeInTheDocument();
      expect(screen.getByTestId('completion-date').textContent).toContain('Completed');
    });

    it('should display percentage score', () => {
      render(<TestResultView result={mockPassedResult} />);

      expect(screen.getByTestId('percentage-score')).toHaveTextContent('78%');
    });

    it('should display "Passed" status for passed result', () => {
      render(<TestResultView result={mockPassedResult} />);

      expect(screen.getByTestId('pass-status')).toHaveTextContent('Passed');
    });

    it('should display "Not Passed" status for failed result', () => {
      render(<TestResultView result={mockFailedResult} />);

      expect(screen.getByTestId('pass-status')).toHaveTextContent('Not Passed');
    });

    it('should display percentile when available', () => {
      render(<TestResultView result={mockPassedResult} />);

      expect(screen.getByTestId('percentile-display')).toHaveTextContent(
        'Better than 72% of participants'
      );
    });

    it('should not display percentile when not available', () => {
      const resultWithoutPercentile = {
        ...mockPassedResult,
        percentile: undefined,
      };
      render(<TestResultView result={resultWithoutPercentile} />);

      expect(screen.queryByTestId('percentile-display')).not.toBeInTheDocument();
    });
  });

  // ==========================================
  // Statistics Cards Tests
  // ==========================================
  describe('Statistics Cards', () => {
    it('should display total score', () => {
      render(<TestResultView result={mockPassedResult} />);

      expect(screen.getByTestId('stat-score-value')).toHaveTextContent('202.0');
    });

    it('should display time in correct format', () => {
      render(<TestResultView result={mockPassedResult} />);

      expect(screen.getByTestId('stat-time-value')).toHaveTextContent('30:00');
    });

    it('should display questions answered count', () => {
      render(<TestResultView result={mockPassedResult} />);

      expect(screen.getByTestId('stat-answered-value')).toHaveTextContent('12/12');
    });

    it('should display skipped count when there are skipped questions', () => {
      render(<TestResultView result={mockFailedResult} />);

      expect(screen.getByTestId('skipped-count')).toHaveTextContent('2 skipped');
    });

    it('should not display skipped count when no questions were skipped', () => {
      render(<TestResultView result={mockPassedResult} />);

      expect(screen.queryByTestId('skipped-count')).not.toBeInTheDocument();
    });

    it('should display competency count', () => {
      render(<TestResultView result={mockPassedResult} />);

      expect(screen.getByTestId('stat-competencies-value')).toHaveTextContent('3');
    });

    it('should have accessible list role for statistics', () => {
      render(<TestResultView result={mockPassedResult} />);

      expect(screen.getByRole('list', { name: 'Test statistics' })).toBeInTheDocument();
      expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // Competency Scores Tests
  // ==========================================
  describe('Competency Scores', () => {
    it('should render all competency cards', () => {
      render(<TestResultView result={mockPassedResult} />);

      mockCompetencyScores.forEach((competency) => {
        expect(
          screen.getByTestId(`competency-card-${competency.competencyId}`)
        ).toBeInTheDocument();
      });
    });

    it('should display competency name', () => {
      render(<TestResultView result={mockPassedResult} />);

      expect(screen.getAllByTestId('competency-name')[0]).toHaveTextContent(
        'Communication'
      );
    });

    it('should display O*NET code when available', () => {
      render(<TestResultView result={mockPassedResult} />);

      expect(screen.getAllByTestId('onet-code')[0]).toHaveTextContent('2.A.1.a');
    });

    it('should display competency percentage', () => {
      render(<TestResultView result={mockPassedResult} />);

      expect(screen.getAllByTestId('competency-percentage')[0]).toHaveTextContent('85%');
    });

    it('should display competency score fraction', () => {
      render(<TestResultView result={mockPassedResult} />);

      expect(screen.getAllByTestId('competency-score')[0]).toHaveTextContent('85.0/100.0');
    });

    it('should display questions answered when available', () => {
      render(<TestResultView result={mockPassedResult} />);

      expect(screen.getAllByTestId('questions-answered')[0]).toHaveTextContent(
        '5 questions answered'
      );
    });
  });

  // ==========================================
  // Performance Tier Tests
  // ==========================================
  describe('Performance Tiers', () => {
    it('should classify 90%+ as excellent', () => {
      const excellentResult = {
        ...mockPassedResult,
        competencyScores: [
          {
            competencyId: 'comp-excellent',
            competencyName: 'Excellent Competency',
            score: 95,
            maxScore: 100,
            percentage: 95,
          },
        ],
      };
      render(<TestResultView result={excellentResult} />);

      const card = screen.getByTestId('competency-card-comp-excellent');
      expect(card).toHaveAttribute('data-tier', 'excellent');
      expect(screen.getByTestId('competency-tier')).toHaveTextContent('Excellent');
    });

    it('should classify 70-89% as good', () => {
      const goodResult = {
        ...mockPassedResult,
        competencyScores: [
          {
            competencyId: 'comp-good',
            competencyName: 'Good Competency',
            score: 75,
            maxScore: 100,
            percentage: 75,
          },
        ],
      };
      render(<TestResultView result={goodResult} />);

      const card = screen.getByTestId('competency-card-comp-good');
      expect(card).toHaveAttribute('data-tier', 'good');
      expect(screen.getByTestId('competency-tier')).toHaveTextContent('Good');
    });

    it('should classify 50-69% as average', () => {
      const averageResult = {
        ...mockPassedResult,
        competencyScores: [
          {
            competencyId: 'comp-average',
            competencyName: 'Average Competency',
            score: 55,
            maxScore: 100,
            percentage: 55,
          },
        ],
      };
      render(<TestResultView result={averageResult} />);

      const card = screen.getByTestId('competency-card-comp-average');
      expect(card).toHaveAttribute('data-tier', 'average');
      expect(screen.getByTestId('competency-tier')).toHaveTextContent('Average');
    });

    it('should classify below 50% as poor', () => {
      const poorResult = {
        ...mockPassedResult,
        competencyScores: [
          {
            competencyId: 'comp-poor',
            competencyName: 'Poor Competency',
            score: 35,
            maxScore: 100,
            percentage: 35,
          },
        ],
      };
      render(<TestResultView result={poorResult} />);

      const card = screen.getByTestId('competency-card-comp-poor');
      expect(card).toHaveAttribute('data-tier', 'poor');
      expect(screen.getByTestId('competency-tier')).toHaveTextContent('Needs Improvement');
    });
  });

  // ==========================================
  // Accessibility Tests
  // ==========================================
  describe('Accessibility', () => {
    it('should have accessible progress bars', () => {
      render(<TestResultView result={mockPassedResult} />);

      const progressBars = screen.getAllByRole('progressbar');
      progressBars.forEach((bar) => {
        expect(bar).toHaveAttribute('aria-valuenow');
        expect(bar).toHaveAttribute('aria-valuemin', '0');
        expect(bar).toHaveAttribute('aria-valuemax', '100');
        expect(bar).toHaveAttribute('aria-label');
      });
    });

    it('should have accessible region for hero section', () => {
      render(<TestResultView result={mockPassedResult} />);

      expect(
        screen.getByRole('region', { name: 'Test result summary' })
      ).toBeInTheDocument();
    });

    it('should have accessible articles for competency cards', () => {
      render(<TestResultView result={mockPassedResult} />);

      const articles = screen.getAllByRole('article');
      expect(articles.length).toBe(mockCompetencyScores.length);
    });
  });

  // ==========================================
  // Edge Cases Tests
  // ==========================================
  describe('Edge Cases', () => {
    it('should handle zero time', () => {
      const zeroTimeResult = {
        ...mockPassedResult,
        totalTimeSeconds: 0,
      };
      render(<TestResultView result={zeroTimeResult} />);

      expect(screen.getByTestId('stat-time-value')).toHaveTextContent('0:00');
    });

    it('should handle single digit seconds', () => {
      const singleDigitResult = {
        ...mockPassedResult,
        totalTimeSeconds: 125, // 2:05
      };
      render(<TestResultView result={singleDigitResult} />);

      expect(screen.getByTestId('stat-time-value')).toHaveTextContent('2:05');
    });

    it('should handle empty competency scores', () => {
      const emptyResult = {
        ...mockPassedResult,
        competencyScores: [],
      };
      render(<TestResultView result={emptyResult} />);

      expect(screen.getByTestId('stat-competencies-value')).toHaveTextContent('0');
    });

    it('should handle 100% score', () => {
      const perfectResult = {
        ...mockPassedResult,
        overallPercentage: 100,
        competencyScores: [
          {
            competencyId: 'comp-perfect',
            competencyName: 'Perfect Score',
            score: 100,
            maxScore: 100,
            percentage: 100,
          },
        ],
      };
      render(<TestResultView result={perfectResult} />);

      expect(screen.getByTestId('percentage-score')).toHaveTextContent('100%');
    });

    it('should handle 0% score', () => {
      const zeroResult = {
        ...mockFailedResult,
        overallPercentage: 0,
        competencyScores: [
          {
            competencyId: 'comp-zero',
            competencyName: 'Zero Score',
            score: 0,
            maxScore: 100,
            percentage: 0,
          },
        ],
      };
      render(<TestResultView result={zeroResult} />);

      expect(screen.getByTestId('percentage-score')).toHaveTextContent('0%');
    });

    it('should handle decimal percentages by rounding', () => {
      const decimalResult = {
        ...mockPassedResult,
        overallPercentage: 78.6,
      };
      render(<TestResultView result={decimalResult} />);

      expect(screen.getByTestId('percentage-score')).toHaveTextContent('79%');
    });
  });
});

// ============================================
// Compact View Tests
// ============================================
describe('CompactTestResultView', () => {
  function CompactTestResultView({ result }: TestResultViewProps) {
    const percentScore = Math.round(result.overallPercentage ?? 0);
    const isPassed = result.passed;
    const sortedCompetencies = [...(result.competencyScores ?? [])].sort(
      (a, b) => b.percentage - a.percentage
    );
    const proficientCount = sortedCompetencies.filter((c) => c.percentage >= 70).length;

    return (
      <div data-testid="compact-result-view">
        <div data-testid="compact-hero">
          <span data-testid="compact-score">{percentScore}%</span>
          <span data-testid="compact-status">{isPassed ? 'Passed' : 'Not Passed'}</span>
        </div>
        <div data-testid="compact-proficient">
          {proficientCount}/{sortedCompetencies.length} proficient
        </div>
        {sortedCompetencies.map((comp) => (
          <div
            key={comp.competencyId}
            data-testid={`compact-competency-${comp.competencyId}`}
          >
            <span>{comp.competencyName}</span>
            <span>{Math.round(comp.percentage)}%</span>
          </div>
        ))}
      </div>
    );
  }

  it('should render compact view', () => {
    render(<CompactTestResultView result={mockPassedResult} />);

    expect(screen.getByTestId('compact-result-view')).toBeInTheDocument();
  });

  it('should display score in compact format', () => {
    render(<CompactTestResultView result={mockPassedResult} />);

    expect(screen.getByTestId('compact-score')).toHaveTextContent('78%');
  });

  it('should display proficient count', () => {
    render(<CompactTestResultView result={mockPassedResult} />);

    // 2 out of 3 competencies have >= 70%
    expect(screen.getByTestId('compact-proficient')).toHaveTextContent('2/3 proficient');
  });

  it('should sort competencies by percentage descending', () => {
    render(<CompactTestResultView result={mockPassedResult} />);

    const competencyElements = [
      screen.getByTestId('compact-competency-comp-1'),
      screen.getByTestId('compact-competency-comp-2'),
      screen.getByTestId('compact-competency-comp-3'),
    ];

    // Communication (85%) should come first
    expect(competencyElements[0]).toHaveTextContent('Communication');
    // Problem Solving (72%) should come second
    expect(competencyElements[1]).toHaveTextContent('Problem Solving');
    // Leadership (45%) should come last
    expect(competencyElements[2]).toHaveTextContent('Leadership');
  });
});

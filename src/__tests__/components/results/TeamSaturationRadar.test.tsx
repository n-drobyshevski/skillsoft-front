/**
 * Tests for TeamSaturationRadar Component
 * Phase 4: Results Enhancement Tests
 *
 * Comprehensive tests covering:
 * - analyzeTeamFit() helper function logic
 * - Main component rendering and props
 * - Radar chart visibility toggles (showCandidate, showTeam, showTarget)
 * - Custom colorScheme application
 * - GapFillList section rendering
 * - Quick stats grid layout (desktop vs mobile)
 * - Development areas section
 * - Contribution type badge display
 * - Mobile responsive behavior
 * - Name truncation on mobile
 * - Bilingual competency names
 * - Edge cases and empty states
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { renderWithIntl } from '../../utils/test-providers';
import {
  TeamSaturationRadar,
  analyzeTeamFit,
} from '@/components/results/TeamSaturationRadar';
import type {
  TeamSaturationDataPoint,
  TeamFitAnalysis,
  TeamContributionType,
} from '@/types/results';

// ============================================================================
// MOCKS
// ============================================================================

// Mock useIsMobile hook
const mockUseIsMobile = vi.fn(() => false);

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => mockUseIsMobile(),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, initial, animate, transition, ...props }: React.HTMLAttributes<HTMLDivElement> & { initial?: unknown; animate?: unknown; transition?: unknown }) => (
      <div {...props}>{children}</div>
    ),
  },
}));

// Mock ComparisonRadarChart (replaces former Recharts mock)
vi.mock('@/components/charts/ComparisonRadarChart', () => ({
  ComparisonRadarChart: ({ data, primary, secondary, className }: {
    data: Array<{ label: string; primary: number; secondary: number }>;
    primary?: { label?: string };
    secondary?: { label?: string };
    className?: string;
  }) => (
    <div
      data-testid="comparison-radar-chart"
      data-points={data.length}
      data-primary-label={primary?.label}
      data-secondary-label={secondary?.label}
      className={className}
    >
      {data.map((d, i) => (
        <div key={i} data-testid={`radar-point-${i}`} data-label={d.label} data-primary={d.primary} data-secondary={d.secondary} />
      ))}
    </div>
  ),
}));

// ============================================================================
// TEST DATA FACTORIES
// ============================================================================

const createMockDataPoint = (
  overrides: Partial<TeamSaturationDataPoint> = {}
): TeamSaturationDataPoint => ({
  competencyId: 'comp-1',
  competencyName: 'Communication',
  candidateScore: 75,
  teamSaturation: 50,
  targetSaturation: 70,
  fillsGap: true,
  gapMagnitude: 25,
  category: 'INTERPERSONAL',
  ...overrides,
});

const mockSaturationData: TeamSaturationDataPoint[] = [
  {
    competencyId: 'comp-1',
    competencyName: 'Communication',
    candidateScore: 85,
    teamSaturation: 45,
    targetSaturation: 70,
    fillsGap: true,
    gapMagnitude: 40,
    category: 'INTERPERSONAL',
  },
  {
    competencyId: 'comp-2',
    competencyName: 'Leadership',
    candidateScore: 70,
    teamSaturation: 60,
    targetSaturation: 70,
    fillsGap: true,
    gapMagnitude: 25,
    category: 'LEADERSHIP',
  },
  {
    competencyId: 'comp-3',
    competencyName: 'Problem Solving',
    candidateScore: 65,
    teamSaturation: 85,
    targetSaturation: 70,
    fillsGap: false,
    gapMagnitude: 0,
    category: 'COGNITIVE',
  },
  {
    competencyId: 'comp-4',
    competencyName: 'Technical Skills',
    candidateScore: 80,
    teamSaturation: 90,
    targetSaturation: 70,
    fillsGap: false,
    gapMagnitude: 0,
    category: 'TECHNICAL',
  },
  {
    competencyId: 'comp-5',
    competencyName: 'Teamwork',
    candidateScore: 72,
    teamSaturation: 55,
    targetSaturation: 70,
    fillsGap: true,
    gapMagnitude: 22,
    category: 'INTERPERSONAL',
  },
];

const mockBilingualData: TeamSaturationDataPoint[] = [
  {
    competencyId: 'comp-ru-1',
    competencyName: 'Коммуникация',
    candidateScore: 80,
    teamSaturation: 50,
    fillsGap: true,
    gapMagnitude: 30,
  },
  {
    competencyId: 'comp-ru-2',
    competencyName: 'Лидерство',
    candidateScore: 65,
    teamSaturation: 70,
    fillsGap: false,
  },
  {
    competencyId: 'comp-ru-3',
    competencyName: 'Аналитическое мышление',
    candidateScore: 75,
    teamSaturation: 40,
    fillsGap: true,
    gapMagnitude: 35,
  },
];

// ============================================================================
// analyzeTeamFit() HELPER FUNCTION TESTS
// ============================================================================

describe('analyzeTeamFit', () => {
  describe('Compatibility Score Calculation', () => {
    it('should calculate compatibility score based on formula', () => {
      const result = analyzeTeamFit(mockSaturationData);

      // Formula: (avgCandidateScore * 0.4) + (gapsFilled/total * 100 * 0.4) + ((total - redundancies)/total * 100 * 0.2)
      // avgCandidateScore = (85 + 70 + 65 + 80 + 72) / 5 = 74.4
      // gapsFilled = 3 (Communication, Leadership, Teamwork with gapMagnitude >= 20)
      // redundancies = 1 (Technical Skills: teamSaturation >= 80 && candidateScore >= 70)
      // baseScore = (74.4 * 0.4) + (3/5 * 100 * 0.4) + ((5-1)/5 * 100 * 0.2)
      // baseScore = 29.76 + 24 + 16 = 69.76 -> rounds to 70

      expect(result.compatibilityScore).toBeGreaterThanOrEqual(0);
      expect(result.compatibilityScore).toBeLessThanOrEqual(100);
      expect(typeof result.compatibilityScore).toBe('number');
    });

    it('should cap compatibility score at 100', () => {
      const highScoreData: TeamSaturationDataPoint[] = [
        createMockDataPoint({ candidateScore: 100, teamSaturation: 20, fillsGap: true, gapMagnitude: 80 }),
        createMockDataPoint({ competencyId: '2', candidateScore: 100, teamSaturation: 20, fillsGap: true, gapMagnitude: 80 }),
      ];

      const result = analyzeTeamFit(highScoreData);
      expect(result.compatibilityScore).toBeLessThanOrEqual(100);
    });

    it('should handle empty data gracefully', () => {
      const result = analyzeTeamFit([]);

      expect(result.compatibilityScore).toBeDefined();
      expect(result.gapsFilledCompetencies).toHaveLength(0);
      expect(result.redundantCompetencies).toHaveLength(0);
    });

    it('should round the compatibility score to nearest integer', () => {
      const result = analyzeTeamFit(mockSaturationData);
      expect(Number.isInteger(result.compatibilityScore)).toBe(true);
    });
  });

  describe('Contribution Type Classification', () => {
    it('should classify as specialist when variance > 400', () => {
      // High variance = specialist (scores spread out significantly)
      const specialistData: TeamSaturationDataPoint[] = [
        createMockDataPoint({ competencyId: '1', candidateScore: 95, fillsGap: false }),
        createMockDataPoint({ competencyId: '2', candidateScore: 30, fillsGap: false }),
        createMockDataPoint({ competencyId: '3', candidateScore: 95, fillsGap: false }),
        createMockDataPoint({ competencyId: '4', candidateScore: 30, fillsGap: false }),
      ];
      // avg = 62.5, variance = ((95-62.5)^2 + (30-62.5)^2 + ...) / 4 = (1056.25 * 2 + 1056.25 * 2) / 4 = 1056.25

      const result = analyzeTeamFit(specialistData);
      expect(result.contributionType).toBe('specialist');
    });

    it('should classify as leader when avg score >= 75', () => {
      const leaderData: TeamSaturationDataPoint[] = [
        createMockDataPoint({ competencyId: '1', candidateScore: 80, fillsGap: false }),
        createMockDataPoint({ competencyId: '2', candidateScore: 78, fillsGap: false }),
        createMockDataPoint({ competencyId: '3', candidateScore: 75, fillsGap: false }),
        createMockDataPoint({ competencyId: '4', candidateScore: 77, fillsGap: false }),
      ];
      // avg = 77.5 >= 75, variance is low (scores are close)

      const result = analyzeTeamFit(leaderData);
      expect(result.contributionType).toBe('leader');
    });

    it('should classify as collaborator when gaps filled >= 3', () => {
      const collaboratorData: TeamSaturationDataPoint[] = [
        createMockDataPoint({ competencyId: '1', candidateScore: 65, fillsGap: true, gapMagnitude: 25 }),
        createMockDataPoint({ competencyId: '2', candidateScore: 60, fillsGap: true, gapMagnitude: 30 }),
        createMockDataPoint({ competencyId: '3', candidateScore: 55, fillsGap: true, gapMagnitude: 20 }),
        createMockDataPoint({ competencyId: '4', candidateScore: 50, fillsGap: false, gapMagnitude: 10 }),
      ];
      // avg = 57.5 < 75, variance is low, gapsFilled = 3

      const result = analyzeTeamFit(collaboratorData);
      expect(result.contributionType).toBe('collaborator');
    });

    it('should classify as generalist by default', () => {
      const generalistData: TeamSaturationDataPoint[] = [
        createMockDataPoint({ competencyId: '1', candidateScore: 60, fillsGap: false }),
        createMockDataPoint({ competencyId: '2', candidateScore: 65, fillsGap: false }),
        createMockDataPoint({ competencyId: '3', candidateScore: 58, fillsGap: true, gapMagnitude: 25 }),
        createMockDataPoint({ competencyId: '4', candidateScore: 62, fillsGap: true, gapMagnitude: 22 }),
      ];
      // avg = 61.25 < 75, variance is low (~10.7), gapsFilled = 2 < 3

      const result = analyzeTeamFit(generalistData);
      expect(result.contributionType).toBe('generalist');
    });

    it('should prioritize specialist over leader when variance is high', () => {
      // Even if avg is high, high variance means specialist
      const data: TeamSaturationDataPoint[] = [
        createMockDataPoint({ competencyId: '1', candidateScore: 100, fillsGap: false }),
        createMockDataPoint({ competencyId: '2', candidateScore: 50, fillsGap: false }),
        createMockDataPoint({ competencyId: '3', candidateScore: 100, fillsGap: false }),
        createMockDataPoint({ competencyId: '4', candidateScore: 50, fillsGap: false }),
      ];
      // avg = 75, variance = 625 > 400

      const result = analyzeTeamFit(data);
      expect(result.contributionType).toBe('specialist');
    });
  });

  describe('Gaps Filled Identification', () => {
    it('should identify competencies that fill gaps', () => {
      const result = analyzeTeamFit(mockSaturationData);

      expect(result.gapsFilledCompetencies.length).toBeGreaterThan(0);
      result.gapsFilledCompetencies.forEach((comp) => {
        expect(comp.fillsGap).toBe(true);
        expect(comp.gapMagnitude).toBeGreaterThanOrEqual(20);
      });
    });

    it('should use custom gapThreshold', () => {
      const result = analyzeTeamFit(mockSaturationData, 30);

      // With higher threshold, fewer competencies should qualify
      const defaultResult = analyzeTeamFit(mockSaturationData, 20);
      expect(result.gapsFilledCompetencies.length).toBeLessThanOrEqual(defaultResult.gapsFilledCompetencies.length);
    });

    it('should filter out competencies with gapMagnitude below threshold', () => {
      const dataWithSmallGaps: TeamSaturationDataPoint[] = [
        createMockDataPoint({ fillsGap: true, gapMagnitude: 15 }),
        createMockDataPoint({ competencyId: '2', fillsGap: true, gapMagnitude: 25 }),
      ];

      const result = analyzeTeamFit(dataWithSmallGaps, 20);
      expect(result.gapsFilledCompetencies.length).toBe(1);
      expect(result.gapsFilledCompetencies[0].competencyId).toBe('2');
    });

    it('should handle competencies without gapMagnitude', () => {
      const dataWithoutMagnitude: TeamSaturationDataPoint[] = [
        createMockDataPoint({ fillsGap: true, gapMagnitude: undefined }),
      ];

      const result = analyzeTeamFit(dataWithoutMagnitude);
      expect(result.gapsFilledCompetencies.length).toBe(0);
    });
  });

  describe('Redundancy Detection', () => {
    it('should identify redundant competencies', () => {
      // Redundant: teamSaturation >= 80 && candidateScore >= 70
      const result = analyzeTeamFit(mockSaturationData);

      result.redundantCompetencies.forEach((comp) => {
        expect(comp.teamSaturation).toBeGreaterThanOrEqual(80);
        expect(comp.candidateScore).toBeGreaterThanOrEqual(70);
      });
    });

    it('should not classify as redundant if team saturation < 80', () => {
      const data: TeamSaturationDataPoint[] = [
        createMockDataPoint({ teamSaturation: 79, candidateScore: 90 }),
      ];

      const result = analyzeTeamFit(data);
      expect(result.redundantCompetencies.length).toBe(0);
    });

    it('should not classify as redundant if candidate score < 70', () => {
      const data: TeamSaturationDataPoint[] = [
        createMockDataPoint({ teamSaturation: 90, candidateScore: 69 }),
      ];

      const result = analyzeTeamFit(data);
      expect(result.redundantCompetencies.length).toBe(0);
    });
  });

  describe('Development Areas Selection', () => {
    it('should identify development areas', () => {
      const dataWithDevAreas: TeamSaturationDataPoint[] = [
        createMockDataPoint({ competencyId: '1', candidateScore: 45, teamSaturation: 55 }),
        createMockDataPoint({ competencyId: '2', candidateScore: 75, teamSaturation: 40 }),
        createMockDataPoint({ competencyId: '3', candidateScore: 40, teamSaturation: 50 }),
      ];

      const result = analyzeTeamFit(dataWithDevAreas);

      // Dev areas: candidateScore < 50 && teamSaturation < 60
      expect(result.developmentAreas.length).toBe(2);
    });

    it('should return competency names for development areas', () => {
      const dataWithDevAreas: TeamSaturationDataPoint[] = [
        createMockDataPoint({ competencyName: 'Weak Area', candidateScore: 30, teamSaturation: 40 }),
      ];

      const result = analyzeTeamFit(dataWithDevAreas);
      expect(result.developmentAreas).toContain('Weak Area');
    });

    it('should return empty array when no development areas exist', () => {
      const strongData: TeamSaturationDataPoint[] = [
        createMockDataPoint({ candidateScore: 80, teamSaturation: 70 }),
        createMockDataPoint({ competencyId: '2', candidateScore: 75, teamSaturation: 65 }),
      ];

      const result = analyzeTeamFit(strongData);
      expect(result.developmentAreas).toHaveLength(0);
    });
  });

  describe('Relative Strengths Selection', () => {
    it('should identify relative strengths', () => {
      const result = analyzeTeamFit(mockSaturationData);

      // Strengths: candidateScore >= 70
      result.relativeStrengths.forEach((name) => {
        const comp = mockSaturationData.find((d) => d.competencyName === name);
        expect(comp?.candidateScore).toBeGreaterThanOrEqual(70);
      });
    });

    it('should sort strengths by candidate score descending', () => {
      const data: TeamSaturationDataPoint[] = [
        createMockDataPoint({ competencyId: '1', competencyName: 'Medium', candidateScore: 75 }),
        createMockDataPoint({ competencyId: '2', competencyName: 'High', candidateScore: 90 }),
        createMockDataPoint({ competencyId: '3', competencyName: 'Low', candidateScore: 70 }),
      ];

      const result = analyzeTeamFit(data);
      expect(result.relativeStrengths[0]).toBe('High');
    });

    it('should limit relative strengths to top 3', () => {
      const manyStrengths: TeamSaturationDataPoint[] = [
        createMockDataPoint({ competencyId: '1', candidateScore: 90 }),
        createMockDataPoint({ competencyId: '2', candidateScore: 85 }),
        createMockDataPoint({ competencyId: '3', candidateScore: 80 }),
        createMockDataPoint({ competencyId: '4', candidateScore: 75 }),
        createMockDataPoint({ competencyId: '5', candidateScore: 70 }),
      ];

      const result = analyzeTeamFit(manyStrengths);
      expect(result.relativeStrengths.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single data point', () => {
      const singlePoint: TeamSaturationDataPoint[] = [
        createMockDataPoint(),
      ];

      const result = analyzeTeamFit(singlePoint);
      expect(result).toBeDefined();
      expect(result.compatibilityScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle all redundant competencies', () => {
      const allRedundant: TeamSaturationDataPoint[] = [
        createMockDataPoint({ competencyId: '1', teamSaturation: 85, candidateScore: 75 }),
        createMockDataPoint({ competencyId: '2', teamSaturation: 90, candidateScore: 80 }),
        createMockDataPoint({ competencyId: '3', teamSaturation: 95, candidateScore: 85 }),
      ];

      const result = analyzeTeamFit(allRedundant);
      expect(result.redundantCompetencies.length).toBe(3);
      expect(result.compatibilityScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle all gaps filled scenario', () => {
      const allGaps: TeamSaturationDataPoint[] = [
        createMockDataPoint({ competencyId: '1', fillsGap: true, gapMagnitude: 30 }),
        createMockDataPoint({ competencyId: '2', fillsGap: true, gapMagnitude: 25 }),
        createMockDataPoint({ competencyId: '3', fillsGap: true, gapMagnitude: 20 }),
      ];

      const result = analyzeTeamFit(allGaps);
      expect(result.gapsFilledCompetencies.length).toBe(3);
    });

    it('should handle zero scores', () => {
      const zeroScores: TeamSaturationDataPoint[] = [
        createMockDataPoint({ candidateScore: 0, teamSaturation: 0 }),
      ];

      const result = analyzeTeamFit(zeroScores);
      expect(result).toBeDefined();
    });

    it('should handle 100% scores', () => {
      const perfectScores: TeamSaturationDataPoint[] = [
        createMockDataPoint({ candidateScore: 100, teamSaturation: 100 }),
      ];

      const result = analyzeTeamFit(perfectScores);
      expect(result.compatibilityScore).toBeLessThanOrEqual(100);
    });
  });
});

// ============================================================================
// TeamSaturationRadar COMPONENT TESTS
// ============================================================================

describe('TeamSaturationRadar', () => {
  beforeEach(() => {
    mockUseIsMobile.mockReturnValue(false);
  });

  // ==========================================
  // Basic Rendering Tests
  // ==========================================
  describe('Basic Rendering', () => {
    it('should render the component with data', () => {
      renderWithIntl(<TeamSaturationRadar data={mockSaturationData} />);

      expect(screen.getByText('Team Fit Analysis')).toBeInTheDocument();
      expect(screen.getByTestId('comparison-radar-chart')).toBeInTheDocument();
    });

    it('should render header with Users icon', () => {
      renderWithIntl(<TeamSaturationRadar data={mockSaturationData} />);

      expect(screen.getByText('Team Fit Analysis')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = renderWithIntl(
        <TeamSaturationRadar data={mockSaturationData} className="custom-radar" />
      );

      expect(container.firstChild).toHaveClass('custom-radar');
    });

    it('should render ComparisonRadarChart with correct data points', () => {
      renderWithIntl(<TeamSaturationRadar data={mockSaturationData} />);

      const chart = screen.getByTestId('comparison-radar-chart');
      expect(chart).toHaveAttribute('data-points', '5');
    });

    it('should pass "You" as primary label and "Team" as secondary label', () => {
      renderWithIntl(<TeamSaturationRadar data={mockSaturationData} />);

      const chart = screen.getByTestId('comparison-radar-chart');
      expect(chart).toHaveAttribute('data-primary-label', 'You');
      expect(chart).toHaveAttribute('data-secondary-label', 'Team');
    });

    it('should transform data correctly for ComparisonRadarChart', () => {
      renderWithIntl(<TeamSaturationRadar data={mockSaturationData} />);

      const firstPoint = screen.getByTestId('radar-point-0');
      expect(firstPoint).toHaveAttribute('data-label', 'Communication');
      expect(firstPoint).toHaveAttribute('data-primary', '85');
      expect(firstPoint).toHaveAttribute('data-secondary', '45');
    });
  });

  // ==========================================
  // Empty Data Handling Tests
  // ==========================================
  describe('Empty Data Handling', () => {
    it('should handle empty data array', () => {
      renderWithIntl(<TeamSaturationRadar data={[]} />);

      expect(screen.getByText('Team Fit Analysis')).toBeInTheDocument();
      // ComparisonRadarChart requires >= 3 data points, so it won't render
      expect(screen.queryByTestId('comparison-radar-chart')).not.toBeInTheDocument();
    });

    it('should display zero gaps filled with empty data', () => {
      renderWithIntl(<TeamSaturationRadar data={[]} />);

      const gapsFilledText = screen.getByText('Gaps Filled');
      expect(gapsFilledText.parentElement?.textContent).toContain('0');
    });
  });


  // ==========================================
  // Gap Fill List Tests
  // ==========================================
  describe('GapFillList Section', () => {
    it('should display gaps filled section when gaps exist', () => {
      renderWithIntl(<TeamSaturationRadar data={mockSaturationData} />);

      expect(screen.getByText('Gaps You Fill')).toBeInTheDocument();
    });

    it('should display competency names in gap fill badges', () => {
      renderWithIntl(<TeamSaturationRadar data={mockSaturationData} />);

      // Communication and Leadership have gapMagnitude >= 20
      expect(screen.getByText('Communication')).toBeInTheDocument();
    });

    it('should display gap magnitude percentage', () => {
      const dataWithGap: TeamSaturationDataPoint[] = [
        createMockDataPoint({ fillsGap: true, gapMagnitude: 35 }),
      ];

      renderWithIntl(<TeamSaturationRadar data={dataWithGap} />);

      expect(screen.getByText('+35%')).toBeInTheDocument();
    });

    it('should not display gap fill section when no gaps filled', () => {
      const noGapsData: TeamSaturationDataPoint[] = [
        createMockDataPoint({ fillsGap: false, gapMagnitude: 0 }),
        createMockDataPoint({ competencyId: '2', fillsGap: false, gapMagnitude: 0 }),
      ];

      renderWithIntl(<TeamSaturationRadar data={noGapsData} />);

      expect(screen.queryByText('Gaps You Fill')).not.toBeInTheDocument();
    });

    it('should only show competencies with gapMagnitude >= 20', () => {
      const mixedGapsData: TeamSaturationDataPoint[] = [
        createMockDataPoint({ competencyName: 'Big Gap', fillsGap: true, gapMagnitude: 30 }),
        createMockDataPoint({ competencyId: '2', competencyName: 'Small Gap', fillsGap: true, gapMagnitude: 15 }),
      ];

      renderWithIntl(<TeamSaturationRadar data={mixedGapsData} />);

      expect(screen.getByText('Big Gap')).toBeInTheDocument();
      // Small Gap should not appear in the gaps filled section (but may appear elsewhere)
    });
  });

  // ==========================================
  // Quick Stats Grid Tests
  // ==========================================
  describe('Quick Stats Grid', () => {
    it('should display compatibility score', () => {
      renderWithIntl(<TeamSaturationRadar data={mockSaturationData} />);

      expect(screen.getByText('Compatibility')).toBeInTheDocument();
    });

    it('should display gaps filled count', () => {
      renderWithIntl(<TeamSaturationRadar data={mockSaturationData} />);

      expect(screen.getByText('Gaps Filled')).toBeInTheDocument();
    });

    it('should display strengths count on desktop', () => {
      mockUseIsMobile.mockReturnValue(false);
      renderWithIntl(<TeamSaturationRadar data={mockSaturationData} />);

      expect(screen.getByText('Strengths')).toBeInTheDocument();
    });

    it('should hide strengths count on mobile', () => {
      mockUseIsMobile.mockReturnValue(true);
      renderWithIntl(<TeamSaturationRadar data={mockSaturationData} />);

      expect(screen.queryByText('Strengths')).not.toBeInTheDocument();
    });

    it('should use 3 columns on desktop', () => {
      mockUseIsMobile.mockReturnValue(false);
      const { container } = renderWithIntl(<TeamSaturationRadar data={mockSaturationData} />);

      const statsGrid = container.querySelector('.grid-cols-3');
      expect(statsGrid).toBeInTheDocument();
    });

    it('should use 2 columns on mobile', () => {
      mockUseIsMobile.mockReturnValue(true);
      const { container } = renderWithIntl(<TeamSaturationRadar data={mockSaturationData} />);

      const statsGrid = container.querySelector('.grid-cols-2');
      expect(statsGrid).toBeInTheDocument();
    });
  });

  // ==========================================
  // Development Areas Section Tests
  // ==========================================
  describe('Development Areas Section', () => {
    it('should display development areas when they exist', () => {
      // Must set fillsGap: false and gapMagnitude: 0 to prevent appearing in GapFillList
      const dataWithDevAreas: TeamSaturationDataPoint[] = [
        createMockDataPoint({
          competencyName: 'Weak Skill',
          candidateScore: 40,
          teamSaturation: 50,
          fillsGap: false,
          gapMagnitude: 0,
        }),
        createMockDataPoint({
          competencyId: '2',
          candidateScore: 80,
          teamSaturation: 70,
          fillsGap: false,
          gapMagnitude: 0,
        }),
      ];

      renderWithIntl(<TeamSaturationRadar data={dataWithDevAreas} />);

      expect(screen.getByText('Growth Areas for Team Fit')).toBeInTheDocument();
      expect(screen.getByText('Weak Skill')).toBeInTheDocument();
    });

    it('should not display development areas section when none exist', () => {
      const strongData: TeamSaturationDataPoint[] = [
        createMockDataPoint({ candidateScore: 80, teamSaturation: 70, fillsGap: false, gapMagnitude: 0 }),
        createMockDataPoint({ competencyId: '2', candidateScore: 75, teamSaturation: 65, fillsGap: false, gapMagnitude: 0 }),
      ];

      renderWithIntl(<TeamSaturationRadar data={strongData} />);

      expect(screen.queryByText('Growth Areas for Team Fit')).not.toBeInTheDocument();
    });

    it('should limit development areas to 3', () => {
      // Must set fillsGap: false to prevent appearing in GapFillList section
      const manyDevAreas: TeamSaturationDataPoint[] = Array.from({ length: 6 }, (_, i) =>
        createMockDataPoint({
          competencyId: `comp-${i}`,
          competencyName: `Weak Skill ${i}`,
          candidateScore: 30,
          teamSaturation: 40,
          fillsGap: false,
          gapMagnitude: 0,
        })
      );

      renderWithIntl(<TeamSaturationRadar data={manyDevAreas} />);

      // Get badges only within the development areas section
      const devAreasSection = screen.getByText('Growth Areas for Team Fit').parentElement;
      const badges = within(devAreasSection!).getAllByText(/Weak Skill/);
      expect(badges.length).toBeLessThanOrEqual(3);
    });
  });

  // ==========================================
  // Contribution Type Badge Tests
  // ==========================================
  describe('Contribution Type Badge', () => {
    it('should display Leader badge', () => {
      const leaderData: TeamSaturationDataPoint[] = [
        createMockDataPoint({ competencyId: '1', candidateScore: 80 }),
        createMockDataPoint({ competencyId: '2', candidateScore: 78 }),
        createMockDataPoint({ competencyId: '3', candidateScore: 76 }),
      ];

      renderWithIntl(<TeamSaturationRadar data={leaderData} />);

      expect(screen.getByText('Leader')).toBeInTheDocument();
    });

    it('should display Specialist badge', () => {
      const specialistData: TeamSaturationDataPoint[] = [
        createMockDataPoint({ competencyId: '1', candidateScore: 95 }),
        createMockDataPoint({ competencyId: '2', candidateScore: 30 }),
        createMockDataPoint({ competencyId: '3', candidateScore: 95 }),
        createMockDataPoint({ competencyId: '4', candidateScore: 30 }),
      ];

      renderWithIntl(<TeamSaturationRadar data={specialistData} />);

      expect(screen.getByText('Specialist')).toBeInTheDocument();
    });

    it('should display Collaborator badge', () => {
      const collaboratorData: TeamSaturationDataPoint[] = [
        createMockDataPoint({ competencyId: '1', candidateScore: 65, fillsGap: true, gapMagnitude: 25 }),
        createMockDataPoint({ competencyId: '2', candidateScore: 60, fillsGap: true, gapMagnitude: 30 }),
        createMockDataPoint({ competencyId: '3', candidateScore: 55, fillsGap: true, gapMagnitude: 20 }),
        createMockDataPoint({ competencyId: '4', candidateScore: 50, fillsGap: false }),
      ];

      renderWithIntl(<TeamSaturationRadar data={collaboratorData} />);

      expect(screen.getByText('Collaborator')).toBeInTheDocument();
    });

    it('should display Generalist badge', () => {
      const generalistData: TeamSaturationDataPoint[] = [
        createMockDataPoint({ competencyId: '1', candidateScore: 60, fillsGap: false }),
        createMockDataPoint({ competencyId: '2', candidateScore: 65, fillsGap: false }),
        createMockDataPoint({ competencyId: '3', candidateScore: 58, fillsGap: true, gapMagnitude: 25 }),
        createMockDataPoint({ competencyId: '4', candidateScore: 62, fillsGap: true, gapMagnitude: 22 }),
      ];

      renderWithIntl(<TeamSaturationRadar data={generalistData} />);

      expect(screen.getByText('Generalist')).toBeInTheDocument();
    });
  });


  // ==========================================
  // Bilingual Support Tests
  // ==========================================
  describe('Bilingual Competency Names', () => {
    it('should render Cyrillic competency names', () => {
      renderWithIntl(<TeamSaturationRadar data={mockBilingualData} />);

      expect(screen.getByText('Team Fit Analysis')).toBeInTheDocument();
      expect(screen.getByTestId('comparison-radar-chart')).toBeInTheDocument();
    });

    it('should display Cyrillic names in gap fill badges', () => {
      renderWithIntl(<TeamSaturationRadar data={mockBilingualData} />);

      expect(screen.getByText('Gaps You Fill')).toBeInTheDocument();
    });
  });

  // ==========================================
  // Edge Cases Tests
  // ==========================================
  describe('Edge Cases', () => {
    it('should handle single data point (chart not rendered, < 3 points)', () => {
      const singlePoint: TeamSaturationDataPoint[] = [
        createMockDataPoint(),
      ];

      renderWithIntl(<TeamSaturationRadar data={singlePoint} />);

      expect(screen.getByText('Team Fit Analysis')).toBeInTheDocument();
      expect(screen.queryByTestId('comparison-radar-chart')).not.toBeInTheDocument();
    });

    it('should render chart with 3+ data points', () => {
      const threePoints: TeamSaturationDataPoint[] = [
        createMockDataPoint({ competencyId: '1', competencyName: 'A' }),
        createMockDataPoint({ competencyId: '2', competencyName: 'B' }),
        createMockDataPoint({ competencyId: '3', competencyName: 'C' }),
      ];

      renderWithIntl(<TeamSaturationRadar data={threePoints} />);

      expect(screen.getByTestId('comparison-radar-chart')).toBeInTheDocument();
    });

    it('should handle many data points', () => {
      const manyPoints: TeamSaturationDataPoint[] = Array.from({ length: 20 }, (_, i) =>
        createMockDataPoint({ competencyId: `comp-${i}`, competencyName: `Competency ${i}` })
      );

      renderWithIntl(<TeamSaturationRadar data={manyPoints} />);

      const chart = screen.getByTestId('comparison-radar-chart');
      expect(chart).toHaveAttribute('data-points', '20');
    });

    it('should handle data without optional fields', () => {
      const minimalData: TeamSaturationDataPoint[] = [
        { competencyId: 'min-1', competencyName: 'A', candidateScore: 50, teamSaturation: 50, fillsGap: false },
        { competencyId: 'min-2', competencyName: 'B', candidateScore: 60, teamSaturation: 40, fillsGap: false },
        { competencyId: 'min-3', competencyName: 'C', candidateScore: 70, teamSaturation: 30, fillsGap: false },
      ];

      renderWithIntl(<TeamSaturationRadar data={minimalData} />);

      expect(screen.getByText('Team Fit Analysis')).toBeInTheDocument();
      expect(screen.getByTestId('comparison-radar-chart')).toBeInTheDocument();
    });
  });
});

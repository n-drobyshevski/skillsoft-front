/**
 * Tests for Big Five projection hooks
 * Tests the O*NET to Big Five mapping and profile calculation
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useBigFiveProjection,
  useBigFiveProjectionDetailed,
  BigFiveProfile,
  BigFiveTrait,
  getBigFiveLabels,
  bigFiveToArray,
  BIG_FIVE_INFO,
} from '@/hooks/useBigFiveProjection';
import { CompetencyScore } from '@/types/domain';

// ============================================
// TEST DATA - Real O*NET codes from mapping
// ============================================

/**
 * Helper to create a CompetencyScore with minimal required fields
 */
function createCompetencyScore(
  id: string,
  name: string,
  percentage: number,
  onetCode?: string
): CompetencyScore {
  return {
    competencyId: id,
    competencyName: name,
    score: percentage,
    maxScore: 100,
    percentage,
    onetCode,
  };
}

// Real O*NET codes from onet_to_bigfive_map.json
const ONET_CODES = {
  // CONSCIENTIOUSNESS primary
  ACHIEVEMENT_EFFORT: '1.C.1.a', // primaryWeight: 0.85, secondary: EXTRAVERSION 0.35
  PERSISTENCE: '1.C.1.b', // primaryWeight: 0.90, secondary: EMOTIONAL_STABILITY 0.30
  DEPENDABILITY: '1.C.5.a', // primaryWeight: 0.95, secondary: CONSCIENTIOUSNESS 0.75
  ATTENTION_TO_DETAIL: '1.C.5.b', // primaryWeight: 0.90, secondary: CONSCIENTIOUSNESS 0.60
  INTEGRITY: '1.C.5.c', // primaryWeight: 0.70, secondary: AGREEABLENESS 0.65

  // EXTRAVERSION primary
  INITIATIVE: '1.C.1.c', // primaryWeight: 0.70, secondary: CONSCIENTIOUSNESS 0.50
  LEADERSHIP: '1.C.2.b', // primaryWeight: 0.80, secondary: CONSCIENTIOUSNESS 0.40, tertiary: OPENNESS 0.25
  SOCIAL_ORIENTATION: '1.C.3.c', // primaryWeight: 0.90, secondary: AGREEABLENESS 0.35

  // AGREEABLENESS primary
  COOPERATION: '1.C.3.a', // primaryWeight: 0.85, secondary: EXTRAVERSION 0.30
  CONCERN_FOR_OTHERS: '1.C.3.b', // primaryWeight: 0.90, secondary: AGREEABLENESS 0.70

  // EMOTIONAL_STABILITY primary
  SELF_CONTROL: '1.C.4.a', // primaryWeight: 0.85, secondary: AGREEABLENESS 0.45, tertiary: CONSCIENTIOUSNESS 0.30
  STRESS_TOLERANCE: '1.C.4.b', // primaryWeight: 0.95, secondary: EMOTIONAL_STABILITY 0.80

  // OPENNESS primary
  ADAPTABILITY: '1.C.4.c', // primaryWeight: 0.75, secondary: EMOTIONAL_STABILITY 0.40, tertiary: AGREEABLENESS 0.25
  INDEPENDENCE: '1.C.6', // primaryWeight: 0.60, secondary: CONSCIENTIOUSNESS 0.55, tertiary: EXTRAVERSION 0.30
  INNOVATION: '1.C.7.a', // primaryWeight: 0.95, secondary: OPENNESS 0.70
  ANALYTICAL_THINKING: '1.C.7.b', // primaryWeight: 0.70, secondary: CONSCIENTIOUSNESS 0.55
};

// ============================================
// NEUTRAL PROFILE CONSTANT
// ============================================
const NEUTRAL_PROFILE: BigFiveProfile = {
  OPENNESS: 50,
  CONSCIENTIOUSNESS: 50,
  EXTRAVERSION: 50,
  AGREEABLENESS: 50,
  EMOTIONAL_STABILITY: 50,
};

// ============================================
// useBigFiveProjection TESTS
// ============================================

describe('useBigFiveProjection', () => {
  describe('Input Validation', () => {
    it('returns neutral profile (all 50) when undefined', () => {
      const { result } = renderHook(() => useBigFiveProjection(undefined));

      expect(result.current).toEqual(NEUTRAL_PROFILE);
    });

    it('returns neutral profile when empty array', () => {
      const { result } = renderHook(() => useBigFiveProjection([]));

      expect(result.current).toEqual(NEUTRAL_PROFILE);
    });

    it('skips competencies without onetCode', () => {
      const scores: CompetencyScore[] = [
        createCompetencyScore('comp-1', 'No Code Competency', 80), // No onetCode
      ];

      const { result } = renderHook(() => useBigFiveProjection(scores));

      // Should return neutral since the only competency has no O*NET code
      expect(result.current).toEqual(NEUTRAL_PROFILE);
    });

    it('processes competencies with onetCode correctly', () => {
      const scores: CompetencyScore[] = [
        createCompetencyScore('comp-1', 'Achievement', 80, ONET_CODES.ACHIEVEMENT_EFFORT),
      ];

      const { result } = renderHook(() => useBigFiveProjection(scores));

      // Achievement/Effort maps primarily to CONSCIENTIOUSNESS
      expect(result.current.CONSCIENTIOUSNESS).toBeGreaterThan(50);
    });
  });

  describe('Aggregation Logic', () => {
    it('projects single competency correctly', () => {
      // Innovation maps to OPENNESS with weight 0.95
      const scores: CompetencyScore[] = [
        createCompetencyScore('comp-1', 'Innovation', 100, ONET_CODES.INNOVATION),
      ];

      const { result } = renderHook(() => useBigFiveProjection(scores));

      // OPENNESS should be high (primary: 0.95 + secondary: 0.70 = 1.65 total weight)
      // Calculation: (100 * 0.95 + 100 * 0.70) / (0.95 + 0.70) = 165 / 1.65 = 100
      expect(result.current.OPENNESS).toBe(100);
      // Other traits should remain neutral
      expect(result.current.CONSCIENTIOUSNESS).toBe(50);
      expect(result.current.EXTRAVERSION).toBe(50);
      expect(result.current.AGREEABLENESS).toBe(50);
      expect(result.current.EMOTIONAL_STABILITY).toBe(50);
    });

    it('aggregates multiple competencies to same trait', () => {
      // Both map primarily to CONSCIENTIOUSNESS
      const scores: CompetencyScore[] = [
        createCompetencyScore('comp-1', 'Persistence', 80, ONET_CODES.PERSISTENCE),
        createCompetencyScore('comp-2', 'Dependability', 70, ONET_CODES.DEPENDABILITY),
      ];

      const { result } = renderHook(() => useBigFiveProjection(scores));

      // CONSCIENTIOUSNESS should be weighted average of contributions
      // Persistence: primary 0.90, secondary to C is 0.75
      // Dependability: primary 0.95, secondary 0.75
      expect(result.current.CONSCIENTIOUSNESS).toBeGreaterThan(50);
      expect(result.current.CONSCIENTIOUSNESS).toBeLessThanOrEqual(100);
    });

    it('applies primary and secondary weights', () => {
      // Cooperation: primary AGREEABLENESS 0.85, secondary EXTRAVERSION 0.30
      const scores: CompetencyScore[] = [
        createCompetencyScore('comp-1', 'Cooperation', 90, ONET_CODES.COOPERATION),
      ];

      const { result } = renderHook(() => useBigFiveProjection(scores));

      // Both traits should be affected
      expect(result.current.AGREEABLENESS).toBe(90); // Primary
      expect(result.current.EXTRAVERSION).toBe(90); // Secondary
    });

    it('applies tertiary weights when present', () => {
      // Leadership: primary EXTRAVERSION 0.80, secondary CONSCIENTIOUSNESS 0.40, tertiary OPENNESS 0.25
      const scores: CompetencyScore[] = [
        createCompetencyScore('comp-1', 'Leadership', 80, ONET_CODES.LEADERSHIP),
      ];

      const { result } = renderHook(() => useBigFiveProjection(scores));

      // All three traits should be affected
      expect(result.current.EXTRAVERSION).toBe(80);
      expect(result.current.CONSCIENTIOUSNESS).toBe(80);
      expect(result.current.OPENNESS).toBe(80);
    });

    it('calculates weighted average accurately', () => {
      // Two competencies with different scores affecting same trait
      // Achievement/Effort: CONSCIENTIOUSNESS weight 0.85
      // Dependability: CONSCIENTIOUSNESS weight 0.95 + secondary 0.75
      const scores: CompetencyScore[] = [
        createCompetencyScore('comp-1', 'Achievement', 100, ONET_CODES.ACHIEVEMENT_EFFORT),
        createCompetencyScore('comp-2', 'Dependability', 50, ONET_CODES.DEPENDABILITY),
      ];

      const { result } = renderHook(() => useBigFiveProjection(scores));

      // CONSCIENTIOUSNESS = (100*0.85 + 50*0.95 + 50*0.75) / (0.85 + 0.95 + 0.75)
      //                   = (85 + 47.5 + 37.5) / 2.55
      //                   = 170 / 2.55 = 66.67 -> rounds to 67
      expect(result.current.CONSCIENTIOUSNESS).toBe(67);
    });
  });

  describe('Score Clamping', () => {
    it('clamps calculated score > 100 to 100', () => {
      // Using maximum score (100%) with high-weight competency
      const scores: CompetencyScore[] = [
        createCompetencyScore('comp-1', 'Innovation', 100, ONET_CODES.INNOVATION),
      ];

      const { result } = renderHook(() => useBigFiveProjection(scores));

      expect(result.current.OPENNESS).toBeLessThanOrEqual(100);
    });

    it('clamps calculated score < 0 to 0', () => {
      // Using minimum score (0%)
      const scores: CompetencyScore[] = [
        createCompetencyScore('comp-1', 'Innovation', 0, ONET_CODES.INNOVATION),
      ];

      const { result } = renderHook(() => useBigFiveProjection(scores));

      expect(result.current.OPENNESS).toBeGreaterThanOrEqual(0);
      expect(result.current.OPENNESS).toBe(0);
    });

    it('rounds fractional scores correctly', () => {
      // Create a scenario that produces fractional result
      const scores: CompetencyScore[] = [
        createCompetencyScore('comp-1', 'Achievement', 75, ONET_CODES.ACHIEVEMENT_EFFORT),
        createCompetencyScore('comp-2', 'Persistence', 68, ONET_CODES.PERSISTENCE),
      ];

      const { result } = renderHook(() => useBigFiveProjection(scores));

      // Result should be an integer
      expect(Number.isInteger(result.current.CONSCIENTIOUSNESS)).toBe(true);
    });
  });

  describe('Missing/Invalid Data', () => {
    it('skips unmapped O*NET codes silently', () => {
      const scores: CompetencyScore[] = [
        createCompetencyScore('comp-1', 'Unknown', 80, '9.Z.9.z'), // Non-existent code
        createCompetencyScore('comp-2', 'Achievement', 70, ONET_CODES.ACHIEVEMENT_EFFORT),
      ];

      const { result } = renderHook(() => useBigFiveProjection(scores));

      // Should still process the valid competency
      expect(result.current.CONSCIENTIOUSNESS).toBeGreaterThan(50);
    });

    it('handles partial mapping correctly', () => {
      // Mix of mapped, unmapped, and no-code competencies
      const scores: CompetencyScore[] = [
        createCompetencyScore('comp-1', 'No Code', 100), // No onetCode
        createCompetencyScore('comp-2', 'Bad Code', 100, 'INVALID'), // Invalid code
        createCompetencyScore('comp-3', 'Innovation', 60, ONET_CODES.INNOVATION), // Valid
      ];

      const { result } = renderHook(() => useBigFiveProjection(scores));

      // Only Innovation should contribute
      expect(result.current.OPENNESS).toBe(60);
    });

    it('returns neutral profile when all competencies are unmapped', () => {
      const scores: CompetencyScore[] = [
        createCompetencyScore('comp-1', 'Unknown1', 80, 'INVALID_1'),
        createCompetencyScore('comp-2', 'Unknown2', 90, 'INVALID_2'),
      ];

      const { result } = renderHook(() => useBigFiveProjection(scores));

      expect(result.current).toEqual(NEUTRAL_PROFILE);
    });
  });

  describe('Memoization', () => {
    it('returns same object reference for same input', () => {
      const scores: CompetencyScore[] = [
        createCompetencyScore('comp-1', 'Innovation', 80, ONET_CODES.INNOVATION),
      ];

      const { result, rerender } = renderHook(() => useBigFiveProjection(scores));

      const firstResult = result.current;
      rerender();
      const secondResult = result.current;

      // Should be the same reference due to useMemo
      expect(firstResult).toBe(secondResult);
    });

    it('recalculates when input changes', () => {
      const initialScores: CompetencyScore[] = [
        createCompetencyScore('comp-1', 'Innovation', 80, ONET_CODES.INNOVATION),
      ];

      const { result, rerender } = renderHook(
        ({ scores }) => useBigFiveProjection(scores),
        { initialProps: { scores: initialScores } }
      );

      const firstResult = result.current;

      const updatedScores: CompetencyScore[] = [
        createCompetencyScore('comp-1', 'Innovation', 90, ONET_CODES.INNOVATION),
      ];

      rerender({ scores: updatedScores });

      expect(result.current.OPENNESS).toBe(90);
      expect(result.current).not.toBe(firstResult);
    });
  });
});

// ============================================
// useBigFiveProjectionDetailed TESTS
// ============================================

describe('useBigFiveProjectionDetailed', () => {
  describe('Contributions Tracking', () => {
    it('tracks each competency contribution per trait', () => {
      const scores: CompetencyScore[] = [
        createCompetencyScore('comp-1', 'Innovation', 80, ONET_CODES.INNOVATION),
        createCompetencyScore('comp-2', 'Adaptability', 70, ONET_CODES.ADAPTABILITY),
      ];

      const { result } = renderHook(() => useBigFiveProjectionDetailed(scores));

      // Innovation contributes to OPENNESS (primary + secondary)
      // Adaptability contributes to OPENNESS (primary)
      const opennessContribs = result.current.contributions.OPENNESS;
      expect(opennessContribs.length).toBeGreaterThan(0);

      // Check that both competencies are tracked
      const competencyIds = opennessContribs.map(c => c.competencyId);
      expect(competencyIds).toContain('comp-1');
      expect(competencyIds).toContain('comp-2');
    });

    it('assigns correct contribution type', () => {
      // Leadership has primary, secondary, and tertiary mappings
      const scores: CompetencyScore[] = [
        createCompetencyScore('comp-1', 'Leadership', 80, ONET_CODES.LEADERSHIP),
      ];

      const { result } = renderHook(() => useBigFiveProjectionDetailed(scores));

      // EXTRAVERSION should have primary contribution
      const extraversionPrimary = result.current.contributions.EXTRAVERSION.find(
        c => c.competencyId === 'comp-1' && c.contributionType === 'primary'
      );
      expect(extraversionPrimary).toBeDefined();
      expect(extraversionPrimary?.weight).toBe(0.80);

      // CONSCIENTIOUSNESS should have secondary contribution
      const conscientiousnessSecondary = result.current.contributions.CONSCIENTIOUSNESS.find(
        c => c.competencyId === 'comp-1' && c.contributionType === 'secondary'
      );
      expect(conscientiousnessSecondary).toBeDefined();
      expect(conscientiousnessSecondary?.weight).toBe(0.40);

      // OPENNESS should have tertiary contribution
      const opennessTertiary = result.current.contributions.OPENNESS.find(
        c => c.competencyId === 'comp-1' && c.contributionType === 'tertiary'
      );
      expect(opennessTertiary).toBeDefined();
      expect(opennessTertiary?.weight).toBe(0.25);
    });

    it('sorts contributions by weightedScore descending', () => {
      const scores: CompetencyScore[] = [
        createCompetencyScore('comp-1', 'Cooperation', 50, ONET_CODES.COOPERATION), // Lower score
        createCompetencyScore('comp-2', 'Concern', 90, ONET_CODES.CONCERN_FOR_OTHERS), // Higher score
      ];

      const { result } = renderHook(() => useBigFiveProjectionDetailed(scores));

      const agreeablenessContribs = result.current.contributions.AGREEABLENESS;

      // Should be sorted by weightedScore descending
      for (let i = 0; i < agreeablenessContribs.length - 1; i++) {
        expect(agreeablenessContribs[i].weightedScore).toBeGreaterThanOrEqual(
          agreeablenessContribs[i + 1].weightedScore
        );
      }
    });

    it('includes O*NET element information in contributions', () => {
      const scores: CompetencyScore[] = [
        createCompetencyScore('comp-1', 'Innovation', 80, ONET_CODES.INNOVATION),
      ];

      const { result } = renderHook(() => useBigFiveProjectionDetailed(scores));

      const contribution = result.current.contributions.OPENNESS[0];
      expect(contribution.onetCode).toBe(ONET_CODES.INNOVATION);
      expect(contribution.onetElement).toBe('Innovation');
    });
  });

  describe('Metadata Calculation', () => {
    it('calculates totalCompetencies correctly', () => {
      const scores: CompetencyScore[] = [
        createCompetencyScore('comp-1', 'Test1', 80, ONET_CODES.INNOVATION),
        createCompetencyScore('comp-2', 'Test2', 70, ONET_CODES.LEADERSHIP),
        createCompetencyScore('comp-3', 'Test3', 60), // No O*NET code
      ];

      const { result } = renderHook(() => useBigFiveProjectionDetailed(scores));

      expect(result.current.metadata.totalCompetencies).toBe(3);
    });

    it('calculates mappedCompetencies correctly', () => {
      const scores: CompetencyScore[] = [
        createCompetencyScore('comp-1', 'Mapped1', 80, ONET_CODES.INNOVATION),
        createCompetencyScore('comp-2', 'Mapped2', 70, ONET_CODES.LEADERSHIP),
        createCompetencyScore('comp-3', 'Unmapped', 60), // No O*NET code
        createCompetencyScore('comp-4', 'Invalid', 50, 'INVALID_CODE'), // Invalid code
      ];

      const { result } = renderHook(() => useBigFiveProjectionDetailed(scores));

      expect(result.current.metadata.mappedCompetencies).toBe(2);
      expect(result.current.metadata.unmappedCompetencies).toBe(2);
    });

    it('calculates coveragePercentage correctly', () => {
      const scores: CompetencyScore[] = [
        createCompetencyScore('comp-1', 'Mapped', 80, ONET_CODES.INNOVATION),
        createCompetencyScore('comp-2', 'Unmapped', 70),
      ];

      const { result } = renderHook(() => useBigFiveProjectionDetailed(scores));

      // 1 out of 2 = 50%
      expect(result.current.metadata.coveragePercentage).toBe(50);
    });

    it('returns high confidence when coverage >= 70%', () => {
      // 8 mapped out of 10 = 80%
      const scores: CompetencyScore[] = [
        createCompetencyScore('comp-1', 'Test1', 80, ONET_CODES.INNOVATION),
        createCompetencyScore('comp-2', 'Test2', 80, ONET_CODES.LEADERSHIP),
        createCompetencyScore('comp-3', 'Test3', 80, ONET_CODES.PERSISTENCE),
        createCompetencyScore('comp-4', 'Test4', 80, ONET_CODES.COOPERATION),
        createCompetencyScore('comp-5', 'Test5', 80, ONET_CODES.STRESS_TOLERANCE),
        createCompetencyScore('comp-6', 'Test6', 80, ONET_CODES.ADAPTABILITY),
        createCompetencyScore('comp-7', 'Test7', 80, ONET_CODES.DEPENDABILITY),
        createCompetencyScore('comp-8', 'Unmapped1', 80),
        createCompetencyScore('comp-9', 'Unmapped2', 80),
        createCompetencyScore('comp-10', 'Test10', 80, ONET_CODES.INITIATIVE),
      ];

      const { result } = renderHook(() => useBigFiveProjectionDetailed(scores));

      expect(result.current.metadata.coveragePercentage).toBe(80);
      expect(result.current.metadata.mappingConfidence).toBe('high');
    });

    it('returns medium confidence when 40% <= coverage < 70%', () => {
      // 5 mapped out of 10 = 50%
      const scores: CompetencyScore[] = [
        createCompetencyScore('comp-1', 'Test1', 80, ONET_CODES.INNOVATION),
        createCompetencyScore('comp-2', 'Test2', 80, ONET_CODES.LEADERSHIP),
        createCompetencyScore('comp-3', 'Test3', 80, ONET_CODES.PERSISTENCE),
        createCompetencyScore('comp-4', 'Test4', 80, ONET_CODES.COOPERATION),
        createCompetencyScore('comp-5', 'Test5', 80, ONET_CODES.STRESS_TOLERANCE),
        createCompetencyScore('comp-6', 'Unmapped1', 80),
        createCompetencyScore('comp-7', 'Unmapped2', 80),
        createCompetencyScore('comp-8', 'Unmapped3', 80),
        createCompetencyScore('comp-9', 'Unmapped4', 80),
        createCompetencyScore('comp-10', 'Unmapped5', 80),
      ];

      const { result } = renderHook(() => useBigFiveProjectionDetailed(scores));

      expect(result.current.metadata.coveragePercentage).toBe(50);
      expect(result.current.metadata.mappingConfidence).toBe('medium');
    });

    it('returns low confidence when coverage < 40%', () => {
      // 3 mapped out of 10 = 30%
      const scores: CompetencyScore[] = [
        createCompetencyScore('comp-1', 'Test1', 80, ONET_CODES.INNOVATION),
        createCompetencyScore('comp-2', 'Test2', 80, ONET_CODES.LEADERSHIP),
        createCompetencyScore('comp-3', 'Test3', 80, ONET_CODES.PERSISTENCE),
        createCompetencyScore('comp-4', 'Unmapped1', 80),
        createCompetencyScore('comp-5', 'Unmapped2', 80),
        createCompetencyScore('comp-6', 'Unmapped3', 80),
        createCompetencyScore('comp-7', 'Unmapped4', 80),
        createCompetencyScore('comp-8', 'Unmapped5', 80),
        createCompetencyScore('comp-9', 'Unmapped6', 80),
        createCompetencyScore('comp-10', 'Unmapped7', 80),
      ];

      const { result } = renderHook(() => useBigFiveProjectionDetailed(scores));

      expect(result.current.metadata.coveragePercentage).toBe(30);
      expect(result.current.metadata.mappingConfidence).toBe('low');
    });

    it('returns correct metadata for empty input', () => {
      const { result } = renderHook(() => useBigFiveProjectionDetailed([]));

      expect(result.current.metadata).toEqual({
        totalCompetencies: 0,
        mappedCompetencies: 0,
        unmappedCompetencies: 0,
        coveragePercentage: 0,
        mappingConfidence: 'low',
      });
    });

    it('returns correct metadata for undefined input', () => {
      const { result } = renderHook(() => useBigFiveProjectionDetailed(undefined));

      expect(result.current.metadata.totalCompetencies).toBe(0);
      expect(result.current.metadata.mappingConfidence).toBe('low');
    });
  });

  describe('Profile Consistency', () => {
    it('returns same profile as useBigFiveProjection', () => {
      const scores: CompetencyScore[] = [
        createCompetencyScore('comp-1', 'Innovation', 80, ONET_CODES.INNOVATION),
        createCompetencyScore('comp-2', 'Leadership', 70, ONET_CODES.LEADERSHIP),
        createCompetencyScore('comp-3', 'Cooperation', 90, ONET_CODES.COOPERATION),
      ];

      const { result: simpleResult } = renderHook(() => useBigFiveProjection(scores));
      const { result: detailedResult } = renderHook(() => useBigFiveProjectionDetailed(scores));

      expect(detailedResult.current.profile).toEqual(simpleResult.current);
    });
  });
});

// ============================================
// UTILITY FUNCTION TESTS
// ============================================

describe('getBigFiveLabels', () => {
  it('returns correct labels for all traits', () => {
    const labels = getBigFiveLabels();

    expect(labels.OPENNESS).toBe('Openness');
    expect(labels.CONSCIENTIOUSNESS).toBe('Conscientiousness');
    expect(labels.EXTRAVERSION).toBe('Extraversion');
    expect(labels.AGREEABLENESS).toBe('Agreeableness');
    expect(labels.EMOTIONAL_STABILITY).toBe('Emotional Stability');
  });
});

describe('bigFiveToArray', () => {
  it('converts profile to array format', () => {
    const profile: BigFiveProfile = {
      OPENNESS: 75,
      CONSCIENTIOUSNESS: 80,
      EXTRAVERSION: 65,
      AGREEABLENESS: 85,
      EMOTIONAL_STABILITY: 70,
    };

    const array = bigFiveToArray(profile);

    expect(array).toHaveLength(5);
    expect(array).toContainEqual({ trait: 'Openness', value: 75 });
    expect(array).toContainEqual({ trait: 'Conscientiousness', value: 80 });
    expect(array).toContainEqual({ trait: 'Extraversion', value: 65 });
    expect(array).toContainEqual({ trait: 'Agreeableness', value: 85 });
    expect(array).toContainEqual({ trait: 'Emotional Stability', value: 70 });
  });
});

describe('BIG_FIVE_INFO', () => {
  it('contains info for all five traits', () => {
    expect(BIG_FIVE_INFO.OPENNESS).toBeDefined();
    expect(BIG_FIVE_INFO.CONSCIENTIOUSNESS).toBeDefined();
    expect(BIG_FIVE_INFO.EXTRAVERSION).toBeDefined();
    expect(BIG_FIVE_INFO.AGREEABLENESS).toBeDefined();
    expect(BIG_FIVE_INFO.EMOTIONAL_STABILITY).toBeDefined();
  });

  it('has displayName, short, and description for each trait', () => {
    const traits = Object.keys(BIG_FIVE_INFO) as Array<keyof typeof BIG_FIVE_INFO>;

    traits.forEach(trait => {
      expect(BIG_FIVE_INFO[trait].displayName).toBeDefined();
      expect(BIG_FIVE_INFO[trait].short).toBeDefined();
      expect(BIG_FIVE_INFO[trait].description).toBeDefined();
    });
  });
});

describe('BigFiveTrait enum', () => {
  it('contains all five personality dimensions', () => {
    expect(BigFiveTrait.OPENNESS).toBe('OPENNESS');
    expect(BigFiveTrait.CONSCIENTIOUSNESS).toBe('CONSCIENTIOUSNESS');
    expect(BigFiveTrait.EXTRAVERSION).toBe('EXTRAVERSION');
    expect(BigFiveTrait.AGREEABLENESS).toBe('AGREEABLENESS');
    expect(BigFiveTrait.EMOTIONAL_STABILITY).toBe('EMOTIONAL_STABILITY');
  });
});

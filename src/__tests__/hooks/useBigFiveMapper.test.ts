/**
 * Tests for useBigFiveMapper hook
 *
 * Tests O*NET Work Style to Big Five personality dimension mapping.
 * Uses static JSON mapping data from onet_to_bigfive_map.json.
 *
 * Real O*NET codes from the codebase:
 * - 1.C.1.a: Achievement/Effort -> CONSCIENTIOUSNESS (primary), EXTRAVERSION (secondary)
 * - 1.C.1.b: Persistence -> CONSCIENTIOUSNESS (primary), EMOTIONAL_STABILITY (secondary)
 * - 1.C.3.a: Cooperation -> AGREEABLENESS (primary), EXTRAVERSION (secondary)
 * - 1.C.3.c: Social Orientation -> EXTRAVERSION (primary), AGREEABLENESS (secondary)
 * - 1.C.4.b: Stress Tolerance -> EMOTIONAL_STABILITY (primary + secondary)
 * - 1.C.7.a: Innovation -> OPENNESS (primary + secondary)
 */
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useBigFiveMapper,
  getBigFiveMapping,
  getOnetCodesForBigFive,
  hasBigFiveMapping,
} from '@/hooks/useBigFiveMapper';

// =============================================================================
// useBigFiveMapper Hook Tests
// =============================================================================

describe('useBigFiveMapper', () => {
  describe('Valid Mapping', () => {
    it('returns correct bigFive dimension for CONSCIENTIOUSNESS mapping', () => {
      const { result } = renderHook(() => useBigFiveMapper('1.C.1.a'));

      expect(result.current.bigFive).toBe('CONSCIENTIOUSNESS');
    });

    it('returns correct bigFive dimension for EXTRAVERSION mapping', () => {
      const { result } = renderHook(() => useBigFiveMapper('1.C.3.c'));

      expect(result.current.bigFive).toBe('EXTRAVERSION');
    });

    it('returns correct bigFive dimension for AGREEABLENESS mapping', () => {
      const { result } = renderHook(() => useBigFiveMapper('1.C.3.a'));

      expect(result.current.bigFive).toBe('AGREEABLENESS');
    });

    it('returns correct bigFive dimension for EMOTIONAL_STABILITY mapping', () => {
      const { result } = renderHook(() => useBigFiveMapper('1.C.4.b'));

      expect(result.current.bigFive).toBe('EMOTIONAL_STABILITY');
    });

    it('returns correct bigFive dimension for OPENNESS mapping', () => {
      const { result } = renderHook(() => useBigFiveMapper('1.C.7.a'));

      expect(result.current.bigFive).toBe('OPENNESS');
    });

    it('returns correct facet dimension for Achievement/Effort', () => {
      const { result } = renderHook(() => useBigFiveMapper('1.C.1.a'));

      expect(result.current.facet).toBe('Achievement Striving');
    });

    it('returns correct facet dimension for Persistence', () => {
      const { result } = renderHook(() => useBigFiveMapper('1.C.1.b'));

      expect(result.current.facet).toBe('Self-Discipline');
    });

    it('returns correct facet dimension for Innovation', () => {
      const { result } = renderHook(() => useBigFiveMapper('1.C.7.a'));

      expect(result.current.facet).toBe('Ideas');
    });

    it('returns confidence from primaryWeight', () => {
      const { result } = renderHook(() => useBigFiveMapper('1.C.1.a'));

      // 1.C.1.a has primaryWeight: 0.85
      expect(result.current.confidence).toBe(0.85);
    });

    it('returns high confidence for Stress Tolerance', () => {
      const { result } = renderHook(() => useBigFiveMapper('1.C.4.b'));

      // 1.C.4.b has primaryWeight: 0.95
      expect(result.current.confidence).toBe(0.95);
    });

    it('returns rationale from mapping', () => {
      const { result } = renderHook(() => useBigFiveMapper('1.C.1.a'));

      expect(result.current.rationale).toContain('Achievement orientation');
      expect(result.current.rationale).toContain('Conscientiousness');
    });

    it('returns onetName from mapping', () => {
      const { result } = renderHook(() => useBigFiveMapper('1.C.1.a'));

      expect(result.current.onetName).toBe('Achievement/Effort');
    });

    it('returns correct onetName for Cooperation', () => {
      const { result } = renderHook(() => useBigFiveMapper('1.C.3.a'));

      expect(result.current.onetName).toBe('Cooperation');
    });

    it('returns correct onetName for Innovation', () => {
      const { result } = renderHook(() => useBigFiveMapper('1.C.7.a'));

      expect(result.current.onetName).toBe('Innovation');
    });

    it('sets hasMapping = true for valid code', () => {
      const { result } = renderHook(() => useBigFiveMapper('1.C.1.a'));

      expect(result.current.hasMapping).toBe(true);
    });
  });

  describe('Secondary Mapping', () => {
    it('returns secondary.bigFive when present', () => {
      const { result } = renderHook(() => useBigFiveMapper('1.C.1.a'));

      // 1.C.1.a has secondaryBigFive: EXTRAVERSION
      expect(result.current.secondary).not.toBeNull();
      expect(result.current.secondary?.bigFive).toBe('EXTRAVERSION');
    });

    it('returns secondary.confidence from secondaryWeight', () => {
      const { result } = renderHook(() => useBigFiveMapper('1.C.1.a'));

      // 1.C.1.a has secondaryWeight: 0.35
      expect(result.current.secondary?.confidence).toBe(0.35);
    });

    it('returns secondary for different dimension pairs', () => {
      // Cooperation: AGREEABLENESS -> EXTRAVERSION
      const { result: cooperationResult } = renderHook(() =>
        useBigFiveMapper('1.C.3.a')
      );
      expect(cooperationResult.current.secondary?.bigFive).toBe('EXTRAVERSION');
      expect(cooperationResult.current.secondary?.confidence).toBe(0.3);
    });

    it('returns secondary for EMOTIONAL_STABILITY -> AGREEABLENESS pair', () => {
      // Self-Control: EMOTIONAL_STABILITY -> AGREEABLENESS
      const { result } = renderHook(() => useBigFiveMapper('1.C.4.a'));

      expect(result.current.bigFive).toBe('EMOTIONAL_STABILITY');
      expect(result.current.secondary?.bigFive).toBe('AGREEABLENESS');
      expect(result.current.secondary?.confidence).toBe(0.45);
    });

    it('handles same dimension for primary and secondary', () => {
      // Stress Tolerance: EMOTIONAL_STABILITY -> EMOTIONAL_STABILITY
      const { result } = renderHook(() => useBigFiveMapper('1.C.4.b'));

      expect(result.current.bigFive).toBe('EMOTIONAL_STABILITY');
      expect(result.current.secondary?.bigFive).toBe('EMOTIONAL_STABILITY');
      expect(result.current.secondary?.confidence).toBe(0.8);
    });

    it('handles same dimension for OPENNESS primary and secondary', () => {
      // Innovation: OPENNESS -> OPENNESS (Ideas -> Fantasy)
      const { result } = renderHook(() => useBigFiveMapper('1.C.7.a'));

      expect(result.current.bigFive).toBe('OPENNESS');
      expect(result.current.secondary?.bigFive).toBe('OPENNESS');
      expect(result.current.secondary?.confidence).toBe(0.7);
    });
  });

  describe('Invalid Input', () => {
    it('returns all-null result for undefined', () => {
      const { result } = renderHook(() => useBigFiveMapper(undefined));

      expect(result.current.bigFive).toBeNull();
      expect(result.current.facet).toBeNull();
      expect(result.current.rationale).toBeNull();
      expect(result.current.onetName).toBeNull();
      expect(result.current.secondary).toBeNull();
    });

    it('returns all-null result for null', () => {
      const { result } = renderHook(() => useBigFiveMapper(null));

      expect(result.current.bigFive).toBeNull();
      expect(result.current.facet).toBeNull();
      expect(result.current.rationale).toBeNull();
      expect(result.current.onetName).toBeNull();
      expect(result.current.secondary).toBeNull();
    });

    it('returns all-null result for empty string', () => {
      const { result } = renderHook(() => useBigFiveMapper(''));

      expect(result.current.bigFive).toBeNull();
      expect(result.current.facet).toBeNull();
      expect(result.current.rationale).toBeNull();
      expect(result.current.onetName).toBeNull();
      expect(result.current.secondary).toBeNull();
    });

    it('returns all-null result for invalid O*NET code', () => {
      const { result } = renderHook(() =>
        useBigFiveMapper('INVALID_CODE_123')
      );

      expect(result.current.bigFive).toBeNull();
      expect(result.current.facet).toBeNull();
      expect(result.current.rationale).toBeNull();
      expect(result.current.onetName).toBeNull();
      expect(result.current.secondary).toBeNull();
    });

    it('returns all-null result for O*NET code not in mapping', () => {
      // Valid format but not in our work styles mapping
      const { result } = renderHook(() => useBigFiveMapper('2.A.1.a'));

      expect(result.current.bigFive).toBeNull();
      expect(result.current.hasMapping).toBe(false);
    });

    it('sets hasMapping = false for invalid input', () => {
      const { result } = renderHook(() => useBigFiveMapper('NOT_FOUND'));

      expect(result.current.hasMapping).toBe(false);
    });

    it('confidence = 0 for invalid input', () => {
      const { result } = renderHook(() => useBigFiveMapper(null));

      expect(result.current.confidence).toBe(0);
    });

    it('confidence = 0 for non-existent code', () => {
      const { result } = renderHook(() => useBigFiveMapper('9.Z.9.z'));

      expect(result.current.confidence).toBe(0);
    });
  });

  describe('Memoization', () => {
    it('returns same reference for same O*NET code on re-render', () => {
      const { result, rerender } = renderHook(
        ({ code }) => useBigFiveMapper(code),
        { initialProps: { code: '1.C.1.a' } }
      );

      const firstResult = result.current;

      // Re-render with same code
      rerender({ code: '1.C.1.a' });

      const secondResult = result.current;

      // useMemo should return the same object reference
      expect(firstResult).toBe(secondResult);
    });

    it('returns different result for different codes', () => {
      const { result, rerender } = renderHook(
        ({ code }) => useBigFiveMapper(code),
        { initialProps: { code: '1.C.1.a' } }
      );

      const firstBigFive = result.current.bigFive;

      // Re-render with different code
      rerender({ code: '1.C.7.a' });

      const secondBigFive = result.current.bigFive;

      expect(firstBigFive).toBe('CONSCIENTIOUSNESS');
      expect(secondBigFive).toBe('OPENNESS');
      expect(firstBigFive).not.toBe(secondBigFive);
    });

    it('returns new reference when code changes', () => {
      const { result, rerender } = renderHook(
        ({ code }) => useBigFiveMapper(code),
        { initialProps: { code: '1.C.1.a' as string | null } }
      );

      const firstResult = result.current;

      // Re-render with different code
      rerender({ code: '1.C.3.a' });

      const secondResult = result.current;

      // Different code should produce different reference
      expect(firstResult).not.toBe(secondResult);
    });

    it('handles transition from null to valid code', () => {
      const { result, rerender } = renderHook(
        ({ code }) => useBigFiveMapper(code),
        { initialProps: { code: null as string | null } }
      );

      expect(result.current.hasMapping).toBe(false);

      rerender({ code: '1.C.1.a' });

      expect(result.current.hasMapping).toBe(true);
      expect(result.current.bigFive).toBe('CONSCIENTIOUSNESS');
    });

    it('handles transition from valid code to null', () => {
      const { result, rerender } = renderHook(
        ({ code }) => useBigFiveMapper(code),
        { initialProps: { code: '1.C.1.a' as string | null } }
      );

      expect(result.current.hasMapping).toBe(true);

      rerender({ code: null });

      expect(result.current.hasMapping).toBe(false);
      expect(result.current.bigFive).toBeNull();
    });
  });
});

// =============================================================================
// getBigFiveMapping Utility Function Tests
// =============================================================================

describe('getBigFiveMapping', () => {
  it('returns same result as hook for valid code', () => {
    const { result } = renderHook(() => useBigFiveMapper('1.C.1.a'));
    const utilityResult = getBigFiveMapping('1.C.1.a');

    expect(utilityResult.bigFive).toBe(result.current.bigFive);
    expect(utilityResult.facet).toBe(result.current.facet);
    expect(utilityResult.confidence).toBe(result.current.confidence);
    expect(utilityResult.rationale).toBe(result.current.rationale);
    expect(utilityResult.onetName).toBe(result.current.onetName);
    expect(utilityResult.hasMapping).toBe(result.current.hasMapping);
  });

  it('handles null input', () => {
    const result = getBigFiveMapping(null);

    expect(result.bigFive).toBeNull();
    expect(result.facet).toBeNull();
    expect(result.confidence).toBe(0);
    expect(result.hasMapping).toBe(false);
  });

  it('handles undefined input', () => {
    const result = getBigFiveMapping(undefined);

    expect(result.bigFive).toBeNull();
    expect(result.facet).toBeNull();
    expect(result.confidence).toBe(0);
    expect(result.hasMapping).toBe(false);
  });

  it('returns all fields for complete mapping', () => {
    const result = getBigFiveMapping('1.C.1.b');

    expect(result).toEqual({
      bigFive: 'CONSCIENTIOUSNESS',
      facet: 'Self-Discipline',
      confidence: 0.9,
      rationale: expect.stringContaining('Persistence'),
      onetName: 'Persistence',
      secondary: {
        bigFive: 'EMOTIONAL_STABILITY',
        confidence: 0.3,
      },
      hasMapping: true,
    });
  });

  it('can be used in server components (no hooks)', () => {
    // This demonstrates the utility is suitable for server-side usage
    const codes = ['1.C.1.a', '1.C.3.a', '1.C.7.a'];
    const results = codes.map((code) => getBigFiveMapping(code));

    expect(results[0].bigFive).toBe('CONSCIENTIOUSNESS');
    expect(results[1].bigFive).toBe('AGREEABLENESS');
    expect(results[2].bigFive).toBe('OPENNESS');
  });
});

// =============================================================================
// getOnetCodesForBigFive Utility Function Tests
// =============================================================================

describe('getOnetCodesForBigFive', () => {
  it('returns array of O*NET codes for CONSCIENTIOUSNESS', () => {
    const codes = getOnetCodesForBigFive('CONSCIENTIOUSNESS');

    expect(codes).toBeInstanceOf(Array);
    expect(codes.length).toBeGreaterThan(0);
    expect(codes).toContain('1.C.1.a'); // Achievement/Effort
    expect(codes).toContain('1.C.1.b'); // Persistence
    expect(codes).toContain('1.C.5.a'); // Dependability
    expect(codes).toContain('1.C.5.b'); // Attention to Detail
  });

  it('returns array of O*NET codes for EXTRAVERSION', () => {
    const codes = getOnetCodesForBigFive('EXTRAVERSION');

    expect(codes).toBeInstanceOf(Array);
    expect(codes.length).toBeGreaterThan(0);
    expect(codes).toContain('1.C.1.c'); // Initiative
    expect(codes).toContain('1.C.2.b'); // Leadership
    expect(codes).toContain('1.C.3.c'); // Social Orientation
  });

  it('returns array of O*NET codes for AGREEABLENESS', () => {
    const codes = getOnetCodesForBigFive('AGREEABLENESS');

    expect(codes).toBeInstanceOf(Array);
    expect(codes.length).toBeGreaterThan(0);
    expect(codes).toContain('1.C.3.a'); // Cooperation
    expect(codes).toContain('1.C.3.b'); // Concern for Others
  });

  it('returns array of O*NET codes for EMOTIONAL_STABILITY', () => {
    const codes = getOnetCodesForBigFive('EMOTIONAL_STABILITY');

    expect(codes).toBeInstanceOf(Array);
    expect(codes.length).toBeGreaterThan(0);
    expect(codes).toContain('1.C.4.a'); // Self-Control
    expect(codes).toContain('1.C.4.b'); // Stress Tolerance
  });

  it('returns array of O*NET codes for OPENNESS', () => {
    const codes = getOnetCodesForBigFive('OPENNESS');

    expect(codes).toBeInstanceOf(Array);
    expect(codes.length).toBeGreaterThan(0);
    expect(codes).toContain('1.C.7.a'); // Innovation
    expect(codes).toContain('1.C.7.b'); // Analytical Thinking
    expect(codes).toContain('1.C.4.c'); // Adaptability/Flexibility
    expect(codes).toContain('1.C.6'); // Independence
  });

  it('returns only primary mappings (not secondary)', () => {
    const conscientiousnessCodes = getOnetCodesForBigFive('CONSCIENTIOUSNESS');
    const extraversionCodes = getOnetCodesForBigFive('EXTRAVERSION');

    // 1.C.1.a has CONSCIENTIOUSNESS as primary and EXTRAVERSION as secondary
    // It should only appear in CONSCIENTIOUSNESS array
    expect(conscientiousnessCodes).toContain('1.C.1.a');
    expect(extraversionCodes).not.toContain('1.C.1.a');
  });

  it('returns consistent results across multiple calls', () => {
    const firstCall = getOnetCodesForBigFive('OPENNESS');
    const secondCall = getOnetCodesForBigFive('OPENNESS');

    expect(firstCall).toEqual(secondCall);
  });
});

// =============================================================================
// hasBigFiveMapping Utility Function Tests
// =============================================================================

describe('hasBigFiveMapping', () => {
  it('returns true for valid O*NET code', () => {
    expect(hasBigFiveMapping('1.C.1.a')).toBe(true);
    expect(hasBigFiveMapping('1.C.3.a')).toBe(true);
    expect(hasBigFiveMapping('1.C.7.a')).toBe(true);
  });

  it('returns true for all known work style codes', () => {
    const knownCodes = [
      '1.C.1.a',
      '1.C.1.b',
      '1.C.1.c',
      '1.C.2.b',
      '1.C.3.a',
      '1.C.3.b',
      '1.C.3.c',
      '1.C.4.a',
      '1.C.4.b',
      '1.C.4.c',
      '1.C.5.a',
      '1.C.5.b',
      '1.C.5.c',
      '1.C.6',
      '1.C.7.a',
      '1.C.7.b',
    ];

    knownCodes.forEach((code) => {
      expect(hasBigFiveMapping(code)).toBe(true);
    });
  });

  it('returns false for invalid code', () => {
    expect(hasBigFiveMapping('INVALID')).toBe(false);
    expect(hasBigFiveMapping('NOT_A_CODE')).toBe(false);
    expect(hasBigFiveMapping('')).toBe(false);
  });

  it('returns false for O*NET codes not in work styles mapping', () => {
    // These are valid O*NET format but not in our work styles (1.C.x.x) mapping
    expect(hasBigFiveMapping('2.A.1.a')).toBe(false); // Abilities
    expect(hasBigFiveMapping('2.B.1.a')).toBe(false); // Basic Skills
    expect(hasBigFiveMapping('4.A.1.a')).toBe(false); // Work Activities
  });

  it('returns false for partial code matches', () => {
    expect(hasBigFiveMapping('1.C.1')).toBe(false);
    expect(hasBigFiveMapping('1.C')).toBe(false);
    expect(hasBigFiveMapping('1')).toBe(false);
  });

  it('is case-sensitive', () => {
    // The mapping uses exact keys, so case matters
    expect(hasBigFiveMapping('1.c.1.a')).toBe(false);
    expect(hasBigFiveMapping('1.C.1.A')).toBe(false);
  });
});

// =============================================================================
// Edge Cases and Integration Tests
// =============================================================================

describe('Edge Cases', () => {
  it('handles all Big Five dimensions in mapping', () => {
    const dimensions = [
      { code: '1.C.1.a', expected: 'CONSCIENTIOUSNESS' },
      { code: '1.C.3.c', expected: 'EXTRAVERSION' },
      { code: '1.C.3.a', expected: 'AGREEABLENESS' },
      { code: '1.C.4.b', expected: 'EMOTIONAL_STABILITY' },
      { code: '1.C.7.a', expected: 'OPENNESS' },
    ] as const;

    dimensions.forEach(({ code, expected }) => {
      const result = getBigFiveMapping(code);
      expect(result.bigFive).toBe(expected);
    });
  });

  it('all mapped codes have required fields', () => {
    const allCodes = [
      '1.C.1.a',
      '1.C.1.b',
      '1.C.1.c',
      '1.C.2.b',
      '1.C.3.a',
      '1.C.3.b',
      '1.C.3.c',
      '1.C.4.a',
      '1.C.4.b',
      '1.C.4.c',
      '1.C.5.a',
      '1.C.5.b',
      '1.C.5.c',
      '1.C.6',
      '1.C.7.a',
      '1.C.7.b',
    ];

    allCodes.forEach((code) => {
      const result = getBigFiveMapping(code);

      expect(result.hasMapping).toBe(true);
      expect(result.bigFive).not.toBeNull();
      expect(result.facet).not.toBeNull();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.rationale).not.toBeNull();
      expect(result.onetName).not.toBeNull();
    });
  });

  it('confidence values are within valid range (0-1)', () => {
    const allCodes = [
      '1.C.1.a',
      '1.C.1.b',
      '1.C.4.b',
      '1.C.5.a',
      '1.C.7.a',
    ];

    allCodes.forEach((code) => {
      const result = getBigFiveMapping(code);

      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);

      if (result.secondary) {
        expect(result.secondary.confidence).toBeGreaterThanOrEqual(0);
        expect(result.secondary.confidence).toBeLessThanOrEqual(1);
      }
    });
  });

  it('primary confidence is always >= secondary confidence', () => {
    const codesWithSecondary = [
      '1.C.1.a',
      '1.C.1.b',
      '1.C.1.c',
      '1.C.3.a',
      '1.C.4.a',
    ];

    codesWithSecondary.forEach((code) => {
      const result = getBigFiveMapping(code);

      if (result.secondary) {
        expect(result.confidence).toBeGreaterThanOrEqual(
          result.secondary.confidence
        );
      }
    });
  });
});

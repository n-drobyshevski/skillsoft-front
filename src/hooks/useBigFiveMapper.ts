/**
 * useBigFiveMapper Hook
 * 
 * Maps O*NET Work Style codes to Big Five personality dimensions.
 * Uses static JSON mapping data - no database calls required.
 * 
 * @example
 * ```tsx
 * const { bigFive, dimension, confidence } = useBigFiveMapper('1.C.1.a');
 * // Returns: { bigFive: 'CONSCIENTIOUSNESS', dimension: 'achievement_striving', confidence: 0.85 }
 * ```
 */

import { useMemo } from 'react';
import type { BigFiveDimension } from '@/types/domain';
import onetToBigFiveMap from '@/data/standards/onet_to_bigfive_map.json';

// =============================================================================
// Types
// =============================================================================

interface OnetBigFiveMapping {
  elementId: string;
  elementName: string;
  description: string;
  primaryBigFive: BigFiveDimension;
  primaryFacet: string;
  primaryWeight: number;
  rationale: string;
  secondaryBigFive?: BigFiveDimension;
  secondaryFacet?: string;
  secondaryWeight?: number;
}

interface BigFiveMappingResult {
  /** The primary Big Five dimension, or null if no mapping exists */
  bigFive: BigFiveDimension | null;
  /** The specific facet/dimension within the Big Five trait */
  dimension: string | null;
  /** Confidence score (0-1) for this mapping */
  confidence: number;
  /** Human-readable rationale for the mapping */
  rationale: string | null;
  /** O*NET element name (e.g., "Achievement/Effort") */
  onetName: string | null;
  /** Secondary Big Five dimension if applicable */
  secondary: {
    bigFive: BigFiveDimension;
    confidence: number;
  } | null;
  /** Whether a valid mapping was found */
  hasMapping: boolean;
}

// =============================================================================
// Type-safe access to mapping data
// =============================================================================

type MappingsRecord = Record<string, OnetBigFiveMapping>;

const mappings = (onetToBigFiveMap as { mappings: MappingsRecord }).mappings;

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook to get Big Five personality mapping for an O*NET code.
 * 
 * @param onetCode - O*NET element code (e.g., "1.C.1.a" for Work Styles)
 * @returns BigFiveMappingResult with mapping details or null values if not found
 */
export function useBigFiveMapper(onetCode: string | null | undefined): BigFiveMappingResult {
  return useMemo(() => {
    if (!onetCode) {
      return {
        bigFive: null,
        dimension: null,
        confidence: 0,
        rationale: null,
        onetName: null,
        secondary: null,
        hasMapping: false,
      };
    }

    const mapping = mappings[onetCode];

    if (!mapping) {
      return {
        bigFive: null,
        dimension: null,
        confidence: 0,
        rationale: null,
        onetName: null,
        secondary: null,
        hasMapping: false,
      };
    }

    return {
      bigFive: mapping.primaryBigFive,
      dimension: mapping.primaryFacet || null,
      confidence: mapping.primaryWeight,
      rationale: mapping.rationale,
      onetName: mapping.elementName,
      secondary: mapping.secondaryBigFive
        ? {
            bigFive: mapping.secondaryBigFive,
            confidence: mapping.secondaryWeight || 0,
          }
        : null,
      hasMapping: true,
    };
  }, [onetCode]);
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get Big Five mapping for an O*NET code (non-hook version for server components)
 */
export function getBigFiveMapping(onetCode: string | null | undefined): BigFiveMappingResult {
  if (!onetCode) {
    return {
      bigFive: null,
      dimension: null,
      confidence: 0,
      rationale: null,
      onetName: null,
      secondary: null,
      hasMapping: false,
    };
  }

  const mapping = mappings[onetCode];

  if (!mapping) {
    return {
      bigFive: null,
      dimension: null,
      confidence: 0,
      rationale: null,
      onetName: null,
      secondary: null,
      hasMapping: false,
    };
  }

  return {
    bigFive: mapping.primaryBigFive,
    dimension: mapping.primaryFacet || null,
    confidence: mapping.primaryWeight,
    rationale: mapping.rationale,
    onetName: mapping.elementName,
    secondary: mapping.secondaryBigFive
      ? {
          bigFive: mapping.secondaryBigFive,
          confidence: mapping.secondaryWeight || 0,
        }
      : null,
    hasMapping: true,
  };
}

/**
 * Get all O*NET codes that map to a specific Big Five dimension
 */
export function getOnetCodesForBigFive(bigFive: BigFiveDimension): string[] {
  return Object.entries(mappings)
    .filter(([, mapping]) => mapping.primaryBigFive === bigFive)
    .map(([code]) => code);
}

/**
 * Check if an O*NET code has a Big Five mapping
 */
export function hasBigFiveMapping(onetCode: string): boolean {
  return onetCode in mappings;
}

export default useBigFiveMapper;

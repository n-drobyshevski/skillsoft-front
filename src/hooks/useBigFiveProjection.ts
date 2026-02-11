import { useMemo } from 'react';
import onetMapping from '@/data/standards/onet_to_bigfive_map.json';
import { CompetencyScore } from '@/types/domain';

/**
 * Big Five personality traits enum matching backend
 */
export enum BigFiveTrait {
  OPENNESS = 'OPENNESS',
  CONSCIENTIOUSNESS = 'CONSCIENTIOUSNESS',
  EXTRAVERSION = 'EXTRAVERSION',
  AGREEABLENESS = 'AGREEABLENESS',
  EMOTIONAL_STABILITY = 'EMOTIONAL_STABILITY'
}

/**
 * Big Five profile with trait scores (0-100)
 */
export interface BigFiveProfile {
  OPENNESS: number;
  CONSCIENTIOUSNESS: number;
  EXTRAVERSION: number;
  AGREEABLENESS: number;
  EMOTIONAL_STABILITY: number;
}

/**
 * O*NET to Big Five mapping entry (from JSON structure)
 */
interface OnetBigFiveMapping {
  elementId: string;
  elementName: string;
  description: string;
  primaryBigFive: keyof BigFiveProfile;
  primaryFacet: string;
  primaryWeight: number;
  secondaryBigFive?: keyof BigFiveProfile;
  secondaryFacet?: string;
  secondaryWeight?: number;
  tertiaryBigFive?: keyof BigFiveProfile;
  tertiaryFacet?: string;
  tertiaryWeight?: number;
  rationale?: string;
}

/**
 * Type for the mappings object (keyed by O*NET element ID)
 */
type MappingsObject = Record<string, OnetBigFiveMapping>;

/**
 * Contribution type indicating the strength of mapping
 */
export type ContributionType = 'primary' | 'secondary' | 'tertiary';

/**
 * Individual competency contribution to a Big Five trait
 */
export interface CompetencyContribution {
  competencyId: string;
  competencyName: string;
  competencyScore: number;
  contributionType: ContributionType;
  weight: number;
  weightedScore: number;
  onetCode: string;
  onetElement: string;
  facet?: string;
}

/**
 * Contributions breakdown by Big Five trait
 */
export interface BigFiveContributions {
  OPENNESS: CompetencyContribution[];
  CONSCIENTIOUSNESS: CompetencyContribution[];
  EXTRAVERSION: CompetencyContribution[];
  AGREEABLENESS: CompetencyContribution[];
  EMOTIONAL_STABILITY: CompetencyContribution[];
}

/**
 * Metadata about the projection quality
 */
export interface ProjectionMetadata {
  totalCompetencies: number;
  mappedCompetencies: number;
  unmappedCompetencies: number;
  coveragePercentage: number;
  mappingConfidence: 'low' | 'medium' | 'high';
}

/**
 * Complete Big Five projection result with contributions
 */
export interface BigFiveProjectionResult {
  profile: BigFiveProfile;
  contributions: BigFiveContributions;
  metadata: ProjectionMetadata;
}

/**
 * Maps competency scores to O*NET codes
 */
function getOnetCode(competency: CompetencyScore): string | null {
  // Try explicit onetCode field first (from backend CompetencyScoreDto)
  if (competency.onetCode) {
    return competency.onetCode;
  }
  
  // Fallback: For future expansion when full competency data with standardCodes is available
  // This requires fetching the full competency entity with standards
  // For now, return null and let caller handle missing mappings
  
  return null;
}

/**
 * Projects competency scores onto Big Five personality dimensions using O*NET correlations.
 * 
 * Algorithm:
 * 1. For each competency score, get its O*NET code
 * 2. Find corresponding Big Five trait and correlation from mapping
 * 3. Aggregate: bigFiveProfile[trait] += competencyScore * correlation
 * 4. Average by trait count (weighted average)
 * 5. Normalize to 0-100 scale
 * 
 * @param competencyScores - Array of competency scores from backend
 * @returns Big Five profile with trait scores (0-100)
 */
export function useBigFiveProjection(competencyScores: CompetencyScore[] | undefined): BigFiveProfile {
  return useMemo(() => {
    if (!competencyScores || competencyScores.length === 0) {
      // Return neutral profile (50 for all traits)
      return {
        OPENNESS: 50,
        CONSCIENTIOUSNESS: 50,
        EXTRAVERSION: 50,
        AGREEABLENESS: 50,
        EMOTIONAL_STABILITY: 50
      };
    }

    // Initialize accumulators
    const traitSums: Record<keyof BigFiveProfile, number> = {
      OPENNESS: 0,
      CONSCIENTIOUSNESS: 0,
      EXTRAVERSION: 0,
      AGREEABLENESS: 0,
      EMOTIONAL_STABILITY: 0
    };

    const traitCounts: Record<keyof BigFiveProfile, number> = {
      OPENNESS: 0,
      CONSCIENTIOUSNESS: 0,
      EXTRAVERSION: 0,
      AGREEABLENESS: 0,
      EMOTIONAL_STABILITY: 0
    };

    // Access mappings object from JSON structure (keyed by O*NET element ID)
    const mappings = (onetMapping as { mappings: MappingsObject }).mappings;

    // Process each competency score
    competencyScores.forEach(competency => {
      const onetCode = getOnetCode(competency);
      if (!onetCode) {
        return; // Skip competencies without O*NET codes
      }

      // Look up mapping by O*NET code (object key lookup)
      const mapping = mappings[onetCode];
      if (!mapping) {
        return; // Skip unmapped O*NET codes
      }

      // Aggregate primary Big Five trait weighted by correlation
      const primaryTrait = mapping.primaryBigFive;
      const primaryWeight = mapping.primaryWeight;
      const primaryScore = competency.percentage * primaryWeight;

      traitSums[primaryTrait] += primaryScore;
      traitCounts[primaryTrait] += primaryWeight;

      // Also aggregate secondary trait if present
      if (mapping.secondaryBigFive && mapping.secondaryWeight) {
        const secondaryTrait = mapping.secondaryBigFive;
        const secondaryWeight = mapping.secondaryWeight;
        const secondaryScore = competency.percentage * secondaryWeight;

        traitSums[secondaryTrait] += secondaryScore;
        traitCounts[secondaryTrait] += secondaryWeight;
      }

      // And tertiary trait if present
      if (mapping.tertiaryBigFive && mapping.tertiaryWeight) {
        const tertiaryTrait = mapping.tertiaryBigFive;
        const tertiaryWeight = mapping.tertiaryWeight;
        const tertiaryScore = competency.percentage * tertiaryWeight;

        traitSums[tertiaryTrait] += tertiaryScore;
        traitCounts[tertiaryTrait] += tertiaryWeight;
      }
    });

    // Calculate averages for each trait
    const profile: BigFiveProfile = {
      OPENNESS: 50,
      CONSCIENTIOUSNESS: 50,
      EXTRAVERSION: 50,
      AGREEABLENESS: 50,
      EMOTIONAL_STABILITY: 50
    };

    (Object.keys(profile) as Array<keyof BigFiveProfile>).forEach(trait => {
      if (traitCounts[trait] > 0) {
        // Weighted average: sum / total_weight
        profile[trait] = Math.round(traitSums[trait] / traitCounts[trait]);
        
        // Clamp to 0-100 range
        profile[trait] = Math.max(0, Math.min(100, profile[trait]));
      }
    });

    return profile;
  }, [competencyScores]);
}

/**
 * Returns human-readable labels for Big Five traits
 */
export function getBigFiveLabels(): Record<keyof BigFiveProfile, string> {
  return {
    OPENNESS: 'Openness',
    CONSCIENTIOUSNESS: 'Conscientiousness',
    EXTRAVERSION: 'Extraversion',
    AGREEABLENESS: 'Agreeableness',
    EMOTIONAL_STABILITY: 'Emotional Stability'
  };
}

/**
 * Returns Big Five profile as array for charting libraries
 */
export function bigFiveToArray(profile: BigFiveProfile): Array<{ trait: string; value: number }> {
  const labels = getBigFiveLabels();

  return (Object.keys(profile) as Array<keyof BigFiveProfile>).map(trait => ({
    trait: labels[trait],
    value: profile[trait]
  }));
}

/**
 * Display information for Big Five traits
 */
export const BIG_FIVE_INFO: Record<keyof BigFiveProfile, {
  displayName: string;
  short: string;
  description: string;
}> = {
  OPENNESS: {
    displayName: 'Openness to Experience',
    short: 'Openness',
    description: 'Creativity, curiosity, and willingness to explore new ideas'
  },
  CONSCIENTIOUSNESS: {
    displayName: 'Conscientiousness',
    short: 'Conscientiousness',
    description: 'Self-discipline, orderliness, and goal-directed behavior'
  },
  EXTRAVERSION: {
    displayName: 'Extraversion',
    short: 'Extraversion',
    description: 'Sociability, assertiveness, and positive emotionality'
  },
  AGREEABLENESS: {
    displayName: 'Agreeableness',
    short: 'Agreeableness',
    description: 'Cooperation, trust, and concern for others'
  },
  EMOTIONAL_STABILITY: {
    displayName: 'Emotional Stability',
    short: 'Stability',
    description: 'Calmness, resilience, and ability to handle stress'
  }
};

/**
 * Calculates mapping confidence based on coverage percentage
 */
function calculateMappingConfidence(coveragePercentage: number): 'low' | 'medium' | 'high' {
  if (coveragePercentage >= 70) return 'high';
  if (coveragePercentage >= 40) return 'medium';
  return 'low';
}

/**
 * Enhanced Big Five projection hook that returns detailed contribution breakdown.
 *
 * Returns:
 * - profile: The calculated Big Five trait scores (0-100)
 * - contributions: Breakdown of which competencies contribute to each trait
 * - metadata: Coverage statistics and mapping confidence
 *
 * @param competencyScores - Array of competency scores from backend
 * @returns Complete projection result with contributions and metadata
 */
export function useBigFiveProjectionDetailed(
  competencyScores: CompetencyScore[] | undefined
): BigFiveProjectionResult {
  return useMemo(() => {
    // Default empty result
    const emptyContributions: BigFiveContributions = {
      OPENNESS: [],
      CONSCIENTIOUSNESS: [],
      EXTRAVERSION: [],
      AGREEABLENESS: [],
      EMOTIONAL_STABILITY: []
    };

    const defaultProfile: BigFiveProfile = {
      OPENNESS: 50,
      CONSCIENTIOUSNESS: 50,
      EXTRAVERSION: 50,
      AGREEABLENESS: 50,
      EMOTIONAL_STABILITY: 50
    };

    if (!competencyScores || competencyScores.length === 0) {
      return {
        profile: defaultProfile,
        contributions: emptyContributions,
        metadata: {
          totalCompetencies: 0,
          mappedCompetencies: 0,
          unmappedCompetencies: 0,
          coveragePercentage: 0,
          mappingConfidence: 'low'
        }
      };
    }

    // Initialize accumulators
    const traitSums: Record<keyof BigFiveProfile, number> = {
      OPENNESS: 0,
      CONSCIENTIOUSNESS: 0,
      EXTRAVERSION: 0,
      AGREEABLENESS: 0,
      EMOTIONAL_STABILITY: 0
    };

    const traitCounts: Record<keyof BigFiveProfile, number> = {
      OPENNESS: 0,
      CONSCIENTIOUSNESS: 0,
      EXTRAVERSION: 0,
      AGREEABLENESS: 0,
      EMOTIONAL_STABILITY: 0
    };

    const contributions: BigFiveContributions = {
      OPENNESS: [],
      CONSCIENTIOUSNESS: [],
      EXTRAVERSION: [],
      AGREEABLENESS: [],
      EMOTIONAL_STABILITY: []
    };

    // Access mappings object from JSON structure
    const mappings = (onetMapping as { mappings: MappingsObject }).mappings;

    // Track mapped competencies
    const mappedCompetencyIds = new Set<string>();

    // Process each competency score
    competencyScores.forEach(competency => {
      const onetCode = getOnetCode(competency);
      if (!onetCode) {
        return; // Skip competencies without O*NET codes
      }

      // Look up mapping by O*NET code
      const mapping = mappings[onetCode];
      if (!mapping) {
        return; // Skip unmapped O*NET codes
      }

      mappedCompetencyIds.add(competency.competencyId);

      // Helper to add contribution
      const addContribution = (
        trait: keyof BigFiveProfile,
        type: ContributionType,
        weight: number,
        facet?: string
      ) => {
        const weightedScore = competency.percentage * weight;

        contributions[trait].push({
          competencyId: competency.competencyId,
          competencyName: competency.competencyName,
          competencyScore: competency.percentage,
          contributionType: type,
          weight,
          weightedScore,
          onetCode,
          onetElement: mapping.elementName,
          facet
        });

        traitSums[trait] += weightedScore;
        traitCounts[trait] += weight;
      };

      // Primary contribution
      addContribution(
        mapping.primaryBigFive,
        'primary',
        mapping.primaryWeight,
        mapping.primaryFacet
      );

      // Secondary contribution if present
      if (mapping.secondaryBigFive && mapping.secondaryWeight) {
        addContribution(
          mapping.secondaryBigFive,
          'secondary',
          mapping.secondaryWeight,
          mapping.secondaryFacet
        );
      }

      // Tertiary contribution if present
      if (mapping.tertiaryBigFive && mapping.tertiaryWeight) {
        addContribution(
          mapping.tertiaryBigFive,
          'tertiary',
          mapping.tertiaryWeight,
          mapping.tertiaryFacet
        );
      }
    });

    // Calculate averages for each trait
    const profile: BigFiveProfile = { ...defaultProfile };

    (Object.keys(profile) as Array<keyof BigFiveProfile>).forEach(trait => {
      if (traitCounts[trait] > 0) {
        profile[trait] = Math.round(traitSums[trait] / traitCounts[trait]);
        profile[trait] = Math.max(0, Math.min(100, profile[trait]));
      }

      // Sort contributions by weighted score (highest first)
      contributions[trait].sort((a, b) => b.weightedScore - a.weightedScore);
    });

    // Calculate metadata
    const totalCompetencies = competencyScores.length;
    const mappedCompetencies = mappedCompetencyIds.size;
    const unmappedCompetencies = totalCompetencies - mappedCompetencies;
    const coveragePercentage = totalCompetencies > 0
      ? Math.round((mappedCompetencies / totalCompetencies) * 100)
      : 0;

    return {
      profile,
      contributions,
      metadata: {
        totalCompetencies,
        mappedCompetencies,
        unmappedCompetencies,
        coveragePercentage,
        mappingConfidence: calculateMappingConfidence(coveragePercentage)
      }
    };
  }, [competencyScores]);
}

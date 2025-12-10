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
 * O*NET to Big Five mapping entry
 */
interface OnetBigFiveMapping {
  onetId: string;
  competencyName?: string;
  bigFive: keyof BigFiveProfile;
  correlation: number;
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

    // Access mappings array from JSON structure
    const mappings = (onetMapping as any).mappings as OnetBigFiveMapping[];

    // Process each competency score
    competencyScores.forEach(competency => {
      const onetCode = getOnetCode(competency);
      if (!onetCode) {
        return; // Skip competencies without O*NET codes
      }

      // Find mapping for this O*NET code
      const mapping = mappings.find(m => m.onetId === onetCode);
      if (!mapping) {
        return; // Skip unmapped O*NET codes
      }

      // Aggregate score weighted by correlation
      const trait = mapping.bigFive;
      const weightedScore = competency.percentage * mapping.correlation;
      
      traitSums[trait] += weightedScore;
      traitCounts[trait] += mapping.correlation; // Weight accumulator
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

/**
 * Transforms simulation distribution data into radar chart format
 * combining competency weights with Big Five trait coverage
 */

import { BigFiveProfile, getBigFiveLabels } from '@/hooks/useBigFiveProjection';

// ============================================
// TYPES
// ============================================

export interface CompetencyDistribution {
  competencyId: string;
  competencyName: string;
  questionCount: number;
  weight: number;
}

export interface RadarDataPoint {
  subject: string;
  value: number;
  fullMark: number;
  type: 'competency' | 'bigfive';
  id: string;
}

export interface CombinedRadarData {
  competencies: RadarDataPoint[];
  bigFive: RadarDataPoint[];
  combined: RadarDataPoint[];
}

export interface TransformOptions {
  maxCompetencies?: number;
  showBigFive?: boolean;
  bigFiveProfile?: BigFiveProfile;
}

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_MAX_COMPETENCIES = 8;

// Competency colors (by index for consistent coloring)
export const COMPETENCY_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
];

// Big Five colors (consistent with BigFiveRadar.tsx)
export const BIG_FIVE_TRAIT_COLORS: Record<keyof BigFiveProfile, string> = {
  OPENNESS: '#8b5cf6',           // violet-500
  CONSCIENTIOUSNESS: '#3b82f6', // blue-500
  EXTRAVERSION: '#f59e0b',      // amber-500
  AGREEABLENESS: '#10b981',     // emerald-500
  EMOTIONAL_STABILITY: '#06b6d4', // cyan-500
};

// ============================================
// UTILITIES
// ============================================

/**
 * Truncates text with ellipsis if it exceeds max length
 */
export function truncateLabel(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

/**
 * Normalizes competency weights to percentages (0-100)
 */
function normalizeWeights(competencies: CompetencyDistribution[]): Map<string, number> {
  const totalWeight = competencies.reduce((sum, c) => sum + (c.weight || 1), 0);
  const normalized = new Map<string, number>();

  competencies.forEach(comp => {
    const weightPercent = totalWeight > 0
      ? Math.round(((comp.weight || 1) / totalWeight) * 100)
      : 0;
    normalized.set(comp.competencyId, weightPercent);
  });

  return normalized;
}

// ============================================
// MAIN TRANSFORM FUNCTION
// ============================================

/**
 * Transforms simulation distribution data into radar chart format.
 *
 * For competencies:
 * - Normalizes weights to percentages (0-100)
 * - Limits to top N competencies by weight
 * - Returns sorted by weight (highest first)
 *
 * For Big Five (if provided):
 * - Uses the profile scores directly (0-100)
 * - Appends to the combined data for dual-layer visualization
 */
export function transformSimulationToRadar(
  distributionByCompetency: CompetencyDistribution[],
  options: TransformOptions = {}
): CombinedRadarData {
  const {
    maxCompetencies = DEFAULT_MAX_COMPETENCIES,
    showBigFive = false,
    bigFiveProfile
  } = options;

  // Normalize weights to percentages
  const normalizedWeights = normalizeWeights(distributionByCompetency);

  // Sort by weight and limit to max
  const sortedCompetencies = [...distributionByCompetency]
    .sort((a, b) => (b.weight || 1) - (a.weight || 1))
    .slice(0, maxCompetencies);

  // Transform to radar data points
  const competencyPoints: RadarDataPoint[] = sortedCompetencies.map(comp => ({
    subject: comp.competencyName,
    value: normalizedWeights.get(comp.competencyId) || 0,
    fullMark: 100,
    type: 'competency' as const,
    id: comp.competencyId,
  }));

  // Create Big Five data points if provided
  let bigFivePoints: RadarDataPoint[] = [];

  if (showBigFive && bigFiveProfile) {
    const labels = getBigFiveLabels();
    bigFivePoints = (Object.keys(bigFiveProfile) as Array<keyof BigFiveProfile>).map(trait => ({
      subject: labels[trait],
      value: bigFiveProfile[trait],
      fullMark: 100,
      type: 'bigfive' as const,
      id: trait,
    }));
  }

  // Combined data: competencies first, then Big Five
  const combined = [...competencyPoints, ...bigFivePoints];

  return {
    competencies: competencyPoints,
    bigFive: bigFivePoints,
    combined,
  };
}

/**
 * Creates a simulated Big Five profile based on competency diversity.
 * This is a rough estimation used when actual Big Five data is not available.
 *
 * The algorithm estimates traits based on:
 * - Openness: variety of competencies (more = higher)
 * - Conscientiousness: weight balance (more balanced = higher)
 * - Extraversion: presence of communication-related competencies
 * - Agreeableness: presence of teamwork-related competencies
 * - Emotional Stability: baseline + competency count factor
 */
export function estimateBigFiveFromCompetencies(
  competencies: CompetencyDistribution[]
): BigFiveProfile {
  if (competencies.length === 0) {
    return {
      OPENNESS: 50,
      CONSCIENTIOUSNESS: 50,
      EXTRAVERSION: 50,
      AGREEABLENESS: 50,
      EMOTIONAL_STABILITY: 50,
    };
  }

  const count = competencies.length;
  const totalWeight = competencies.reduce((sum, c) => sum + (c.weight || 1), 0);
  const avgWeight = totalWeight / count;

  // Calculate weight variance (lower = more balanced)
  const variance = competencies.reduce(
    (sum, c) => sum + Math.pow((c.weight || 1) - avgWeight, 2),
    0
  ) / count;
  const normalizedVariance = Math.min(variance / 100, 1); // Normalize to 0-1

  // Openness: More competencies = higher openness (curiosity, breadth)
  const openness = Math.min(100, 40 + count * 8);

  // Conscientiousness: More balanced weights = higher (organization, discipline)
  const conscientiousness = Math.round(70 - normalizedVariance * 30);

  // Extraversion: Base 50, modified by competency count (more = higher)
  const extraversion = Math.min(100, 45 + count * 5);

  // Agreeableness: Base 60, modified by balance
  const agreeableness = Math.round(60 + (1 - normalizedVariance) * 15);

  // Emotional Stability: Base 55, slightly affected by competency count
  const emotionalStability = Math.min(100, 55 + count * 3);

  return {
    OPENNESS: openness,
    CONSCIENTIOUSNESS: conscientiousness,
    EXTRAVERSION: extraversion,
    AGREEABLENESS: agreeableness,
    EMOTIONAL_STABILITY: emotionalStability,
  };
}

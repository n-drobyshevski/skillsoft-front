/**
 * Result Transformers
 *
 * Utility functions to transform raw test result data into the format
 * required by Phase 4 visualization components.
 */

import type { CompetencyScore } from '@/types/domain';
import type {
  GapDataPoint,
  GapTransformOptions,
  TeamSaturationDataPoint,
  TeamSaturationTransformOptions,
  DevelopmentRecommendation,
  RecommendationGeneratorOptions,
  RecommendationPriority,
} from '@/types/results';

// ============================================================================
// Gap Analysis Transformers
// ============================================================================

/**
 * Transform competency scores into gap data points for JOB_FIT visualization
 */
export function toGapData(
  scores: CompetencyScore[],
  options: GapTransformOptions = {}
): GapDataPoint[] {
  const { defaultTarget = 70, includeWeights = false, categoryFilter, minScore } = options;

  return scores
    .filter((score) => {
      if (categoryFilter && score.competencyCategory !== categoryFilter) {
        return false;
      }
      if (minScore !== undefined && score.percentage < minScore) {
        return false;
      }
      return true;
    })
    .map((score) => {
      const targetScore = defaultTarget;
      const gap = targetScore - score.percentage;

      return {
        id: score.competencyId,
        name: score.competencyName,
        actualScore: score.percentage,
        targetScore,
        gap,
        category: score.competencyCategory,
        weight: includeWeights ? score.weight : undefined,
        metadata: {
          onetCode: score.onetCode,
          questionsAnswered: score.questionsAnswered,
        },
      };
    });
}

/**
 * Transform competency scores with O*NET benchmark data
 */
export function toGapDataWithBenchmarks(
  scores: CompetencyScore[],
  benchmarks: Record<string, number>,
  options: Omit<GapTransformOptions, 'defaultTarget'> = {}
): GapDataPoint[] {
  const { includeWeights = false, categoryFilter, minScore } = options;

  return scores
    .filter((score) => {
      if (categoryFilter && score.competencyCategory !== categoryFilter) {
        return false;
      }
      if (minScore !== undefined && score.percentage < minScore) {
        return false;
      }
      return true;
    })
    .map((score) => {
      // Use benchmark if available, otherwise default to 70
      const targetScore = benchmarks[score.competencyId] ?? 70;
      const gap = targetScore - score.percentage;

      return {
        id: score.competencyId,
        name: score.competencyName,
        actualScore: score.percentage,
        targetScore,
        gap,
        category: score.competencyCategory,
        weight: includeWeights ? score.weight : undefined,
        metadata: {
          onetCode: score.onetCode,
          questionsAnswered: score.questionsAnswered,
        },
      };
    });
}

// ============================================================================
// Team Saturation Transformers
// ============================================================================

/**
 * Transform competency scores into team saturation data for TEAM_FIT visualization
 */
export function toTeamSaturationData(
  scores: CompetencyScore[],
  options: TeamSaturationTransformOptions
): TeamSaturationDataPoint[] {
  const { teamSaturation, targetSaturation = 70, gapThreshold = 20 } = options;

  return scores.map((score) => {
    const teamScore = teamSaturation[score.competencyId] ?? 50;
    const candidateScore = score.percentage;

    // Candidate fills a gap if team is low and candidate is high
    const fillsGap = teamScore < targetSaturation && candidateScore >= teamScore + gapThreshold;
    const gapMagnitude = fillsGap ? candidateScore - teamScore : 0;

    return {
      competencyId: score.competencyId,
      competencyName: score.competencyName,
      candidateScore,
      teamSaturation: teamScore,
      targetSaturation,
      fillsGap,
      gapMagnitude,
      category: score.competencyCategory,
    };
  });
}

/**
 * Transform with simulated team data (for demo/preview purposes)
 */
export function toTeamSaturationDataSimulated(
  scores: CompetencyScore[],
  baseTeamScore: number = 60,
  variance: number = 15
): TeamSaturationDataPoint[] {
  // Generate somewhat realistic team scores
  const teamSaturation: Record<string, number> = {};

  scores.forEach((score, index) => {
    // Create some variety in team scores
    const offset = (Math.sin(index * 1.5) * variance);
    teamSaturation[score.competencyId] = Math.max(
      20,
      Math.min(90, baseTeamScore + offset)
    );
  });

  return toTeamSaturationData(scores, {
    teamSaturation,
    targetSaturation: 70,
    gapThreshold: 15,
  });
}

// ============================================================================
// Development Recommendations Generators
// ============================================================================

/**
 * Determine recommendation priority based on gap size and importance
 */
function determinePriority(gap: number, weight?: number): RecommendationPriority {
  const weightMultiplier = weight ? weight * 2 : 1;
  const weightedGap = gap * weightMultiplier;

  if (weightedGap >= 40) return 'critical';
  if (weightedGap >= 25) return 'high';
  if (weightedGap >= 10) return 'medium';
  return 'low';
}

/**
 * Generate development title based on competency and gap
 */
function generateTitle(competencyName: string, gap: number): string {
  if (gap >= 30) {
    return `Develop foundational ${competencyName} skills`;
  }
  if (gap >= 15) {
    return `Strengthen ${competencyName} capabilities`;
  }
  return `Enhance ${competencyName} proficiency`;
}

/**
 * Generate description based on gap analysis
 */
function generateDescription(
  competencyName: string,
  currentScore: number,
  targetScore: number
): string {
  const gap = targetScore - currentScore;

  if (gap >= 30) {
    return `Your ${competencyName} score of ${Math.round(currentScore)}% is significantly below the target of ${Math.round(targetScore)}%. Focus on building core skills through structured learning and practice opportunities.`;
  }
  if (gap >= 15) {
    return `Your ${competencyName} score shows room for improvement. Targeted development can help you reach the benchmark level required for this role.`;
  }
  return `You're close to meeting the ${competencyName} target. A few focused activities can help you bridge the remaining gap.`;
}

/**
 * Estimate hours based on gap size
 */
function estimateHours(gap: number): number {
  if (gap >= 30) return 40;
  if (gap >= 20) return 25;
  if (gap >= 10) return 15;
  return 8;
}

/**
 * Generate development recommendations from competency scores
 */
export function generateRecommendations(
  scores: CompetencyScore[],
  options: RecommendationGeneratorOptions
): DevelopmentRecommendation[] {
  const {
    targets,
    minGap = 5,
    maxRecommendations = 10,
    sortByPriority = true,
  } = options;

  const recommendations: DevelopmentRecommendation[] = [];

  scores.forEach((score) => {
    const targetScore = targets[score.competencyId] ?? 70;
    const gap = targetScore - score.percentage;

    // Skip if gap is below threshold
    if (gap < minGap) return;

    const priority = determinePriority(gap, score.weight);

    recommendations.push({
      id: `rec-${score.competencyId}`,
      competencyId: score.competencyId,
      competencyName: score.competencyName,
      currentScore: score.percentage,
      targetScore,
      gap,
      priority,
      title: generateTitle(score.competencyName, gap),
      description: generateDescription(score.competencyName, score.percentage, targetScore),
      estimatedHours: estimateHours(gap),
      focusIndicators: score.indicatorScores?.slice(0, 3).map((i) => i.indicatorTitle),
      successMetrics: [
        `Achieve ${Math.round(targetScore)}% score in ${score.competencyName}`,
        'Complete recommended learning resources',
        'Apply skills in real-world scenarios',
      ],
    });
  });

  // Sort by priority
  if (sortByPriority) {
    const priorityOrder: Record<RecommendationPriority, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    recommendations.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  }

  // Limit to max recommendations
  return recommendations.slice(0, maxRecommendations);
}

/**
 * Generate recommendations from gap data
 */
export function generateRecommendationsFromGaps(
  gaps: GapDataPoint[],
  options: Omit<RecommendationGeneratorOptions, 'targets'> = {}
): DevelopmentRecommendation[] {
  const { minGap = 5, maxRecommendations = 10, sortByPriority = true } = options;

  const recommendations: DevelopmentRecommendation[] = [];

  gaps.forEach((gap) => {
    // Skip if gap is negative (exceeds) or below threshold
    if (gap.gap < minGap) return;

    const priority = determinePriority(gap.gap, gap.weight);

    recommendations.push({
      id: `rec-${gap.id}`,
      competencyId: gap.id,
      competencyName: gap.name,
      currentScore: gap.actualScore,
      targetScore: gap.targetScore,
      gap: gap.gap,
      priority,
      title: generateTitle(gap.name, gap.gap),
      description: generateDescription(gap.name, gap.actualScore, gap.targetScore),
      estimatedHours: estimateHours(gap.gap),
      successMetrics: [
        `Achieve ${Math.round(gap.targetScore)}% score in ${gap.name}`,
        'Complete recommended learning resources',
        'Demonstrate improved performance in follow-up assessment',
      ],
    });
  });

  // Sort by priority
  if (sortByPriority) {
    const priorityOrder: Record<RecommendationPriority, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    recommendations.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  }

  return recommendations.slice(0, maxRecommendations);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate average score from competency scores
 */
export function calculateAverageScore(scores: CompetencyScore[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, s) => acc + s.percentage, 0);
  return Math.round(sum / scores.length);
}

/**
 * Calculate weighted average score
 */
export function calculateWeightedAverageScore(scores: CompetencyScore[]): number {
  if (scores.length === 0) return 0;

  let totalWeight = 0;
  let weightedSum = 0;

  scores.forEach((score) => {
    const weight = score.weight ?? 1;
    totalWeight += weight;
    weightedSum += score.percentage * weight;
  });

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

/**
 * Get top strengths from competency scores
 */
export function getTopStrengths(
  scores: CompetencyScore[],
  count: number = 3,
  minScore: number = 70
): CompetencyScore[] {
  return scores
    .filter((s) => s.percentage >= minScore)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, count);
}

/**
 * Get development areas from competency scores
 */
export function getDevelopmentAreas(
  scores: CompetencyScore[],
  count: number = 3,
  maxScore: number = 60
): CompetencyScore[] {
  return scores
    .filter((s) => s.percentage < maxScore)
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, count);
}

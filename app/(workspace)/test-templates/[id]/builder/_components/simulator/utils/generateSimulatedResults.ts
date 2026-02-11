/**
 * Generate Simulated Results
 *
 * Transforms SimulationResult into preview data that shows what
 * a candidate's results would look like after taking the assessment.
 * Results vary based on the selected persona profile.
 */

import { SimulationResult, SimulationProfile, Difficulty } from '../types';
import { Strategy } from '../strategy-context';
import { BigFiveProfile } from '@/hooks/useBigFiveProjection';

// ============================================
// TYPES
// ============================================

export interface SimulatedCompetencyScore {
  competencyId: string;
  competencyName: string;
  simulatedPercentage: number;
  questionCount: number;
  passed: boolean;
  confidence: 'high' | 'medium' | 'low';
  category?: string;
}

export interface SimulatedResultsData {
  overallScore: number;
  passed: boolean;
  passingThreshold: number;
  competencyScores: SimulatedCompetencyScore[];
  bigFiveProfile: BigFiveProfile;
  strengths: SimulatedCompetencyScore[];
  gaps: SimulatedCompetencyScore[];
  estimatedDuration: number;
  totalQuestions: number;
  // Job Fit specific
  jobAlignmentScore?: number;
  onetCoverage?: number;
  // Team Fit specific
  teamGap?: number;
  complementarySkills?: SimulatedCompetencyScore[];
  growthAreas?: SimulatedCompetencyScore[];
}

// ============================================
// PERSONA SCORE RANGES
// ============================================

const PERSONA_RANGES: Record<SimulationProfile, { min: number; max: number; variance: number }> = {
  PERFECT_CANDIDATE: { min: 82, max: 98, variance: 8 },
  RANDOM_GUESSER: { min: 35, max: 65, variance: 20 },
  FAILING_CANDIDATE: { min: 15, max: 45, variance: 15 },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate a random score within persona range with some variance
 */
function generatePersonaScore(persona: SimulationProfile, seed?: number): number {
  const range = PERSONA_RANGES[persona];
  const baseScore = range.min + Math.random() * (range.max - range.min);
  const variance = (Math.random() - 0.5) * range.variance;
  return Math.round(Math.max(0, Math.min(100, baseScore + variance)));
}

/**
 * Determine confidence level based on question count
 */
function getConfidenceLevel(questionCount: number): 'high' | 'medium' | 'low' {
  if (questionCount >= 5) return 'high';
  if (questionCount >= 3) return 'medium';
  return 'low';
}

/**
 * Generate simulated competency scores based on persona
 */
export function generateSimulatedScores(
  distribution: SimulationResult['distributionByCompetency'],
  persona: SimulationProfile,
  passingScore: number
): SimulatedCompetencyScore[] {
  if (!distribution?.length) return [];

  return distribution.map((comp, index) => {
    // Add some variation per competency while maintaining persona character
    const baseScore = generatePersonaScore(persona, index);

    // Adjust based on difficulty mix - harder questions = slightly lower scores for non-perfect
    const difficultyPenalty = persona !== 'PERFECT_CANDIDATE'
      ? (comp.difficultyMix?.ADVANCED || 0) * 0.5 + (comp.difficultyMix?.EXPERT || 0) * 1
      : 0;

    const simulatedPercentage = Math.round(Math.max(0, Math.min(100, baseScore - difficultyPenalty)));

    return {
      competencyId: comp.competencyId,
      competencyName: comp.competencyName,
      simulatedPercentage,
      questionCount: comp.questionCount,
      passed: simulatedPercentage >= passingScore,
      confidence: getConfidenceLevel(comp.questionCount),
    };
  });
}

/**
 * Project competency scores to Big Five personality traits
 */
export function projectToBigFive(
  competencyScores: SimulatedCompetencyScore[],
  persona: SimulationProfile
): BigFiveProfile {
  // Base profile varies by persona
  const baseProfiles: Record<SimulationProfile, BigFiveProfile> = {
    PERFECT_CANDIDATE: {
      OPENNESS: 82,
      CONSCIENTIOUSNESS: 88,
      EXTRAVERSION: 75,
      AGREEABLENESS: 80,
      EMOTIONAL_STABILITY: 85,
    },
    RANDOM_GUESSER: {
      OPENNESS: 55,
      CONSCIENTIOUSNESS: 48,
      EXTRAVERSION: 52,
      AGREEABLENESS: 50,
      EMOTIONAL_STABILITY: 45,
    },
    FAILING_CANDIDATE: {
      OPENNESS: 35,
      CONSCIENTIOUSNESS: 28,
      EXTRAVERSION: 40,
      AGREEABLENESS: 38,
      EMOTIONAL_STABILITY: 32,
    },
  };

  const base = baseProfiles[persona];

  // Add some variance based on competency scores
  const avgScore = competencyScores.length > 0
    ? competencyScores.reduce((sum, c) => sum + c.simulatedPercentage, 0) / competencyScores.length
    : 50;

  const adjustment = (avgScore - 50) * 0.2;

  return {
    OPENNESS: Math.round(Math.max(0, Math.min(100, base.OPENNESS + adjustment + (Math.random() - 0.5) * 10))),
    CONSCIENTIOUSNESS: Math.round(Math.max(0, Math.min(100, base.CONSCIENTIOUSNESS + adjustment + (Math.random() - 0.5) * 8))),
    EXTRAVERSION: Math.round(Math.max(0, Math.min(100, base.EXTRAVERSION + (Math.random() - 0.5) * 12))),
    AGREEABLENESS: Math.round(Math.max(0, Math.min(100, base.AGREEABLENESS + (Math.random() - 0.5) * 10))),
    EMOTIONAL_STABILITY: Math.round(Math.max(0, Math.min(100, base.EMOTIONAL_STABILITY + adjustment + (Math.random() - 0.5) * 8))),
  };
}

/**
 * Calculate job alignment score for TARGETED_FIT
 */
export function calculateJobAlignment(
  scores: SimulatedCompetencyScore[],
  passingScore: number
): { alignmentScore: number; coverage: number } {
  if (!scores.length) return { alignmentScore: 0, coverage: 0 };

  const passedCount = scores.filter(s => s.passed).length;
  const coverage = Math.round((passedCount / scores.length) * 100);
  const avgScore = scores.reduce((sum, s) => sum + s.simulatedPercentage, 0) / scores.length;

  // Alignment considers both coverage and average score
  const alignmentScore = Math.round((coverage * 0.4) + (avgScore * 0.6));

  return { alignmentScore, coverage };
}

/**
 * Calculate team gap for DYNAMIC_GAP_ANALYSIS
 */
export function calculateTeamGap(
  scores: SimulatedCompetencyScore[]
): { gap: number; complementary: SimulatedCompetencyScore[]; growth: SimulatedCompetencyScore[] } {
  if (!scores.length) return { gap: 0, complementary: [], growth: [] };

  // Simulate team average (would come from real data in production)
  const teamAverage = 65;
  const candidateAverage = scores.reduce((sum, s) => sum + s.simulatedPercentage, 0) / scores.length;
  const gap = Math.round(candidateAverage - teamAverage);

  // Split into complementary (above team avg) and growth areas (below)
  const sortedScores = [...scores].sort((a, b) => b.simulatedPercentage - a.simulatedPercentage);
  const complementary = sortedScores.filter(s => s.simulatedPercentage >= teamAverage).slice(0, 3);
  const growth = sortedScores.filter(s => s.simulatedPercentage < teamAverage).slice(-3).reverse();

  return { gap, complementary, growth };
}

// ============================================
// MAIN GENERATOR FUNCTION
// ============================================

/**
 * Generate complete simulated results data based on simulation output and persona
 */
export function generateSimulatedResults(
  result: SimulationResult,
  strategy: Strategy,
  persona: SimulationProfile,
  passingScore: number,
  onetSocCode?: string,
  teamId?: string
): SimulatedResultsData {
  // Generate competency scores
  const competencyScores = generateSimulatedScores(
    result.distributionByCompetency || [],
    persona,
    passingScore
  );

  // Calculate overall score
  const overallScore = result.simulatedScore ?? (
    competencyScores.length > 0
      ? Math.round(competencyScores.reduce((sum, s) => sum + s.simulatedPercentage, 0) / competencyScores.length)
      : 0
  );

  // Generate Big Five profile
  const bigFiveProfile = projectToBigFive(competencyScores, persona);

  // Sort for strengths and gaps
  const sortedScores = [...competencyScores].sort((a, b) => b.simulatedPercentage - a.simulatedPercentage);
  const strengths = sortedScores.slice(0, 3);
  const gaps = sortedScores.slice(-3).reverse();

  // Base result data
  const baseData: SimulatedResultsData = {
    overallScore,
    passed: overallScore >= passingScore,
    passingThreshold: passingScore,
    competencyScores,
    bigFiveProfile,
    strengths,
    gaps,
    estimatedDuration: result.estimatedDurationMinutes || 30,
    totalQuestions: result.sampleQuestions?.length || competencyScores.reduce((sum, c) => sum + c.questionCount, 0),
  };

  // Add strategy-specific data
  if (strategy === 'TARGETED_FIT') {
    const { alignmentScore, coverage } = calculateJobAlignment(competencyScores, passingScore);
    baseData.jobAlignmentScore = alignmentScore;
    baseData.onetCoverage = coverage;
  }

  if (strategy === 'DYNAMIC_GAP_ANALYSIS') {
    const { gap, complementary, growth } = calculateTeamGap(competencyScores);
    baseData.teamGap = gap;
    baseData.complementarySkills = complementary;
    baseData.growthAreas = growth;
  }

  return baseData;
}

// ============================================
// DISPLAY HELPERS
// ============================================

/**
 * Get color class based on score and threshold
 */
export function getScoreColorClass(score: number, threshold: number): string {
  if (score >= threshold + 10) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= threshold) return 'text-emerald-500 dark:text-emerald-500';
  if (score >= threshold - 10) return 'text-amber-500 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
}

/**
 * Get background color class based on score and threshold
 */
export function getScoreBgClass(score: number, threshold: number): string {
  if (score >= threshold) {
    return 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800';
  }
  if (score >= threshold - 10) {
    return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800';
  }
  return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
}

/**
 * Get progress bar color based on score
 */
export function getProgressBarColor(score: number, threshold: number): string {
  if (score >= threshold) return 'bg-emerald-500';
  if (score >= threshold - 10) return 'bg-amber-500';
  return 'bg-red-500';
}

/**
 * Format confidence level for display
 */
export function formatConfidence(confidence: 'high' | 'medium' | 'low'): string {
  const labels = {
    high: 'High confidence',
    medium: 'Moderate confidence',
    low: 'Limited data',
  };
  return labels[confidence];
}

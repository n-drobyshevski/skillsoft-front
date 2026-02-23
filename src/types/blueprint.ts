/**
 * Blueprint Builder Types
 *
 * Shared type definitions for the test template blueprint builder.
 * These types are used by both the server actions (app/) and the
 * Zustand stores (src/store/) and therefore must live under src/types/
 * where both can import via @/types/blueprint.
 *
 * Originally defined in app/(workspace)/test-templates/[id]/builder/actions.ts.
 * That file re-exports these types for backward compatibility.
 */

// ============================================
// ENUMS / UNION TYPES
// ============================================

export type HealthStatus = 'CRITICAL' | 'MODERATE' | 'HEALTHY';
export type SimulationProfile = 'PERFECT_CANDIDATE' | 'RANDOM_GUESSER' | 'FAILING_CANDIDATE';
export type Strategy = 'UNIVERSAL_BASELINE' | 'TARGETED_FIT' | 'DYNAMIC_GAP_ANALYSIS';
export type Difficulty = 'FOUNDATIONAL' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type SelectionReason =
  | 'COVERAGE_GAP'
  | 'CALIBRATION'
  | 'ADAPTIVE_CHECK'
  | 'RANDOMIZED'
  | 'BACKSTOP';
export type AdaptivityMode = 'LINEAR' | 'ADAPTIVE_STANDARD' | 'RUTHLESS';

// ============================================
// DATA INTERFACES
// ============================================

export interface BlueprintCompetency {
  id: string;
  name: string;
  category: string;
  questionCount: number;
  weight: number;
  difficulty?: Difficulty;
}

export interface AdaptivitySettings {
  mode: AdaptivityMode;
  allowBacktracking: boolean;
}

export interface BlueprintState {
  templateId: string;
  templateName: string;
  strategy: Strategy;
  competencies: BlueprintCompetency[];
  adaptivity: AdaptivitySettings;
  timeLimitMinutes: number;
  passingScore: number;
  includeBigFive?: boolean;
  onetSocCode?: string;
  strictnessLevel?: number;
  teamId?: string;
  saturationThreshold?: number;
}

export interface LibraryCompetency {
  id: string;
  name: string;
  category: string;
  description: string;
  questionCount: number;
  health: HealthStatus;
}

export interface QuestionSummary {
  id: string;
  competencyId?: string;
  text: string;
  difficulty: string;
  competencyName: string;
  indicatorTitle: string;
  estimatedTimeSeconds: number;
  selectionReason?: SelectionReason;
  simulatedCorrect?: boolean;
  simulatedAnswer?: string;
}

export interface InventoryWarning {
  competencyId?: string | null;
  competencyName?: string | null;
  difficulty?: string | null;
  currentCount?: number;
  severity?: HealthStatus;
  /** Warning severity: INFO, WARNING, ERROR */
  level?: 'INFO' | 'WARNING' | 'ERROR';
  /** Human-readable warning message */
  message?: string;
}

export interface SimulationResult {
  valid: boolean;
  composition: Record<string, number>;
  sampleQuestions: QuestionSummary[];
  warnings: InventoryWarning[];
  estimatedDurationMinutes: number;
  difficultyDistribution: Record<string, number>;
  distributionByCompetency: Array<{
    competencyId: string;
    competencyName: string;
    questionCount: number;
    weight: number;
    difficultyMix: Record<Difficulty, number>;
  }>;
  distributionByDifficulty: Record<Difficulty, number>;
  selectionReasons: Record<SelectionReason, number>;
  simulatedScore?: number;
  runLogs: string[];
  competencyScores?: Record<string, CompetencySimulationScore>;
  abilityLevel?: number;
}

export interface CompetencySimulationScore {
  competencyId: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  difficultyBreakdown: Record<string, number>;
}

export interface InventoryHeatmap {
  competencyHealth: Record<string, HealthStatus>;
  totalCompetencies: number;
  healthyCounts: number;
  criticalCounts: number;
}

export interface SampleQuestionResponse {
  text: string;
  difficulty?: Difficulty;
}

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

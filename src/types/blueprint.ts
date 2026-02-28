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
  indicatorCount?: number;
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

/**
 * A competency resolved from an O*NET benchmark profile.
 * Used to restrict the library panel in JOB_FIT mode.
 */
export interface ResolvedOnetCompetency {
  id: string;
  name: string;
  category: string;
  onetBenchmarkName: string;
  benchmarkScore: number;
}

export interface LibraryCompetency {
  id: string;
  name: string;
  category: string;
  description: string;
  questionCount: number;
  indicatorCount: number;
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

export type WarningCode =
  | 'BENCHMARK_LOOKUP_FALLBACK'
  | 'INDICATOR_EXHAUSTED_BORROWING'
  | 'FUZZY_MATCH_PASSPORT'
  | 'FUZZY_MATCH_ONET'
  | 'NO_INDICATORS_FOR_GAPS'
  | 'NO_ACTIVE_QUESTIONS_INDICATOR'
  | 'NO_ACTIVE_INDICATORS_COMPETENCY'
  | 'NO_ACTIVE_INDICATORS_COMPETENCIES'
  | 'NO_ONET_SOC_CODE'
  | 'NO_ONET_PROFILE'
  | 'INVENTORY_CRITICAL'
  | 'INVENTORY_LIMITED'
  | 'GENERIC';

export interface InventoryWarning {
  competencyId?: string | null;
  competencyName?: string | null;
  difficulty?: string | null;
  currentCount?: number;
  severity?: HealthStatus;
  /** Warning severity: INFO, WARNING, ERROR */
  level?: 'INFO' | 'WARNING' | 'ERROR';
  /** Machine-readable warning code for tooltip lookup */
  code?: WarningCode | null;
  /** Human-readable warning message (English fallback) */
  message?: string;
  /** Dynamic parameters for i18n message interpolation */
  params?: Record<string, string> | null;
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
  /** Per-competency per-difficulty question counts. Key format: "competencyId:DIFFICULTY" */
  detailedCounts: Record<string, number>;
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

// ============================================
// INDICATOR INVENTORY (Library Panel Expansion)
// ============================================

export interface IndicatorQuestionStats {
  indicatorId: string;
  title: string;
  weight: number;
  isActive: boolean;
  totalQuestions: number;
  questionsByDifficulty: Record<Difficulty, number>;
}

export interface IndicatorInventory {
  competencyId: string;
  indicators: IndicatorQuestionStats[];
}

export enum CompetencyCategory {
  COGNITIVE = 'COGNITIVE',
  INTERPERSONAL = 'INTERPERSONAL',
  LEADERSHIP = 'LEADERSHIP',
  ADAPTABILITY = 'ADAPTABILITY',
  EMOTIONAL_INTELLIGENCE = 'EMOTIONAL_INTELLIGENCE',
  COMMUNICATION = 'COMMUNICATION',
  COLLABORATION = 'COLLABORATION',
  CRITICAL_THINKING = 'CRITICAL_THINKING',
  TIME_MANAGEMENT = 'TIME_MANAGEMENT'
}
export enum ProficiencyLevel {
  NOVICE = 'NOVICE',
  DEVELOPING = 'DEVELOPING',
  PROFICIENT = 'PROFICIENT',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export enum ApprovalStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED',
  UNDER_REVISION = 'UNDER_REVISION'}

export enum IndicatorMeasurementType  {
  FREQUENCY = 'FREQUENCY',
  QUALITY = 'QUALITY',
  IMPACT = 'IMPACT',
  CONSISTENCY = 'CONSISTENCY',
  IMPROVEMENT = 'IMPROVEMENT',
}

export enum QuestionType {
  // Primary Smart Assessment types (per ROADMAP.md Section 1.B)
  LIKERT = 'LIKERT',
  SJT = 'SJT',
  MCQ = 'MCQ',
  
  // Extended types (backwards compatibility)
  LIKERT_SCALE = 'LIKERT_SCALE',
  SITUATIONAL_JUDGMENT = 'SITUATIONAL_JUDGMENT',
  BEHAVIORAL_EXAMPLE = 'BEHAVIORAL_EXAMPLE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  CAPABILITY_ASSESSMENT = 'CAPABILITY_ASSESSMENT',
  SELF_REFLECTION = 'SELF_REFLECTION',
  PEER_FEEDBACK = 'PEER_FEEDBACK',
  FREQUENCY_SCALE = 'FREQUENCY_SCALE',
  OPEN_TEXT = 'OPEN_TEXT',
}

/**
 * Helper to check if a question type is a primary Smart Assessment type.
 * Primary types support advanced scoring (vector weights, ipsative measurement).
 */
export function isPrimaryQuestionType(type: QuestionType): boolean {
  return type === QuestionType.LIKERT || type === QuestionType.SJT || type === QuestionType.MCQ;
}

/**
 * Helper to check if a question type supports vector weights.
 * SJT/SITUATIONAL_JUDGMENT questions can have weights like: {"Leadership": 0.8, "Empathy": -1.0}
 */
export function supportsVectorWeights(type: QuestionType): boolean {
  return type === QuestionType.SJT || type === QuestionType.SITUATIONAL_JUDGMENT;
}

export enum DifficultyLevel {
  FOUNDATIONAL = 'FOUNDATIONAL',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
  SPECIALIZED = 'SPECIALIZED',
}

// ============================================
// TEST SESSION ENUMS
// ============================================

export enum SessionStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
  TIMED_OUT = 'TIMED_OUT'
}

// ============================================
// ASSESSMENT GOAL ENUM
// Per ROADMAP.md Section 1.C - defines scoring strategy
// ============================================

/**
 * Assessment goal types for TestTemplate.
 * Per ROADMAP.md Section 1.C and 1.2 - defines the scoring strategy and test assembly mechanics.
 * 
 * Each goal determines:
 * - How questions are selected (Context filters, difficulty adjustment)
 * - How results are scored (Strategy Pattern)
 * - What output is generated (Competency Passport, Job Fit Score, Team Fit Analysis)
 */
export enum AssessmentGoal {
  /**
   * Scenario A: Universal Baseline (Triple-Standard Aggregation)
   * Generates a "Competency Passport" with Big Five, O*NET, and ESCO mappings.
   * Uses Context Neutrality Filter to exclude role-specific questions.
   * Results are reusable across Job Fit and Team Fit scenarios.
   */
  OVERVIEW = 'OVERVIEW',
  
  /**
   * Scenario B: Job Fit (O*NET Benchmark Injection)
   * Uses O*NET SOC code to load benchmark requirements.
   * Implements Delta Testing - reuses Competency Passport data if available.
   * Applies Weighted Cosine Similarity scoring.
   */
  JOB_FIT = 'JOB_FIT',
  
  /**
   * Scenario C: Team Fit (ESCO Gap Analysis)
   * Uses ESCO URIs for skill normalization across team members.
   * Analyzes personality compatibility using Big Five from Passport.
   * Implements Role Saturation scoring to identify team gaps.
   */
  TEAM_FIT = 'TEAM_FIT'
}

/**
 * Display name and description for AssessmentGoal values.
 * Used for UI rendering and tooltips.
 */
export const AssessmentGoalInfo: Record<AssessmentGoal, { displayName: string; description: string }> = {
  [AssessmentGoal.OVERVIEW]: {
    displayName: 'Universal Baseline',
    description: 'Generates Competency Passport with Big Five personality profile'
  },
  [AssessmentGoal.JOB_FIT]: {
    displayName: 'Job Fit Assessment',
    description: 'Compares candidate against O*NET occupation benchmarks'
  },
  [AssessmentGoal.TEAM_FIT]: {
    displayName: 'Team Fit Analysis',
    description: 'Analyzes skill gaps and personality fit within a team'
  }
};
import { ApprovalStatus, AssessmentGoal, CompetencyCategory, DifficultyLevel, ProficiencyLevel, IndicatorMeasurementType, QuestionType, SessionStatus  } from "../enums/domain_enums";

// ============================================
// LEGACY STANDARD CODE MAPPING (kept for backwards compatibility)
// ============================================

export interface StandardCodeMapping {
  code: string;
  name: string;
  confidence: "LOW" | "MODERATE" | "HIGH" | "VERIFIED";
}

// ============================================
// TRIPLE STANDARD MAPPING (per ROADMAP.md Section 1.A)
// ============================================

/**
 * O*NET reference mapping for occupational standards.
 * Per ROADMAP.md: Used for Job Fit Baseline (Scenario B)
 */
export interface OnetReference {
  code: string;       // e.g., "2.B.1.a"
  name: string;       // e.g., "Social Perceptiveness"
  similarity?: number; // 0.0 - 1.0 confidence score
}

/**
 * ESCO reference mapping for transversal skills.
 * Per ROADMAP.md: Used for Team Fit interoperability (Scenario C)
 */
export interface EscoReference {
  uri: string;        // e.g., "http://data.europa.eu/esco/skill/S1.2"
  label: string;      // e.g., "Working with others"
}

/**
 * Big Five personality category mapping.
 * Per ROADMAP.md: Used for Team Fit / Culture Fit analysis
 */
export type BigFiveCategory = 
  | 'BIG_FIVE_OPENNESS'
  | 'BIG_FIVE_CONSCIENTIOUSNESS'
  | 'BIG_FIVE_EXTRAVERSION'
  | 'BIG_FIVE_AGREEABLENESS'
  | 'BIG_FIVE_NEUROTICISM'
  | 'BIG_FIVE_EMOTIONAL_STABILITY';

/**
 * Triple Standard Mapping for global competency alignment.
 * Per ROADMAP.md Section 1.A "Mapping Strategy":
 * 
 * Benefits:
 * - One answer feeds three analytical models simultaneously
 * - Enables Competency Passport reuse across scenarios
 * - Normalizes local competencies to global standards
 */
export interface TripleStandardCodes {
  /** 1. Psychological Standard (Team Fit / Big Five) */
  global_category?: BigFiveCategory;
  
  /** 2. Occupational Standard (Job Fit Baseline - O*NET) */
  onet_ref?: OnetReference;
  
  /** 3. Transversal Standard (Interoperability - ESCO) */
  esco_ref?: EscoReference;
  
  // Legacy compatibility fields
  ESCO?: StandardCodeMapping;
  ONET?: StandardCodeMapping;
  BIG_FIVE?: StandardCodeMapping;
  [key: string]: StandardCodeMapping | OnetReference | EscoReference | BigFiveCategory | undefined;
}

/** @deprecated Use TripleStandardCodes instead */
export interface StandardCodes {
  ESCO?: StandardCodeMapping;
  ONET?: StandardCodeMapping;
  BIG_FIVE?: StandardCodeMapping;
  [key: string]: StandardCodeMapping | undefined;
}

export interface BehavioralIndicator {
  id: string;
  title: string;
  description?: string;
  observabilityLevel: ProficiencyLevel;
  measurementType: IndicatorMeasurementType;
  weight: number;
  examples?: string;
  counterExamples?: string;
  isActive: boolean;
  approvalStatus: ApprovalStatus;
  orderIndex: number;
  competencyId: string;
}

/**
 * Metadata schema for AssessmentQuestion.
 * Per ROADMAP.md Section 1.B: Allows filtering questions by context and difficulty.
 * Used by Context Neutrality Filter in Scenario A (Universal Baseline)
 */
export interface QuestionMetadata {
  tags?: string[];  // e.g., ["IT", "JUNIOR", "GENERAL"]
  difficulty?: string;  // e.g., "HARD"
  time_limit_sec?: number;
  context?: 'UNIVERSAL' | 'IT' | 'SALES' | 'FINANCE' | 'HEALTHCARE' | string;
  scenario_type?: 'WORKPLACE' | 'INTERPERSONAL' | 'LEADERSHIP' | string;
  measurement_target?: 'BEHAVIORAL' | 'COGNITIVE' | 'EMOTIONAL' | string;
}

/**
 * Answer option with optional vector weights for SJT questions.
 * Per ROADMAP.md Section 1.B: SJT questions support ipsative scoring.
 */
export interface AnswerOption {
  id?: string;
  text?: string;
  label?: string;
  value?: number;
  score?: number;
  correct?: boolean;
  explanation?: string;
  effectiveness?: number;
  /** Vector weights for SJT (Situational Judgment) questions */
  weights?: Record<string, number>;  // e.g., { "Leadership": 0.8, "Empathy": -1.0 }
}

export interface AssessmentQuestion {
  id: string;
  behavioralIndicatorId: string;
  questionText: string;
  questionType: QuestionType;
  answerOptions?: AnswerOption[];
  scoringRubric: string;
  timeLimit?: number;
  difficultyLevel: DifficultyLevel;
  /**
   * Metadata JSONB field for flexible tagging and context filtering.
   * Per ROADMAP.md Section 1.B: Allows filtering questions by context and difficulty
   */
  metadata?: QuestionMetadata;
  isActive: boolean;
  orderIndex: number;
}

// ============================================
// ASSESSMENT QUESTION HELPER FUNCTIONS
// Per ROADMAP.md Section 1.B for Context Neutrality filtering
// ============================================

/**
 * Get tags from question metadata.
 * @returns Array of tags or empty array if none
 */
export function getQuestionTags(question: AssessmentQuestion): string[] {
  return question.metadata?.tags ?? [];
}

/**
 * Check if a question has a specific tag (case-insensitive).
 * Used for Context Neutrality Filter in test assembly.
 */
export function questionHasTag(question: AssessmentQuestion, tag: string): boolean {
  return getQuestionTags(question).some(t => t.toLowerCase() === tag.toLowerCase());
}

/**
 * Check if a question is context-neutral.
 * Per ROADMAP.md: Questions with GENERAL/UNIVERSAL tags or without narrow tags (IT, SALES, FINANCE)
 * Used in Scenario A (Universal Baseline) to filter out context-specific questions.
 */
export function isContextNeutral(question: AssessmentQuestion): boolean {
  const tags = getQuestionTags(question);
  if (tags.length === 0) return true;
  if (questionHasTag(question, 'GENERAL') || questionHasTag(question, 'UNIVERSAL')) return true;
  // Check for narrow context tags
  const narrowTags = ['IT', 'SALES', 'FINANCE', 'HEALTHCARE'];
  return !narrowTags.some(t => questionHasTag(question, t));
}

export interface Competency {
  id: string;
  name: string;
  description: string;
  category: CompetencyCategory;
  level: ProficiencyLevel;
  /**
   * Triple Standard Mapping for global competency alignment.
   * Per ROADMAP.md Section 1.A - supports Big Five, O*NET, and ESCO mappings
   */
  standardCodes?: TripleStandardCodes;
  isActive: boolean;
  approvalStatus: ApprovalStatus;
  behavioralIndicators?: BehavioralIndicator[];
  version: number;
  createdAt: string;
  lastModified: string;
}

// ============================================
// COMPETENCY HELPER FUNCTIONS
// Per ROADMAP.md Section 1.A for Triple Standard support
// ============================================

/**
 * Get the Big Five psychological category mapping from a competency.
 * @returns Big Five category string or undefined if not mapped
 */
export function getBigFiveCategory(competency: Competency): BigFiveCategory | undefined {
  return competency.standardCodes?.global_category;
}

/**
 * Get the O*NET reference mapping from a competency.
 * @returns O*NET reference object or undefined if not mapped
 */
export function getOnetRef(competency: Competency): OnetReference | undefined {
  return competency.standardCodes?.onet_ref;
}

/**
 * Get the O*NET code (e.g., "2.B.1.a") from a competency.
 * @returns O*NET code string or undefined
 */
export function getOnetCode(competency: Competency): string | undefined {
  return competency.standardCodes?.onet_ref?.code;
}

/**
 * Get the ESCO reference mapping from a competency.
 * @returns ESCO reference object or undefined if not mapped
 */
export function getEscoRef(competency: Competency): EscoReference | undefined {
  return competency.standardCodes?.esco_ref;
}

/**
 * Get the ESCO URI from a competency.
 * @returns ESCO URI string or undefined
 */
export function getEscoUri(competency: Competency): string | undefined {
  return competency.standardCodes?.esco_ref?.uri;
}

/**
 * Check if a competency has complete Triple Standard mapping.
 * Per ROADMAP.md: Required for Scenario A (Universal Baseline) to generate Competency Passport
 * @returns true if Big Five, O*NET, and ESCO mappings are all present
 */
export function hasTripleStandardMapping(competency: Competency): boolean {
  const codes = competency.standardCodes;
  if (!codes) return false;
  return !!(codes.global_category && codes.onet_ref && codes.esco_ref);
}

export interface DashboardStats {
  totalCompetencies: number;
  totalBehavioralIndicators: number;
  totalAssessmentQuestions: number;
  competenciesByCategory: { [key: string]: number };
  competenciesByLevel: { [key: string]: number };
  averageIndicatorsPerCompetency: number;
}

// ============================================
// TEST TEMPLATE INTERFACES
// Per ROADMAP.md Section 1.C - supports goal-based scoring strategies
// ============================================

/**
 * Blueprint configuration structure varies by AssessmentGoal:
 * 
 * OVERVIEW:
 * - No additional configuration required
 * 
 * JOB_FIT:
 * - onet_soc_code: O*NET occupation code (e.g., "15-1252.00" for Software Developers)
 * 
 * TEAM_FIT:
 * - team_id: Reference to team for gap analysis
 */
export interface TestTemplateBlueprint {
  onet_soc_code?: string;  // For JOB_FIT
  team_id?: string;        // For TEAM_FIT
  [key: string]: unknown;  // Allow additional properties
}

export interface TestTemplate {
  id: string;
  name: string;
  description?: string;
  /**
   * Assessment goal determining scoring strategy.
   * Per ROADMAP.md Section 1.C: OVERVIEW, JOB_FIT, or TEAM_FIT
   */
  goal: AssessmentGoal;
  /**
   * Blueprint configuration varying by goal type.
   * OVERVIEW: Empty or minimal
   * JOB_FIT: { onet_soc_code: "15-1252.00" }
   * TEAM_FIT: { team_id: "uuid" }
   */
  blueprint?: TestTemplateBlueprint;
  /** @deprecated Use blueprint.competency_ids or specific goal-based selection */
  competencyIds: string[];
  questionsPerIndicator: number;
  timeLimitMinutes: number;
  passingScore: number;
  isActive: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  allowSkip: boolean;
  allowBackNavigation: boolean;
  showResultsImmediately: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TestTemplateSummary {
  id: string;
  name: string;
  description?: string;
  /**
   * Assessment goal for display/filtering purposes.
   * Per ROADMAP.md Section 1.C: OVERVIEW, JOB_FIT, or TEAM_FIT
   */
  goal: AssessmentGoal;
  competencyCount: number;
  timeLimitMinutes: number;
  passingScore: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateTestTemplateRequest {
  name: string;
  description?: string;
  /**
   * Assessment goal determining scoring strategy.
   * Defaults to OVERVIEW if not provided.
   */
  goal?: AssessmentGoal;
  /**
   * Blueprint configuration varying by goal type.
   * JOB_FIT: { onet_soc_code: "15-1252.00" }
   * TEAM_FIT: { team_id: "uuid" }
   */
  blueprint?: TestTemplateBlueprint;
  /** @deprecated Use blueprint for goal-specific competency selection */
  competencyIds?: string[];
  questionsPerIndicator?: number;
  timeLimitMinutes?: number;
  passingScore?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  allowSkip?: boolean;
  allowBackNavigation?: boolean;
  showResultsImmediately?: boolean;
}

export interface UpdateTestTemplateRequest {
  name?: string;
  description?: string;
  /**
   * Assessment goal determining scoring strategy.
   */
  goal?: AssessmentGoal;
  /**
   * Blueprint configuration varying by goal type.
   */
  blueprint?: TestTemplateBlueprint;
  /** @deprecated Use blueprint for goal-specific competency selection */
  competencyIds?: string[];
  questionsPerIndicator?: number;
  timeLimitMinutes?: number;
  passingScore?: number;
  isActive?: boolean;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  allowSkip?: boolean;
  allowBackNavigation?: boolean;
  showResultsImmediately?: boolean;
}

// ============================================
// TEST SESSION INTERFACES
// ============================================

export interface TestSession {
  id: string;
  templateId: string;
  templateName: string;
  clerkUserId: string;
  status: SessionStatus;
  startedAt?: string;
  completedAt?: string;
  currentQuestionIndex: number;
  timeRemainingSeconds?: number;
  questionOrder: string[];
  totalQuestions: number;
  answeredQuestions: number;
  lastActivityAt?: string;
  createdAt: string;
}

export interface TestSessionSummary {
  id: string;
  templateId: string;
  templateName: string;
  status: SessionStatus;
  startedAt?: string;
  completedAt?: string;
  totalQuestions: number;
  answeredQuestions: number;
  createdAt: string;
}

export interface StartTestSessionRequest {
  templateId: string;
  clerkUserId: string;
}

export interface SessionQuestion {
  id: string;
  questionText: string;
  questionType: QuestionType;
  answerOptions?: Array<{
    id?: string;
    text?: string;
    label?: string;
    value?: number;
    score?: number;
  }>;
  difficultyLevel: DifficultyLevel;
  timeLimit?: number;
  behavioralIndicatorId: string;
  competencyId?: string;
  isAnswered?: boolean;
  isSkipped?: boolean;
}

export interface CurrentQuestionResponse {
  sessionId: string;
  question: SessionQuestion;
  questionNumber: number;
  totalQuestions: number;
  previousAnswer?: TestAnswer;
  allowSkip: boolean;
  allowBackNavigation: boolean;
  timeRemainingSeconds?: number;
}

// ============================================
// TEST ANSWER INTERFACES
// ============================================

export interface TestAnswer {
  id?: string;
  sessionId: string;
  questionId: string;
  selectedOptionIds?: string[];
  likertValue?: number;
  rankingOrder?: string[];
  textResponse?: string;
  timeSpentSeconds: number;
  isSkipped: boolean;
  answeredAt?: string;
}

export interface SubmitAnswerRequest {
  sessionId: string;
  questionId: string;
  selectedOptionIds?: string[];
  likertValue?: number;
  rankingOrder?: string[];
  textResponse?: string;
  timeSpentSeconds: number;
  isSkipped?: boolean;
}

// ============================================
// TEST RESULT INTERFACES
// ============================================

export interface TestResult {
  id: string;
  sessionId: string;
  templateId: string;
  templateName: string;
  clerkUserId: string;
  overallScore: number;
  overallPercentage: number;
  percentile?: number;
  passed: boolean;
  competencyScores: CompetencyScore[];
  totalTimeSeconds: number;
  questionsAnswered: number;
  questionsSkipped: number;
  totalQuestions: number;
  completedAt: string;
}

export interface CompetencyScore {
  competencyId: string;
  competencyName: string;
  competencyCategory?: string;
  score: number;
  maxScore: number;
  percentage: number;
  weight?: number;
  indicatorScores?: IndicatorScore[];
}

export interface IndicatorScore {
  indicatorId: string;
  indicatorTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  questionsAnswered: number;
  questionScores?: QuestionScore[];
}

export interface QuestionScore {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  score: number;
  maxScore: number;
  userAnswer?: string;
  correctAnswer?: string;
  timeSpentSeconds: number;
}

export interface UserStatistics {
  clerkUserId: string;
  totalTestsCompleted: number;
  averageScore: number;
  averagePercentage: number;
  totalTimeSpent: number;
  passRate: number;
}

export interface TemplateStatistics {
  templateId: string;
  templateName: string;
  totalCompletions: number;
  averageScore: number;
  passRate: number;
  averageTimeSeconds: number;
}
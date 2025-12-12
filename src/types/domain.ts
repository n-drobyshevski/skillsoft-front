/**
 * Domain types, enums, and interfaces for the Skillsoft application.
 * Consolidated from app/enums/domain_enums.ts and app/interfaces/domain-interfaces.ts
 */

// ============================================
// ENUMS
// ============================================

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
  UNDER_REVISION = 'UNDER_REVISION'
}

/**
 * Context Scope for Behavioral Indicators - Smart Assessment Two-Tier Filtering
 * Used to ensure context-neutral assessments in Scenario A (Universal Baseline)
 * Per ROADMAP.md Section 1.B and Smart Assessment documentation
 */
export enum ContextScope {
  /** Context-neutral - Applies to all humans regardless of job role (e.g., Active Listening, Emotional Regulation) */
  UNIVERSAL = 'UNIVERSAL',
  /** White-collar jobs - Office environments (e.g., Email Etiquette, Meeting Facilitation) */
  PROFESSIONAL = 'PROFESSIONAL',
  /** Technical roles - IT, Engineering, Data Science (e.g., Code Review, Technical Documentation) */
  TECHNICAL = 'TECHNICAL',
  /** Leadership roles - People management and organizational leadership (e.g., Delegation, Performance Feedback) */
  MANAGERIAL = 'MANAGERIAL'
}

export enum IndicatorMeasurementType {
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
  SINGLE_CHOICE = 'SINGLE_CHOICE',
}

export enum DifficultyLevel {
  FOUNDATIONAL = 'FOUNDATIONAL',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
  SPECIALIZED = 'SPECIALIZED',
}

export enum SessionStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
  TIMED_OUT = 'TIMED_OUT'
}

export type AnswerValue = string | number | string[];

/** @deprecated Use TestSession interface below - kept for backwards compatibility */
export interface LegacyTestSession {
  id: string;
  templateId: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED' | 'EXPIRED';
  currentQuestionIndex: number;
  startTime: string;
  endTime?: string;
  questions: SessionQuestion[];
  answers?: Array<{
    questionId: string;
    value: AnswerValue;
    timeSpentMs?: number;
  }>;
}

/**
 * Assessment goal types for TestTemplate.
 * Per ROADMAP.md Section 1.C and 1.2 - defines the scoring strategy and test assembly mechanics.
 */
export enum AssessmentGoal {
  /**
   * Scenario A: Universal Baseline (Triple-Standard Aggregation)
   * Generates a "Competency Passport" with Big Five, O*NET, and ESCO mappings.
   */
  OVERVIEW = 'OVERVIEW',
  
  /**
   * Scenario B: Job Fit (O*NET Benchmark Injection)
   * Uses O*NET SOC code to load benchmark requirements.
   */
  JOB_FIT = 'JOB_FIT',
  
  /**
   * Scenario C: Team Fit (ESCO Gap Analysis)
   * Uses ESCO URIs for skill normalization across team members.
   */
  TEAM_FIT = 'TEAM_FIT'
}

/**
 * Display name and description for AssessmentGoal values.
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

// ============================================
// ENUM HELPER FUNCTIONS
// ============================================

/**
 * Helper to check if a question type is a primary Smart Assessment type.
 */
export function isPrimaryQuestionType(type: QuestionType): boolean {
  return type === QuestionType.LIKERT || type === QuestionType.SJT || type === QuestionType.MCQ;
}

/**
 * Helper to check if a question type supports vector weights.
 */
export function supportsVectorWeights(type: QuestionType): boolean {
  return type === QuestionType.SJT || type === QuestionType.SITUATIONAL_JUDGMENT;
}

// ============================================
// STANDARD CODE INTERFACES
// ============================================

/**
 * Big Five Personality Dimensions (OCEAN Model)
 * Used for psychological profiling and personality-based competency mapping.
 */
export type BigFiveDimension = 
  | 'OPENNESS'
  | 'CONSCIENTIOUSNESS' 
  | 'EXTRAVERSION'
  | 'AGREEABLENESS'
  | 'EMOTIONAL_STABILITY';

/**
 * Display information for Big Five dimensions
 */
export const BigFiveInfo: Record<BigFiveDimension, { displayName: string; description: string; color: string }> = {
  OPENNESS: {
    displayName: 'Openness',
    description: 'Creativity, curiosity, and openness to new experiences',
    color: 'purple'
  },
  CONSCIENTIOUSNESS: {
    displayName: 'Conscientiousness',
    description: 'Organization, dependability, and self-discipline',
    color: 'green'
  },
  EXTRAVERSION: {
    displayName: 'Extraversion',
    description: 'Sociability, assertiveness, and positive emotions',
    color: 'orange'
  },
  AGREEABLENESS: {
    displayName: 'Agreeableness',
    description: 'Cooperation, trust, and concern for others',
    color: 'blue'
  },
  EMOTIONAL_STABILITY: {
    displayName: 'Emotional Stability',
    description: 'Calmness, resilience, and stress tolerance',
    color: 'teal'
  }
};

/**
 * All Big Five dimensions as an array for iteration
 */
export const BIG_FIVE_DIMENSIONS: BigFiveDimension[] = [
  'OPENNESS',
  'CONSCIENTIOUSNESS',
  'EXTRAVERSION',
  'AGREEABLENESS',
  'EMOTIONAL_STABILITY'
];

/**
 * O*NET Reference DTO - matches backend StandardCodesDto.OnetRefDto
 * O*NET codes follow patterns like "2.B.1.a" for abilities, skills, knowledge
 * 
 * NOTE: Uses camelCase to match Java record field names for proper Jackson deserialization.
 * The backend may serialize to snake_case but accepts camelCase for deserialization.
 */
export interface OnetRefDto {
  /** O*NET element code (e.g., "2.B.1.a") */
  code: string;
  /** Human-readable title from O*NET database */
  title?: string;
  /** Type of O*NET element: ability, skill, knowledge, work_activity, work_style */
  elementType?: 'ability' | 'skill' | 'knowledge' | 'work_activity' | 'work_style' | 'interest' | 'work_value' | 'work_context';
}

/**
 * ESCO Reference DTO - matches backend StandardCodesDto.EscoRefDto
 * ESCO URIs are persistent identifiers from the European Commission's ESCO classification
 * 
 * NOTE: Uses camelCase to match Java record field names.
 */
export interface EscoRefDto {
  /** ESCO persistent URI (e.g., "http://data.europa.eu/esco/skill/...") */
  uri: string;
  /** Human-readable label from ESCO */
  title?: string;
  /** Type classification: skill, competence, knowledge, language, transversal */
  skillType?: 'skill' | 'competence' | 'knowledge' | 'language' | 'transversal';
}

/**
 * Big Five Reference DTO - matches backend StandardCodesDto.BigFiveRefDto
 * Follows the same pattern as OnetRefDto and EscoRefDto.
 * 
 * Uses simple field names: trait (like code in ONET), title, facet (like elementType/skillType)
 */
export interface BigFiveRefDto {
  /** Big Five personality dimension code (e.g., "CONSCIENTIOUSNESS") */
  trait: BigFiveDimension;
  /** Human-readable display name (e.g., "Conscientiousness") */
  title?: string;
  /** Optional sub-facet of the trait (e.g., "achievement_striving", "self_discipline") */
  facet?: string;
}

/**
 * Helper to get Big Five dimension from BigFiveRefDto
 */
export function getEffectiveBigFive(bigFiveRef?: BigFiveRefDto): BigFiveDimension | null {
  if (!bigFiveRef) return null;
  return bigFiveRef.trait || null;
}

/**
 * Helper to get effective facet from BigFiveRefDto
 */
export function getEffectiveDimension(bigFiveRef?: BigFiveRefDto): string | null {
  if (!bigFiveRef) return null;
  return bigFiveRef.facet || null;
}

/**
 * Standard Codes DTO - matches backend StandardCodesDto
 * Type-safe container for O*NET, ESCO, and Big Five standard mappings
 * 
 * NOTE: Uses camelCase to match Java record field names.
 */
export interface StandardCodesDto {
  bigFiveRef?: BigFiveRefDto;
  onetRef?: OnetRefDto;
  escoRef?: EscoRefDto;
}

// Legacy interfaces for backwards compatibility
/** @deprecated Use OnetRefDto instead */
export interface OnetReference {
  code: string;
  name: string;
  similarity?: number;
}

/** @deprecated Use EscoRefDto instead */
export interface EscoReference {
  uri: string;
  label: string;
}

/** @deprecated Use GlobalCategoryDto.domain with "big_five" prefix */
export type BigFiveCategory = 
  | 'BIG_FIVE_OPENNESS'
  | 'BIG_FIVE_CONSCIENTIOUSNESS'
  | 'BIG_FIVE_EXTRAVERSION'
  | 'BIG_FIVE_AGREEABLENESS'
  | 'BIG_FIVE_NEUROTICISM'
  | 'BIG_FIVE_EMOTIONAL_STABILITY';

/** @deprecated Use StandardCodesDto instead */
export interface StandardCodeMapping {
  code: string;
  name: string;
  confidence: "LOW" | "MODERATE" | "HIGH" | "VERIFIED";
}

/** @deprecated Use StandardCodesDto instead */
export interface TripleStandardCodes {
  bigFiveRef?: BigFiveRefDto | BigFiveCategory;
  onetRef?: OnetRefDto | OnetReference;
  escoRef?: EscoRefDto | EscoReference;
  ESCO?: StandardCodeMapping;
  ONET?: StandardCodeMapping;
  BIG_FIVE?: StandardCodeMapping;
  [key: string]: StandardCodeMapping | OnetRefDto | OnetReference | EscoRefDto | EscoReference | BigFiveRefDto | BigFiveCategory | undefined;
}

/** @deprecated Use StandardCodesDto instead */
export interface StandardCodes {
  ESCO?: StandardCodeMapping;
  ONET?: StandardCodeMapping;
  BIG_FIVE?: StandardCodeMapping;
  [key: string]: StandardCodeMapping | undefined;
}

// ============================================
// CORE DOMAIN INTERFACES
// ============================================

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
  /** Context scope for Smart Assessment filtering - defaults to UNIVERSAL for backward compatibility */
  contextScope?: ContextScope;
}

/**
 * Question Metadata JSONB structure for Smart Assessment filtering
 * Two-Tier Scoping System: Macro-level (BehavioralIndicator.contextScope) + Micro-level (tags)
 * Per ROADMAP.md Section 1.B: Context Neutrality Filter and Smart Assessment documentation
 */
export interface QuestionMetadata {
  /**
   * Tags for context filtering and difficulty markers
   * 
   * Controlled Vocabulary:
   * - GENERAL: Context-neutral questions for Scenario A (Universal Baseline) - CRITICAL for Competency Passport
   * - Domain markers: IT, SALES, FINANCE, MEDICAL, ENGINEERING - Industry-specific context for Scenario B
   * - Complexity markers: JUNIOR, MID, SENIOR - Adaptive difficulty for role-appropriate assessments
   * 
   * Usage Examples:
   * - Scenario A (Universal Baseline): ["GENERAL", "JUNIOR"] - Context-neutral, entry-level
   * - Scenario B (Job Fit - IT): ["IT", "MID"] - Technical context, mid-career complexity
   * - Scenario C (Team Fit): ["SALES", "SENIOR", "FINANCE"] - Domain-specific, senior-level
   */
  tags?: string[];
  /** Difficulty score 0.0-1.0 for adaptive testing */
  difficulty?: string;
  /** Time limit in seconds for this specific question */
  time_limit_sec?: number;
  /** @deprecated Use tags array instead - kept for backward compatibility */
  context?: 'UNIVERSAL' | 'IT' | 'SALES' | 'FINANCE' | 'HEALTHCARE' | string;
  /** Scenario type classification */
  scenario_type?: 'WORKPLACE' | 'INTERPERSONAL' | 'LEADERSHIP' | string;
  /** Target measurement dimension */
  measurement_target?: 'BEHAVIORAL' | 'COGNITIVE' | 'EMOTIONAL' | string;
}

export interface AnswerOption {
  id?: string;
  text?: string;
  label?: string;
  value?: number;
  score?: number;
  correct?: boolean;
  explanation?: string;
  effectiveness?: number;
  weights?: Record<string, number>;
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
  metadata?: QuestionMetadata;
  isActive: boolean;
  orderIndex: number;
}

export interface Competency {
  id: string;
  name: string;
  description: string;
  category: CompetencyCategory;
  level: ProficiencyLevel;
  standardCodes?: StandardCodesDto;
  isActive: boolean;
  approvalStatus: ApprovalStatus;
  behavioralIndicators?: BehavioralIndicator[];
  version: number;
  createdAt: string;
  lastModified: string;
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
// QUESTION HELPER FUNCTIONS
// ============================================

export function getQuestionTags(question: AssessmentQuestion): string[] {
  return question.metadata?.tags ?? [];
}

export function questionHasTag(question: AssessmentQuestion, tag: string): boolean {
  return getQuestionTags(question).some(t => t.toLowerCase() === tag.toLowerCase());
}

export function isContextNeutral(question: AssessmentQuestion): boolean {
  const tags = getQuestionTags(question);
  if (tags.length === 0) return true;
  if (questionHasTag(question, 'GENERAL') || questionHasTag(question, 'UNIVERSAL')) return true;
  const narrowTags = ['IT', 'SALES', 'FINANCE', 'HEALTHCARE'];
  return !narrowTags.some(t => questionHasTag(question, t));
}

// ============================================
// COMPETENCY HELPER FUNCTIONS
// ============================================

export function getBigFiveRef(competency: Competency): BigFiveRefDto | undefined {
  return competency.standardCodes?.bigFiveRef;
}

export function getOnetRef(competency: Competency): OnetRefDto | undefined {
  return competency.standardCodes?.onetRef;
}

export function getOnetCode(competency: Competency): string | undefined {
  return competency.standardCodes?.onetRef?.code;
}

export function getEscoRef(competency: Competency): EscoRefDto | undefined {
  return competency.standardCodes?.escoRef;
}

export function getEscoUri(competency: Competency): string | undefined {
  return competency.standardCodes?.escoRef?.uri;
}

export function hasTripleStandardMapping(competency: Competency): boolean {
  const codes = competency.standardCodes;
  if (!codes) return false;
  return !!(codes.bigFiveRef && codes.onetRef && codes.escoRef);
}

// ============================================
// TEST TEMPLATE INTERFACES
// ============================================

export interface TestTemplateBlueprint {
  onet_soc_code?: string;
  team_id?: string;
  [key: string]: unknown;
}

export interface TestTemplate {
  id: string;
  name: string;
  description?: string;
  goal: AssessmentGoal;
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
  goal?: AssessmentGoal;
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
  goal?: AssessmentGoal;
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
  scenario?: string;
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
  questionIndex: number;  // Backend uses questionIndex, not questionNumber
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
  timeSpentSeconds?: number;
  skip?: boolean;
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
  questionsAnswered?: number; // Number of questions answered for this competency
  weight?: number;
  onetCode?: string; // O*NET code for Big Five projection
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

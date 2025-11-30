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

export interface StandardCodeMapping {
  code: string;
  name: string;
  confidence: "LOW" | "MODERATE" | "HIGH" | "VERIFIED";
}

export interface OnetReference {
  code: string;
  name: string;
  similarity?: number;
}

export interface EscoReference {
  uri: string;
  label: string;
}

export type BigFiveCategory = 
  | 'BIG_FIVE_OPENNESS'
  | 'BIG_FIVE_CONSCIENTIOUSNESS'
  | 'BIG_FIVE_EXTRAVERSION'
  | 'BIG_FIVE_AGREEABLENESS'
  | 'BIG_FIVE_NEUROTICISM'
  | 'BIG_FIVE_EMOTIONAL_STABILITY';

export interface TripleStandardCodes {
  global_category?: BigFiveCategory;
  onet_ref?: OnetReference;
  esco_ref?: EscoReference;
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
}

export interface QuestionMetadata {
  tags?: string[];
  difficulty?: string;
  time_limit_sec?: number;
  context?: 'UNIVERSAL' | 'IT' | 'SALES' | 'FINANCE' | 'HEALTHCARE' | string;
  scenario_type?: 'WORKPLACE' | 'INTERPERSONAL' | 'LEADERSHIP' | string;
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
  standardCodes?: TripleStandardCodes;
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

export function getBigFiveCategory(competency: Competency): BigFiveCategory | undefined {
  return competency.standardCodes?.global_category;
}

export function getOnetRef(competency: Competency): OnetReference | undefined {
  return competency.standardCodes?.onet_ref;
}

export function getOnetCode(competency: Competency): string | undefined {
  return competency.standardCodes?.onet_ref?.code;
}

export function getEscoRef(competency: Competency): EscoReference | undefined {
  return competency.standardCodes?.esco_ref;
}

export function getEscoUri(competency: Competency): string | undefined {
  return competency.standardCodes?.esco_ref?.uri;
}

export function hasTripleStandardMapping(competency: Competency): boolean {
  const codes = competency.standardCodes;
  if (!codes) return false;
  return !!(codes.global_category && codes.onet_ref && codes.esco_ref);
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

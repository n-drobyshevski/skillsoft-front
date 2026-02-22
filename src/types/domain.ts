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

export enum ObservabilityLevel {
  DIRECTLY_OBSERVABLE = 'DIRECTLY_OBSERVABLE',
  PARTIALLY_OBSERVABLE = 'PARTIALLY_OBSERVABLE',
  INFERRED = 'INFERRED',
  SELF_REPORTED = 'SELF_REPORTED',
  REQUIRES_DOCUMENTATION = 'REQUIRES_DOCUMENTATION',
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

// ============================================
// O*NET OCCUPATION TYPES (Goal-Aware Blueprint)
// ============================================

/**
 * O*NET Job Title for occupation search/selection.
 * Used in JOB_FIT goal configuration to select the target job.
 * Different from skills.ts ONetOccupation which is for O*NET element relationships.
 */
export interface ONetJobTitle {
  /** O*NET SOC code (e.g., "15-1252.00") */
  socCode: string;
  /** Job title (e.g., "Software Developers") */
  title: string;
  /** Job description */
  description: string;
}

/**
 * Single competency benchmark from O*NET occupation profile.
 */
export interface ONetBenchmark {
  /** Internal competency code */
  competencyCode: string;
  /** Human-readable competency name */
  competencyName: string;
  /** Required proficiency level (1-7 scale) */
  requiredLevel: number;
  /** Importance rating (1-5 scale) */
  importance: number;
}

/**
 * Complete O*NET occupation profile with benchmarks.
 * Fetched after selecting an occupation for JOB_FIT assessment.
 */
export interface ONetProfile {
  /** O*NET SOC code */
  socCode: string;
  /** Full occupation title */
  occupationTitle: string;
  /** Competency benchmarks for this occupation */
  benchmarks: ONetBenchmark[];
  /** Knowledge areas required */
  knowledgeAreas: string[];
  /** Skills required */
  skills: string[];
}

// ============================================
// TEAM TYPES (Goal-Aware Blueprint)
// ============================================

/**
 * Team summary for selection dropdown.
 */
export interface Team {
  id: string;
  name: string;
  memberCount: number;
  createdAt: string;
}

/**
 * Individual team member's skill data.
 */
export interface TeamMemberSkill {
  memberId: string;
  memberName: string;
  competencyId: string;
  score: number;
}

/**
 * Team profile with saturation analysis.
 * Used for TEAM_FIT goal configuration.
 */
export interface TeamProfile {
  teamId: string;
  teamName: string;
  /** Saturation per competency (competencyId -> 0.0-1.0) */
  saturation: Record<string, number>;
  /** Competency names that are undersaturated */
  undersaturatedCompetencies: string[];
  /** Individual member skill breakdown */
  memberSkills: TeamMemberSkill[];
}

// ============================================
// PASSPORT TYPES (Delta Testing)
// ============================================

/**
 * Big Five personality profile scores.
 * OCEAN model dimensions normalized to 0-100.
 */
export interface BigFiveProfileScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  emotionalStability: number;
}

/**
 * Competency Passport - candidate's comprehensive skill profile.
 * Generated from OVERVIEW assessments, used for Delta Testing in JOB_FIT.
 */
export interface CompetencyPassport {
  id: string;
  candidateId: string;
  clerkUserId: string;
  lastUpdated: string;
  /** Competency scores (competencyId -> score 0-100) */
  scores: Record<string, number>;
  /** Big Five personality profile (if assessed) */
  bigFiveProfile?: BigFiveProfileScores;
  /** Whether passport is still valid */
  isValid: boolean;
  /** Expiration date if applicable */
  expiresAt?: string;
}

// ============================================
// GOAL-SPECIFIC BLUEPRINT CONFIG TYPES
// ============================================

/**
 * OVERVIEW goal blueprint configuration.
 * Generates comprehensive Competency Passport.
 */
export interface OverviewBlueprintConfig {
  competencyIds: string[];
  questionsPerIndicator: number;
  includeBigFive: boolean;
  preferredDifficulty?: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
}

/**
 * JOB_FIT goal blueprint configuration.
 * Evaluates candidate against O*NET occupation benchmarks.
 */
export interface JobFitBlueprintConfig {
  /** O*NET SOC code for target occupation */
  onetSocCode: string;
  /** Strictness level 0-100 (how closely to match benchmarks) */
  strictnessLevel: number;
  /** Candidate's Clerk user ID for delta testing */
  candidateClerkUserId?: string;
  /** Enable delta testing (skip already-measured competencies) */
  enableDeltaTesting?: boolean;
  /** Optional competency override (instead of O*NET defaults) */
  competencyOverride?: string[];
}

/**
 * TEAM_FIT goal blueprint configuration.
 * Analyzes candidate's fit within existing team composition.
 */
export interface TeamFitBlueprintConfig {
  /** Target team ID */
  teamId: string;
  /** Saturation threshold 0.0-1.0 (defines what's "undersaturated") */
  saturationThreshold: number;
  /** Optional competency override */
  competencyOverride?: string[];
}

/**
 * Union type for goal-specific configurations.
 */
export type GoalSpecificConfig =
  | { goal: 'OVERVIEW'; config: OverviewBlueprintConfig }
  | { goal: 'JOB_FIT'; config: JobFitBlueprintConfig }
  | { goal: 'TEAM_FIT'; config: TeamFitBlueprintConfig };

// ============================================
// ASSEMBLY PROGRESS TYPES
// ============================================

/**
 * Assembly phase during test preparation.
 */
export type AssemblyPhase =
  | 'INITIALIZING'
  | 'SELECTING'
  | 'VALIDATING'
  | 'SHUFFLING'
  | 'COMPLETE'
  | 'FAILED';

/**
 * Real-time progress during test assembly.
 * Used for progress modal during test start.
 */
export interface AssemblyProgress {
  sessionId: string;
  templateId: string;
  phase: AssemblyPhase;
  totalCompetencies: number;
  processedCompetencies: number;
  questionsSelected: number;
  percentComplete: number;
  elapsedMillis: number;
  message: string;
  inProgress: boolean;
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
  observabilityLevel: ObservabilityLevel;
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
  /**
   * Indicates whether the template has a valid typed blueprint for test assembly.
   * Frontend should disable "Start Test" button when this is false.
   */
  hasValidBlueprint?: boolean;
  /** Version number (1 for originals, increments with each version) */
  version?: number;
  /** ID of the parent template (previous version in the chain) */
  parentId?: string | null;
  /** Lifecycle status: DRAFT, PUBLISHED, or ARCHIVED */
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
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
  /** Lifecycle status */
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

/**
 * Minimal template data needed for catalog cards.
 * Shared between Available Tests and Shared with Me views.
 */
export type TemplateCardData = Pick<TestTemplateSummary,
  'id' | 'name' | 'description' | 'goal' | 'competencyCount' |
  'timeLimitMinutes' | 'passingScore' | 'isActive'
>;

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

/**
 * Result status enum for test scoring workflow.
 * Matches backend TestResult.status field.
 *
 * Status transitions:
 * - PENDING: Scoring in progress (retries active, fallback to scheduled job)
 * - COMPLETED: Scoring successful, all data available
 * - FAILED: All scoring attempts exhausted, requires manual intervention
 */
export type ResultStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

/**
 * Response consistency analysis fields.
 * Populated by backend consistency analysis across all assessment goals.
 */
export interface ConsistencyMetrics {
  /** Overall response consistency score (0-1). Higher = more consistent. */
  consistencyScore?: number;
  /** Human-readable consistency warning flags */
  consistencyFlags?: string[];
  /** Rate of speed anomalies detected (0-1). Higher = more anomalies. */
  speedAnomalyRate?: number;
  /** Rate of straight-lining detected (0-1). Higher = more straight-lining. */
  straightLiningRate?: number;
}

/**
 * Extended metrics for TEAM_FIT assessment results.
 * Populated by TeamFitScoringStrategy on backend.
 */
export interface TeamFitExtendedMetrics extends ConsistencyMetrics {
  /** Ratio of unique skills candidate brings to team (0-1) */
  diversityRatio: number;
  /** Ratio of overlapping skills with team (0-1) */
  saturationRatio: number;
  /** Multiplier applied to final score based on team fit */
  teamFitMultiplier: number;
  /** Count of competencies contributing to diversity */
  diversityCount: number;
  /** Count of competencies already saturated in team */
  saturationCount: number;
  /** Count of competency gaps candidate can fill */
  gapCount: number;
  /** Per-competency team saturation scores (competencyId -> saturation %). Populated by backend v2+. */
  competencySaturation?: Record<string, number>;
  /** Personality compatibility between candidate and team Big Five profiles (0-1). Null if no personality data. */
  personalityCompatibility?: number | null;
}

/**
 * Generic extended metrics for any assessment goal.
 * Contains optional consistency analysis and goal-specific fields.
 */
export interface GenericExtendedMetrics extends ConsistencyMetrics {
  /** Confidence level computed by backend */
  confidenceLevel?: string;
  /** Human-readable confidence message */
  confidenceMessage?: string;
  /** Allow additional dynamic fields from backend */
  [key: string]: unknown;
}

/**
 * Extended metrics for OVERVIEW assessment results.
 * Populated by OverviewScoringStrategy on backend.
 * Contains profile pattern categorization of competencies.
 */
export interface OverviewExtendedMetrics extends GenericExtendedMetrics {
  /**
   * Profile pattern categorization of competencies.
   * Keys: SIGNATURE_STRENGTH, STRENGTH, AVERAGE, DEVELOPING, CRITICAL_GAP
   * Values: Array of competency names belonging to each category.
   */
  profilePattern?: Record<string, string[]>;
}

/**
 * Type guard to check if extended metrics contain OVERVIEW specific fields.
 */
export function isOverviewMetrics(
  metrics: OverviewExtendedMetrics | TeamFitExtendedMetrics | GenericExtendedMetrics | null | undefined,
): metrics is OverviewExtendedMetrics {
  if (!metrics) return false;
  return (
    'profilePattern' in metrics &&
    metrics.profilePattern != null &&
    typeof metrics.profilePattern === 'object'
  );
}

/**
 * Type guard to check if extended metrics contain TEAM_FIT specific fields.
 */
export function isTeamFitMetrics(
  metrics: TeamFitExtendedMetrics | GenericExtendedMetrics | null | undefined,
): metrics is TeamFitExtendedMetrics {
  if (!metrics) return false;
  return (
    'diversityRatio' in metrics &&
    'saturationRatio' in metrics &&
    'teamFitMultiplier' in metrics &&
    typeof metrics.diversityRatio === 'number' &&
    typeof metrics.saturationRatio === 'number' &&
    typeof metrics.teamFitMultiplier === 'number'
  );
}

/**
 * Test result interface matching backend TestResultDto.
 *
 * Key differences from SPEC.md:
 * - Added `status` field (PENDING | COMPLETED | FAILED)
 * - Added `clerkUserId` field for user association
 * - Added `totalQuestions` field
 * - Renamed `createdAt` to `completedAt`
 * - All score fields can be null when status is PENDING
 * - bigFiveProfile only populated for TEAM_FIT goal
 * - extendedMetrics only populated for TEAM_FIT goal
 */
export interface TestResult {
  id: string;
  sessionId: string;
  templateId: string;
  templateName: string;
  clerkUserId: string;
  /** Raw score sum - can be null when PENDING */
  overallScore: number | null;
  /** Score as percentage (0-100) - can be null when PENDING */
  overallPercentage: number | null;
  /** Percentile ranking - optional even when COMPLETED */
  percentile?: number | null;
  /** Whether candidate passed - can be null when PENDING */
  passed: boolean | null;
  /** Competency breakdown - can be null when PENDING */
  competencyScores: CompetencyScore[] | null;
  totalTimeSeconds: number;
  questionsAnswered: number;
  questionsSkipped: number;
  totalQuestions: number;
  completedAt: string;
  /** Scoring workflow status - CRITICAL for UI state management */
  status: ResultStatus;
  /**
   * Big Five personality profile (OCEAN model).
   * Only populated for TEAM_FIT assessments.
   * For OVERVIEW/JOB_FIT, use useBigFiveProjection hook with onetCode.
   */
  bigFiveProfile?: Record<string, number> | null;
  /**
   * Extended metrics for scoring strategy.
   * Contains diversity/saturation analysis for TEAM_FIT, consistency data for all goals.
   */
  extendedMetrics?: TeamFitExtendedMetrics | GenericExtendedMetrics | null;
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
  // Confidence interval fields (populated by backend ConfidenceIntervalCalculator)
  sem?: number;           // Standard Error of Measurement
  ciLower?: number;       // 95% CI lower bound
  ciUpper?: number;       // 95% CI upper bound
  cronbachAlpha?: number; // Cronbach's alpha used for CI calculation
  computedSd?: number;    // Computed standard deviation for this competency
  // Per-competency percentile rank
  percentile?: number;    // Percentile rank within this competency across all takers
  benchmarkScore?: number; // O*NET benchmark score for this competency (S1)
  // 5-level proficiency label (backend-computed, e.g. "Expert", "Developing")
  proficiencyLabel?: string;
  // Evidence sufficiency indicator
  insufficientEvidence?: boolean;
  evidenceNote?: string;
}

export interface IndicatorScore {
  indicatorId: string;
  indicatorTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  questionsAnswered: number;
  questionScores?: QuestionScore[];
  /** Weight of this indicator within the competency */
  weight?: number;
  /** 5-level proficiency label (backend-computed) */
  proficiencyLabel?: string;
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

// ============================================
// TREND TRACKING TYPES
// ============================================

/**
 * Lightweight competency score for trend tracking.
 * Matches backend CompetencyTrendPointDto.
 */
export interface CompetencyTrendPoint {
  competencyId: string;
  competencyName: string;
  percentage: number | null;
  ciLower?: number | null;
  ciUpper?: number | null;
}

/**
 * Single data point for historical trend visualization.
 * Matches backend TrendDataPointDto.
 */
export interface TrendDataPoint {
  resultId: string;
  templateId: string;
  templateName: string;
  overallPercentage: number | null;
  passed: boolean | null;
  completedAt: string;
  competencyScores: CompetencyTrendPoint[];
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

// ============================================
// CANDIDATE COMPARISON TYPES
// ============================================

/** Top-level comparison response for side-by-side candidate analysis. */
export interface CandidateComparison {
  templateId: string;
  templateName: string;
  teamId: string;
  targetRole: string | null;
  teamSize: number;
  teamAvailable: boolean;
  candidates: CandidateSummary[];
  competencyComparison: CompetencyComparisonEntry[];
  gapCoverageMatrix: GapCoverageEntry[];
  complementarityPairs: CandidatePairComplementarity[];
  teamCompetencySaturation: Record<string, number>;
  /** Assessment goal context. Inferred from backend response structure when not explicitly provided. */
  goal?: 'JOB_FIT' | 'TEAM_FIT' | 'OVERVIEW';
}

/** Per-candidate summary with rankings and scores. */
export interface CandidateSummary {
  resultId: string;
  displayName: string;
  overallPercentage: number;
  passed: boolean;
  overallRank: number;
  diversityRank: number;
  personalityRank: number;
  diversityRatio: number;
  saturationRatio: number;
  teamFitMultiplier: number;
  personalityCompatibility: number | null;
  bigFiveProfile: Record<string, number> | null;
  competencySaturation: Record<string, number>;
  completedAt: string;
}

/** Per-competency comparison across all candidates. */
export interface CompetencyComparisonEntry {
  competencyId: string;
  competencyName: string;
  teamSaturation: number | null;
  candidateScores: Record<string, number>;
  bestCandidateId: string;
  isTeamGap: boolean;
}

/** Gap coverage entry showing which candidates fill a team gap. */
export interface GapCoverageEntry {
  competencyId: string;
  competencyName: string;
  teamSaturation: number;
  candidateCoverage: Record<string, number>;
  bestCandidateId: string;
}

/** Pairwise candidate complementarity for combined hiring decisions. */
export interface CandidatePairComplementarity {
  candidateA: string;
  candidateB: string;
  candidateAName: string;
  candidateBName: string;
  complementarityScore: number;
  combinedGapsCovered: number;
  totalTeamGaps: number;
}

// ============================================
// TEMPLATE READINESS TYPES
// ============================================

/**
 * Health status for competency question inventory.
 * Matches backend HealthStatus enum.
 */
export type HealthStatus = 'HEALTHY' | 'MODERATE' | 'CRITICAL';

/**
 * Readiness status for a single competency.
 * Shows if the competency has sufficient questions for testing.
 */
export interface CompetencyReadiness {
  competencyId: string;
  competencyName: string;
  questionsAvailable: number;
  questionsRequired: number;
  healthStatus: HealthStatus;
  issues: string[];
}

/**
 * Response from template readiness check endpoint.
 * Used for pre-flight validation before starting a test session.
 */
export interface TemplateReadinessResponse {
  ready: boolean;
  message: string;
  competencyReadiness: CompetencyReadiness[];
  totalQuestionsAvailable: number;
  questionsRequired: number;
}

/**
 * Competency issue details from TestNotReadyException.
 * Provides detailed info about why a test cannot start.
 */
export interface CompetencyIssue {
  competencyId: string;
  competencyName: string;
  questionsAvailable: number;
  questionsRequired: number;
  healthStatus: HealthStatus;
  issues: string[];
}

// ============================================
// TEMPLATE VISIBILITY & SHARING TYPES
// ============================================

/**
 * Template visibility levels.
 * Controls who can access the template.
 */
export enum TemplateVisibility {
  /** Only owner and explicitly shared users/teams can access */
  PRIVATE = 'PRIVATE',
  /** Any authenticated user can view and use */
  PUBLIC = 'PUBLIC',
  /** Anyone with a valid share link (anonymous access allowed) */
  LINK = 'LINK'
}

/**
 * Share permission levels for template access.
 * Hierarchical: MANAGE includes EDIT, EDIT includes VIEW.
 */
export enum SharePermission {
  /** Can view and use the template for tests */
  VIEW = 'VIEW',
  /** Can modify the template content */
  EDIT = 'EDIT',
  /** Can manage sharing settings and visibility */
  MANAGE = 'MANAGE'
}

/**
 * Type of grantee for template shares.
 */
export enum GranteeType {
  /** Share with individual user */
  USER = 'USER',
  /** Share with team (all members inherit access) */
  TEAM = 'TEAM'
}

/**
 * Visibility information for a template.
 */
export interface VisibilityInfo {
  templateId: string;
  visibility: TemplateVisibility;
  visibilityChangedAt?: string;
  ownerId: string;
  ownerName?: string;
  activeSharesCount: number;
  activeLinksCount: number;
  templateStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

/**
 * Request to change template visibility.
 */
export interface ChangeVisibilityRequest {
  visibility: TemplateVisibility;
}

/**
 * Template share record for user or team grants.
 */
export interface TemplateShare {
  id: string;
  templateId: string;
  granteeType: GranteeType;
  granteeId: string;
  granteeName?: string;
  granteeEmail?: string;
  granteeAvatarUrl?: string;
  permission: SharePermission;
  grantedById: string;
  grantedByName?: string;
  grantedAt: string;
  expiresAt?: string;
  isActive: boolean;
  revokedAt?: string;
}

/**
 * Request to share template with a user.
 * Either userId or email must be provided.
 */
export interface ShareUserRequest {
  userId?: string;
  email?: string;
  permission: SharePermission;
  expiresAt?: string;
}

/**
 * Request to share template with a team.
 */
export interface ShareTeamRequest {
  teamId: string;
  permission: SharePermission;
  expiresAt?: string;
}

/**
 * Request to update an existing share.
 */
export interface UpdateShareRequest {
  permission: SharePermission;
  expiresAt?: string;
}

/**
 * Bulk share request for multiple users and teams.
 */
export interface BulkShareRequest {
  userShares: ShareUserRequest[];
  teamShares: ShareTeamRequest[];
}

/**
 * Result of bulk share operation.
 */
export interface BulkShareResponse {
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  failedCount: number;
  created: TemplateShare[];
  updated: TemplateShare[];
  errors: Record<string, string>;
}

/**
 * Share link for token-based template access.
 */
export interface ShareLink {
  id: string;
  templateId: string;
  token: string;
  tokenMasked: boolean;
  permission: SharePermission;
  label?: string;
  expiresAt: string;
  maxUses?: number;
  currentUses: number;
  createdById: string;
  createdByName?: string;
  createdAt: string;
  isActive: boolean;
  revokedAt?: string;
  lastUsedAt?: string;
  fullUrl?: string;
}

/**
 * Request to create a share link.
 */
export interface CreateShareLinkRequest {
  permission: SharePermission;
  expiresInDays: number;
  maxUses?: number;
  label?: string;
}

/**
 * Result of share link validation.
 */
export interface LinkValidationResult {
  valid: boolean;
  templateId?: string;
  templateName?: string;
  permission?: SharePermission;
  reason?: string;
}

/**
 * Link validation error reasons.
 */
export const LinkValidationReasons = {
  NOT_FOUND: 'NOT_FOUND',
  REVOKED: 'REVOKED',
  EXPIRED: 'EXPIRED',
  MAX_USES_REACHED: 'MAX_USES_REACHED',
  VISIBILITY_MISMATCH: 'VISIBILITY_MISMATCH',
  TEMPLATE_NOT_FOUND: 'TEMPLATE_NOT_FOUND',
  TEMPLATE_ARCHIVED: 'TEMPLATE_ARCHIVED',
  MISSING_TOKEN: 'MISSING_TOKEN'
} as const;

/**
 * Link count information.
 */
export interface LinkCountInfo {
  activeCount: number;
  maxLinks: number;
}

/**
 * Per-link statistics returned by the share link stats endpoint.
 */
export interface ShareLinkStats {
  shareLinkId: string;
  totalSessions: number;
  completedResults: number;
  averageScore: number | null;
  passRate: number | null;
}

/**
 * Template shared with the current user.
 * Combines template summary with sharing metadata.
 */
export interface SharedTemplateItem {
  /** The template details */
  template: {
    id: string;
    name: string;
    description?: string;
    goal: AssessmentGoal;
    competencyCount: number;
    timeLimitMinutes: number;
    passingScore: number;
    isActive: boolean;
    createdAt: string;
  };
  /** Share permission granted to current user */
  permission: SharePermission;
  /** Who shared the template */
  sharedBy: {
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string;
  };
  /** When it was shared */
  sharedAt: string;
  /** When access expires (if applicable) */
  expiresAt?: string;
  /** Whether the share is still active */
  isActive: boolean;
}

/**
 * Response for listing templates shared with current user.
 */
export interface SharedTemplatesResponse {
  items: SharedTemplateItem[];
  total: number;
}

// ============================================
// VISIBILITY HELPER FUNCTIONS
// ============================================

/**
 * Check if a permission level includes another.
 * MANAGE includes EDIT and VIEW; EDIT includes VIEW.
 */
export function permissionIncludes(
  userPermission: SharePermission,
  required: SharePermission
): boolean {
  const levels: Record<SharePermission, number> = {
    [SharePermission.VIEW]: 1,
    [SharePermission.EDIT]: 2,
    [SharePermission.MANAGE]: 3
  };
  return levels[userPermission] >= levels[required];
}

/**
 * Get display text for visibility level.
 */
export function getVisibilityDisplayText(visibility: TemplateVisibility): string {
  switch (visibility) {
    case TemplateVisibility.PRIVATE:
      return 'Private';
    case TemplateVisibility.PUBLIC:
      return 'Public';
    case TemplateVisibility.LINK:
      return 'Anyone with link';
  }
}

/**
 * Get description for visibility level.
 */
export function getVisibilityDescription(visibility: TemplateVisibility): string {
  switch (visibility) {
    case TemplateVisibility.PRIVATE:
      return 'Only you and people you share with can access';
    case TemplateVisibility.PUBLIC:
      return 'Anyone in the organization can view and use';
    case TemplateVisibility.LINK:
      return 'Anyone with the link can access (anonymous allowed)';
  }
}

/**
 * Get display text for permission level.
 */
export function getPermissionDisplayText(permission: SharePermission): string {
  switch (permission) {
    case SharePermission.VIEW:
      return 'Viewer';
    case SharePermission.EDIT:
      return 'Editor';
    case SharePermission.MANAGE:
      return 'Manager';
  }
}

/**
 * Get description for permission level.
 */
export function getPermissionDescription(permission: SharePermission): string {
  switch (permission) {
    case SharePermission.VIEW:
      return 'Can view and take tests';
    case SharePermission.EDIT:
      return 'Can edit template content';
    case SharePermission.MANAGE:
      return 'Can manage sharing settings';
  }
}

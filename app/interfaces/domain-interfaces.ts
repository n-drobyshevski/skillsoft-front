import { ApprovalStatus, CompetencyCategory, DifficultyLevel, ProficiencyLevel, IndicatorMeasurementType, QuestionType, SessionStatus  } from "../enums/domain_enums";


export interface StandardCodeMapping {
  code: string;
  name: string;
  confidence: "LOW" | "MODERATE" | "HIGH" | "VERIFIED";
}

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

export interface AssessmentQuestion {
  id: string;
  behavioralIndicatorId: string;
  questionText: string;
  questionType: QuestionType;
  answerOptions?: Array<{
    text?: string;
    label?: string;
    value?: number;
    score?: number;
    correct?: boolean;
    explanation?: string;
  }>;
  scoringRubric: string;
  timeLimit?: number;
  difficultyLevel: DifficultyLevel;
  isActive: boolean;
  orderIndex: number;
}

export interface Competency {
  id: string;
  name: string;
  description: string;
  category: CompetencyCategory;
  level: ProficiencyLevel;
  standardCodes?: StandardCodes;
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
// TEST TEMPLATE INTERFACES
// ============================================

export interface TestTemplate {
  id: string;
  name: string;
  description?: string;
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
  competencyCount: number;
  timeLimitMinutes: number;
  passingScore: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateTestTemplateRequest {
  name: string;
  description?: string;
  competencyIds: string[];
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
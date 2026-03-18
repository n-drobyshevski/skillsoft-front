export interface MockAnswerOption {
  id: string;
  text: string;
  score: number;
  correct: boolean;
  explanation?: string;
}

export interface MockQuestion {
  id: string;
  questionText: string;
  questionType: 'MCQ';
  answerOptions: MockAnswerOption[];
  difficultyLevel: 'FOUNDATIONAL' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | 'SPECIALIZED';
  metadata: { tags: string[]; complexity_score: number };
}

export interface MockPsychometrics {
  discriminationIndex: number;
  difficultyIndex: number;
  cronbachAlpha: number;
  timeLimit: number;
  sem: number;
  ciLower: number;
  ciUpper: number;
  /** Percentage of test-takers who answered correctly */
  correctRate: number;
  /** Average response time in seconds */
  avgResponseTime: number;
  /** Median response time in seconds */
  medianResponseTime: number;
}

export interface MockMapping {
  competencyName: string;
  indicatorTitle: string;
  onetCode: string;
  escoUri: string;
  bigFiveCategory: string;
  weight: number;
  /** How many questions measure this behavioral indicator */
  questionsInIndicator: number;
  /** How many questions in the parent competency total */
  questionsInCompetency: number;
  /** This question's contribution to competency score as percentage */
  contributionPct: number;
}

export interface MockUsage {
  /** Number of assessments this question has been used in */
  assessmentCount: number;
  /** Last time this question was modified */
  lastModified: string;
  /** Question position in current test */
  position: number;
  /** Total questions in current test */
  totalQuestions: number;
}

export interface MockScoring {
  maxScore: number;
  scoringMethod: string;
  optionScores: Record<string, number>;
}

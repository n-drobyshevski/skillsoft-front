/**
 * Test Data Factory for E2E Tests.
 * Generates test data with unique identifiers for each test run.
 */

// ==========================================
// Types
// ==========================================

export interface CompetencyData {
  name: string;
  description: string;
  category: string;
  standardCodes?: Record<string, unknown>;
}

export interface BehavioralIndicatorData {
  title: string;
  description: string;
  competencyId: string;
  weight: number;
  orderIndex: number;
  observabilityLevel: string;
  measurementType: string;
  examples: string;
  counterExamples: string;
}

export interface QuestionData {
  questionText: string;
  questionType: 'LIKERT_SCALE' | 'MCQ' | 'SJT' | 'BEHAVIORAL';
  behavioralIndicatorId: string;
  answerOptions: unknown[];
  scoringRubric: string;
  difficultyLevel: string;
  timeLimit: number;
}

export interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'EDITOR' | 'USER';
}

export interface TestTemplateData {
  name: string;
  description: string;
  goal: 'OVERVIEW' | 'JOB_FIT' | 'TEAM_FIT';
  competencyIds?: string[];
  questionsPerIndicator?: number;
  timeLimitMinutes?: number;
  passingScore?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  allowSkip?: boolean;
  allowBackNavigation?: boolean;
  showResultsImmediately?: boolean;
  blueprint?: {
    onet_soc_code?: string;
    team_id?: string;
    [key: string]: unknown;
  };
}

export interface TestSessionData {
  templateId: string;
  clerkUserId: string;
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED' | 'TIMED_OUT';
}

export interface TestAnswerData {
  questionId: string;
  likertValue?: number;
  selectedOptionIds?: string[];
  textResponse?: string;
  timeSpentSeconds?: number;
}

// ==========================================
// Helpers
// ==========================================

/**
 * Generate a unique test ID.
 */
function generateTestId(): string {
  return `e2e-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Get current timestamp for unique naming.
 */
function getTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

// ==========================================
// Data Factory
// ==========================================

export const DataFactory = {
  // ==========================================
  // Competency Data
  // ==========================================
  competency: {
    /**
     * Create a valid competency with default values.
     */
    valid: (overrides: Partial<CompetencyData> = {}): CompetencyData => ({
      name: `Test Competency ${generateTestId()}`,
      description: 'A test competency created for E2E testing purposes. This description is long enough to pass validation requirements.',
      category: 'COGNITIVE',
      ...overrides,
    }),

    /**
     * Create a competency with Russian content.
     */
    withRussianContent: (overrides: Partial<CompetencyData> = {}): CompetencyData => ({
      name: `Тестовая компетенция ${generateTestId()}`,
      description: 'Описание тестовой компетенции для E2E тестирования. Это описание достаточно длинное для прохождения валидации.',
      category: 'INTERPERSONAL',
      ...overrides,
    }),

    /**
     * Create a competency with standard codes.
     */
    withStandardCodes: (overrides: Partial<CompetencyData> = {}): CompetencyData => ({
      name: `Competency with Standards ${generateTestId()}`,
      description: 'A competency that includes international standard codes for testing standard code functionality.',
      category: 'COGNITIVE',
      standardCodes: {
        onetRef: { code: '2.B.1.a', title: 'Active Listening' },
        escoRef: { uri: 'http://data.europa.eu/esco/skill/test', title: 'Test Skill' },
        bigFiveRef: { trait: 'OPENNESS', title: 'Openness' },
      },
      ...overrides,
    }),

    /**
     * Invalid competency data for validation testing.
     */
    invalid: {
      emptyName: (): Partial<CompetencyData> => ({
        name: '',
        description: 'Valid description that meets length requirements.',
        category: 'COGNITIVE',
      }),
      shortDescription: (): Partial<CompetencyData> => ({
        name: 'Valid Name',
        description: 'Too short',
        category: 'COGNITIVE',
      }),
      missingCategory: (): Partial<CompetencyData> => ({
        name: 'Valid Name',
        description: 'Valid description that meets length requirements.',
      }),
    },
  },

  // ==========================================
  // Behavioral Indicator Data
  // ==========================================
  behavioralIndicator: {
    /**
     * Create a valid behavioral indicator.
     */
    valid: (competencyId: string, overrides: Partial<BehavioralIndicatorData> = {}): BehavioralIndicatorData => ({
      title: `Test Indicator ${generateTestId()}`,
      description: 'A test behavioral indicator for E2E testing.',
      competencyId,
      weight: 0.5,
      orderIndex: 1,
      observabilityLevel: 'DIRECTLY_OBSERVABLE',
      measurementType: 'FREQUENCY',
      examples: 'Example behavior demonstrating this indicator',
      counterExamples: 'Counter-example behavior not demonstrating this indicator',
      ...overrides,
    }),

    /**
     * Create a behavioral indicator with Russian content.
     */
    withRussianContent: (competencyId: string, overrides: Partial<BehavioralIndicatorData> = {}): BehavioralIndicatorData => ({
      title: `Тестовый индикатор ${generateTestId()}`,
      description: 'Тестовый поведенческий индикатор для E2E тестирования.',
      competencyId,
      weight: 0.5,
      orderIndex: 1,
      observabilityLevel: 'DIRECTLY_OBSERVABLE',
      measurementType: 'FREQUENCY',
      examples: 'Пример поведения, демонстрирующего этот индикатор',
      counterExamples: 'Контрпример поведения',
      ...overrides,
    }),
  },

  // ==========================================
  // Assessment Question Data
  // ==========================================
  question: {
    /**
     * Create a Likert scale question.
     */
    likert: (behavioralIndicatorId: string, overrides: Partial<QuestionData> = {}): QuestionData => ({
      questionText: `How often do you demonstrate this behavior? [${generateTestId()}]`,
      questionType: 'LIKERT_SCALE',
      behavioralIndicatorId,
      answerOptions: [
        { label: 'Never', value: 1 },
        { label: 'Rarely', value: 2 },
        { label: 'Sometimes', value: 3 },
        { label: 'Often', value: 4 },
        { label: 'Always', value: 5 },
      ],
      scoringRubric: 'Higher scores indicate better performance',
      difficultyLevel: 'INTERMEDIATE',
      timeLimit: 30,
      ...overrides,
    }),

    /**
     * Create a multiple choice question.
     */
    multipleChoice: (behavioralIndicatorId: string, overrides: Partial<QuestionData> = {}): QuestionData => ({
      questionText: `What is the best approach? [${generateTestId()}]`,
      questionType: 'MCQ',
      behavioralIndicatorId,
      answerOptions: [
        { text: 'Option A - Incorrect', score: 1, correct: false },
        { text: 'Option B - Correct', score: 5, correct: true },
        { text: 'Option C - Partially correct', score: 3, correct: false },
        { text: 'Option D - Incorrect', score: 0, correct: false },
      ],
      scoringRubric: 'Select the most appropriate response',
      difficultyLevel: 'INTERMEDIATE',
      timeLimit: 60,
      ...overrides,
    }),

    /**
     * Create a situational judgment test question.
     */
    sjt: (behavioralIndicatorId: string, overrides: Partial<QuestionData> = {}): QuestionData => ({
      questionText: `Scenario: You encounter a challenging situation. What would you do? [${generateTestId()}]`,
      questionType: 'SJT',
      behavioralIndicatorId,
      answerOptions: [
        { text: 'Response A - Passive', effectiveness: 2 },
        { text: 'Response B - Assertive', effectiveness: 4 },
        { text: 'Response C - Aggressive', effectiveness: 1 },
        { text: 'Response D - Collaborative', effectiveness: 5 },
      ],
      scoringRubric: 'Select the most effective response',
      difficultyLevel: 'ADVANCED',
      timeLimit: 180,
      ...overrides,
    }),

    /**
     * Create a question with Russian content.
     */
    russianLikert: (behavioralIndicatorId: string, overrides: Partial<QuestionData> = {}): QuestionData => ({
      questionText: `Как часто вы демонстрируете это поведение? [${generateTestId()}]`,
      questionType: 'LIKERT_SCALE',
      behavioralIndicatorId,
      answerOptions: [
        { label: 'Никогда', value: 1 },
        { label: 'Редко', value: 2 },
        { label: 'Иногда', value: 3 },
        { label: 'Часто', value: 4 },
        { label: 'Всегда', value: 5 },
      ],
      scoringRubric: 'Более высокие оценки указывают на лучшую эффективность',
      difficultyLevel: 'BASIC',
      timeLimit: 30,
      ...overrides,
    }),
  },

  // ==========================================
  // User Data
  // ==========================================
  user: {
    admin: (): UserData => ({
      email: `admin-${generateTestId()}@test.skillsoft.local`,
      firstName: 'Test',
      lastName: 'Admin',
      role: 'ADMIN',
    }),
    editor: (): UserData => ({
      email: `editor-${generateTestId()}@test.skillsoft.local`,
      firstName: 'Test',
      lastName: 'Editor',
      role: 'EDITOR',
    }),
    user: (): UserData => ({
      email: `user-${generateTestId()}@test.skillsoft.local`,
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
    }),
  },

  // ==========================================
  // Test Template Data
  // ==========================================
  testTemplate: {
    /**
     * Create a valid Overview test template.
     */
    overview: (overrides: Partial<TestTemplateData> = {}): TestTemplateData => ({
      name: `E2E Overview Test ${generateTestId()}`,
      description: 'E2E test template for Universal Baseline assessment with Big Five profile generation.',
      goal: 'OVERVIEW',
      questionsPerIndicator: 2,
      timeLimitMinutes: 30,
      passingScore: 60,
      shuffleQuestions: true,
      shuffleOptions: true,
      allowSkip: false,
      allowBackNavigation: true,
      showResultsImmediately: true,
      ...overrides,
    }),

    /**
     * Create a valid JobFit test template.
     */
    jobFit: (onetSocCode: string, overrides: Partial<TestTemplateData> = {}): TestTemplateData => ({
      name: `E2E Job Fit Test ${generateTestId()}`,
      description: 'E2E test template for Job Fit assessment using O*NET benchmarks.',
      goal: 'JOB_FIT',
      questionsPerIndicator: 3,
      timeLimitMinutes: 45,
      passingScore: 70,
      shuffleQuestions: true,
      shuffleOptions: true,
      allowSkip: false,
      allowBackNavigation: true,
      showResultsImmediately: true,
      blueprint: {
        onet_soc_code: onetSocCode,
      },
      ...overrides,
    }),

    /**
     * Create a valid TeamFit test template.
     */
    teamFit: (teamId: string, overrides: Partial<TestTemplateData> = {}): TestTemplateData => ({
      name: `E2E Team Fit Test ${generateTestId()}`,
      description: 'E2E test template for Team Fit assessment with ESCO skill mapping.',
      goal: 'TEAM_FIT',
      questionsPerIndicator: 2,
      timeLimitMinutes: 40,
      passingScore: 65,
      shuffleQuestions: true,
      shuffleOptions: true,
      allowSkip: false,
      allowBackNavigation: true,
      showResultsImmediately: true,
      blueprint: {
        team_id: teamId,
      },
      ...overrides,
    }),

    /**
     * Create a quick test template (short, for testing flows).
     */
    quick: (overrides: Partial<TestTemplateData> = {}): TestTemplateData => ({
      name: `E2E Quick Test ${generateTestId()}`,
      description: 'Quick E2E test template for testing basic flows.',
      goal: 'OVERVIEW',
      questionsPerIndicator: 1,
      timeLimitMinutes: 5,
      passingScore: 50,
      shuffleQuestions: false,
      shuffleOptions: false,
      allowSkip: true,
      allowBackNavigation: true,
      showResultsImmediately: true,
      ...overrides,
    }),

    /**
     * Create a template with specific competencies.
     */
    withCompetencies: (competencyIds: string[], overrides: Partial<TestTemplateData> = {}): TestTemplateData => ({
      name: `E2E Template with Competencies ${generateTestId()}`,
      description: 'E2E test template with specific competencies for testing.',
      goal: 'OVERVIEW',
      competencyIds,
      questionsPerIndicator: 2,
      timeLimitMinutes: 20,
      passingScore: 60,
      shuffleQuestions: true,
      shuffleOptions: true,
      allowSkip: false,
      allowBackNavigation: true,
      showResultsImmediately: true,
      ...overrides,
    }),

    /**
     * Create a timed test template with strict time limit.
     */
    timed: (timeLimitMinutes: number, overrides: Partial<TestTemplateData> = {}): TestTemplateData => ({
      name: `E2E Timed Test ${generateTestId()}`,
      description: `E2E test template with ${timeLimitMinutes} minute time limit.`,
      goal: 'OVERVIEW',
      questionsPerIndicator: 2,
      timeLimitMinutes,
      passingScore: 60,
      shuffleQuestions: true,
      shuffleOptions: true,
      allowSkip: false,
      allowBackNavigation: false, // No back navigation in timed tests
      showResultsImmediately: true,
      ...overrides,
    }),
  },

  // ==========================================
  // Test Session Data
  // ==========================================
  testSession: {
    /**
     * Create a test session request.
     */
    create: (templateId: string, clerkUserId: string): TestSessionData => ({
      templateId,
      clerkUserId,
    }),

    /**
     * Test answer for Likert scale question.
     */
    likertAnswer: (questionId: string, value: number, timeSpentSeconds = 10): TestAnswerData => ({
      questionId,
      likertValue: value,
      timeSpentSeconds,
    }),

    /**
     * Test answer for MCQ/SJT question.
     */
    choiceAnswer: (questionId: string, selectedOptionIds: string[], timeSpentSeconds = 15): TestAnswerData => ({
      questionId,
      selectedOptionIds,
      timeSpentSeconds,
    }),

    /**
     * Test answer for text input question.
     */
    textAnswer: (questionId: string, textResponse: string, timeSpentSeconds = 60): TestAnswerData => ({
      questionId,
      textResponse,
      timeSpentSeconds,
    }),
  },

  // ==========================================
  // Utility Functions
  // ==========================================
  utils: {
    generateTestId,
    getTimestamp,
    /**
     * Generate a random Likert value (1-5).
     */
    randomLikertValue: (): number => Math.floor(Math.random() * 5) + 1,
    /**
     * Generate a random selection from options.
     */
    randomSelection: (optionIds: string[]): string => {
      return optionIds[Math.floor(Math.random() * optionIds.length)];
    },
    /**
     * Generate a test text response that meets minimum character requirements.
     */
    generateTestText: (minLength = 50): string => {
      const base = 'This is a test response generated for E2E testing purposes. ';
      let result = '';
      while (result.length < minLength) {
        result += base;
      }
      return result.substring(0, Math.max(minLength, result.length));
    },
  },
};

export default DataFactory;

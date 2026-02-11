/**
 * Test Data Factory for Frontend Tests
 *
 * Provides type-safe factory functions for creating mock entities with bilingual
 * (English/Russian) support to ensure proper Cyrillic character handling.
 *
 * Usage:
 * ```ts
 * import { createMockCompetency, createMockTestTemplate, createMockUser } from '@/__tests__/factories';
 *
 * // Create a single entity
 * const competency = createMockCompetency();
 *
 * // Create with overrides
 * const customCompetency = createMockCompetency({ name: 'Custom Name' });
 *
 * // Create multiple entities
 * const competencies = createMockCompetencies(5);
 * ```
 */

import type {
  Competency,
  BehavioralIndicator,
  AssessmentQuestion,
  TestTemplate,
  TestSession,
} from '@/types/domain';

import {
  CompetencyCategory,
  ApprovalStatus,
  ObservabilityLevel,
  IndicatorMeasurementType,
  ContextScope,
  QuestionType,
  DifficultyLevel,
  SessionStatus,
  AssessmentGoal,
  TemplateStatus,
} from '@/types/domain';

import type { User, UserRole } from '@/types/user';

// ============================================
// COUNTER FOR UNIQUE IDS
// ============================================

let counter = 1;

/**
 * Resets the counter for deterministic test data.
 */
export function resetFactoryCounter(): void {
  counter = 1;
}

function getNextId(): string {
  return `test-${counter++}`;
}

// ============================================
// BILINGUAL TEST DATA
// ============================================

const COMPETENCY_NAMES = [
  'Strategic Leadership / Стратегическое лидерство',
  'Critical Thinking / Критическое мышление',
  'Communication Skills / Навыки коммуникации',
  'Problem Solving / Решение проблем',
  'Team Collaboration / Командная работа',
];

const INDICATOR_TITLES = [
  'Decision Making / Принятие решений',
  'Conflict Resolution / Разрешение конфликтов',
  'Active Listening / Активное слушание',
  'Time Management / Управление временем',
  'Adaptability / Адаптивность',
];

const QUESTION_TEXTS = [
  'How often do you demonstrate this behavior? / Как часто вы демонстрируете это поведение?',
  'Rate your proficiency in this area / Оцените свой уровень в этой области',
  'Select the most effective response / Выберите наиболее эффективный ответ',
];

// ============================================
// USER FACTORY
// ============================================

export type MockUserRole = 'admin' | 'editor' | 'user';

export interface MockUser {
  id: string;
  clerkId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
  role: MockUserRole;
  isActive: boolean;
}

/**
 * Creates a mock User object.
 */
export function createMockUser(
  role: MockUserRole = 'user',
  overrides?: Partial<MockUser>
): MockUser {
  const id = getNextId();
  const roleName = role.charAt(0).toUpperCase() + role.slice(1);

  return {
    id,
    clerkId: `clerk_${role}_${id}`,
    email: `${role}${id}@test.skillsoft.app`,
    username: `test${role}${id}`,
    firstName: 'Test / Тест',
    lastName: `${roleName} ${id}`,
    imageUrl: null,
    role,
    isActive: true,
    ...overrides,
  };
}

/**
 * Creates a mock admin user.
 */
export function createMockAdminUser(overrides?: Partial<MockUser>): MockUser {
  return createMockUser('admin', overrides);
}

/**
 * Creates a mock editor user.
 */
export function createMockEditorUser(overrides?: Partial<MockUser>): MockUser {
  return createMockUser('editor', overrides);
}

// ============================================
// COMPETENCY FACTORY
// ============================================

/**
 * Creates a mock Competency object.
 */
export function createMockCompetency(overrides?: Partial<Competency>): Competency {
  const id = getNextId();
  const nameIndex = parseInt(id.split('-')[1]) % COMPETENCY_NAMES.length;
  const categories = Object.values(CompetencyCategory);

  return {
    id,
    name: COMPETENCY_NAMES[nameIndex],
    description: `Test competency description / Описание тестовой компетенции ${id}`,
    category: categories[parseInt(id.split('-')[1]) % categories.length],
    isActive: true,
    approvalStatus: ApprovalStatus.APPROVED,
    behavioralIndicators: [],
    version: 1,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    standardCodes: {
      onetRef: { code: '2.B.1.a', title: 'Social Perceptiveness' },
      escoRef: { uri: "https://data.europa.eu/esco/skill/test", title: 'Test skill' },
      bigFiveRef: { trait: 'CONSCIENTIOUSNESS', title: 'Conscientiousness' },
    },
    ...overrides,
  };
}

/**
 * Creates multiple mock competencies.
 */
export function createMockCompetencies(count: number): Competency[] {
  return Array.from({ length: count }, () => createMockCompetency());
}

// ============================================
// BEHAVIORAL INDICATOR FACTORY
// ============================================

/**
 * Creates a mock BehavioralIndicator object.
 */
export function createMockBehavioralIndicator(
  overrides?: Partial<BehavioralIndicator>
): BehavioralIndicator {
  const id = getNextId();
  const titleIndex = parseInt(id.split('-')[1]) % INDICATOR_TITLES.length;
  const observabilityLevels = Object.values(ObservabilityLevel);
  const contextScopes = Object.values(ContextScope);

  return {
    id,
    title: INDICATOR_TITLES[titleIndex],
    description: `Indicator description / Описание индикатора ${id}`,
    competencyId: 'comp-1',
    weight: 0.3 + (parseInt(id.split('-')[1]) % 5) * 0.1,
    orderIndex: parseInt(id.split('-')[1]),
    observabilityLevel: observabilityLevels[parseInt(id.split('-')[1]) % observabilityLevels.length],
    measurementType: IndicatorMeasurementType.FREQUENCY,
    examples: 'Positive behavior examples / Примеры положительного поведения',
    counterExamples: 'Negative behavior examples / Примеры негативного поведения',
    isActive: true,
    approvalStatus: ApprovalStatus.APPROVED,
    contextScope: contextScopes[parseInt(id.split('-')[1]) % contextScopes.length],
    ...overrides,
  };
}

/**
 * Creates multiple mock behavioral indicators for a competency.
 */
export function createMockBehavioralIndicators(
  competencyId: string,
  count: number
): BehavioralIndicator[] {
  return Array.from({ length: count }, (_, i) =>
    createMockBehavioralIndicator({ competencyId, orderIndex: i + 1 })
  );
}

// ============================================
// ASSESSMENT QUESTION FACTORY
// ============================================

/**
 * Creates a mock AssessmentQuestion object.
 */
export function createMockAssessmentQuestion(
  type: QuestionType = QuestionType.LIKERT_SCALE,
  overrides?: Partial<AssessmentQuestion>
): AssessmentQuestion {
  const id = getNextId();
  const textIndex = parseInt(id.split('-')[1]) % QUESTION_TEXTS.length;
  const difficultyLevels = Object.values(DifficultyLevel);

  return {
    id,
    questionText: QUESTION_TEXTS[textIndex],
    questionType: type,
    answerOptions: createAnswerOptionsForType(type),
    scoringRubric: `Scoring rubric / Критерии оценки ${id}`,
    timeLimit: 300,
    difficultyLevel: difficultyLevels[parseInt(id.split('-')[1]) % difficultyLevels.length],
    isActive: true,
    orderIndex: parseInt(id.split('-')[1]),
    behavioralIndicatorId: 'bi-1',
    ...overrides,
  };
}

/**
 * Creates answer options appropriate for the question type.
 */
function createAnswerOptionsForType(type: QuestionType): Array<Record<string, unknown>> {
  switch (type) {
    case QuestionType.LIKERT:
    case QuestionType.LIKERT_SCALE:
    case QuestionType.FREQUENCY_SCALE:
      return [
        { value: 1, label: 'Полностью не согласен / Strongly Disagree', score: 1 },
        { value: 2, label: 'Не согласен / Disagree', score: 2 },
        { value: 3, label: 'Нейтрально / Neutral', score: 3 },
        { value: 4, label: 'Согласен / Agree', score: 4 },
        { value: 5, label: 'Полностью согласен / Strongly Agree', score: 5 },
      ];

    case QuestionType.MCQ:
    case QuestionType.MULTIPLE_CHOICE:
    case QuestionType.SINGLE_CHOICE:
      return [
        { id: 'A', text: 'Option A / Вариант А', isCorrect: true },
        { id: 'B', text: 'Option B / Вариант Б', isCorrect: false },
        { id: 'C', text: 'Option C / Вариант В', isCorrect: false },
        { id: 'D', text: 'Option D / Вариант Г', isCorrect: false },
      ];

    case QuestionType.SJT:
    case QuestionType.SITUATIONAL_JUDGMENT:
      return [
        { action: 'Take immediate action / Немедленное действие', effectiveness: 3 },
        { action: 'Consult with colleagues / Консультация с коллегами', effectiveness: 5 },
        { action: 'Escalate to management / Передать руководству', effectiveness: 2 },
        { action: 'Ignore the situation / Игнорировать ситуацию', effectiveness: 1 },
      ];

    default:
      return [{ value: 1, label: 'Default option / Вариант по умолчанию' }];
  }
}

// ============================================
// TEST TEMPLATE FACTORY
// ============================================

/**
 * Creates a mock TestTemplate object.
 */
export function createMockTestTemplate(
  goal: AssessmentGoal = AssessmentGoal.OVERVIEW,
  overrides?: Partial<TestTemplate>
): TestTemplate {
  const id = getNextId();

  return {
    id,
    name: `Test Template / Тестовый шаблон ${id}`,
    description: `Template description / Описание шаблона ${id}`,
    goal,
    status: TemplateStatus.DRAFT,
    version: 1,
    questionsPerIndicator: 3,
    timeLimitMinutes: 60,
    passingScore: 70.0,
    isActive: true,
    shuffleQuestions: true,
    shuffleOptions: true,
    allowSkip: true,
    allowBackNavigation: true,
    showResultsImmediately: true,
    visibility: 'PRIVATE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blueprint: createBlueprintForGoal(goal),
    ...overrides,
  } as TestTemplate;
}

/**
 * Creates blueprint configuration for the specified goal.
 */
function createBlueprintForGoal(goal: AssessmentGoal): Record<string, unknown> {
  switch (goal) {
    case AssessmentGoal.OVERVIEW:
      return {
        strategy: 'UNIVERSAL_BASELINE',
        competencies: 'CROSS_FUNCTIONAL_ONLY',
        saveAsPassport: true,
        indicatorsPerCompetency: 2,
        questionsPerIndicator: 2,
      };

    case AssessmentGoal.JOB_FIT:
      return {
        strategy: 'TARGETED_FIT',
        onetSocCode: '15-1132.00',
        useOnetBenchmarks: true,
        reusePassportData: true,
      };

    case AssessmentGoal.TEAM_FIT:
      return {
        strategy: 'DYNAMIC_GAP_ANALYSIS',
        teamId: 'team-1',
        normalizationStandard: 'ESCO_V1',
        saturationThreshold: 0.75,
      };

    default:
      return {};
  }
}

// ============================================
// TEST SESSION FACTORY
// ============================================

/**
 * Creates a mock TestSession object.
 */
export function createMockTestSession(
  templateId: string,
  clerkUserId: string,
  overrides?: Partial<TestSession>
): TestSession {
  const id = getNextId();

  return {
    id,
    templateId,
    clerkUserId,
    status: SessionStatus.NOT_STARTED,
    currentQuestionIndex: 0,
    startedAt: null,
    completedAt: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  } as TestSession;
}

/**
 * Creates a mock TestSession that is in progress.
 */
export function createMockInProgressSession(
  templateId: string,
  clerkUserId: string,
  overrides?: Partial<TestSession>
): TestSession {
  return createMockTestSession(templateId, clerkUserId, {
    status: SessionStatus.IN_PROGRESS,
    startedAt: new Date().toISOString(),
    ...overrides,
  });
}

/**
 * Creates a mock completed TestSession.
 */
export function createMockCompletedSession(
  templateId: string,
  clerkUserId: string,
  overrides?: Partial<TestSession>
): TestSession {
  const startTime = new Date();
  startTime.setHours(startTime.getHours() - 1);

  return createMockTestSession(templateId, clerkUserId, {
    status: SessionStatus.COMPLETED,
    startedAt: startTime.toISOString(),
    completedAt: new Date().toISOString(),
    ...overrides,
  });
}

// ============================================
// TEAM FACTORY
// ============================================

export interface MockTeam {
  id: string;
  name: string;
  description: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  memberCount: number;
  createdAt: string;
}

/**
 * Creates a mock Team object.
 */
export function createMockTeam(overrides?: Partial<MockTeam>): MockTeam {
  const id = getNextId();

  return {
    id,
    name: `Alpha Team / Команда Альфа ${id}`,
    description: `Team description / Описание команды ${id}`,
    status: 'DRAFT',
    memberCount: 5,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ============================================
// SHARE FACTORY
// ============================================

export interface MockTemplateShare {
  id: string;
  templateId: string;
  granteeType: 'USER' | 'TEAM';
  granteeId: string;
  permission: 'VIEW' | 'EDIT' | 'MANAGE';
  grantedAt: string;
  isActive: boolean;
}

/**
 * Creates a mock TemplateShare object.
 */
export function createMockTemplateShare(
  templateId: string,
  granteeId: string,
  permission: 'VIEW' | 'EDIT' | 'MANAGE' = 'VIEW',
  overrides?: Partial<MockTemplateShare>
): MockTemplateShare {
  const id = getNextId();

  return {
    id,
    templateId,
    granteeType: 'USER',
    granteeId,
    permission,
    grantedAt: new Date().toISOString(),
    isActive: true,
    ...overrides,
  };
}

export interface MockTemplateShareLink {
  id: string;
  templateId: string;
  token: string;
  permission: 'VIEW' | 'EDIT';
  expiresAt: string;
  maxUses: number | null;
  currentUses: number;
  isActive: boolean;
}

/**
 * Creates a mock TemplateShareLink object.
 */
export function createMockTemplateShareLink(
  templateId: string,
  overrides?: Partial<MockTemplateShareLink>
): MockTemplateShareLink {
  const id = getNextId();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  return {
    id,
    templateId,
    token: `link_token_${id}`,
    permission: 'VIEW',
    expiresAt: expiresAt.toISOString(),
    maxUses: null,
    currentUses: 0,
    isActive: true,
    ...overrides,
  };
}

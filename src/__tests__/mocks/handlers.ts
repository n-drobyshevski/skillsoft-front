/**
 * MSW Request Handlers for API Mocking
 * Extended for comprehensive CRUD testing
 */
import { http, HttpResponse } from 'msw';
import type { Competency, BehavioralIndicator, AssessmentQuestion } from '@/types/domain';
import {
  CompetencyCategory,
  ApprovalStatus,
  ObservabilityLevel,
  IndicatorMeasurementType,
  ContextScope,
  QuestionType,
  DifficultyLevel,
  AssessmentGoal,
} from '@/types/domain';
import { UserRole } from '@/types/user';

const API_BASE = 'http://localhost:8080/api';

// ============================================
// MOCK DATA - Competencies
// ============================================
export const mockCompetencies: Competency[] = [
  {
    id: 'comp-1',
    name: 'Communication',
    description: 'Effective verbal and written communication skills for professional settings',
    category: CompetencyCategory.INTERPERSONAL,
    isActive: true,
    approvalStatus: ApprovalStatus.APPROVED,
    behavioralIndicators: [],
    version: 1,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    standardCodes: {
      onetRef: { code: '2.A.1.a', title: 'Oral Comprehension' },
      escoRef: { uri: 'http://data.europa.eu/esco/skill/1234', title: 'Communication skills' },
      bigFiveRef: { trait: 'EXTRAVERSION', title: 'Extraversion' },
    },
  },
  {
    id: 'comp-2',
    name: 'Problem Solving',
    description: 'Ability to analyze and solve complex problems effectively',
    category: CompetencyCategory.COGNITIVE,
    isActive: true,
    approvalStatus: ApprovalStatus.APPROVED,
    behavioralIndicators: [],
    version: 1,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    standardCodes: {
      onetRef: { code: '2.A.2.b', title: 'Deductive Reasoning' },
      bigFiveRef: { trait: 'OPENNESS', title: 'Openness to Experience' },
    },
  },
  {
    id: 'comp-3',
    name: 'Leadership',
    description: 'Ability to guide and motivate teams towards achieving goals',
    category: CompetencyCategory.LEADERSHIP,
    isActive: false,
    approvalStatus: ApprovalStatus.DRAFT,
    behavioralIndicators: [],
    version: 2,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    standardCodes: {},
  },
];

// ============================================
// MOCK DATA - Behavioral Indicators
// ============================================
export const mockBehavioralIndicators: BehavioralIndicator[] = [
  {
    id: 'bi-1',
    title: 'Active Listening',
    description: 'Demonstrates attentive listening in conversations with colleagues',
    competencyId: 'comp-1',
    weight: 0.3,
    orderIndex: 1,
    observabilityLevel: ObservabilityLevel.DIRECTLY_OBSERVABLE,
    measurementType: IndicatorMeasurementType.FREQUENCY,
    examples: 'Maintains eye contact, asks clarifying questions, paraphrases to confirm understanding',
    counterExamples: 'Interrupts frequently, appears distracted, multitasks during conversations',
    isActive: true,
    approvalStatus: ApprovalStatus.APPROVED,
    contextScope: ContextScope.UNIVERSAL,
  },
  {
    id: 'bi-2',
    title: 'Clear Articulation',
    description: 'Expresses ideas and thoughts clearly and concisely',
    competencyId: 'comp-1',
    weight: 0.4,
    orderIndex: 2,
    observabilityLevel: ObservabilityLevel.PARTIALLY_OBSERVABLE,
    measurementType: IndicatorMeasurementType.QUALITY,
    examples: 'Uses appropriate vocabulary, structures thoughts logically, adapts language to audience',
    counterExamples: 'Uses jargon unnecessarily, rambles, fails to get to the point',
    isActive: true,
    approvalStatus: ApprovalStatus.APPROVED,
    contextScope: ContextScope.PROFESSIONAL,
  },
  {
    id: 'bi-3',
    title: 'Critical Analysis',
    description: 'Breaks down complex problems into manageable components',
    competencyId: 'comp-2',
    weight: 0.5,
    orderIndex: 1,
    observabilityLevel: ObservabilityLevel.INFERRED,
    measurementType: IndicatorMeasurementType.IMPACT,
    examples: 'Identifies root causes, considers multiple perspectives, uses data-driven approach',
    counterExamples: 'Jumps to conclusions, ignores evidence, relies on intuition alone',
    isActive: true,
    approvalStatus: ApprovalStatus.PENDING_REVIEW,
    contextScope: ContextScope.TECHNICAL,
  },
];

// ============================================
// MOCK DATA - Assessment Questions
// ============================================
export const mockQuestions: AssessmentQuestion[] = [
  {
    id: 'q-1',
    behavioralIndicatorId: 'bi-1',
    questionText: 'How often do you seek feedback from colleagues after important conversations?',
    questionType: QuestionType.LIKERT_SCALE,
    answerOptions: [
      { id: 'opt-1', label: 'Never', value: 1 },
      { id: 'opt-2', label: 'Rarely', value: 2 },
      { id: 'opt-3', label: 'Sometimes', value: 3 },
      { id: 'opt-4', label: 'Often', value: 4 },
      { id: 'opt-5', label: 'Always', value: 5 },
    ],
    scoringRubric: 'Higher scores indicate more proactive feedback seeking',
    timeLimit: 30,
    difficultyLevel: DifficultyLevel.INTERMEDIATE,
    metadata: { tags: ['GENERAL'] },
    isActive: true,
    orderIndex: 1,
  },
  {
    id: 'q-2',
    behavioralIndicatorId: 'bi-1',
    questionText: 'You are in a meeting and a colleague presents an idea that you disagree with. What do you do?',
    questionType: QuestionType.SITUATIONAL_JUDGMENT,
    answerOptions: [
      { id: 'opt-1', text: 'Immediately voice your disagreement', value: 1, effectiveness: 2 },
      { id: 'opt-2', text: 'Wait for an appropriate moment and ask clarifying questions', value: 2, effectiveness: 5 },
      { id: 'opt-3', text: 'Stay silent and discuss privately after the meeting', value: 3, effectiveness: 3 },
      { id: 'opt-4', text: 'Propose an alternative approach while acknowledging their perspective', value: 4, effectiveness: 4 },
    ],
    scoringRubric: 'Evaluates diplomatic communication skills and emotional intelligence',
    timeLimit: 180,
    difficultyLevel: DifficultyLevel.ADVANCED,
    metadata: { tags: ['GENERAL', 'MID'] },
    isActive: true,
    orderIndex: 2,
  },
  {
    id: 'q-3',
    behavioralIndicatorId: 'bi-2',
    questionText: 'Which of the following best describes effective written communication?',
    questionType: QuestionType.MULTIPLE_CHOICE,
    answerOptions: [
      { id: 'opt-1', text: 'Using as many words as possible to explain your point', value: 1, correct: false },
      { id: 'opt-2', text: 'Being clear, concise, and adapting to your audience', value: 2, correct: true },
      { id: 'opt-3', text: 'Using technical jargon to appear knowledgeable', value: 3, correct: false },
      { id: 'opt-4', text: 'Writing lengthy emails with extensive background', value: 4, correct: false },
    ],
    scoringRubric: 'Correct answer: Option 2 - Clear, concise, audience-adapted communication',
    timeLimit: 60,
    difficultyLevel: DifficultyLevel.FOUNDATIONAL,
    metadata: { tags: ['GENERAL', 'JUNIOR'] },
    isActive: true,
    orderIndex: 1,
  },
  {
    id: 'q-4',
    behavioralIndicatorId: 'bi-3',
    questionText: 'Describe a time when you had to analyze a complex problem at work.',
    questionType: QuestionType.OPEN_TEXT,
    answerOptions: [],
    scoringRubric: 'Evaluate for: problem identification, analysis approach, solution quality',
    timeLimit: 300,
    difficultyLevel: DifficultyLevel.EXPERT,
    metadata: { tags: ['IT', 'SENIOR'] },
    isActive: false,
    orderIndex: 1,
  },
];

// ============================================
// MOCK DATA - Users
// ============================================
export const mockUsers = [
  {
    id: 'user-1',
    clerkId: 'clerk_test123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.USER,
    isActive: true,
  },
  {
    id: 'user-2',
    clerkId: 'clerk_admin456',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    isActive: true,
  },
];

// ============================================
// MOCK DATA - Test Templates
// ============================================
export const mockTestTemplates = {
  content: [
    {
      id: 'template-1',
      name: 'Overview Assessment',
      goal: AssessmentGoal.OVERVIEW,
      description: 'General soft skills assessment for universal baseline',
      isActive: true,
      competencyCount: 2,
      timeLimitMinutes: 30,
      passingScore: 70,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'template-2',
      name: 'Job Fit Assessment',
      goal: AssessmentGoal.JOB_FIT,
      description: 'Role-specific competency assessment',
      isActive: true,
      competencyCount: 3,
      timeLimitMinutes: 45,
      passingScore: 75,
      createdAt: new Date().toISOString(),
    },
  ],
  totalElements: 2,
  totalPages: 1,
  size: 10,
  number: 0,
};

// ============================================
// HELPER: In-memory data store for testing mutations
// ============================================
let competencyStore = [...mockCompetencies];
let indicatorStore = [...mockBehavioralIndicators];
let questionStore = [...mockQuestions];

export const resetMockStores = () => {
  competencyStore = [...mockCompetencies];
  indicatorStore = [...mockBehavioralIndicators];
  questionStore = [...mockQuestions];
};

// ============================================
// REQUEST HANDLERS
// ============================================
export const handlers = [
  // ==========================================
  // COMPETENCIES CRUD
  // ==========================================

  // GET all competencies
  http.get(`${API_BASE}/competencies`, () => {
    return HttpResponse.json(competencyStore);
  }),

  // GET single competency by ID
  http.get(`${API_BASE}/competencies/:id`, ({ params }) => {
    const competency = competencyStore.find((c) => c.id === params.id);
    if (!competency) {
      return HttpResponse.json(
        { message: 'Competency not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
    return HttpResponse.json(competency);
  }),

  // CREATE competency
  http.post(`${API_BASE}/competencies`, async ({ request }) => {
    const body = await request.json() as Partial<Competency>;

    // Validate required fields
    if (!body.name || body.name.length < 3) {
      return HttpResponse.json(
        { message: 'Name must be at least 3 characters', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }
    if (!body.description || body.description.length < 10) {
      return HttpResponse.json(
        { message: 'Description must be at least 10 characters', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const newCompetency: Competency = {
      id: `comp-${Date.now()}`,
      name: body.name,
      description: body.description,
      category: body.category || CompetencyCategory.INTERPERSONAL,
      isActive: body.isActive ?? true,
      approvalStatus: body.approvalStatus || ApprovalStatus.DRAFT,
      standardCodes: body.standardCodes || {},
      behavioralIndicators: [],
      version: 1,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    competencyStore.push(newCompetency);
    return HttpResponse.json(newCompetency, { status: 201 });
  }),

  // UPDATE competency
  http.put(`${API_BASE}/competencies/:id`, async ({ params, request }) => {
    const body = await request.json() as Partial<Competency>;
    const index = competencyStore.findIndex((c) => c.id === params.id);

    if (index === -1) {
      return HttpResponse.json(
        { message: 'Competency not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate required fields
    if (body.name && body.name.length < 3) {
      return HttpResponse.json(
        { message: 'Name must be at least 3 characters', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const updated: Competency = {
      ...competencyStore[index],
      ...body,
      id: params.id as string,
      version: competencyStore[index].version + 1,
      lastModified: new Date().toISOString(),
    };

    competencyStore[index] = updated;
    return HttpResponse.json(updated);
  }),

  // DELETE competency
  http.delete(`${API_BASE}/competencies/:id`, ({ params }) => {
    const index = competencyStore.findIndex((c) => c.id === params.id);

    if (index === -1) {
      return HttpResponse.json(
        { message: 'Competency not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    competencyStore.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // GET indicators for competency
  http.get(`${API_BASE}/competencies/:id/bi`, ({ params }) => {
    const indicators = indicatorStore.filter((bi) => bi.competencyId === params.id);
    return HttpResponse.json(indicators);
  }),

  // GET available indicators for competency
  http.get(`${API_BASE}/competencies/:id/available-bi`, ({ params }) => {
    const availableIndicators = indicatorStore.filter(
      (bi) => bi.competencyId !== params.id
    );
    return HttpResponse.json(availableIndicators);
  }),

  // Attach indicator to competency
  http.post(`${API_BASE}/competencies/:competencyId/bi/:indicatorId`, ({ params }) => {
    const indicatorIndex = indicatorStore.findIndex((bi) => bi.id === params.indicatorId);
    if (indicatorIndex !== -1) {
      indicatorStore[indicatorIndex] = {
        ...indicatorStore[indicatorIndex],
        competencyId: params.competencyId as string,
      };
    }
    return new HttpResponse(null, { status: 200 });
  }),

  // Detach indicator from competency
  http.delete(`${API_BASE}/competencies/:competencyId/bi/:indicatorId`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // ==========================================
  // BEHAVIORAL INDICATORS CRUD
  // ==========================================

  // GET all indicators
  http.get(`${API_BASE}/behavioral-indicators`, () => {
    return HttpResponse.json(indicatorStore);
  }),

  // GET single indicator by ID
  http.get(`${API_BASE}/behavioral-indicators/:id`, ({ params }) => {
    const indicator = indicatorStore.find((bi) => bi.id === params.id);
    if (!indicator) {
      return HttpResponse.json(
        { message: 'Behavioral indicator not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
    return HttpResponse.json(indicator);
  }),

  // CREATE indicator
  http.post(`${API_BASE}/behavioral-indicators`, async ({ request }) => {
    const body = await request.json() as Partial<BehavioralIndicator>;

    // Validate required fields
    if (!body.title || body.title.length < 5) {
      return HttpResponse.json(
        { message: 'Title must be at least 5 characters', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }
    if (!body.description || body.description.length < 10) {
      return HttpResponse.json(
        { message: 'Description must be at least 10 characters', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }
    if (!body.competencyId) {
      return HttpResponse.json(
        { message: 'Competency ID is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const newIndicator: BehavioralIndicator = {
      id: `bi-${Date.now()}`,
      title: body.title,
      description: body.description,
      competencyId: body.competencyId,
      weight: body.weight || 0.2,
      orderIndex: body.orderIndex || 1,
      observabilityLevel: body.observabilityLevel || ObservabilityLevel.DIRECTLY_OBSERVABLE,
      measurementType: body.measurementType || IndicatorMeasurementType.FREQUENCY,
      examples: body.examples || '',
      counterExamples: body.counterExamples || '',
      isActive: body.isActive ?? true,
      approvalStatus: body.approvalStatus || ApprovalStatus.DRAFT,
      contextScope: body.contextScope || ContextScope.UNIVERSAL,
    };

    indicatorStore.push(newIndicator);
    return HttpResponse.json(newIndicator, { status: 201 });
  }),

  // UPDATE indicator
  http.put(`${API_BASE}/behavioral-indicators/:id`, async ({ params, request }) => {
    const body = await request.json() as Partial<BehavioralIndicator>;
    const index = indicatorStore.findIndex((bi) => bi.id === params.id);

    if (index === -1) {
      return HttpResponse.json(
        { message: 'Behavioral indicator not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate weight range
    if (body.weight !== undefined && (body.weight < 0.01 || body.weight > 1)) {
      return HttpResponse.json(
        { message: 'Weight must be between 0.01 and 1', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const updated: BehavioralIndicator = {
      ...indicatorStore[index],
      ...body,
      id: params.id as string,
    };

    indicatorStore[index] = updated;
    return HttpResponse.json(updated);
  }),

  // DELETE indicator
  http.delete(`${API_BASE}/behavioral-indicators/:id`, ({ params }) => {
    const index = indicatorStore.findIndex((bi) => bi.id === params.id);

    if (index === -1) {
      return HttpResponse.json(
        { message: 'Behavioral indicator not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    indicatorStore.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // GET questions for indicator
  http.get(`${API_BASE}/behavioral-indicators/:id/questions`, ({ params }) => {
    const questions = questionStore.filter((q) => q.behavioralIndicatorId === params.id);
    return HttpResponse.json(questions);
  }),

  // UPDATE indicator questions
  http.put(`${API_BASE}/behavioral-indicators/:id/questions`, async ({ params, request }) => {
    const body = await request.json() as { questionIds: string[] };
    // Update question associations
    questionStore = questionStore.map((q) => {
      if (body.questionIds.includes(q.id)) {
        return { ...q, behavioralIndicatorId: params.id as string };
      }
      return q;
    });
    return HttpResponse.json({ success: true });
  }),

  // ==========================================
  // ASSESSMENT QUESTIONS CRUD
  // ==========================================

  // GET all questions
  http.get(`${API_BASE}/questions`, () => {
    return HttpResponse.json(questionStore);
  }),

  // GET single question by ID
  http.get(`${API_BASE}/questions/:id`, ({ params }) => {
    const question = questionStore.find((q) => q.id === params.id);
    if (!question) {
      return HttpResponse.json(
        { message: 'Assessment question not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
    return HttpResponse.json(question);
  }),

  // CREATE question
  http.post(`${API_BASE}/questions`, async ({ request }) => {
    const url = new URL(request.url);
    const behavioralIndicatorId = url.searchParams.get('behavioralIndicatorId');
    const body = await request.json() as Partial<AssessmentQuestion>;

    // Validate required fields
    if (!body.questionText || body.questionText.length < 10) {
      return HttpResponse.json(
        { message: 'Question text must be at least 10 characters', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }
    if (!behavioralIndicatorId) {
      return HttpResponse.json(
        { message: 'Behavioral indicator ID is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const newQuestion: AssessmentQuestion = {
      id: `q-${Date.now()}`,
      behavioralIndicatorId: behavioralIndicatorId,
      questionText: body.questionText,
      questionType: body.questionType || QuestionType.LIKERT_SCALE,
      answerOptions: body.answerOptions || [],
      scoringRubric: body.scoringRubric || '',
      timeLimit: body.timeLimit || 60,
      difficultyLevel: body.difficultyLevel || DifficultyLevel.INTERMEDIATE,
      metadata: body.metadata || {},
      isActive: body.isActive ?? true,
      orderIndex: body.orderIndex || 1,
    };

    questionStore.push(newQuestion);
    return HttpResponse.json(newQuestion, { status: 201 });
  }),

  // UPDATE question
  http.put(`${API_BASE}/questions/:id`, async ({ params, request }) => {
    const body = await request.json() as Partial<AssessmentQuestion>;
    const index = questionStore.findIndex((q) => q.id === params.id);

    if (index === -1) {
      return HttpResponse.json(
        { message: 'Assessment question not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate question text if provided
    if (body.questionText && body.questionText.length < 10) {
      return HttpResponse.json(
        { message: 'Question text must be at least 10 characters', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const updated: AssessmentQuestion = {
      ...questionStore[index],
      ...body,
      id: params.id as string,
    };

    questionStore[index] = updated;
    return HttpResponse.json(updated);
  }),

  // DELETE question
  http.delete(`${API_BASE}/questions/:id`, ({ params }) => {
    const index = questionStore.findIndex((q) => q.id === params.id);

    if (index === -1) {
      return HttpResponse.json(
        { message: 'Assessment question not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    questionStore.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ==========================================
  // USERS
  // ==========================================

  http.get(`${API_BASE}/users`, () => {
    return HttpResponse.json(mockUsers);
  }),

  http.get(`${API_BASE}/users/:id`, ({ params }) => {
    const user = mockUsers.find((u) => u.id === params.id);
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
    return HttpResponse.json(user);
  }),

  // ==========================================
  // TEST TEMPLATES
  // ==========================================

  http.get(`${API_BASE}/v1/tests/templates`, () => {
    return HttpResponse.json(mockTestTemplates);
  }),

  http.get(`${API_BASE}/v1/tests/templates/active`, () => {
    return HttpResponse.json(
      mockTestTemplates.content.filter((t) => t.isActive)
    );
  }),

  http.get(`${API_BASE}/v1/tests/templates/:id`, ({ params }) => {
    const template = mockTestTemplates.content.find((t) => t.id === params.id);
    if (!template) {
      return HttpResponse.json(
        { message: 'Template not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
    return HttpResponse.json(template);
  }),

  // ==========================================
  // TEST SESSIONS
  // ==========================================

  http.get(`${API_BASE}/v1/tests/sessions`, () => {
    return HttpResponse.json({
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 10,
      number: 0,
    });
  }),
];

// ============================================
// ERROR HANDLERS FOR TESTING ERROR SCENARIOS
// ============================================
export const errorHandlers = {
  /**
   * Handler that simulates a server error for competencies
   */
  competencyServerError: http.get(`${API_BASE}/competencies`, () => {
    return HttpResponse.json(
      { message: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }),

  /**
   * Handler that simulates an unauthorized error
   */
  competencyUnauthorized: http.get(`${API_BASE}/competencies`, () => {
    return HttpResponse.json(
      { message: 'Authentication required', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }),

  /**
   * Handler that simulates a forbidden error
   */
  competencyForbidden: http.get(`${API_BASE}/competencies`, () => {
    return HttpResponse.json(
      { message: 'Access denied', code: 'FORBIDDEN' },
      { status: 403 }
    );
  }),

  /**
   * Handler that simulates a network timeout
   */
  competencyTimeout: http.get(`${API_BASE}/competencies`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 30000));
    return HttpResponse.json([]);
  }),

  /**
   * Handler that simulates a validation error on create
   */
  competencyValidationError: http.post(`${API_BASE}/competencies`, () => {
    return HttpResponse.json(
      {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: [
          { field: 'name', message: 'Name is required' },
          { field: 'description', message: 'Description is required' },
        ]
      },
      { status: 400 }
    );
  }),
};

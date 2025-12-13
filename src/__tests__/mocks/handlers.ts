/**
 * MSW Request Handlers for API Mocking
 */
import { http, HttpResponse } from 'msw';

const API_BASE = 'http://localhost:8080/api';

// Sample mock data
export const mockCompetencies = [
  {
    id: 'comp-1',
    name: 'Communication',
    description: 'Effective verbal and written communication skills',
    category: 'INTERPERSONAL',
    level: 'PROFICIENT',
    isActive: true,
    approvalStatus: 'APPROVED',
    behavioralIndicators: [],
    lastModified: new Date().toISOString(),
    standardCodes: {},
  },
  {
    id: 'comp-2',
    name: 'Problem Solving',
    description: 'Ability to analyze and solve complex problems',
    category: 'COGNITIVE',
    level: 'ADVANCED',
    isActive: true,
    approvalStatus: 'APPROVED',
    behavioralIndicators: [],
    lastModified: new Date().toISOString(),
    standardCodes: {},
  },
];

export const mockBehavioralIndicators = [
  {
    id: 'bi-1',
    title: 'Active Listening',
    description: 'Demonstrates attentive listening in conversations',
    competencyId: 'comp-1',
    weight: 0.3,
    orderIndex: 1,
    observabilityLevel: 'DIRECTLY_OBSERVABLE',
    measurementType: 'LIKERT_SCALE',
    examples: 'Maintains eye contact, asks clarifying questions',
    counterExamples: 'Interrupts frequently, appears distracted',
    isActive: true,
    approvalStatus: 'APPROVED',
  },
];

export const mockQuestions = [
  {
    id: 'q-1',
    questionText: 'How often do you seek feedback from colleagues?',
    questionType: 'LIKERT_SCALE',
    answerOptions: [
      { id: 'opt-1', label: 'Never', value: 1 },
      { id: 'opt-2', label: 'Rarely', value: 2 },
      { id: 'opt-3', label: 'Sometimes', value: 3 },
      { id: 'opt-4', label: 'Often', value: 4 },
      { id: 'opt-5', label: 'Always', value: 5 },
    ],
    scoringRubric: 'Higher scores indicate more proactive feedback seeking',
    timeLimit: 30,
    difficultyLevel: 'INTERMEDIATE',
    isActive: true,
    orderIndex: 1,
  },
];

export const mockUsers = [
  {
    id: 'user-1',
    clerkId: 'clerk_test123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'USER',
    isActive: true,
  },
];

export const mockTestTemplates = {
  content: [
    {
      id: 'template-1',
      name: 'Overview Assessment',
      type: 'OVERVIEW',
      description: 'General soft skills assessment',
      isActive: true,
    },
  ],
  totalElements: 1,
  totalPages: 1,
  size: 10,
  number: 0,
};

export const handlers = [
  // Competencies
  http.get(`${API_BASE}/competencies`, () => {
    return HttpResponse.json(mockCompetencies);
  }),

  http.get(`${API_BASE}/competencies/:id`, ({ params }) => {
    const competency = mockCompetencies.find((c) => c.id === params.id);
    if (!competency) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(competency);
  }),

  http.post(`${API_BASE}/competencies`, async ({ request }) => {
    const body = await request.json();
    const newCompetency = { id: `comp-${Date.now()}`, ...body };
    return HttpResponse.json(newCompetency, { status: 201 });
  }),

  http.put(`${API_BASE}/competencies/:id`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: params.id, ...body });
  }),

  http.delete(`${API_BASE}/competencies/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Behavioral Indicators
  http.get(`${API_BASE}/behavioral-indicators`, () => {
    return HttpResponse.json(mockBehavioralIndicators);
  }),

  http.get(`${API_BASE}/behavioral-indicators/:id`, ({ params }) => {
    const indicator = mockBehavioralIndicators.find((bi) => bi.id === params.id);
    if (!indicator) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(indicator);
  }),

  // Questions
  http.get(`${API_BASE}/questions`, () => {
    return HttpResponse.json(mockQuestions);
  }),

  http.get(`${API_BASE}/questions/:id`, ({ params }) => {
    const question = mockQuestions.find((q) => q.id === params.id);
    if (!question) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(question);
  }),

  // Users
  http.get(`${API_BASE}/users`, () => {
    return HttpResponse.json(mockUsers);
  }),

  http.get(`${API_BASE}/users/:id`, ({ params }) => {
    const user = mockUsers.find((u) => u.id === params.id);
    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(user);
  }),

  // Test Templates
  http.get(`${API_BASE}/v1/tests/templates`, () => {
    return HttpResponse.json(mockTestTemplates);
  }),

  // Test Sessions
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

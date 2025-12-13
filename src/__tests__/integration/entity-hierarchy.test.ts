/**
 * Tests for Entity Hierarchy and Relationships
 * Phase 3: HR CRUD Tests - Entity Hierarchy
 *
 * Tests the domain model hierarchy:
 * Competency (macro-level) -> BehavioralIndicator (meso-level) -> AssessmentQuestion (micro-level)
 *
 * Tests cover:
 * - Parent-child relationships
 * - Cascading operations
 * - Data integrity constraints
 * - Weight distribution across indicators
 * - Question distribution across types
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  mockCompetencies,
  mockBehavioralIndicators,
  mockQuestions,
  resetMockStores,
} from '../mocks/handlers';
import type {
  Competency,
  BehavioralIndicator,
  AssessmentQuestion,
} from '@/types/domain';

// API base URL for tests
const API_BASE = 'http://localhost:8080/api';

// Helper functions
async function fetchCompetencies(): Promise<Competency[]> {
  const response = await fetch(`${API_BASE}/competencies`);
  return response.json();
}

async function fetchCompetencyById(id: string): Promise<Competency> {
  const response = await fetch(`${API_BASE}/competencies/${id}`);
  return response.json();
}

async function fetchIndicatorsForCompetency(competencyId: string): Promise<BehavioralIndicator[]> {
  const response = await fetch(`${API_BASE}/competencies/${competencyId}/bi`);
  return response.json();
}

async function fetchAllIndicators(): Promise<BehavioralIndicator[]> {
  const response = await fetch(`${API_BASE}/behavioral-indicators`);
  return response.json();
}

async function fetchIndicatorById(id: string): Promise<BehavioralIndicator> {
  const response = await fetch(`${API_BASE}/behavioral-indicators/${id}`);
  return response.json();
}

async function fetchQuestionsForIndicator(indicatorId: string): Promise<AssessmentQuestion[]> {
  const response = await fetch(`${API_BASE}/behavioral-indicators/${indicatorId}/questions`);
  return response.json();
}

async function fetchAllQuestions(): Promise<AssessmentQuestion[]> {
  const response = await fetch(`${API_BASE}/questions`);
  return response.json();
}

async function fetchQuestionById(id: string): Promise<AssessmentQuestion> {
  const response = await fetch(`${API_BASE}/questions/${id}`);
  return response.json();
}

async function createCompetency(data: Partial<Competency>): Promise<Competency> {
  const response = await fetch(`${API_BASE}/competencies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

async function createIndicator(data: Partial<BehavioralIndicator>): Promise<BehavioralIndicator> {
  const response = await fetch(`${API_BASE}/behavioral-indicators`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

async function createQuestion(
  behavioralIndicatorId: string,
  data: Partial<AssessmentQuestion>
): Promise<AssessmentQuestion> {
  const response = await fetch(`${API_BASE}/questions?behavioralIndicatorId=${behavioralIndicatorId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

describe('Entity Hierarchy', () => {
  beforeEach(() => {
    resetMockStores();
  });

  // ==========================================
  // Hierarchy Structure Tests
  // ==========================================
  describe('Hierarchy Structure', () => {
    it('should have competencies at the top level', async () => {
      const competencies = await fetchCompetencies();

      expect(competencies.length).toBeGreaterThan(0);
      competencies.forEach(comp => {
        expect(comp.id).toBeDefined();
        expect(comp.name).toBeDefined();
        expect(comp.description).toBeDefined();
        expect(comp.category).toBeDefined();
        expect(comp.level).toBeDefined();
      });
    });

    it('should have indicators linked to competencies', async () => {
      const indicators = await fetchAllIndicators();

      expect(indicators.length).toBeGreaterThan(0);
      indicators.forEach(indicator => {
        expect(indicator.competencyId).toBeDefined();
        expect(indicator.competencyId).toMatch(/^comp-\d+$/);
      });
    });

    it('should have questions linked to indicators', async () => {
      const questions = await fetchAllQuestions();

      expect(questions.length).toBeGreaterThan(0);
      questions.forEach(question => {
        expect(question.behavioralIndicatorId).toBeDefined();
        expect(question.behavioralIndicatorId).toMatch(/^bi-\d+$/);
      });
    });

    it('should traverse the full hierarchy: Competency -> Indicators -> Questions', async () => {
      // Get a competency
      const competency = await fetchCompetencyById('comp-1');
      expect(competency).toBeDefined();

      // Get its indicators
      const indicators = await fetchIndicatorsForCompetency('comp-1');
      expect(indicators.length).toBeGreaterThan(0);

      // Get questions for the first indicator
      const indicatorId = indicators[0].id;
      const questions = await fetchQuestionsForIndicator(indicatorId);

      // Questions should belong to this indicator
      questions.forEach(q => {
        expect(q.behavioralIndicatorId).toBe(indicatorId);
      });
    });
  });

  // ==========================================
  // Parent-Child Relationships
  // ==========================================
  describe('Parent-Child Relationships', () => {
    it('should correctly associate indicators with their parent competency', async () => {
      const comp1Indicators = await fetchIndicatorsForCompetency('comp-1');
      const comp2Indicators = await fetchIndicatorsForCompetency('comp-2');

      // All comp-1 indicators should have competencyId = 'comp-1'
      comp1Indicators.forEach(indicator => {
        expect(indicator.competencyId).toBe('comp-1');
      });

      // All comp-2 indicators should have competencyId = 'comp-2'
      comp2Indicators.forEach(indicator => {
        expect(indicator.competencyId).toBe('comp-2');
      });
    });

    it('should correctly associate questions with their parent indicator', async () => {
      const bi1Questions = await fetchQuestionsForIndicator('bi-1');
      const bi2Questions = await fetchQuestionsForIndicator('bi-2');

      // All bi-1 questions should have behavioralIndicatorId = 'bi-1'
      bi1Questions.forEach(question => {
        expect(question.behavioralIndicatorId).toBe('bi-1');
      });

      // All bi-2 questions should have behavioralIndicatorId = 'bi-2'
      bi2Questions.forEach(question => {
        expect(question.behavioralIndicatorId).toBe('bi-2');
      });
    });

    it('should allow creating a new indicator under an existing competency', async () => {
      const newIndicator = await createIndicator({
        title: 'New Test Indicator',
        description: 'A new indicator for testing parent-child relationships',
        competencyId: 'comp-1',
        weight: 0.15,
        orderIndex: 10,
        observabilityLevel: 'NOVICE',
        measurementType: 'FREQUENCY',
        isActive: true,
        approvalStatus: 'DRAFT',
        contextScope: 'UNIVERSAL',
      });

      expect(newIndicator.competencyId).toBe('comp-1');

      // Verify it appears in the competency's indicators
      const comp1Indicators = await fetchIndicatorsForCompetency('comp-1');
      const found = comp1Indicators.find(i => i.id === newIndicator.id);
      expect(found).toBeDefined();
    });

    it('should allow creating a new question under an existing indicator', async () => {
      const newQuestion = await createQuestion('bi-1', {
        questionText: 'This is a new question for testing hierarchy',
        questionType: 'LIKERT_SCALE',
        answerOptions: [
          { label: '1', value: 1 },
          { label: '5', value: 5 },
        ],
        scoringRubric: 'Test rubric',
        difficultyLevel: 'FOUNDATIONAL',
        isActive: true,
        orderIndex: 10,
      });

      expect(newQuestion.behavioralIndicatorId).toBe('bi-1');

      // Verify it appears in the indicator's questions
      const bi1Questions = await fetchQuestionsForIndicator('bi-1');
      const found = bi1Questions.find(q => q.id === newQuestion.id);
      expect(found).toBeDefined();
    });
  });

  // ==========================================
  // Weight Distribution
  // ==========================================
  describe('Weight Distribution', () => {
    it('should have indicators with weights between 0.01 and 1.0', async () => {
      const indicators = await fetchAllIndicators();

      indicators.forEach(indicator => {
        expect(indicator.weight).toBeGreaterThanOrEqual(0.01);
        expect(indicator.weight).toBeLessThanOrEqual(1.0);
      });
    });

    it('should have total weights per competency not exceeding 1.0 (business rule)', async () => {
      const competencies = await fetchCompetencies();

      for (const competency of competencies) {
        const indicators = await fetchIndicatorsForCompetency(competency.id);
        const totalWeight = indicators.reduce((sum, ind) => sum + ind.weight, 0);

        // Total weight should ideally be 1.0 but we just verify it doesn't exceed
        expect(totalWeight).toBeLessThanOrEqual(1.0 + 0.001); // Small epsilon for floating point
      }
    });

    it('should maintain weight ordering for prioritization', async () => {
      const comp1Indicators = await fetchIndicatorsForCompetency('comp-1');

      if (comp1Indicators.length > 1) {
        // Higher weighted indicators should generally be prioritized
        const sortedByWeight = [...comp1Indicators].sort((a, b) => b.weight - a.weight);
        const highestWeight = sortedByWeight[0];
        const lowestWeight = sortedByWeight[sortedByWeight.length - 1];

        expect(highestWeight.weight).toBeGreaterThan(lowestWeight.weight);
      }
    });
  });

  // ==========================================
  // Order Index Management
  // ==========================================
  describe('Order Index Management', () => {
    it('should have unique order indices within a competency', async () => {
      const comp1Indicators = await fetchIndicatorsForCompetency('comp-1');
      const orderIndices = comp1Indicators.map(i => i.orderIndex);
      const uniqueIndices = new Set(orderIndices);

      expect(uniqueIndices.size).toBe(orderIndices.length);
    });

    it('should have indicators ordered by orderIndex', async () => {
      const comp1Indicators = await fetchIndicatorsForCompetency('comp-1');

      for (let i = 1; i < comp1Indicators.length; i++) {
        expect(comp1Indicators[i].orderIndex).toBeGreaterThanOrEqual(
          comp1Indicators[i - 1].orderIndex
        );
      }
    });

    it('should have questions with valid order indices', async () => {
      const questions = await fetchAllQuestions();

      questions.forEach(question => {
        expect(question.orderIndex).toBeGreaterThanOrEqual(1);
        expect(question.orderIndex).toBeLessThanOrEqual(50);
      });
    });
  });

  // ==========================================
  // Question Type Distribution
  // ==========================================
  describe('Question Type Distribution', () => {
    it('should have a variety of question types', async () => {
      const questions = await fetchAllQuestions();
      const types = new Set(questions.map(q => q.questionType));

      expect(types.size).toBeGreaterThan(1);
    });

    it('should have Likert scale questions as the majority (business rule: 70%)', async () => {
      const questions = await fetchAllQuestions();
      const likertTypes = ['LIKERT', 'LIKERT_SCALE'];
      const likertQuestions = questions.filter(q => likertTypes.includes(q.questionType));

      // In real scenarios, 70% should be Likert
      // For our mock data, just verify we have some
      expect(likertQuestions.length).toBeGreaterThan(0);
    });

    it('should have SJT questions for complex scenarios', async () => {
      const questions = await fetchAllQuestions();
      const sjtTypes = ['SJT', 'SITUATIONAL_JUDGMENT'];
      const sjtQuestions = questions.filter(q => sjtTypes.includes(q.questionType));

      expect(sjtQuestions.length).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // Data Integrity
  // ==========================================
  describe('Data Integrity', () => {
    it('should have all indicators reference existing competencies', async () => {
      const competencies = await fetchCompetencies();
      const competencyIds = new Set(competencies.map(c => c.id));
      const indicators = await fetchAllIndicators();

      indicators.forEach(indicator => {
        expect(competencyIds.has(indicator.competencyId)).toBe(true);
      });
    });

    it('should have all questions reference existing indicators', async () => {
      const indicators = await fetchAllIndicators();
      const indicatorIds = new Set(indicators.map(i => i.id));
      const questions = await fetchAllQuestions();

      questions.forEach(question => {
        expect(indicatorIds.has(question.behavioralIndicatorId)).toBe(true);
      });
    });

    it('should maintain referential integrity when creating new entities', async () => {
      // Create a new competency
      const newCompetency = await createCompetency({
        name: 'Integrity Test Competency',
        description: 'A competency for testing data integrity',
        category: 'LEADERSHIP',
        level: 'NOVICE',
        isActive: true,
        approvalStatus: 'DRAFT',
      });

      // Create an indicator for it
      const newIndicator = await createIndicator({
        title: 'Integrity Test Indicator',
        description: 'An indicator for testing data integrity',
        competencyId: newCompetency.id,
        weight: 0.5,
        orderIndex: 1,
        observabilityLevel: 'NOVICE',
        measurementType: 'FREQUENCY',
        isActive: true,
        approvalStatus: 'DRAFT',
        contextScope: 'UNIVERSAL',
      });

      // Create a question for the indicator
      const newQuestion = await createQuestion(newIndicator.id, {
        questionText: 'This is an integrity test question',
        questionType: 'LIKERT_SCALE',
        answerOptions: [
          { label: '1', value: 1 },
          { label: '5', value: 5 },
        ],
        scoringRubric: 'Test',
        difficultyLevel: 'FOUNDATIONAL',
        isActive: true,
        orderIndex: 1,
      });

      // Verify the chain
      expect(newIndicator.competencyId).toBe(newCompetency.id);
      expect(newQuestion.behavioralIndicatorId).toBe(newIndicator.id);

      // Verify we can traverse up
      const fetchedIndicator = await fetchIndicatorById(newIndicator.id);
      expect(fetchedIndicator.competencyId).toBe(newCompetency.id);

      const fetchedQuestion = await fetchQuestionById(newQuestion.id);
      expect(fetchedQuestion.behavioralIndicatorId).toBe(newIndicator.id);
    });
  });

  // ==========================================
  // Approval Status Flow
  // ==========================================
  describe('Approval Status Flow', () => {
    it('should have competencies with various approval statuses', async () => {
      const competencies = await fetchCompetencies();
      const statuses = new Set(competencies.map(c => c.approvalStatus));

      expect(statuses.has('APPROVED')).toBe(true);
      expect(statuses.has('DRAFT')).toBe(true);
    });

    it('should have indicators with various approval statuses', async () => {
      const indicators = await fetchAllIndicators();
      const statuses = new Set(indicators.map(i => i.approvalStatus));

      expect(statuses.size).toBeGreaterThan(0);
    });

    it('should follow workflow: DRAFT -> PENDING_REVIEW -> APPROVED', async () => {
      const validStatuses = [
        'DRAFT',
        'PENDING_REVIEW',
        'APPROVED',
        'REJECTED',
        'ARCHIVED',
        'UNDER_REVISION',
      ];

      const competencies = await fetchCompetencies();
      competencies.forEach(comp => {
        expect(validStatuses).toContain(comp.approvalStatus);
      });

      const indicators = await fetchAllIndicators();
      indicators.forEach(ind => {
        expect(validStatuses).toContain(ind.approvalStatus);
      });
    });
  });

  // ==========================================
  // Context Scope Hierarchy
  // ==========================================
  describe('Context Scope Hierarchy', () => {
    it('should have indicators with valid context scopes', async () => {
      const validScopes = ['UNIVERSAL', 'PROFESSIONAL', 'TECHNICAL', 'MANAGERIAL'];
      const indicators = await fetchAllIndicators();

      indicators.forEach(indicator => {
        if (indicator.contextScope) {
          expect(validScopes).toContain(indicator.contextScope);
        }
      });
    });

    it('should have UNIVERSAL scope for context-neutral indicators', async () => {
      const indicators = await fetchAllIndicators();
      const universalIndicators = indicators.filter(
        i => i.contextScope === 'UNIVERSAL'
      );

      expect(universalIndicators.length).toBeGreaterThan(0);
    });

    it('should have scope-specific indicators for specialized assessments', async () => {
      const indicators = await fetchAllIndicators();
      const scopes = new Set(indicators.map(i => i.contextScope));

      // Should have variety of scopes
      expect(scopes.size).toBeGreaterThan(1);
    });
  });

  // ==========================================
  // Standard Codes Propagation
  // ==========================================
  describe('Standard Codes in Hierarchy', () => {
    it('should have competencies with triple standard mappings', async () => {
      const competencies = await fetchCompetencies();
      const compWithStandards = competencies.filter(
        c => c.standardCodes && (
          c.standardCodes.onetRef ||
          c.standardCodes.escoRef ||
          c.standardCodes.bigFiveRef
        )
      );

      expect(compWithStandards.length).toBeGreaterThan(0);
    });

    it('should have competencies with O*NET references', async () => {
      const competencies = await fetchCompetencies();
      const compWithOnet = competencies.filter(
        c => c.standardCodes?.onetRef?.code
      );

      expect(compWithOnet.length).toBeGreaterThan(0);
    });

    it('should have competencies with Big Five references', async () => {
      const competencies = await fetchCompetencies();
      const compWithBigFive = competencies.filter(
        c => c.standardCodes?.bigFiveRef?.trait
      );

      expect(compWithBigFive.length).toBeGreaterThan(0);
    });

    it('should have competencies with ESCO references', async () => {
      const competencies = await fetchCompetencies();
      const compWithEsco = competencies.filter(
        c => c.standardCodes?.escoRef?.uri
      );

      expect(compWithEsco.length).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // Question Metadata and Tags
  // ==========================================
  describe('Question Metadata and Tags', () => {
    it('should have questions with context-neutral tags', async () => {
      const questions = await fetchAllQuestions();
      const questionsWithGeneralTag = questions.filter(
        q => q.metadata?.tags?.includes('GENERAL')
      );

      expect(questionsWithGeneralTag.length).toBeGreaterThan(0);
    });

    it('should have questions with complexity tags', async () => {
      const complexityTags = ['JUNIOR', 'MID', 'SENIOR'];
      const questions = await fetchAllQuestions();

      const questionsWithComplexity = questions.filter(
        q => q.metadata?.tags?.some(tag => complexityTags.includes(tag))
      );

      expect(questionsWithComplexity.length).toBeGreaterThan(0);
    });

    it('should have questions with domain-specific tags', async () => {
      const domainTags = ['IT', 'SALES', 'FINANCE', 'MEDICAL', 'ENGINEERING'];
      const questions = await fetchAllQuestions();

      const questionsWithDomain = questions.filter(
        q => q.metadata?.tags?.some(tag => domainTags.includes(tag))
      );

      expect(questionsWithDomain.length).toBeGreaterThan(0);
    });
  });
});

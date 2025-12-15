/**
 * Tests for Behavioral Indicators API Service
 * Phase 3: HR CRUD Tests - Behavioral Indicators
 *
 * Tests cover:
 * - READ operations (getAllIndicators, getIndicatorById)
 * - CREATE operation (createIndicator)
 * - UPDATE operation (updateIndicator)
 * - DELETE operation (deleteIndicator)
 * - Error handling scenarios
 * - Question associations
 * - Weight validation
 * - Context scope handling
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import {
  mockBehavioralIndicators,
  mockQuestions,
  resetMockStores,
} from '../mocks/handlers';
import type {
  BehavioralIndicator,
} from '@/types/domain';
import {
  ObservabilityLevel,
  ApprovalStatus,
  IndicatorMeasurementType,
  ContextScope,
} from '@/types/domain';

// API base URL for tests
const API_BASE = 'http://localhost:8080/api';

// Helper functions for API calls
async function fetchIndicators(): Promise<BehavioralIndicator[]> {
  const response = await fetch(`${API_BASE}/behavioral-indicators`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function fetchIndicatorById(id: string): Promise<BehavioralIndicator> {
  const response = await fetch(`${API_BASE}/behavioral-indicators/${id}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function createIndicator(data: Partial<BehavioralIndicator>): Promise<BehavioralIndicator> {
  const response = await fetch(`${API_BASE}/behavioral-indicators`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

async function updateIndicator(id: string, data: Partial<BehavioralIndicator>): Promise<BehavioralIndicator> {
  const response = await fetch(`${API_BASE}/behavioral-indicators/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

async function deleteIndicator(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/behavioral-indicators/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP ${response.status}`);
  }
}

async function fetchIndicatorQuestions(indicatorId: string): Promise<unknown[]> {
  const response = await fetch(`${API_BASE}/behavioral-indicators/${indicatorId}/questions`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

describe('Behavioral Indicators API', () => {
  beforeEach(() => {
    resetMockStores();
  });

  // ==========================================
  // READ Operations
  // ==========================================
  describe('READ Operations', () => {
    describe('getAllIndicators', () => {
      it('should fetch all behavioral indicators', async () => {
        const indicators = await fetchIndicators();

        expect(indicators).toBeInstanceOf(Array);
        expect(indicators.length).toBe(mockBehavioralIndicators.length);
      });

      it('should return indicators with correct structure', async () => {
        const indicators = await fetchIndicators();
        const first = indicators[0];

        expect(first).toHaveProperty('id');
        expect(first).toHaveProperty('title');
        expect(first).toHaveProperty('description');
        expect(first).toHaveProperty('competencyId');
        expect(first).toHaveProperty('weight');
        expect(first).toHaveProperty('orderIndex');
        expect(first).toHaveProperty('observabilityLevel');
        expect(first).toHaveProperty('measurementType');
        expect(first).toHaveProperty('examples');
        expect(first).toHaveProperty('counterExamples');
        expect(first).toHaveProperty('isActive');
        expect(first).toHaveProperty('approvalStatus');
        expect(first).toHaveProperty('contextScope');
      });

      it('should return indicators with valid weight values', async () => {
        const indicators = await fetchIndicators();

        indicators.forEach(indicator => {
          expect(indicator.weight).toBeGreaterThanOrEqual(0);
          expect(indicator.weight).toBeLessThanOrEqual(1);
        });
      });

      it('should return indicators with valid context scopes', async () => {
        const indicators = await fetchIndicators();
        const validScopes = ['UNIVERSAL', 'PROFESSIONAL', 'TECHNICAL', 'MANAGERIAL'];

        indicators.forEach(indicator => {
          if (indicator.contextScope) {
            expect(validScopes).toContain(indicator.contextScope);
          }
        });
      });

      it('should return indicators linked to competencies', async () => {
        const indicators = await fetchIndicators();

        indicators.forEach(indicator => {
          expect(indicator.competencyId).toBeDefined();
          expect(indicator.competencyId).toMatch(/^comp-\d+$/);
        });
      });
    });

    describe('getIndicatorById', () => {
      it('should fetch a single indicator by ID', async () => {
        const indicator = await fetchIndicatorById('bi-1');

        expect(indicator).toBeDefined();
        expect(indicator.id).toBe('bi-1');
        expect(indicator.title).toBe('Active Listening');
      });

      it('should return 404 for non-existent indicator', async () => {
        await expect(fetchIndicatorById('non-existent-id')).rejects.toThrow();
      });

      it('should return indicator with examples and counter-examples', async () => {
        const indicator = await fetchIndicatorById('bi-1');

        expect(indicator.examples).toBeDefined();
        expect(indicator.counterExamples).toBeDefined();
        expect(indicator.examples!.length).toBeGreaterThan(0);
        expect(indicator.counterExamples!.length).toBeGreaterThan(0);
      });
    });
  });

  // ==========================================
  // CREATE Operations
  // ==========================================
  describe('CREATE Operations', () => {
    it('should create a new indicator with required fields', async () => {
      const newIndicator = await createIndicator({
        title: 'New Behavioral Indicator',
        description: 'A description that is at least 10 characters long',
        competencyId: 'comp-1',
        weight: 0.25,
        orderIndex: 3,
        observabilityLevel: ObservabilityLevel.DIRECTLY_OBSERVABLE,
        measurementType: IndicatorMeasurementType.QUALITY,
        isActive: true,
        approvalStatus: ApprovalStatus.DRAFT,
        contextScope: ContextScope.UNIVERSAL,
      });

      expect(newIndicator).toBeDefined();
      expect(newIndicator.id).toMatch(/^bi-\d+$/);
      expect(newIndicator.title).toBe('New Behavioral Indicator');
      expect(newIndicator.competencyId).toBe('comp-1');
    });

    it('should create an indicator with examples and counter-examples', async () => {
      const newIndicator = await createIndicator({
        title: 'Indicator with Examples',
        description: 'Testing examples and counter-examples fields',
        competencyId: 'comp-1',
        weight: 0.2,
        orderIndex: 4,
        observabilityLevel: ObservabilityLevel.PARTIALLY_OBSERVABLE,
        measurementType: IndicatorMeasurementType.IMPACT,
        examples: 'Positive example 1, Positive example 2',
        counterExamples: 'Negative example 1, Negative example 2',
        isActive: true,
        approvalStatus: ApprovalStatus.DRAFT,
        contextScope: ContextScope.PROFESSIONAL,
      });

      expect(newIndicator.examples).toBe('Positive example 1, Positive example 2');
      expect(newIndicator.counterExamples).toBe('Negative example 1, Negative example 2');
    });

    it('should fail to create indicator with short title', async () => {
      await expect(
        createIndicator({
          title: 'Shor', // Too short (< 5 chars)
          description: 'A valid description that is long enough',
          competencyId: 'comp-1',
          weight: 0.2,
          orderIndex: 1,
          observabilityLevel: ObservabilityLevel.DIRECTLY_OBSERVABLE,
          measurementType: IndicatorMeasurementType.FREQUENCY,
          isActive: true,
          approvalStatus: ApprovalStatus.DRAFT,
          contextScope: ContextScope.UNIVERSAL,
        })
      ).rejects.toThrow('Title must be at least 5 characters');
    });

    it('should fail to create indicator with short description', async () => {
      await expect(
        createIndicator({
          title: 'Valid Title',
          description: 'Short', // Too short (< 10 chars)
          competencyId: 'comp-1',
          weight: 0.2,
          orderIndex: 1,
          observabilityLevel: ObservabilityLevel.DIRECTLY_OBSERVABLE,
          measurementType: IndicatorMeasurementType.FREQUENCY,
          isActive: true,
          approvalStatus: ApprovalStatus.DRAFT,
          contextScope: ContextScope.UNIVERSAL,
        })
      ).rejects.toThrow('Description must be at least 10 characters');
    });

    it('should fail to create indicator without competencyId', async () => {
      await expect(
        createIndicator({
          title: 'Valid Title Here',
          description: 'A valid description that is long enough',
          weight: 0.2,
          orderIndex: 1,
          observabilityLevel: ObservabilityLevel.DIRECTLY_OBSERVABLE,
          measurementType: IndicatorMeasurementType.FREQUENCY,
          isActive: true,
          approvalStatus: ApprovalStatus.DRAFT,
          contextScope: ContextScope.UNIVERSAL,
        })
      ).rejects.toThrow('Competency ID is required');
    });

    it('should create indicator with all context scopes', async () => {
      const scopes: ContextScope[] = [ContextScope.UNIVERSAL, ContextScope.PROFESSIONAL, ContextScope.TECHNICAL, ContextScope.MANAGERIAL];

      for (const scope of scopes) {
        const indicator = await createIndicator({
          title: `Indicator for ${scope}`,
          description: `Testing ${scope} context scope indicator`,
          competencyId: 'comp-1',
          weight: 0.1,
          orderIndex: 1,
          observabilityLevel: ObservabilityLevel.DIRECTLY_OBSERVABLE,
          measurementType: IndicatorMeasurementType.FREQUENCY,
          isActive: true,
          approvalStatus: ApprovalStatus.DRAFT,
          contextScope: scope,
        });

        expect(indicator.contextScope).toBe(scope);
      }
    });

    it('should persist created indicator to store', async () => {
      const initialCount = (await fetchIndicators()).length;

      await createIndicator({
        title: 'Persisted Indicator',
        description: 'This indicator should be persisted to the store',
        competencyId: 'comp-2',
        weight: 0.3,
        orderIndex: 5,
        observabilityLevel: ObservabilityLevel.INFERRED,
        measurementType: IndicatorMeasurementType.CONSISTENCY,
        isActive: true,
        approvalStatus: ApprovalStatus.DRAFT,
        contextScope: ContextScope.TECHNICAL,
      });

      const finalCount = (await fetchIndicators()).length;
      expect(finalCount).toBe(initialCount + 1);
    });
  });

  // ==========================================
  // UPDATE Operations
  // ==========================================
  describe('UPDATE Operations', () => {
    it('should update an existing indicator', async () => {
      const updated = await updateIndicator('bi-1', {
        title: 'Updated Active Listening',
        description: 'Updated description for active listening indicator',
      });

      expect(updated.id).toBe('bi-1');
      expect(updated.title).toBe('Updated Active Listening');
    });

    it('should update indicator weight', async () => {
      const updated = await updateIndicator('bi-1', {
        weight: 0.5,
      });

      expect(updated.weight).toBe(0.5);
    });

    it('should fail to update with invalid weight (too low)', async () => {
      await expect(
        updateIndicator('bi-1', {
          weight: 0.001, // Too low (< 0.01)
        })
      ).rejects.toThrow('Weight must be between 0.01 and 1');
    });

    it('should fail to update with invalid weight (too high)', async () => {
      await expect(
        updateIndicator('bi-1', {
          weight: 1.5, // Too high (> 1)
        })
      ).rejects.toThrow('Weight must be between 0.01 and 1');
    });

    it('should allow partial updates', async () => {
      const original = await fetchIndicatorById('bi-1');

      const updated = await updateIndicator('bi-1', {
        isActive: false,
      });

      expect(updated.title).toBe(original.title); // Unchanged
      expect(updated.description).toBe(original.description); // Unchanged
      expect(updated.isActive).toBe(false); // Changed
    });

    it('should update context scope', async () => {
      const updated = await updateIndicator('bi-1', {
        contextScope: ContextScope.MANAGERIAL,
      });

      expect(updated.contextScope).toBe('MANAGERIAL');
    });

    it('should update approval status', async () => {
      const updated = await updateIndicator('bi-3', {
        approvalStatus: ApprovalStatus.APPROVED,
      });

      expect(updated.approvalStatus).toBe('APPROVED');
    });

    it('should return 404 when updating non-existent indicator', async () => {
      await expect(
        updateIndicator('non-existent-id', {
          title: 'Test Update',
        })
      ).rejects.toThrow();
    });

    it('should update measurement type', async () => {
      const updated = await updateIndicator('bi-1', {
        measurementType: IndicatorMeasurementType.IMPROVEMENT,
      });

      expect(updated.measurementType).toBe('IMPROVEMENT');
    });
  });

  // ==========================================
  // DELETE Operations
  // ==========================================
  describe('DELETE Operations', () => {
    it('should delete an existing indicator', async () => {
      const initialCount = (await fetchIndicators()).length;

      await deleteIndicator('bi-3');

      const finalCount = (await fetchIndicators()).length;
      expect(finalCount).toBe(initialCount - 1);
    });

    it('should return 404 when deleting non-existent indicator', async () => {
      await expect(deleteIndicator('non-existent-id')).rejects.toThrow();
    });

    it('should make deleted indicator unfetchable', async () => {
      await deleteIndicator('bi-2');

      await expect(fetchIndicatorById('bi-2')).rejects.toThrow();
    });
  });

  // ==========================================
  // Question Relationships
  // ==========================================
  describe('Question Relationships', () => {
    it('should fetch questions for an indicator', async () => {
      const questions = await fetchIndicatorQuestions('bi-1');

      expect(Array.isArray(questions)).toBe(true);
    });

    it('should return only questions belonging to the indicator', async () => {
      const questions = await fetchIndicatorQuestions('bi-1');

      (questions as Array<{ behavioralIndicatorId: string }>).forEach((question) => {
        expect(question.behavioralIndicatorId).toBe('bi-1');
      });
    });

    it('should update indicator questions association', async () => {
      const response = await fetch(`${API_BASE}/behavioral-indicators/bi-2/questions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionIds: ['q-1', 'q-2'] }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.success).toBe(true);
    });
  });

  // ==========================================
  // Weight Distribution
  // ==========================================
  describe('Weight Distribution', () => {
    it('should have indicators with various weights', async () => {
      const indicators = await fetchIndicators();
      const weights = indicators.map(i => i.weight);
      const uniqueWeights = new Set(weights);

      expect(uniqueWeights.size).toBeGreaterThan(1);
    });

    it('should allow weight updates that maintain valid range', async () => {
      const validWeights = [0.01, 0.1, 0.25, 0.5, 0.75, 1.0];

      for (const weight of validWeights) {
        const updated = await updateIndicator('bi-1', { weight });
        expect(updated.weight).toBe(weight);
      }
    });
  });

  // ==========================================
  // Error Handling
  // ==========================================
  describe('Error Handling', () => {
    it('should handle server errors gracefully', async () => {
      server.use(
        http.get(`${API_BASE}/behavioral-indicators`, () => {
          return HttpResponse.json(
            { message: 'Internal server error', code: 'SERVER_ERROR' },
            { status: 500 }
          );
        })
      );

      await expect(fetchIndicators()).rejects.toThrow();
    });

    it('should handle not found errors', async () => {
      await expect(fetchIndicatorById('definitely-not-found')).rejects.toThrow();
    });
  });

  // ==========================================
  // Data Characteristics
  // ==========================================
  describe('Data Characteristics', () => {
    it('should return indicators with various measurement types', async () => {
      const indicators = await fetchIndicators();
      const measurementTypes = new Set(indicators.map(i => i.measurementType));

      expect(measurementTypes.size).toBeGreaterThan(1);
    });

    it('should return indicators with various observability levels', async () => {
      const indicators = await fetchIndicators();
      const levels = new Set(indicators.map(i => i.observabilityLevel));

      expect(levels.size).toBeGreaterThan(1);
    });

    it('should support Russian content in indicators', async () => {
      const russianIndicator = await createIndicator({
        title: 'Активное слушание', // "Active Listening" in Russian
        description: 'Демонстрирует внимательное слушание в разговорах', // Russian description
        competencyId: 'comp-1',
        weight: 0.2,
        orderIndex: 10,
        observabilityLevel: ObservabilityLevel.DIRECTLY_OBSERVABLE,
        measurementType: IndicatorMeasurementType.QUALITY,
        examples: 'Поддерживает зрительный контакт',
        counterExamples: 'Часто перебивает',
        isActive: true,
        approvalStatus: ApprovalStatus.DRAFT,
        contextScope: ContextScope.UNIVERSAL,
      });

      expect(russianIndicator.title).toBe('Активное слушание');
      expect(russianIndicator.description).toContain('слушание');
    });

    it('should order indicators by orderIndex', async () => {
      const indicators = await fetchIndicators();
      const comp1Indicators = indicators.filter(i => i.competencyId === 'comp-1');

      for (let i = 1; i < comp1Indicators.length; i++) {
        expect(comp1Indicators[i].orderIndex).toBeGreaterThanOrEqual(
          comp1Indicators[i - 1].orderIndex
        );
      }
    });
  });
});

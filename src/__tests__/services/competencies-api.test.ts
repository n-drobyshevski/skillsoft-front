/**
 * Tests for Competencies API Service
 * Phase 3: HR CRUD Tests - Competencies
 *
 * Tests cover:
 * - READ operations (getAllCompetencies, getCompetencyById)
 * - CREATE operation (createCompetency)
 * - UPDATE operation (updateCompetency)
 * - DELETE operation (deleteCompetency)
 * - Error handling scenarios
 * - Indicator attachment/detachment
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import {
  mockCompetencies,
  mockBehavioralIndicators,
  resetMockStores,
  errorHandlers,
} from '../mocks/handlers';
import type { Competency } from '@/types/domain';
import { CompetencyCategory, ApprovalStatus } from '@/types/domain';

// API base URL for tests
const API_BASE = 'http://localhost:8080/api';

// Helper to make API calls
async function fetchCompetencies(): Promise<Competency[]> {
  const response = await fetch(`${API_BASE}/competencies`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function fetchCompetencyById(id: string): Promise<Competency> {
  const response = await fetch(`${API_BASE}/competencies/${id}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function createCompetency(data: Partial<Competency>): Promise<Competency> {
  const response = await fetch(`${API_BASE}/competencies`, {
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

async function updateCompetency(id: string, data: Partial<Competency>): Promise<Competency> {
  const response = await fetch(`${API_BASE}/competencies/${id}`, {
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

async function deleteCompetency(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/competencies/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP ${response.status}`);
  }
}

describe('Competencies API', () => {
  beforeEach(() => {
    resetMockStores();
  });

  // ==========================================
  // READ Operations
  // ==========================================
  describe('READ Operations', () => {
    describe('getAllCompetencies', () => {
      it('should fetch all competencies', async () => {
        const competencies = await fetchCompetencies();

        expect(competencies).toBeInstanceOf(Array);
        expect(competencies.length).toBe(mockCompetencies.length);
      });

      it('should return competencies with correct structure', async () => {
        const competencies = await fetchCompetencies();
        const first = competencies[0];

        expect(first).toHaveProperty('id');
        expect(first).toHaveProperty('name');
        expect(first).toHaveProperty('description');
        expect(first).toHaveProperty('category');
        expect(first).toHaveProperty('isActive');
        expect(first).toHaveProperty('approvalStatus');
        expect(first).toHaveProperty('standardCodes');
        expect(first).toHaveProperty('version');
        expect(first).toHaveProperty('createdAt');
        expect(first).toHaveProperty('lastModified');
      });

      it('should return competencies with standard codes', async () => {
        const competencies = await fetchCompetencies();
        const communicationCompetency = competencies.find(c => c.name === 'Communication');

        expect(communicationCompetency).toBeDefined();
        expect(communicationCompetency?.standardCodes?.onetRef).toBeDefined();
        expect(communicationCompetency?.standardCodes?.escoRef).toBeDefined();
        expect(communicationCompetency?.standardCodes?.bigFiveRef).toBeDefined();
      });

      it('should return competencies filtered by active status', async () => {
        const competencies = await fetchCompetencies();
        const activeCompetencies = competencies.filter(c => c.isActive);
        const inactiveCompetencies = competencies.filter(c => !c.isActive);

        expect(activeCompetencies.length).toBeGreaterThan(0);
        expect(inactiveCompetencies.length).toBeGreaterThan(0);
      });

      it('should return competencies with different approval statuses', async () => {
        const competencies = await fetchCompetencies();
        const statuses = new Set(competencies.map(c => c.approvalStatus));

        expect(statuses.has(ApprovalStatus.APPROVED)).toBe(true);
        expect(statuses.has(ApprovalStatus.DRAFT)).toBe(true);
      });
    });

    describe('getCompetencyById', () => {
      it('should fetch a single competency by ID', async () => {
        const competency = await fetchCompetencyById('comp-1');

        expect(competency).toBeDefined();
        expect(competency.id).toBe('comp-1');
        expect(competency.name).toBe('Communication');
      });

      it('should return 404 for non-existent competency', async () => {
        await expect(fetchCompetencyById('non-existent-id')).rejects.toThrow();
      });

      it('should return competency with behavioral indicators array', async () => {
        const competency = await fetchCompetencyById('comp-1');

        expect(competency).toHaveProperty('behavioralIndicators');
        expect(Array.isArray(competency.behavioralIndicators)).toBe(true);
      });
    });
  });

  // ==========================================
  // CREATE Operations
  // ==========================================
  describe('CREATE Operations', () => {
    it('should create a new competency with minimal data', async () => {
      const newCompetency = await createCompetency({
        name: 'New Competency',
        description: 'A description that is at least 10 characters long',
        category: CompetencyCategory.LEADERSHIP,
        isActive: true,
        approvalStatus: ApprovalStatus.DRAFT,
      });

      expect(newCompetency).toBeDefined();
      expect(newCompetency.id).toMatch(/^comp-\d+$/);
      expect(newCompetency.name).toBe('New Competency');
      expect(newCompetency.description).toBe('A description that is at least 10 characters long');
    });

    it('should create a competency with standard codes', async () => {
      const newCompetency = await createCompetency({
        name: 'Competency with Standards',
        description: 'A competency mapped to international standards',
        category: CompetencyCategory.COGNITIVE,
        isActive: true,
        approvalStatus: ApprovalStatus.DRAFT,
        standardCodes: {
          onetRef: { code: '2.A.1.b', title: 'Written Comprehension' },
          bigFiveRef: { trait: 'OPENNESS', title: 'Openness' },
        },
      });

      expect(newCompetency.standardCodes?.onetRef?.code).toBe('2.A.1.b');
      expect(newCompetency.standardCodes?.bigFiveRef?.trait).toBe('OPENNESS');
    });

    it('should fail to create competency with short name', async () => {
      await expect(
        createCompetency({
          name: 'Ab', // Too short (< 3 chars)
          description: 'A valid description that is long enough',
          category: CompetencyCategory.LEADERSHIP,
          isActive: true,
          approvalStatus: ApprovalStatus.DRAFT,
        })
      ).rejects.toThrow('Name must be at least 3 characters');
    });

    it('should fail to create competency with short description', async () => {
      await expect(
        createCompetency({
          name: 'Valid Name',
          description: 'Short', // Too short (< 10 chars)
          category: CompetencyCategory.LEADERSHIP,
          isActive: true,
          approvalStatus: ApprovalStatus.DRAFT,
        })
      ).rejects.toThrow('Description must be at least 10 characters');
    });

    it('should create competency and persist to store', async () => {
      const initialCount = (await fetchCompetencies()).length;

      await createCompetency({
        name: 'Persisted Competency',
        description: 'This competency should be persisted to the store',
        category: CompetencyCategory.COMMUNICATION,
        isActive: true,
        approvalStatus: ApprovalStatus.DRAFT,
      });

      const finalCount = (await fetchCompetencies()).length;
      expect(finalCount).toBe(initialCount + 1);
    });

    it('should set default values for optional fields', async () => {
      const newCompetency = await createCompetency({
        name: 'Minimal Competency',
        description: 'Only required fields provided',
      });

      expect(newCompetency.version).toBe(1);
      expect(newCompetency.behavioralIndicators).toEqual([]);
      expect(newCompetency.createdAt).toBeDefined();
      expect(newCompetency.lastModified).toBeDefined();
    });
  });

  // ==========================================
  // UPDATE Operations
  // ==========================================
  describe('UPDATE Operations', () => {
    it('should update an existing competency', async () => {
      const updated = await updateCompetency('comp-1', {
        name: 'Updated Communication',
        description: 'Updated description for communication competency',
      });

      expect(updated.id).toBe('comp-1');
      expect(updated.name).toBe('Updated Communication');
      expect(updated.description).toBe('Updated description for communication competency');
    });

    it('should increment version on update', async () => {
      const original = await fetchCompetencyById('comp-1');
      const updated = await updateCompetency('comp-1', {
        name: 'Version Test',
        description: 'Testing version increment functionality',
      });

      expect(updated.version).toBe(original.version + 1);
    });

    it('should update lastModified timestamp', async () => {
      const original = await fetchCompetencyById('comp-1');

      // Small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      const updated = await updateCompetency('comp-1', {
        name: 'Timestamp Test Update',
        description: 'Testing timestamp update functionality',
      });

      expect(new Date(updated.lastModified).getTime()).toBeGreaterThanOrEqual(
        new Date(original.lastModified).getTime()
      );
    });

    it('should allow partial updates', async () => {
      const original = await fetchCompetencyById('comp-1');

      const updated = await updateCompetency('comp-1', {
        isActive: false,
      });

      expect(updated.name).toBe(original.name); // Unchanged
      expect(updated.description).toBe(original.description); // Unchanged
      expect(updated.isActive).toBe(false); // Changed
    });

    it('should return 404 when updating non-existent competency', async () => {
      await expect(
        updateCompetency('non-existent-id', {
          name: 'Test Update',
          description: 'Should fail because competency does not exist',
        })
      ).rejects.toThrow();
    });

    it('should fail to update with invalid short name', async () => {
      await expect(
        updateCompetency('comp-1', {
          name: 'Ab', // Too short
        })
      ).rejects.toThrow('Name must be at least 3 characters');
    });

    it('should update standard codes', async () => {
      const updated = await updateCompetency('comp-1', {
        standardCodes: {
          onetRef: { code: '2.A.1.c', title: 'New O*NET Reference' },
          escoRef: { uri: 'http://data.europa.eu/esco/skill/9999', title: 'New ESCO Skill' },
        },
      });

      expect(updated.standardCodes?.onetRef?.code).toBe('2.A.1.c');
      expect(updated.standardCodes?.escoRef?.uri).toContain('9999');
    });

    it('should update approval status', async () => {
      const updated = await updateCompetency('comp-3', {
        approvalStatus: ApprovalStatus.APPROVED,
      });

      expect(updated.approvalStatus).toBe('APPROVED');
    });
  });

  // ==========================================
  // DELETE Operations
  // ==========================================
  describe('DELETE Operations', () => {
    it('should delete an existing competency', async () => {
      const initialCount = (await fetchCompetencies()).length;

      await deleteCompetency('comp-3');

      const finalCount = (await fetchCompetencies()).length;
      expect(finalCount).toBe(initialCount - 1);
    });

    it('should return 404 when deleting non-existent competency', async () => {
      await expect(deleteCompetency('non-existent-id')).rejects.toThrow();
    });

    it('should make deleted competency unfetchable', async () => {
      await deleteCompetency('comp-2');

      await expect(fetchCompetencyById('comp-2')).rejects.toThrow();
    });
  });

  // ==========================================
  // Indicator Relationships
  // ==========================================
  describe('Indicator Relationships', () => {
    it('should fetch indicators for a competency', async () => {
      const response = await fetch(`${API_BASE}/competencies/comp-1/bi`);
      const indicators = await response.json();

      expect(Array.isArray(indicators)).toBe(true);
      indicators.forEach((indicator: { competencyId: string }) => {
        expect(indicator.competencyId).toBe('comp-1');
      });
    });

    it('should fetch available indicators for a competency', async () => {
      const response = await fetch(`${API_BASE}/competencies/comp-1/available-bi`);
      const availableIndicators = await response.json();

      expect(Array.isArray(availableIndicators)).toBe(true);
      availableIndicators.forEach((indicator: { competencyId: string }) => {
        expect(indicator.competencyId).not.toBe('comp-1');
      });
    });

    it('should attach indicator to competency', async () => {
      const response = await fetch(`${API_BASE}/competencies/comp-3/bi/bi-1`, {
        method: 'POST',
      });

      expect(response.status).toBe(200);
    });

    it('should detach indicator from competency', async () => {
      const response = await fetch(`${API_BASE}/competencies/comp-1/bi/bi-1`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(204);
    });
  });

  // ==========================================
  // Error Handling
  // ==========================================
  describe('Error Handling', () => {
    it('should handle server errors gracefully', async () => {
      server.use(errorHandlers.competencyServerError);

      await expect(fetchCompetencies()).rejects.toThrow();
    });

    it('should handle unauthorized errors', async () => {
      server.use(errorHandlers.competencyUnauthorized);

      await expect(fetchCompetencies()).rejects.toThrow();
    });

    it('should handle forbidden errors', async () => {
      server.use(errorHandlers.competencyForbidden);

      await expect(fetchCompetencies()).rejects.toThrow();
    });
  });

  // ==========================================
  // Data Filtering and Sorting
  // ==========================================
  describe('Data Characteristics', () => {
    it('should return competencies with various categories', async () => {
      const competencies = await fetchCompetencies();
      const categories = new Set(competencies.map(c => c.category));

      expect(categories.size).toBeGreaterThan(1);
    });

    it('should have competencies with Russian content support', async () => {
      // Create a competency with Russian content
      const russianCompetency = await createCompetency({
        name: 'Коммуникация', // "Communication" in Russian
        description: 'Эффективные навыки устного и письменного общения', // Russian description
        category: CompetencyCategory.COMMUNICATION,
        isActive: true,
        approvalStatus: ApprovalStatus.DRAFT,
      });

      expect(russianCompetency.name).toBe('Коммуникация');
      expect(russianCompetency.description).toContain('навыки');
    });
  });
});

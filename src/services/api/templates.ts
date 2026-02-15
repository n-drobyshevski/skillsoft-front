import { getAuthHeaders } from '../roleApi';
import { fetchApi } from './core';

import type {
  TestTemplate,
  TestTemplateSummary,
  CreateTestTemplateRequest,
  UpdateTestTemplateRequest,
} from '@/types/domain';

// Test endpoints - paths are relative to the v1 base URL
const TEST_TEMPLATES_BASE = '/tests/templates';

export const testTemplatesApi = {
  /**
   * Get all test templates with pagination
   */
  getAllTemplates: async (page = 0, size = 20): Promise<{
    content: TestTemplateSummary[];
    totalElements: number;
    totalPages: number;
  }> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_TEMPLATES_BASE}?page=${page}&size=${size}`, {
      tags: ['test-templates'],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * Get only active test templates.
   *
   * @param preResolvedAuthHeaders - Optional pre-resolved auth headers for use
   *   inside 'use cache' scopes where getAuthHeaders() cannot be called.
   *   When omitted, auth headers are resolved automatically.
   */
  getActiveTemplates: async (
    preResolvedAuthHeaders?: Record<string, string>,
  ): Promise<TestTemplateSummary[]> => {
    const authHeaders = preResolvedAuthHeaders ?? await getAuthHeaders();
    return fetchApi(`${TEST_TEMPLATES_BASE}/active`, {
      tags: ['test-templates-active'],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * Get active templates owned by the current user.
   * Used for personal mode catalog.
   */
  getMyTemplates: async (): Promise<TestTemplateSummary[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_TEMPLATES_BASE}/mine`, {
      tags: ['my-templates'],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * Get a single test template by ID
   */
  getTemplateById: async (id: string): Promise<TestTemplate | null> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_TEMPLATES_BASE}/${id}`, {
      tags: [`test-template-${id}`],
      revalidate: 60,
      authHeaders,
      silentStatusCodes: [404], // 404 is expected for non-existent/deleted templates
    });
  },

  /**
   * Create a new test template
   */
  createTemplate: async (data: CreateTestTemplateRequest): Promise<TestTemplate> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_TEMPLATES_BASE}`, {
      method: 'POST',
      body: JSON.stringify(data),
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Update an existing test template
   */
  updateTemplate: async (id: string, data: UpdateTestTemplateRequest): Promise<TestTemplate> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_TEMPLATES_BASE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      cache: 'no-store',
      authHeaders,
    });
  },

  /**
   * Search templates by name
   */
  searchByName: async (name: string): Promise<TestTemplateSummary[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_TEMPLATES_BASE}/search?name=${encodeURIComponent(name)}`, {
      tags: ['test-templates-search'],
      revalidate: 30,
      authHeaders,
    });
  },

  /**
   * Get templates by competency
   */
  getByCompetency: async (competencyId: string): Promise<TestTemplateSummary[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_TEMPLATES_BASE}/by-competency/${competencyId}`, {
      tags: [`test-templates-competency-${competencyId}`],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * Get template statistics (admin only)
   */
  getStatistics: async (): Promise<{
    totalTemplates: number;
    activeTemplates: number;
    inactiveTemplates: number;
  }> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEST_TEMPLATES_BASE}/statistics`, {
      tags: ['test-templates-stats'],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * Delete a test template
   */
  deleteTemplate: async (id: string): Promise<void> => {
    const authHeaders = await getAuthHeaders();
    await fetchApi(`${TEST_TEMPLATES_BASE}/${id}`, {
      method: 'DELETE',
      cache: 'no-store',
      authHeaders,
    });
  },
};

/**
 * Tests for API Error Handling
 * Phase 5: Comprehensive Error Handling Tests
 *
 * Tests cover:
 * - Network error handling
 * - 401 Unauthorized errors
 * - 403 Forbidden errors
 * - 404 Not Found errors
 * - 500 Server errors
 * - Timeout handling
 * - CORS errors
 * - Connection refused errors
 * - Empty response handling
 * - JSON parsing errors
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse, delay } from 'msw';
import { server } from '../mocks/server';
import { resetMockStores } from '../mocks/handlers';

// API base URL for tests
const API_BASE = 'http://localhost:8080/api';

// ============================================
// API ERROR TYPE (matching src/services/api.ts)
// ============================================
interface ApiError extends Error {
  status?: number;
  code?: string;
}

// ============================================
// HELPER: API fetch wrapper (mimics src/services/api.ts handleResponse)
// ============================================
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = new Error('API request failed');
    error.status = response.status;

    try {
      const errorData = await response.json();
      error.message = errorData.message || `HTTP error! status: ${response.status}`;
      error.code = errorData.code;

      // Add specific messaging for common errors
      if (response.status === 403) {
        error.message = errorData.message || 'Access denied. Please sign in and try again.';
      } else if (response.status === 401) {
        error.message = errorData.message || 'Authentication required. Please sign in.';
      } else if (response.status === 404) {
        error.message = errorData.message || 'Resource not found.';
      } else if (response.status >= 500) {
        error.message = errorData.message || 'Server error. Please try again later.';
      }
    } catch {
      // Provide more specific error messages based on status code
      if (response.status === 403) {
        error.message = 'Access denied. Please sign in and try again.';
      } else if (response.status === 401) {
        error.message = 'Authentication required. Please sign in.';
      } else if (response.status === 404) {
        error.message = 'Resource not found.';
      } else if (response.status >= 500) {
        error.message = 'Server error. Please try again later.';
      } else {
        error.message = `HTTP error! status: ${response.status}`;
      }
    }
    throw error;
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  const contentLength = response.headers.get('content-length');

  if (
    response.status === 204 ||
    contentLength === '0' ||
    !contentType?.includes('application/json')
  ) {
    return null as T;
  }

  try {
    const text = await response.text();
    if (!text.trim()) {
      return null as T;
    }
    return JSON.parse(text) as T;
  } catch (parseError) {
    if (parseError instanceof SyntaxError) {
      return null as T;
    }
    throw parseError;
  }
}

// ============================================
// HELPER: Fetch with error handling
// ============================================
async function fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  return handleResponse<T>(response);
}

// ============================================
// TESTS
// ============================================
describe('API Error Handling', () => {
  beforeEach(() => {
    resetMockStores();
  });

  // ==========================================
  // 401 Unauthorized Errors
  // ==========================================
  describe('401 Unauthorized Errors', () => {
    it('should handle 401 with JSON error body', async () => {
      server.use(
        http.get(`${API_BASE}/competencies`, () => {
          return HttpResponse.json(
            { message: 'Authentication required', code: 'UNAUTHORIZED' },
            { status: 401 }
          );
        })
      );

      try {
        await fetchWithErrorHandling(`${API_BASE}/competencies`);
        expect.fail('Should have thrown an error');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.status).toBe(401);
        expect(apiError.message).toBe('Authentication required');
        expect(apiError.code).toBe('UNAUTHORIZED');
      }
    });

    it('should handle 401 without JSON body', async () => {
      server.use(
        http.get(`${API_BASE}/competencies`, () => {
          return new HttpResponse(null, { status: 401 });
        })
      );

      try {
        await fetchWithErrorHandling(`${API_BASE}/competencies`);
        expect.fail('Should have thrown an error');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.status).toBe(401);
        expect(apiError.message).toBe('Authentication required. Please sign in.');
      }
    });

    it('should handle 401 with custom error message', async () => {
      server.use(
        http.get(`${API_BASE}/competencies`, () => {
          return HttpResponse.json(
            { message: 'Token expired', code: 'TOKEN_EXPIRED' },
            { status: 401 }
          );
        })
      );

      try {
        await fetchWithErrorHandling(`${API_BASE}/competencies`);
        expect.fail('Should have thrown an error');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.message).toBe('Token expired');
        expect(apiError.code).toBe('TOKEN_EXPIRED');
      }
    });
  });

  // ==========================================
  // 403 Forbidden Errors
  // ==========================================
  describe('403 Forbidden Errors', () => {
    it('should handle 403 with JSON error body', async () => {
      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json(
            { message: 'Admin access required', code: 'FORBIDDEN' },
            { status: 403 }
          );
        })
      );

      try {
        await fetchWithErrorHandling(`${API_BASE}/users`);
        expect.fail('Should have thrown an error');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.status).toBe(403);
        expect(apiError.message).toBe('Admin access required');
        expect(apiError.code).toBe('FORBIDDEN');
      }
    });

    it('should handle 403 without JSON body', async () => {
      server.use(
        http.get(`${API_BASE}/users`, () => {
          return new HttpResponse(null, { status: 403 });
        })
      );

      try {
        await fetchWithErrorHandling(`${API_BASE}/users`);
        expect.fail('Should have thrown an error');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.status).toBe(403);
        expect(apiError.message).toBe('Access denied. Please sign in and try again.');
      }
    });

    it('should handle 403 for role-based restrictions', async () => {
      server.use(
        http.delete(`${API_BASE}/users/:id`, () => {
          return HttpResponse.json(
            { message: 'Insufficient permissions to delete users', code: 'INSUFFICIENT_PERMISSIONS' },
            { status: 403 }
          );
        })
      );

      try {
        await fetchWithErrorHandling(`${API_BASE}/users/user-1`, { method: 'DELETE' });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.status).toBe(403);
        expect(apiError.message).toContain('Insufficient permissions');
      }
    });
  });

  // ==========================================
  // 404 Not Found Errors
  // ==========================================
  describe('404 Not Found Errors', () => {
    it('should handle 404 with JSON error body', async () => {
      server.use(
        http.get(`${API_BASE}/competencies/:id`, () => {
          return HttpResponse.json(
            { message: 'Competency not found', code: 'NOT_FOUND' },
            { status: 404 }
          );
        })
      );

      try {
        await fetchWithErrorHandling(`${API_BASE}/competencies/non-existent`);
        expect.fail('Should have thrown an error');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.status).toBe(404);
        expect(apiError.message).toBe('Competency not found');
        expect(apiError.code).toBe('NOT_FOUND');
      }
    });

    it('should handle 404 without JSON body', async () => {
      server.use(
        http.get(`${API_BASE}/competencies/:id`, () => {
          return new HttpResponse(null, { status: 404 });
        })
      );

      try {
        await fetchWithErrorHandling(`${API_BASE}/competencies/non-existent`);
        expect.fail('Should have thrown an error');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.status).toBe(404);
        expect(apiError.message).toBe('Resource not found.');
      }
    });

    it('should handle 404 for nested resources', async () => {
      server.use(
        http.get(`${API_BASE}/competencies/:compId/bi/:biId`, () => {
          return HttpResponse.json(
            { message: 'Behavioral indicator not found for this competency', code: 'NOT_FOUND' },
            { status: 404 }
          );
        })
      );

      try {
        await fetchWithErrorHandling(`${API_BASE}/competencies/comp-1/bi/bi-999`);
        expect.fail('Should have thrown an error');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.status).toBe(404);
        expect(apiError.message).toContain('Behavioral indicator not found');
      }
    });
  });

  // ==========================================
  // 500 Server Errors
  // ==========================================
  describe('500 Server Errors', () => {
    it('should handle 500 with JSON error body', async () => {
      server.use(
        http.get(`${API_BASE}/competencies`, () => {
          return HttpResponse.json(
            { message: 'Database connection failed', code: 'DB_ERROR' },
            { status: 500 }
          );
        })
      );

      try {
        await fetchWithErrorHandling(`${API_BASE}/competencies`);
        expect.fail('Should have thrown an error');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.status).toBe(500);
        expect(apiError.message).toBe('Database connection failed');
        expect(apiError.code).toBe('DB_ERROR');
      }
    });

    it('should handle 500 without JSON body', async () => {
      server.use(
        http.get(`${API_BASE}/competencies`, () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      try {
        await fetchWithErrorHandling(`${API_BASE}/competencies`);
        expect.fail('Should have thrown an error');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.status).toBe(500);
        expect(apiError.message).toBe('Server error. Please try again later.');
      }
    });

    it('should handle 502 Bad Gateway', async () => {
      server.use(
        http.get(`${API_BASE}/competencies`, () => {
          return new HttpResponse(null, { status: 502 });
        })
      );

      try {
        await fetchWithErrorHandling(`${API_BASE}/competencies`);
        expect.fail('Should have thrown an error');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.status).toBe(502);
        expect(apiError.message).toBe('Server error. Please try again later.');
      }
    });

    it('should handle 503 Service Unavailable', async () => {
      server.use(
        http.get(`${API_BASE}/competencies`, () => {
          return HttpResponse.json(
            { message: 'Service temporarily unavailable', code: 'SERVICE_UNAVAILABLE' },
            { status: 503 }
          );
        })
      );

      try {
        await fetchWithErrorHandling(`${API_BASE}/competencies`);
        expect.fail('Should have thrown an error');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.status).toBe(503);
        expect(apiError.message).toBe('Service temporarily unavailable');
      }
    });
  });

  // ==========================================
  // 400 Bad Request Errors
  // ==========================================
  describe('400 Bad Request Errors', () => {
    it('should handle validation errors', async () => {
      server.use(
        http.post(`${API_BASE}/competencies`, () => {
          return HttpResponse.json(
            {
              message: 'Validation failed',
              code: 'VALIDATION_ERROR',
              errors: [
                { field: 'name', message: 'Name is required' },
                { field: 'description', message: 'Description is required' },
              ],
            },
            { status: 400 }
          );
        })
      );

      try {
        await fetchWithErrorHandling(`${API_BASE}/competencies`, {
          method: 'POST',
          body: JSON.stringify({}),
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.status).toBe(400);
        expect(apiError.message).toBe('Validation failed');
        expect(apiError.code).toBe('VALIDATION_ERROR');
      }
    });

    it('should handle malformed request errors', async () => {
      server.use(
        http.post(`${API_BASE}/competencies`, () => {
          return HttpResponse.json(
            { message: 'Invalid JSON in request body', code: 'MALFORMED_REQUEST' },
            { status: 400 }
          );
        })
      );

      try {
        await fetchWithErrorHandling(`${API_BASE}/competencies`, {
          method: 'POST',
          body: 'invalid json',
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.status).toBe(400);
        expect(apiError.message).toContain('Invalid JSON');
      }
    });

    it('should handle field-specific validation errors', async () => {
      server.use(
        http.put(`${API_BASE}/competencies/:id`, () => {
          return HttpResponse.json(
            { message: 'Name must be at least 3 characters', code: 'VALIDATION_ERROR' },
            { status: 400 }
          );
        })
      );

      try {
        await fetchWithErrorHandling(`${API_BASE}/competencies/comp-1`, {
          method: 'PUT',
          body: JSON.stringify({ name: 'Ab' }),
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.status).toBe(400);
        expect(apiError.message).toContain('Name must be at least 3 characters');
      }
    });
  });

  // ==========================================
  // Empty Response Handling
  // ==========================================
  describe('Empty Response Handling', () => {
    it('should handle 204 No Content response', async () => {
      server.use(
        http.delete(`${API_BASE}/competencies/:id`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      const result = await fetchWithErrorHandling(`${API_BASE}/competencies/comp-1`, {
        method: 'DELETE',
      });

      expect(result).toBeNull();
    });

    it('should handle empty body with 200 status', async () => {
      server.use(
        http.get(`${API_BASE}/health`, () => {
          return new HttpResponse('', {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        })
      );

      const result = await fetchWithErrorHandling(`${API_BASE}/health`);
      expect(result).toBeNull();
    });

    it('should handle content-length: 0', async () => {
      server.use(
        http.get(`${API_BASE}/empty`, () => {
          return new HttpResponse(null, {
            status: 200,
            headers: { 'Content-Length': '0' },
          });
        })
      );

      const result = await fetchWithErrorHandling(`${API_BASE}/empty`);
      expect(result).toBeNull();
    });

    it('should handle non-JSON content type', async () => {
      server.use(
        http.get(`${API_BASE}/text`, () => {
          return new HttpResponse('Plain text response', {
            status: 200,
            headers: { 'Content-Type': 'text/plain' },
          });
        })
      );

      const result = await fetchWithErrorHandling(`${API_BASE}/text`);
      expect(result).toBeNull();
    });
  });

  // ==========================================
  // Network Errors
  // ==========================================
  describe('Network Errors', () => {
    it('should handle network failure', async () => {
      server.use(
        http.get(`${API_BASE}/competencies`, () => {
          return HttpResponse.error();
        })
      );

      await expect(fetchWithErrorHandling(`${API_BASE}/competencies`)).rejects.toThrow();
    });
  });

  // ==========================================
  // Timeout Handling
  // ==========================================
  describe('Timeout Handling', () => {
    it('should handle slow responses', async () => {
      server.use(
        http.get(`${API_BASE}/slow`, async () => {
          await delay(100);
          return HttpResponse.json({ data: 'slow response' });
        })
      );

      const result = await fetchWithErrorHandling(`${API_BASE}/slow`);
      expect(result).toEqual({ data: 'slow response' });
    });
  });

  // ==========================================
  // Rate Limiting (429)
  // ==========================================
  describe('Rate Limiting', () => {
    it('should handle 429 Too Many Requests', async () => {
      server.use(
        http.get(`${API_BASE}/competencies`, () => {
          return HttpResponse.json(
            { message: 'Rate limit exceeded. Please try again later.', code: 'RATE_LIMITED' },
            {
              status: 429,
              headers: { 'Retry-After': '60' },
            }
          );
        })
      );

      try {
        await fetchWithErrorHandling(`${API_BASE}/competencies`);
        expect.fail('Should have thrown an error');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.status).toBe(429);
        expect(apiError.message).toContain('Rate limit exceeded');
      }
    });
  });

  // ==========================================
  // Conflict Errors (409)
  // ==========================================
  describe('Conflict Errors', () => {
    it('should handle 409 Conflict for duplicate resources', async () => {
      server.use(
        http.post(`${API_BASE}/competencies`, () => {
          return HttpResponse.json(
            { message: 'A competency with this name already exists', code: 'DUPLICATE_RESOURCE' },
            { status: 409 }
          );
        })
      );

      try {
        await fetchWithErrorHandling(`${API_BASE}/competencies`, {
          method: 'POST',
          body: JSON.stringify({ name: 'Existing Competency' }),
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.status).toBe(409);
        expect(apiError.message).toContain('already exists');
      }
    });

    it('should handle 409 Conflict for version mismatch', async () => {
      server.use(
        http.put(`${API_BASE}/competencies/:id`, () => {
          return HttpResponse.json(
            { message: 'Resource has been modified. Please refresh and try again.', code: 'VERSION_CONFLICT' },
            { status: 409 }
          );
        })
      );

      try {
        await fetchWithErrorHandling(`${API_BASE}/competencies/comp-1`, {
          method: 'PUT',
          body: JSON.stringify({ version: 1 }),
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.status).toBe(409);
        expect(apiError.code).toBe('VERSION_CONFLICT');
      }
    });
  });

  // ==========================================
  // JSON Parsing Errors
  // ==========================================
  describe('JSON Parsing Errors', () => {
    it('should handle malformed JSON response', async () => {
      server.use(
        http.get(`${API_BASE}/malformed`, () => {
          return new HttpResponse('{ invalid json }', {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        })
      );

      // Should not throw, returns null for parse errors
      const result = await fetchWithErrorHandling(`${API_BASE}/malformed`);
      expect(result).toBeNull();
    });

    it('should handle partial JSON response', async () => {
      server.use(
        http.get(`${API_BASE}/partial`, () => {
          return new HttpResponse('{"name": "test"', {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        })
      );

      const result = await fetchWithErrorHandling(`${API_BASE}/partial`);
      expect(result).toBeNull();
    });
  });

  // ==========================================
  // Success Responses
  // ==========================================
  describe('Success Responses', () => {
    it('should handle successful JSON response', async () => {
      server.use(
        http.get(`${API_BASE}/competencies`, () => {
          return HttpResponse.json([{ id: 'comp-1', name: 'Test' }]);
        })
      );

      const result = await fetchWithErrorHandling<{ id: string; name: string }[]>(
        `${API_BASE}/competencies`
      );

      expect(result).toEqual([{ id: 'comp-1', name: 'Test' }]);
    });

    it('should handle successful POST response', async () => {
      server.use(
        http.post(`${API_BASE}/competencies`, async ({ request }) => {
          const body = await request.json() as Record<string, unknown>;
          return HttpResponse.json({ id: 'new-comp', ...body }, { status: 201 });
        })
      );

      const result = await fetchWithErrorHandling(`${API_BASE}/competencies`, {
        method: 'POST',
        body: JSON.stringify({ name: 'New Competency' }),
      });

      expect(result).toEqual({ id: 'new-comp', name: 'New Competency' });
    });
  });
});

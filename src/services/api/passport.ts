import { getAuthHeaders } from '../roleApi';
import { fetchApi, USE_MOCK_API } from './core';

import type { CompetencyPassport } from '@/types/domain';
import type { ApiError } from '@/types/errors';

const PASSPORT_BASE = '/passports';

export const passportApi = {
  /**
   * Get competency passport for a specific user.
   * Returns null if user doesn't have a passport yet.
   */
  getPassport: async (clerkUserId: string): Promise<CompetencyPassport | null> => {
    if (USE_MOCK_API) {
      // Return mock passport for demo purposes
      return {
        id: 'passport-1',
        candidateId: 'candidate-1',
        clerkUserId,
        lastUpdated: new Date().toISOString(),
        scores: {
          'Problem Solving': 78,
          'Communication': 82,
          'Leadership': 65,
          'Teamwork': 88,
          'Adaptability': 75,
        },
        bigFiveProfile: {
          openness: 72,
          conscientiousness: 85,
          extraversion: 60,
          agreeableness: 78,
          emotionalStability: 70,
        },
        isValid: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }

    try {
      const authHeaders = await getAuthHeaders();
      return await fetchApi(`${PASSPORT_BASE}/user/${clerkUserId}`, {
        tags: [`passport-${clerkUserId}`],
        cache: 'no-store',
        authHeaders,
        silentStatusCodes: [404],
      });
    } catch (error) {
      // Return null if passport doesn't exist (404)
      if (error instanceof Error && 'status' in error && (error as ApiError).status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Check if user has a valid (non-expired) passport.
   * Used to determine if delta testing is available.
   */
  hasValidPassport: async (clerkUserId: string): Promise<boolean> => {
    if (USE_MOCK_API) {
      return true; // Mock: always has passport
    }

    try {
      const authHeaders = await getAuthHeaders();
      const result = await fetchApi<{ valid: boolean }>(
        `${PASSPORT_BASE}/user/${clerkUserId}/valid`,
        {
          cache: 'no-store',
          authHeaders,
          silentStatusCodes: [404],
        }
      );
      return result?.valid ?? false;
    } catch {
      return false;
    }
  },
};

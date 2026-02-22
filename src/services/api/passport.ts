import { getAuthHeaders } from '../roleApi';
import { fetchApi } from './core';

import type { CompetencyPassport } from '@/types/domain';
import type { ApiError } from '@/types/errors';

const PASSPORT_BASE = '/passports';

export const passportApi = {
  /**
   * Get competency passport for a specific user.
   * Returns null if user doesn't have a passport yet.
   */
  getPassport: async (clerkUserId: string): Promise<CompetencyPassport | null> => {
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

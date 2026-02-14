import { getAuthHeaders } from '../roleApi';
import { fetchApi } from './core';

import type { AssemblyProgress } from '@/types/domain';

const ASSEMBLY_BASE = '/tests/sessions/templates';

export const assemblyApi = {
  /**
   * Get real-time assembly progress for a template.
   * Used for progress modal during test session creation.
   */
  getProgress: async (templateId: string): Promise<AssemblyProgress | null> => {
    try {
      const authHeaders = await getAuthHeaders();
      return await fetchApi(`${ASSEMBLY_BASE}/${templateId}/assembly-progress`, {
        cache: 'no-store',
        authHeaders,
        silentStatusCodes: [404],
      });
    } catch {
      return null;
    }
  },
};

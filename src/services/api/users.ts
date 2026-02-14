import { cache } from 'react';
import { revalidateUserTags } from '@/app/actions';
import { getAuthHeaders } from '../roleApi';
import { fetchApi } from './core';

import type { User, UserCreateInput, UserUpdateInput, UserRole } from '@/types/user';

// Endpoint constant
const USERS_ENDPOINT = '/users';

// Cached users fetcher with auth headers
const getAllUsersCached = cache(async (
  preResolvedAuthHeaders?: Record<string, string>,
): Promise<User[] | null> => {
  const authHeaders = preResolvedAuthHeaders ?? await getAuthHeaders();
  return fetchApi(USERS_ENDPOINT, {
    tags: ['users'],
    revalidate: 60,
    authHeaders,
  });
});

export const usersApi = {
  /**
   * Get all users.
   *
   * @param preResolvedAuthHeaders - Optional pre-resolved auth headers for use
   *   inside 'use cache' scopes where getAuthHeaders() cannot be called.
   *   When omitted, auth headers are resolved automatically.
   */
  getAllUsers: getAllUsersCached,

  /**
   * Get all active users - client-side compatible version
   * Used by useSuggestedUsers hook for quick picks
   */
  getActiveUsers: async (): Promise<User[]> => {
    const authHeaders = await getAuthHeaders();
    const users = await fetchApi<User[] | null>(USERS_ENDPOINT, {
      cache: 'no-store',
      authHeaders,
    });
    return users ?? [];
  },

  getUserById: async (userId: string): Promise<User | null> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${USERS_ENDPOINT}/${userId}`, {
      tags: [`user-${userId}`],
      revalidate: 60,
      authHeaders,
      silentStatusCodes: [404], // 404 is expected for non-existent users
    });
  },

  getUserByClerkId: async (clerkId: string): Promise<User | null> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${USERS_ENDPOINT}/clerk/${clerkId}`, {
      tags: [`user-clerk-${clerkId}`],
      revalidate: 60,
      authHeaders,
      silentStatusCodes: [404], // 404 is expected for non-existent users
    });
  },

  createUser: async (data: UserCreateInput): Promise<User> => {
    const authHeaders = await getAuthHeaders();
    const result = await fetchApi<User>(USERS_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(data),
      cache: 'no-store',
      authHeaders,
    });
    await revalidateUserTags();
    return result;
  },

  updateUser: async (userId: string, data: UserUpdateInput): Promise<User> => {
    const authHeaders = await getAuthHeaders();
    const result = await fetchApi<User>(`${USERS_ENDPOINT}/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      cache: 'no-store',
      authHeaders,
    });
    await revalidateUserTags(userId);
    return result;
  },

  updateUserRole: async (userId: string, role: UserRole): Promise<User> => {
    const authHeaders = await getAuthHeaders();
    const result = await fetchApi<User>(`${USERS_ENDPOINT}/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
      cache: 'no-store',
      authHeaders,
    });
    await revalidateUserTags(userId);
    return result;
  },

  deactivateUser: async (userId: string): Promise<void> => {
    const authHeaders = await getAuthHeaders();
    await fetchApi(`${USERS_ENDPOINT}/${userId}/deactivate`, {
      method: 'PATCH',
      cache: 'no-store',
      authHeaders,
    });
    await revalidateUserTags(userId);
  },

  activateUser: async (userId: string): Promise<void> => {
    const authHeaders = await getAuthHeaders();
    await fetchApi(`${USERS_ENDPOINT}/${userId}/activate`, {
      method: 'PATCH',
      cache: 'no-store',
      authHeaders,
    });
    await revalidateUserTags(userId);
  },

  deleteUser: async (userId: string): Promise<void> => {
    const authHeaders = await getAuthHeaders();
    await fetchApi(`${USERS_ENDPOINT}/${userId}`, {
      method: 'DELETE',
      cache: 'no-store',
      authHeaders,
    });
    await revalidateUserTags(userId);
  },

  searchUsers: async (query: string): Promise<User[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${USERS_ENDPOINT}/search?query=${encodeURIComponent(query)}`, {
      cache: 'no-store',
      authHeaders,
    });
  },

  getUsersByRole: async (role: UserRole): Promise<User[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${USERS_ENDPOINT}/role/${role}`, {
      tags: [`users-role-${role}`],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * Get user statistics (totals, by role).
   *
   * @param preResolvedAuthHeaders - Optional pre-resolved auth headers for use
   *   inside 'use cache' scopes where getAuthHeaders() cannot be called.
   *   When omitted, auth headers are resolved automatically.
   */
  getUserStats: async (
    preResolvedAuthHeaders?: Record<string, string>,
  ): Promise<{
    totalUsers: number;
    activeUsers: number;
    byRole: Record<string, number>;
  }> => {
    const authHeaders = preResolvedAuthHeaders ?? await getAuthHeaders();
    return fetchApi(`${USERS_ENDPOINT}/stats`, {
      tags: ['users-stats'],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * Manually sync all users from Clerk to the backend.
   * This calls the /api/users/sync endpoint which fetches users from Clerk
   * and syncs them to the Spring Boot backend.
   */
  syncAllFromClerk: async (): Promise<{
    success: boolean;
    message?: string;
    created?: number;
    updated?: number;
    failed?: number;
    total?: number;
    error?: string;
    errors?: string[];
  }> => {
    type SyncResponse = {
      success: boolean;
      message?: string;
      created?: number;
      updated?: number;
      failed?: number;
      total?: number;
      error?: string;
      errors?: string[];
    };

    const response = await fetch('/api/users/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData: { error?: string } = await response.json().catch(() => ({})) as { error?: string };
      throw new Error(errorData.error || `Sync failed: ${response.status}`);
    }

    return response.json() as Promise<SyncResponse>;
  },
};

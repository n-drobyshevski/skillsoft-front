/**
 * Users API Cache - Server-side caching for user admin data.
 *
 * Provides cached data fetching for the users admin page using 'use cache'.
 * Uses auth-outside-cache pattern: auth headers resolved by caller, passed as params.
 *
 * Cache profiles:
 * - Users list: userData (15min) - user data changes infrequently
 */

import { cacheLife, cacheTag } from 'next/cache';
import { User } from '@/types/user';
import { getAuthHeaders } from './roleApi';

// Type for auth headers passed into cached functions
type AuthHeaders = Record<string, string>;

// API Version configuration
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

const getApiBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const versionPath = API_VERSION ? `/${API_VERSION}` : '';
  if (!apiUrl) {
    return `http://localhost:8080/api${versionPath}`;
  }
  const protocol = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1') ? 'http' : 'https';
  return `${protocol}://${apiUrl}/api${versionPath}`;
};

const USERS_ENDPOINT = '/users';

// ============================================================================
// Users List
// ============================================================================

/**
 * Cached users list fetcher with auth headers.
 * Auth headers are passed as params (become part of cache key).
 */
export async function getAllUsersCached(
  authHeaders: AuthHeaders,
): Promise<User[] | null> {
  'use cache';
  cacheLife('userData');
  cacheTag('users');

  try {
    const response = await fetch(
      `${getApiBaseUrl()}${USERS_ENDPOINT}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      }
    );

    if (!response.ok) return null;
    return (await response.json()) as User[];
  } catch {
    return null;
  }
}

// ============================================================================
// Single User
// ============================================================================

/**
 * Cached single user fetcher.
 */
export async function getUserByIdCached(
  userId: string,
  authHeaders: AuthHeaders,
): Promise<User | null> {
  'use cache';
  cacheLife('userData');
  cacheTag('users', `user-${userId}`);

  try {
    const response = await fetch(
      `${getApiBaseUrl()}${USERS_ENDPOINT}/${userId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      }
    );

    if (!response.ok) return null;
    return (await response.json()) as User;
  } catch {
    return null;
  }
}

// ============================================================================
// Orchestrator (for Users Admin Page)
// ============================================================================

/**
 * Fetch users with auth.
 * Primary data fetcher for the users admin page.
 *
 * NOT cached itself -- resolves auth then delegates to cached function.
 */
export async function getUsersPageDataCached(): Promise<User[] | null> {
  const authHeaders = await getAuthHeaders();
  return getAllUsersCached(authHeaders);
}

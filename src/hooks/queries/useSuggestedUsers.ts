'use client';

/**
 * Hook for fetching suggested users for quick selection
 *
 * Provides a filtered, limited list of users for quick pick UI.
 * Filters out users who are already shared with (by email).
 *
 * Uses Clerk's useAuth() for client-side authentication.
 *
 * Migrated from React Query to simple useState + useEffect pattern.
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import type { User } from '@/types/user';
import { UserRole } from '@/types/user';

const SUGGESTED_USERS_LIMIT = 3;

// API Version - defaults to v1
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

const getApiBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return `http://localhost:8080/api/${API_VERSION}`;
  }
  const protocol = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1') ? 'http' : 'https';
  return `${protocol}://${apiUrl}/api/${API_VERSION}`;
};

/**
 * Map Clerk organization role to application UserRole
 */
function mapOrgRoleToUserRole(orgRole: string | undefined | null): UserRole {
  if (!orgRole) return UserRole.USER;

  // Clerk org roles have format "org:role_name"
  const roleName = orgRole.replace('org:', '').toLowerCase();

  switch (roleName) {
    case 'admin':
      return UserRole.ADMIN;
    case 'editor':
      return UserRole.EDITOR;
    case 'hr_manager':
      return UserRole.EDITOR;
    case 'hr_specialist':
      return UserRole.EDITOR;
    default:
      return UserRole.USER;
  }
}

/**
 * Hook to fetch and filter suggested users for quick selection
 *
 * @param excludeEmails - Array of emails to exclude (already shared with)
 * @param limit - Maximum number of users to return (default: 3)
 * @returns Filtered list of suggested users, loading state, and error
 *
 * @example
 * ```tsx
 * const { users, isLoading, isEmpty } = useSuggestedUsers(
 *   ['already@shared.com'],
 *   3
 * );
 * ```
 */
export function useSuggestedUsers(
  excludeEmails: string[] = [],
  limit: number = SUGGESTED_USERS_LIMIT
) {
  const { userId, orgRole, isSignedIn } = useAuth();

  const [allUsers, setAllUsers] = useState<User[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Track if already fetched to avoid re-fetching on every render
  const hasFetched = useRef(false);

  // Build auth headers for client-side API calls
  const authHeaders = useMemo(() => {
    if (!userId) return null;

    const role = mapOrgRoleToUserRole(orgRole);
    return {
      'X-User-Id': userId,
      'X-User-Role': role,
    };
  }, [userId, orgRole]);

  // Fetch users once when authenticated
  useEffect(() => {
    if (!isSignedIn || !authHeaders || hasFetched.current) return;

    let cancelled = false;
    hasFetched.current = true;
    setIsLoading(true);

    (async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
          mode: 'cors',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status}`);
        }

        const users = (await response.json()) as User[];
        if (!cancelled) {
          setAllUsers(users);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, authHeaders]);

  // Filter and limit users
  const suggestedUsers = useMemo(() => {
    if (!allUsers || allUsers.length === 0) return [];

    const excludeSet = new Set(excludeEmails.map((e) => e.toLowerCase()));

    return allUsers
      .filter((user) => {
        // Must be active
        if (!user.isActive) return false;
        // Must not be the current user
        if (user.clerkId === userId) return false;
        // Must not be in excluded list (check both email and username)
        if (user.email && excludeSet.has(user.email.toLowerCase())) return false;
        if (user.username && excludeSet.has(user.username.toLowerCase())) return false;
        return true;
      })
      .slice(0, limit);
  }, [allUsers, excludeEmails, limit, userId]);

  return {
    users: suggestedUsers,
    isLoading,
    error,
    isEmpty: !isLoading && suggestedUsers.length === 0,
    hasUsers: suggestedUsers.length > 0,
  };
}

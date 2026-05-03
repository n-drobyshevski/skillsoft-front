/**
 * Role-aware API service for Skillsoft.
 * 
 * This module provides functions to make API calls with proper authentication
 * headers that include the user's role from Clerk session.
 * 
 * The backend expects these headers for role-based access control:
 * - X-User-Id: The Clerk user ID
 * - X-User-Role: The user's role (ADMIN, EDITOR, USER)
 * 
 * NOTE: This file is SERVER-ONLY. It uses @clerk/nextjs/server functions.
 * For client components, use roleApiClient.ts instead.
 */
'use server';

import { connection } from 'next/server';
import { cookies } from 'next/headers';
import { auth, currentUser as getClerkUser } from '@clerk/nextjs/server';
import { UserRole } from '@/types/user';
import { signAuthHeaders } from '@/lib/hmac';
import { LENS_COOKIE_NAME, LENS_TO_ROLE, type LensType } from '@/store/lens-store';

/**
 * Get the role from Clerk organization role string.
 */
function mapOrgRole(orgRole: string | undefined): UserRole | null {
  if (!orgRole) return null;
  
  switch (orgRole) {
    case 'org:admin':
      return UserRole.ADMIN;
    case 'org:editor':
      return UserRole.EDITOR;
    case 'org:member':
      return UserRole.USER;
    default:
      return null;
  }
}

/** Role hierarchy levels for downgrade validation */
const ROLE_LEVEL: Record<UserRole, number> = {
  [UserRole.USER]: 0,
  [UserRole.EDITOR]: 1,
  [UserRole.ADMIN]: 2,
};

/**
 * Read the active lens from the cookie and resolve the effective role.
 * Can only downgrade (never escalate) relative to the real Clerk role.
 */
async function getEffectiveRole(realRole: UserRole): Promise<UserRole> {
  try {
    const cookieStore = await cookies();
    const lensCookie = cookieStore.get(LENS_COOKIE_NAME)?.value as LensType | undefined;
    if (!lensCookie || !(lensCookie in LENS_TO_ROLE)) return realRole;
    const lensRole = LENS_TO_ROLE[lensCookie];
    // Only allow downgrade, never escalation
    return ROLE_LEVEL[lensRole] <= ROLE_LEVEL[realRole] ? lensRole : realRole;
  } catch {
    // cookies() may fail during prerendering — fall back to real role
    return realRole;
  }
}

interface ErrorResponse {
  message?: string;
  code?: string;
}

/**
 * Get authentication headers for API requests.
 * Extracts user ID and role from Clerk session.
 * 
 * IMPORTANT: Clerk provides `orgRole` directly on the auth object (e.g., "org:admin"),
 * NOT in sessionClaims. The sessionClaims only contain abbreviated org info.
 * 
 * @returns Headers object with X-User-Id and X-User-Role
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    // Signal to Next.js PPR that this code requires a real request
    // Without this, prerendering will fail because auth() needs headers()
    await connection();
    const authResult = await auth();
    const { userId, sessionClaims, orgRole } = authResult;

    if (!userId) {
      console.warn('[Auth] No userId found in Clerk session');
      return {};
    }

    // Get role from auth object (orgRole comes from Clerk organization)
    // orgRole is directly on auth result, NOT in sessionClaims
    const metadataRole = sessionClaims?.metadata?.role as UserRole | undefined;

    // Priority: Organization role > session claims metadata > publicMetadata > default USER
    const mappedRole = mapOrgRole(orgRole as string | undefined);
    let userRole: UserRole = mappedRole ?? metadataRole ?? UserRole.USER;

    // Fallback: when session token doesn't include publicMetadata and org role is absent,
    // fetch the full user object to read publicMetadata.role directly.
    if (!mappedRole && !metadataRole) {
      try {
        const user = await getClerkUser();
        const pubRole = user?.publicMetadata?.role as UserRole | undefined;
        if (pubRole) {
          userRole = pubRole;
        }
      } catch {
        // currentUser() may fail during prerendering — keep default
      }
    }

    // Resolve effective role from lens cookie (can only downgrade)
    const effectiveRole = await getEffectiveRole(userRole);

    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth] Headers generated:', {
        userId: userId.substring(0, 8) + '...',
        role: userRole,
        effectiveRole,
        source: mappedRole ? 'orgRole' : metadataRole ? 'metadata' : 'default'
      });
    }

    // Generate HMAC signature headers (no-op if HMAC_SHARED_SECRET is not set)
    const hmacHeaders = signAuthHeaders(userId, userRole, effectiveRole);

    return {
      'X-User-Id': userId,
      'X-User-Role': userRole,
      'X-Effective-Role': effectiveRole,
      ...hmacHeaders,
    };
  } catch (error) {
    // Re-throw Next.js internal errors (PPR bailout, prerender signals, redirects)
    // These must propagate so Next.js can properly handle dynamic rendering boundaries
    if (typeof error === 'object' && error !== null && 'digest' in error) {
      throw error;
    }
    // Log the error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Auth] Failed to get auth headers:', error);
    }
    // Silent fail - return empty headers if auth fails
    return {};
  }
}

/**
 * Get the current user's role from Clerk session.
 * Useful for server components that need to conditionally render based on role.
 * 
 * @returns The user's role or 'USER' as default
 */
export async function getCurrentUserRole(): Promise<UserRole> {
  try {
    await connection();
    const authResult = await auth();
    const { userId, sessionClaims, orgRole } = authResult;

    if (!userId) {
      return UserRole.USER;
    }

    const metadataRole = sessionClaims?.metadata?.role as UserRole | undefined;
    const mappedRole = mapOrgRole(orgRole as string | undefined);
    let realRole = mappedRole ?? metadataRole ?? UserRole.USER;

    if (!mappedRole && !metadataRole) {
      try {
        const user = await getClerkUser();
        const pubRole = user?.publicMetadata?.role as UserRole | undefined;
        if (pubRole) {
          realRole = pubRole;
        }
      } catch {
        // currentUser() may fail during prerendering — keep default
      }
    }

    // Return effective (lens-downgraded) role
    return getEffectiveRole(realRole);
  } catch (error) {
    // Re-throw Next.js internal errors (PPR bailout, prerender signals, redirects)
    if (typeof error === 'object' && error !== null && 'digest' in error) {
      throw error;
    }
    return UserRole.USER;
  }
}

/**
 * Check if current user has admin or editor role (can create/edit content).
 * 
 * @returns True if user is ADMIN or EDITOR
 */
export async function canCreateContent(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role === UserRole.ADMIN || role === UserRole.EDITOR;
}

/**
 * Enhanced API fetch that includes role headers.
 * Use this for server-side API calls that need RBAC.
 * 
 * @param url - The API URL to fetch
 * @param options - Standard fetch options
 * @returns The fetch response
 */
export async function fetchWithRole(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const authHeaders = await getAuthHeaders();
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
    mode: 'cors',
    credentials: 'include',
  });
}

/**
 * Generate signed authentication headers for client-side API calls.
 *
 * Client components cannot access HMAC_SHARED_SECRET (it's server-only).
 * They should call this server action to obtain headers with HMAC signatures.
 *
 * @param userId - The Clerk user ID
 * @param userRole - The user's role string (e.g., 'ADMIN', 'EDITOR', 'USER')
 * @returns Headers object with X-User-Id, X-User-Role, and HMAC signature headers
 */
export async function getSignedAuthHeaders(
  userId: string,
  userRole: string
): Promise<Record<string, string>> {
  if (!userId) {
    return {};
  }

  // Resolve effective role from lens cookie
  const effectiveRole = await getEffectiveRole(userRole as UserRole);
  const hmacHeaders = signAuthHeaders(userId, userRole, effectiveRole);

  return {
    'X-User-Id': userId,
    'X-User-Role': userRole,
    'X-Effective-Role': effectiveRole,
    ...hmacHeaders,
  };
}

/**
 * Get the API base URL from environment variables.
 * Made async to comply with 'use server' directive requirements.
 */
export async function getApiBaseUrl(): Promise<string> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  return apiUrl ? `https://${apiUrl}/api` : 'http://localhost:8080/api';
}

/**
 * Make a role-authenticated API request.
 * 
 * @param endpoint - API endpoint (e.g., '/users')
 * @param options - Fetch options
 * @returns Parsed JSON response
 */
export async function roleApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetchWithRole(
    `${baseUrl}${endpoint}`,
    options
  );
  
  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({})) as ErrorResponse;
    const error = new Error(errorData.message ?? `HTTP ${response.status}`);
    (error as Error & { status: number }).status = response.status;
    throw error;
  }
  
  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (response.status === 204 || !contentType?.includes('application/json')) {
    return null as T;
  }
  
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (null as T);
}

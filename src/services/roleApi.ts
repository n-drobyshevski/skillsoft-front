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

import { auth } from '@clerk/nextjs/server';
import { UserRole } from '@/types/user';

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
    const authResult = await auth();
    const { userId, sessionClaims, orgRole } = authResult;
    
    if (!userId) {
      return {};
    }
    
    // Get role from auth object (orgRole comes from Clerk organization)
    // orgRole is directly on auth result, NOT in sessionClaims
    const metadataRole = sessionClaims?.metadata?.role as UserRole | undefined;
    
    // Priority: Organization role > metadata role > default USER
    const mappedRole = mapOrgRole(orgRole as string | undefined);
    const userRole: UserRole = mappedRole ?? metadataRole ?? UserRole.USER;
    
    return {
      'X-User-Id': userId,
      'X-User-Role': userRole,
    };
  } catch {
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
    const authResult = await auth();
    const { userId, sessionClaims, orgRole } = authResult;
    
    if (!userId) {
      return UserRole.USER;
    }
    
    const metadataRole = sessionClaims?.metadata?.role as UserRole | undefined;
    const mappedRole = mapOrgRole(orgRole as string | undefined);
    
    return mappedRole ?? metadataRole ?? UserRole.USER;
  } catch {
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

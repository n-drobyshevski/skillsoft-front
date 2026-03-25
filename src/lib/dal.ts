/**
 * Data Access Layer (DAL) - Next.js 16 Authorization Pattern
 * 
 * This module provides a centralized place for authorization logic,
 * following Next.js 16 best practices:
 * 
 * 1. Optimistic checks in proxy.ts (cookie-based, fast)
 * 2. Secure checks in DAL (verified against Clerk, cached)
 * 
 * The DAL uses React's `cache()` function to memoize authorization checks
 * within a single request, preventing duplicate API calls.
 * 
 * Usage in Server Components:
 * ```ts
 * import { verifySession, requireAdmin, requireEditor } from '@/lib/dal';
 * 
 * // In a Server Component
 * export default async function AdminPage() {
 *   const session = await requireAdmin(); // Throws redirect if not admin
 *   // ... render admin content
 * }
 * ```
 */
'use server';

import { cache } from 'react';
import { connection } from 'next/server';
import { cookies } from 'next/headers';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { UserRole } from '@/types/user';
import { LENS_COOKIE_NAME, LENS_TO_ROLE, type LensType } from '@/store/lens-store';

// ============================================================================
// Types
// ============================================================================

export interface VerifiedSession {
  userId: string;
  /** Effective role (lens-downgraded). Use this for permission checks. */
  role: UserRole;
  /** Actual Clerk role before lens downgrade. Use for audit/display only. */
  actualRole: UserRole;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  isAdmin: boolean;
  isEditor: boolean;
  hasContentAccess: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Map Clerk organization role to our internal UserRole type
 */
function mapOrgRoleToUserRole(orgRole: string | undefined): UserRole | null {
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
 * Read the active lens cookie and resolve the effective role.
 * Can only downgrade relative to the real Clerk role.
 */
async function resolveEffectiveRole(realRole: UserRole): Promise<UserRole> {
  try {
    const cookieStore = await cookies();
    const lensCookie = cookieStore.get(LENS_COOKIE_NAME)?.value as LensType | undefined;
    if (!lensCookie || !(lensCookie in LENS_TO_ROLE)) return realRole;
    const lensRole = LENS_TO_ROLE[lensCookie];
    return ROLE_LEVEL[lensRole] <= ROLE_LEVEL[realRole] ? lensRole : realRole;
  } catch {
    return realRole;
  }
}

// ============================================================================
// Cached Session Verification
// ============================================================================

/**
 * Verify the current session and get user data.
 * 
 * This function is memoized using React's `cache()`, so multiple calls
 * within the same request will only hit Clerk once.
 * 
 * @returns VerifiedSession object with user data and role info
 * @returns null if no valid session exists
 */
export const verifySession = cache(async (): Promise<VerifiedSession | null> => {
  try {
    // Signal to Next.js PPR that this code requires a real request
    // Without this, prerendering will fail because auth() needs headers()
    await connection();
    const authResult = await auth();
    const { userId, sessionClaims, orgRole } = authResult;
    
    // No authenticated user
    if (!userId) {
      return null;
    }
    
    // Get role from org membership or metadata
    const mappedRole = mapOrgRoleToUserRole(orgRole as string | undefined);
    const metadataRole = sessionClaims?.metadata?.role as UserRole | undefined;
    const actualRole: UserRole = mappedRole ?? metadataRole ?? UserRole.USER;

    // Resolve effective role from lens cookie (can only downgrade)
    const role = await resolveEffectiveRole(actualRole);

    // Get user details (also cached by Clerk)
    const user = await currentUser();

    return {
      userId,
      role,
      actualRole,
      email: user?.emailAddresses?.[0]?.emailAddress ?? null,
      firstName: user?.firstName ?? null,
      lastName: user?.lastName ?? null,
      isAdmin: role === 'ADMIN',
      isEditor: role === 'EDITOR',
      hasContentAccess: role === 'ADMIN' || role === 'EDITOR',
    };
  } catch (error) {
    // Re-throw Next.js internal errors (PPR bailout, prerender signals, redirects)
    if (typeof error === 'object' && error !== null && 'digest' in error) {
      throw error;
    }
    return null;
  }
});

/**
 * Get the current user's role (cached).
 * 
 * @returns UserRole or 'USER' as default
 */
export const getUserRole = cache(async (): Promise<UserRole> => {
  const session = await verifySession();
  return session?.role ?? UserRole.USER;
});

// ============================================================================
// Authorization Guards
// ============================================================================

/**
 * Require authentication - redirects to sign-in if not authenticated.
 * 
 * @param redirectTo - Where to redirect after sign-in (default: /dashboard)
 * @returns VerifiedSession for the authenticated user
 */
export async function requireAuth(redirectTo?: string): Promise<VerifiedSession> {
  const session = await verifySession();
  
  if (!session) {
    const signInUrl = redirectTo 
      ? `/sign-in?redirect_url=${encodeURIComponent(redirectTo)}`
      : '/sign-in';
    redirect(signInUrl);
  }
  
  return session;
}

/**
 * Require ADMIN role - redirects to dashboard if not admin.
 * 
 * @returns VerifiedSession for the admin user
 */
export async function requireAdmin(): Promise<VerifiedSession> {
  const session = await requireAuth();
  
  if (!session.isAdmin) {
    redirect('/dashboard?error=unauthorized&message=Admin+access+required');
  }
  
  return session;
}

/**
 * Require EDITOR or ADMIN role - redirects to dashboard if neither.
 * 
 * @returns VerifiedSession for the editor/admin user
 */
export async function requireEditor(): Promise<VerifiedSession> {
  const session = await requireAuth();
  
  if (!session.hasContentAccess) {
    redirect('/dashboard?error=unauthorized&message=Editor+access+required');
  }
  
  return session;
}

/**
 * Require content management access (ADMIN or EDITOR).
 * Alias for requireEditor() for semantic clarity.
 * 
 * @returns VerifiedSession for user with content access
 */
export const requireContentAccess = requireEditor;

// ============================================================================
// Permission Checks (non-throwing)
// ============================================================================

/**
 * Check if current user is authenticated (non-throwing).
 * 
 * @returns true if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await verifySession();
  return session !== null;
}

/**
 * Check if current user is admin (non-throwing).
 * 
 * @returns true if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await verifySession();
  return session?.isAdmin ?? false;
}

/**
 * Check if current user can manage content (non-throwing).
 * 
 * @returns true if user is admin or editor
 */
export async function canManageContent(): Promise<boolean> {
  const session = await verifySession();
  return session?.hasContentAccess ?? false;
}

/**
 * Check if current user has a specific role (non-throwing).
 * 
 * @param role - The role to check for
 * @returns true if user has the specified role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const session = await verifySession();
  return session?.role === role;
}

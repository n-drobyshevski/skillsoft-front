/**
 * Role-based access control utilities for Skillsoft.
 * 
 * This module provides functions to check user roles from Clerk session claims.
 * 
 * The role can come from two sources:
 * 1. Organization role (orgRole) - from Clerk organization membership (e.g., "org:admin")
 * 2. Public metadata role - stored in user's publicMetadata
 * 
 * Organization role takes priority over metadata role.
 */

import { auth } from '@clerk/nextjs/server';
import { UserRole } from '@/types/user';

/**
 * Role hierarchy - higher number means more permissions.
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.USER]: 1,
  [UserRole.EDITOR]: 2,
  [UserRole.ADMIN]: 3,
};

/**
 * Map Clerk organization role to application UserRole.
 * 
 * @param orgRole - Clerk org role string (e.g., "org:admin")
 * @returns Mapped UserRole or null if not recognized
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

/**
 * Get the effective user role from session claims.
 * Checks both orgRole and metadata.role, with orgRole taking priority.
 * 
 * @returns The effective UserRole, defaults to 'USER' if none found
 */
async function getEffectiveRole(): Promise<UserRole> {
  const { sessionClaims } = await auth();
  
  // Get role from organization (takes priority)
  const orgRole = sessionClaims?.orgRole as string | undefined;
  const mappedOrgRole = mapOrgRole(orgRole);
  
  // Fallback to metadata role
  const metadataRole = sessionClaims?.metadata?.role as UserRole | undefined;
  
  // Priority: Organization role > metadata role > default USER
  return mappedOrgRole ?? metadataRole ?? UserRole.USER;
}

/**
 * Check if the current user has a specific role.
 * 
 * @param role - The role to check for
 * @returns Promise<boolean> - True if user has the exact role
 * 
 * @example
 * const isAdmin = await checkRole('ADMIN');
 * if (!isAdmin) redirect('/');
 */
export async function checkRole(role: UserRole): Promise<boolean> {
  const userRole = await getEffectiveRole();
  return userRole === role;
}

/**
 * Get the current user's role from session claims.
 * 
 * @returns Promise<UserRole | null> - The user's role or null if not set
 */
export async function getUserRole(): Promise<UserRole | null> {
  const { sessionClaims } = await auth();
  
  // Get role from organization (takes priority)
  const orgRole = sessionClaims?.orgRole as string | undefined;
  const mappedOrgRole = mapOrgRole(orgRole);
  
  // Fallback to metadata role
  const metadataRole = sessionClaims?.metadata?.role as UserRole | undefined;
  
  return mappedOrgRole ?? metadataRole ?? null;
}

/**
 * Check if the current user has at least the specified role level.
 * Uses role hierarchy: USER < EDITOR < ADMIN
 * 
 * @param minimumRole - The minimum role required
 * @returns Promise<boolean> - True if user's role is >= minimum role
 * 
 * @example
 * // Returns true for EDITOR and ADMIN
 * const canEdit = await hasMinimumRole('EDITOR');
 */
export async function hasMinimumRole(minimumRole: UserRole): Promise<boolean> {
  const userRole = await getEffectiveRole();

  // Safe access with explicit type assertion for Record<UserRole, number>
  const userLevel = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[minimumRole as keyof typeof ROLE_HIERARCHY] ?? 0;

  return userLevel >= requiredLevel;
}

/**
 * Check if the current user has any of the specified roles.
 * 
 * @param roles - Array of roles to check against
 * @returns Promise<boolean> - True if user has any of the roles
 * 
 * @example
 * const canManageContent = await hasAnyRole(['ADMIN', 'EDITOR']);
 */
export async function hasAnyRole(roles: UserRole[]): Promise<boolean> {
  const userRole = await getEffectiveRole();
  return roles.includes(userRole);
}

/**
 * Check if the current user is an admin.
 * Shorthand for checkRole('ADMIN').
 */
export async function isAdmin(): Promise<boolean> {
  return checkRole(UserRole.ADMIN);
}

/**
 * Check if the current user can edit content (ADMIN or EDITOR).
 * Shorthand for hasAnyRole(['ADMIN', 'EDITOR']).
 */
export async function canEdit(): Promise<boolean> {
  return hasAnyRole([UserRole.ADMIN, UserRole.EDITOR]);
}

/**
 * Get role display name for UI.
 */
export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Administrator',
    [UserRole.EDITOR]: 'Editor',
    [UserRole.USER]: 'User',
  };
  // Safe access with explicit type assertion for Record<UserRole, string>
  return names[role as keyof typeof names] ?? 'Unknown';
}

/**
 * Get role badge variant for UI styling.
 */
export function getRoleBadgeVariant(role: UserRole): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variants: Record<UserRole, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    [UserRole.ADMIN]: 'destructive',
    [UserRole.EDITOR]: 'default',
    [UserRole.USER]: 'secondary',
  };
  // Safe access with explicit type assertion for Record<UserRole, variant>
  return variants[role as keyof typeof variants] ?? 'outline';
}

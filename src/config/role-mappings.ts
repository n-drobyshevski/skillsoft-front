import { UserRole } from "@/types/user";
import { LensType } from "@/store/lens-store";

/**
 * Role-to-Lens Mappings
 *
 * Centralized configuration for role-based lens access.
 * Makes it easy to add new roles or modify lens permissions.
 */

/**
 * Default lens for each role
 * Used when user first logs in or has no stored preference
 */
export const ROLE_LENS_DEFAULTS: Record<UserRole, LensType> = {
  [UserRole.ADMIN]: "admin",
  [UserRole.EDITOR]: "editor",
  [UserRole.USER]: "user",
};

/**
 * Available lenses for each role
 * Users can only switch to lenses at or below their permission level
 */
export const ROLE_AVAILABLE_LENSES: Record<UserRole, LensType[]> = {
  [UserRole.ADMIN]: ["user", "editor", "admin"],
  [UserRole.EDITOR]: ["user", "editor"],
  [UserRole.USER]: ["user"],
};

/**
 * Helper: Get default lens for a role
 */
export function getDefaultLensForRole(role: UserRole): LensType {
  return ROLE_LENS_DEFAULTS[role] || "user";
}

/**
 * Helper: Get available lenses for a role
 */
export function getAvailableLensesForRole(role: UserRole): LensType[] {
  return ROLE_AVAILABLE_LENSES[role] || ["user"];
}

/**
 * Helper: Check if a lens is available for a role
 */
export function isLensAvailableForRole(lens: LensType, role: UserRole): boolean {
  return getAvailableLensesForRole(role).includes(lens);
}

/**
 * Helper: Validate and correct lens for role
 * Returns the lens if valid, otherwise returns the default lens for the role
 */
export function getValidLensForRole(lens: LensType, role: UserRole): LensType {
  if (isLensAvailableForRole(lens, role)) {
    return lens;
  }
  return getDefaultLensForRole(role);
}

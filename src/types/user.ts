/**
 * User entity interfaces for Clerk.js integration.
 * Consolidated from app/interfaces/user-interfaces.ts
 */

export enum UserRole {
  USER = 'USER',
  EDITOR = 'EDITOR',
  ADMIN = 'ADMIN',
}

/**
 * User status key for i18n translation lookup.
 * Derived from User model's isActive, banned, and locked properties.
 */
export type UserStatusKey = 'active' | 'inactive' | 'banned' | 'locked';

export interface User {
  id: string;
  clerkId: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  hasImage?: boolean;
  role: UserRole;
  isActive: boolean;
  banned?: boolean;
  locked?: boolean;
  preferences?: string;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  clerkCreatedAt?: string;
  lastSignInAt?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  byRole: {
    admin: number;
    editor: number;
    user: number;
  };
  recentlyActive: number;
}

export interface UserCreateInput {
  clerkId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
}

export interface UserUpdateInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
  preferences?: string;
}

// ============================================
// USER HELPER FUNCTIONS
// ============================================

export function getUserFullName(user: User): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  } else if (user.firstName) {
    return user.firstName;
  } else if (user.lastName) {
    return user.lastName;
  } else if (user.username) {
    return user.username;
  } else if (user.email) {
    return user.email;
  }
  return user.clerkId;
}

export function canUserAccess(user: User): boolean {
  return user.isActive && !user.banned && !user.locked;
}

/**
 * Get the status key for a user (for i18n translation lookup).
 * Use with useUserStatusTranslation() hook for translated labels.
 *
 * @example
 * ```tsx
 * const statusKey = getUserStatusKey(user);
 * const { getLabel } = useUserStatusTranslation();
 * const label = getLabel(statusKey); // Translated label
 * ```
 */
export function getUserStatusKey(user: User): UserStatusKey {
  if (user.banned) return 'banned';
  if (user.locked) return 'locked';
  if (!user.isActive) return 'inactive';
  return 'active';
}

/**
 * Get user status with hardcoded English label and badge variant.
 *
 * @deprecated For i18n support, use getUserStatusKey() with useUserStatusTranslation() hook.
 * This function is kept for backward compatibility with existing components.
 *
 * @example Migration:
 * ```tsx
 * // Old (deprecated):
 * const status = getUserStatus(user);
 * <Badge variant={status.variant}>{status.label}</Badge>
 *
 * // New (i18n):
 * const statusKey = getUserStatusKey(user);
 * const { getLabel } = useUserStatusTranslation();
 * const variant = getStatusBadgeVariant(statusKey);
 * <Badge variant={variant}>{getLabel(statusKey)}</Badge>
 * ```
 */
export function getUserStatus(user: User): { label: string; variant: 'default' | 'success' | 'warning' | 'destructive'; key: UserStatusKey } {
  if (user.banned) {
    return { label: 'Banned', variant: 'destructive', key: 'banned' };
  }
  if (user.locked) {
    return { label: 'Locked', variant: 'warning', key: 'locked' };
  }
  if (!user.isActive) {
    return { label: 'Inactive', variant: 'warning', key: 'inactive' };
  }
  return { label: 'Active', variant: 'success', key: 'active' };
}

/**
 * Get the badge variant for a user status key.
 * Use with getUserStatusKey() for type-safe status styling.
 */
export function getStatusBadgeVariant(status: UserStatusKey): 'default' | 'success' | 'warning' | 'destructive' {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
    case 'locked':
      return 'warning';
    case 'banned':
      return 'destructive';
    default:
      return 'default';
  }
}

export function getUserInitials(user: User): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  } else if (user.firstName) {
    return user.firstName.substring(0, 2).toUpperCase();
  } else if (user.lastName) {
    return user.lastName.substring(0, 2).toUpperCase();
  } else if (user.username) {
    return user.username.substring(0, 2).toUpperCase();
  } else if (user.email) {
    return user.email.substring(0, 2).toUpperCase();
  }
  return 'U';
}

export function getRoleBadgeColor(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
    case UserRole.EDITOR:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    case UserRole.USER:
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800';
  }
}

/**
 * Get the display name for a user role (hardcoded English).
 *
 * @deprecated For i18n support, use useUserRoleTranslation() hook instead.
 * This function is kept for backward compatibility.
 *
 * @example Migration:
 * ```tsx
 * // Old (deprecated):
 * const displayName = getRoleDisplayName(user.role);
 *
 * // New (i18n):
 * const { getLabel } = useUserRoleTranslation();
 * const displayName = getLabel(user.role);
 * ```
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return 'Administrator';
    case UserRole.EDITOR:
      return 'Editor';
    case UserRole.USER:
      return 'User';
    default:
      return role;
  }
}

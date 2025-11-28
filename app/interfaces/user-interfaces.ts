/**
 * User entity interfaces for Clerk.js integration
 */

export enum UserRole {
  USER = 'USER',
  EDITOR = 'EDITOR',
  ADMIN = 'ADMIN',
}

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

/**
 * Input types for user operations
 */
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

/**
 * Helper function to get user's full name
 */
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

/**
 * Helper function to check if user can access the system
 */
export function canUserAccess(user: User): boolean {
  return user.isActive && !user.banned && !user.locked;
}

/**
 * Helper function to get user status description
 */
export function getUserStatus(user: User): { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' } {
  if (user.banned) {
    return { label: 'Banned', variant: 'destructive' };
  }
  if (user.locked) {
    return { label: 'Locked', variant: 'warning' };
  }
  if (!user.isActive) {
    return { label: 'Inactive', variant: 'warning' };
  }
  return { label: 'Active', variant: 'success' };
}

/**
 * Helper function to get user initials for avatar
 */
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

/**
 * Get role badge color class
 */
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
 * Get role display name
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

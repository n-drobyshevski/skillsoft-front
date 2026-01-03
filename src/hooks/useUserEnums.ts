'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { UserRole } from '@/types/user';

/**
 * Represents a user status key for translation lookup.
 * Maps to the User model's computed status (based on isActive, banned, locked).
 */
export type UserStatusKey = 'active' | 'inactive' | 'banned' | 'locked';

/**
 * Option interface for Select components with optional description.
 */
export interface UserEnumOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
}

// Type for the translation function to handle dynamic keys
type TranslationFn = ReturnType<typeof useTranslations>;

/**
 * Hook for translating UserRole enum values with i18n support.
 *
 * @returns Object with getLabel, getDescription, and getRoleOptions functions
 *
 * @example
 * ```tsx
 * const { getLabel, getDescription, getRoleOptions } = useUserRoleTranslation();
 *
 * // Get translated label
 * const label = getLabel(UserRole.ADMIN); // "Administrator" or "Администратор"
 *
 * // Get description
 * const desc = getDescription(UserRole.ADMIN); // "Full system access"
 *
 * // Get options for Select component
 * const options = getRoleOptions(); // [{ value: 'USER', label: '...', description: '...' }, ...]
 * ```
 */
export function useUserRoleTranslation() {
  const t = useTranslations('enums.userRole') as TranslationFn;

  return useMemo(() => {
    // Helper to safely translate a key
    const safeTranslate = (key: string): string => {
      try {
        return (t as unknown as (key: string) => string)(key);
      } catch {
        // Fallback: format enum value to title case
        return key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
      }
    };

    // Check if a key exists
    const hasKey = (key: string): boolean => {
      try {
        (t as unknown as (key: string) => string)(key);
        return true;
      } catch {
        return false;
      }
    };

    return {
      /**
       * Get the translated label for a user role.
       */
      getLabel: (role: UserRole): string => safeTranslate(role),

      /**
       * Get the translated description for a user role.
       */
      getDescription: (role: UserRole): string | undefined => {
        const descKey = `${role}_DESC`;
        return hasKey(descKey) ? safeTranslate(descKey) : undefined;
      },

      /**
       * Get label and description together for rich UI components.
       */
      getLabelWithDescription: (role: UserRole): { label: string; description?: string } => {
        const label = safeTranslate(role);
        const descKey = `${role}_DESC`;
        const description = hasKey(descKey) ? safeTranslate(descKey) : undefined;
        return { label, description };
      },

      /**
       * Get all role options for Select components.
       * Returns options in order: USER, EDITOR, ADMIN (ascending privilege).
       */
      getRoleOptions: (): UserEnumOption<UserRole>[] => {
        const roleOrder: UserRole[] = [UserRole.USER, UserRole.EDITOR, UserRole.ADMIN];
        return roleOrder.map((role) => {
          const label = safeTranslate(role);
          const descKey = `${role}_DESC`;
          const description = hasKey(descKey) ? safeTranslate(descKey) : undefined;
          return { value: role, label, description };
        });
      },

      /**
       * Get role options from a custom list of roles.
       */
      getOptionsForRoles: (roles: readonly UserRole[]): UserEnumOption<UserRole>[] =>
        roles.map((role) => {
          const label = safeTranslate(role);
          const descKey = `${role}_DESC`;
          const description = hasKey(descKey) ? safeTranslate(descKey) : undefined;
          return { value: role, label, description };
        }),
    };
  }, [t]);
}

/**
 * Hook for translating user status values with i18n support.
 * Status is computed from User model properties (isActive, banned, locked).
 *
 * @returns Object with getLabel, getDescription, and getStatusOptions functions
 *
 * @example
 * ```tsx
 * const { getLabel, getDescription, getStatusOptions } = useUserStatusTranslation();
 *
 * // Get translated label
 * const label = getLabel('active'); // "Active" or "Активен"
 *
 * // Get description
 * const desc = getDescription('banned'); // "User is permanently blocked from the system"
 *
 * // Get all status options
 * const options = getStatusOptions();
 * ```
 */
export function useUserStatusTranslation() {
  const t = useTranslations('enums.userStatus') as TranslationFn;

  return useMemo(() => {
    // Helper to safely translate a key
    const safeTranslate = (key: string): string => {
      try {
        return (t as unknown as (key: string) => string)(key);
      } catch {
        // Fallback: capitalize
        return key.charAt(0).toUpperCase() + key.slice(1);
      }
    };

    // Check if a key exists
    const hasKey = (key: string): boolean => {
      try {
        (t as unknown as (key: string) => string)(key);
        return true;
      } catch {
        return false;
      }
    };

    // All available statuses in display order
    const allStatuses: UserStatusKey[] = ['active', 'inactive', 'locked', 'banned'];

    return {
      /**
       * Get the translated label for a user status.
       */
      getLabel: (status: UserStatusKey): string => safeTranslate(status),

      /**
       * Get the translated description for a user status.
       */
      getDescription: (status: UserStatusKey): string | undefined => {
        const descKey = `${status}_DESC`;
        return hasKey(descKey) ? safeTranslate(descKey) : undefined;
      },

      /**
       * Get label and description together for rich UI components.
       */
      getLabelWithDescription: (status: UserStatusKey): { label: string; description?: string } => {
        const label = safeTranslate(status);
        const descKey = `${status}_DESC`;
        const description = hasKey(descKey) ? safeTranslate(descKey) : undefined;
        return { label, description };
      },

      /**
       * Get all status options for Select/filter components.
       */
      getStatusOptions: (): UserEnumOption<UserStatusKey>[] =>
        allStatuses.map((status) => {
          const label = safeTranslate(status);
          const descKey = `${status}_DESC`;
          const description = hasKey(descKey) ? safeTranslate(descKey) : undefined;
          return { value: status, label, description };
        }),

      /**
       * Get status options from a custom list.
       */
      getOptionsForStatuses: (statuses: readonly UserStatusKey[]): UserEnumOption<UserStatusKey>[] =>
        statuses.map((status) => {
          const label = safeTranslate(status);
          const descKey = `${status}_DESC`;
          const description = hasKey(descKey) ? safeTranslate(descKey) : undefined;
          return { value: status, label, description };
        }),
    };
  }, [t]);
}

/**
 * Combined hook that provides both role and status translations.
 * Useful when you need both in the same component.
 *
 * @example
 * ```tsx
 * const { roles, statuses } = useUserEnumTranslations();
 *
 * const roleLabel = roles.getLabel(user.role);
 * const statusLabel = statuses.getLabel(getUserStatusKey(user));
 * ```
 */
export function useUserEnumTranslations() {
  const roles = useUserRoleTranslation();
  const statuses = useUserStatusTranslation();

  return { roles, statuses };
}

/**
 * Helper function to derive the status key from a User object.
 * Use this to get the correct status key for translation.
 *
 * @param user - User object or partial with status flags
 * @returns The appropriate UserStatusKey for translation
 *
 * @example
 * ```tsx
 * const statusKey = getUserStatusKey(user); // 'active' | 'inactive' | 'banned' | 'locked'
 * const label = statuses.getLabel(statusKey);
 * ```
 */
export function getUserStatusKey(user: {
  isActive?: boolean;
  banned?: boolean;
  locked?: boolean;
}): UserStatusKey {
  if (user.banned) return 'banned';
  if (user.locked) return 'locked';
  if (user.isActive === false) return 'inactive';
  return 'active';
}

/**
 * Get the badge variant for a user status.
 * Useful for consistent styling across components.
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

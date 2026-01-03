'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

/**
 * Supported enum namespaces for translation lookup.
 * Each corresponds to a key in messages/{locale}.json under "enums".
 */
export type EnumNamespace =
  | 'competencyCategory'
  | 'observabilityLevel'
  | 'approvalStatus'
  | 'contextScope'
  | 'measurementType'
  | 'difficultyLevel'
  | 'questionType'
  | 'sessionStatus'
  | 'assessmentGoal'
  // Psychometrics-specific enums
  | 'itemValidityStatus'
  | 'difficultyFlag'
  | 'discriminationFlag'
  | 'reliabilityStatus'
  | 'bigFiveTrait'
  // User management enums
  | 'userRole'
  | 'userStatus';

/**
 * Option interface for Select components.
 * Includes optional description for rich dropdown items.
 */
export interface EnumOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
}

// Type for the translation function to handle dynamic keys
type TranslationFn = ReturnType<typeof useTranslations>;

/**
 * Hook for translating enum values with i18n support.
 *
 * @param namespace - The enum namespace (e.g., 'observabilityLevel')
 * @returns Object with translate, translateWithDescription, and getOptions functions
 *
 * @example
 * ```tsx
 * const { translate, getOptions } = useEnumTranslation('observabilityLevel');
 * const label = translate('DIRECTLY_OBSERVABLE'); // "Directly Observable" or "Напрямую наблюдаемый"
 * const options = getOptions(Object.values(ObservabilityLevel));
 * ```
 */
export function useEnumTranslation<T extends string>(namespace: EnumNamespace) {
  const t = useTranslations(`enums.${namespace}`) as TranslationFn;

  return useMemo(() => {
    // Helper to safely translate a key
    const safeTranslate = (key: string): string => {
      try {
        // Use type assertion to bypass strict typing for dynamic keys
        return (t as unknown as (key: string) => string)(key);
      } catch {
        // Fallback: replace underscores with spaces and title case
        return key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
      }
    };

    // Check if a key exists (try to translate and see if it throws)
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
       * Translate a single enum value to its localized display string.
       * Falls back to formatted raw value if translation is missing.
       */
      translate: (value: T): string => safeTranslate(value),

      /**
       * Translate enum value with optional description suffix.
       * Used for rich select items with help text.
       */
      translateWithDescription: (value: T): { label: string; description?: string } => {
        const label = safeTranslate(value);
        const descKey = `${value}_DESC`;
        const description = hasKey(descKey) ? safeTranslate(descKey) : undefined;
        return { label, description };
      },

      /**
       * Generate translated options array for Select components.
       * Preserves original enum value for form submission.
       */
      getOptions: (enumValues: readonly T[]): EnumOption<T>[] =>
        enumValues.map((value) => {
          const label = safeTranslate(value);
          const descKey = `${value}_DESC`;
          const description = hasKey(descKey) ? safeTranslate(descKey) : undefined;
          return { value, label, description };
        }),
    };
  }, [t]);
}

/**
 * Standalone translation function for Server Components.
 * Use when useTranslations is available but React hooks are not.
 *
 * @param t - Translation function from getTranslations('enums.namespace')
 * @param value - Enum value to translate
 */
export function translateEnum<T extends string>(
  t: (key: string) => string,
  value: T
): string {
  try {
    return t(value);
  } catch {
    return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
}

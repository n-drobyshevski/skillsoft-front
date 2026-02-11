import { z } from 'zod';

/**
 * Type for next-intl translation function.
 * Supports both simple keys and interpolation with parameters.
 */
export type TranslationFunction = (
  key: string,
  params?: Record<string, string | number>
) => string;

/**
 * Helper to create translated validation message for use in schema definitions.
 * Use this when you need custom error messages with parameters.
 *
 * @param t - Translation function
 * @param key - Translation key (e.g., 'validation.minLength')
 * @param params - Interpolation parameters
 * @returns Translated error message string
 */
export function validationMessage(
  t: TranslationFunction,
  key: string,
  params?: Record<string, string | number>
): string {
  return t(key, params);
}

/**
 * Creates a custom error message function for Zod 4 nativeEnum.
 * In Zod 4, nativeEnum uses `error` property instead of `errorMap`.
 */
export function enumError(t: TranslationFunction): string {
  return t('validation.selectOption');
}

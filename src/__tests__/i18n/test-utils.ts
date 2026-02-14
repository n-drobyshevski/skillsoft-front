/**
 * I18n Test Utilities
 *
 * Helper functions for testing internationalization features.
 */

import enMessages from '../../../messages/en/index';
import ruMessages from '../../../messages/ru/index';

export type Locale = 'en' | 'ru';

export const messages: Record<Locale, typeof enMessages> = {
  en: enMessages,
  ru: ruMessages,
};

/**
 * Get all translation keys from a locale
 */
export function getAllKeys(locale: Locale): string[] {
  return extractKeys(messages[locale]);
}

/**
 * Recursively extract all keys from an object
 */
function extractKeys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return extractKeys(value as object, path);
    }
    return [path];
  });
}

/**
 * Get a translation value by path
 */
export function getTranslation(locale: Locale, path: string): string | undefined {
  const parts = path.split('.');
  let current: unknown = messages[locale];

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Check if a translation exists
 */
export function hasTranslation(locale: Locale, path: string): boolean {
  return getTranslation(locale, path) !== undefined;
}

/**
 * Get keys that exist in one locale but not the other
 */
export function getMissingKeys(
  sourceLocale: Locale,
  targetLocale: Locale
): string[] {
  const sourceKeys = getAllKeys(sourceLocale);
  const targetKeys = new Set(getAllKeys(targetLocale));

  return sourceKeys.filter(key => !targetKeys.has(key));
}

/**
 * Get keys with empty values
 */
export function getEmptyKeys(locale: Locale): string[] {
  const keys = getAllKeys(locale);
  return keys.filter(key => {
    const value = getTranslation(locale, key);
    return value === '' || value === null || value === undefined;
  });
}

/**
 * Count translations by namespace
 */
export function countByNamespace(locale: Locale): Record<string, number> {
  const keys = getAllKeys(locale);
  const counts: Record<string, number> = {};

  keys.forEach(key => {
    const namespace = key.split('.')[0];
    counts[namespace] = (counts[namespace] || 0) + 1;
  });

  return counts;
}

/**
 * Validate interpolation placeholders match between locales
 */
export function getInterpolationMismatches(): string[] {
  const enKeys = getAllKeys('en');
  const mismatches: string[] = [];

  // Regex to find {placeholder} patterns
  const placeholderRegex = /\{(\w+)\}/g;

  enKeys.forEach(key => {
    const enValue = getTranslation('en', key);
    const ruValue = getTranslation('ru', key);

    if (enValue && ruValue) {
      const enPlaceholders = new Set(
        [...enValue.matchAll(placeholderRegex)].map(m => m[1])
      );
      const ruPlaceholders = new Set(
        [...ruValue.matchAll(placeholderRegex)].map(m => m[1])
      );

      // Check if placeholders match
      const enOnly = [...enPlaceholders].filter(p => !ruPlaceholders.has(p));
      const ruOnly = [...ruPlaceholders].filter(p => !enPlaceholders.has(p));

      if (enOnly.length > 0 || ruOnly.length > 0) {
        mismatches.push(
          `${key}: EN has {${enOnly.join(', ')}}, RU has {${ruOnly.join(', ')}}`
        );
      }
    }
  });

  return mismatches;
}

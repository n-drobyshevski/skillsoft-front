/**
 * Importance Label Utility
 *
 * Maps numeric weight multipliers (0.5 - 2.0) to human-friendly
 * importance labels for HR professionals.
 *
 * Display only -- does not change the underlying data model values.
 */

/**
 * Translation keys for importance levels under builder.card.importanceLevel.*
 */
export type ImportanceLevelKey = 'low' | 'medium' | 'high' | 'critical';

/**
 * Returns the translation key for the importance level corresponding
 * to the given numeric weight value.
 *
 * Weight mapping:
 *   <= 0.5  -> "low"
 *   <= 1.0  -> "medium"
 *   <= 1.5  -> "high"
 *   >  1.5  -> "critical"
 */
export function getImportanceLevelKey(weight: number): ImportanceLevelKey {
  if (weight <= 0.5) return 'low';
  if (weight <= 1.0) return 'medium';
  if (weight <= 1.5) return 'high';
  return 'critical';
}

/**
 * Color classes for each importance level, used by visual indicators.
 */
export const importanceLevelColors: Record<ImportanceLevelKey, string> = {
  low: 'text-muted-foreground',
  medium: 'text-blue-600 dark:text-blue-400',
  high: 'text-amber-600 dark:text-amber-400',
  critical: 'text-red-600 dark:text-red-400',
};

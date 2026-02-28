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

/**
 * Discrete importance levels for ToggleGroup selection.
 * Reverse mapping of getImportanceLevelKey — each level maps to a weight value.
 */
export const IMPORTANCE_LEVELS = [
  { value: 0.5, key: 'low' as const },
  { value: 1.0, key: 'medium' as const },
  { value: 1.5, key: 'high' as const },
  { value: 2.0, key: 'critical' as const },
] as const;

/**
 * ToggleGroup active-state classes for importance levels.
 * Applied conditionally by comparing current value — includes hover overrides.
 */
export const importanceLevelBgColors: Record<ImportanceLevelKey, string> = {
  low: 'bg-muted text-muted-foreground hover:bg-muted',
  medium: 'bg-blue-500 text-white hover:bg-blue-600 hover:text-white',
  high: 'bg-amber-500 text-white hover:bg-amber-600 hover:text-white',
  critical: 'bg-red-500 text-white hover:bg-red-600 hover:text-white',
};

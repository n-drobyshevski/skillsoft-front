/**
 * Competency Detail Page - State Machine & Utility Functions
 *
 * This module provides:
 * 1. Page state machine types and derivation logic
 * 2. Alpha quality assessment utilities
 * 3. Status-based UI configuration (gradients, colors)
 *
 * Used by the competency reliability detail page for consistent state handling.
 */

import { ReliabilityStatus, CompetencyReliabilityDetail, AlphaIfDeletedEntry } from '@/types/psychometrics';

// ============================================
// STATE MACHINE TYPES
// ============================================

/**
 * Page state discriminated union for type-safe rendering
 * Note: 'loading' state is handled by Suspense/loading.tsx in server components
 */
export type CompetencyDetailPageState =
  | { status: 'error'; message: string; isRetryable: boolean }
  | { status: 'not_found' }
  | { status: 'populated'; data: CompetencyReliabilityDetail };

/**
 * Reliability sub-states for populated data
 */
export type ReliabilitySubState = 'reliable' | 'acceptable' | 'unreliable' | 'insufficient';

// ============================================
// STATE DERIVATION
// ============================================

/**
 * Derives the page state from data fetching results
 */
export function derivePageState(
  detail: CompetencyReliabilityDetail | null,
  error: string | null
): CompetencyDetailPageState {
  if (error) {
    return {
      status: 'error',
      message: error,
      isRetryable: !error.includes('not found') && !error.includes('404'),
    };
  }

  if (!detail) {
    return { status: 'not_found' };
  }

  return { status: 'populated', data: detail };
}

/**
 * Derives the reliability sub-state from status enum
 */
export function deriveReliabilitySubState(status: ReliabilityStatus): ReliabilitySubState {
  switch (status) {
    case ReliabilityStatus.RELIABLE:
      return 'reliable';
    case ReliabilityStatus.ACCEPTABLE:
      return 'acceptable';
    case ReliabilityStatus.UNRELIABLE:
      return 'unreliable';
    case ReliabilityStatus.INSUFFICIENT_DATA:
    default:
      return 'insufficient';
  }
}

// ============================================
// ALPHA QUALITY ASSESSMENT
// ============================================

/**
 * Locale-agnostic keys for alpha quality zones
 */
export type AlphaQualityKey =
  | 'insufficient'
  | 'unacceptable'
  | 'poor'
  | 'acceptable'
  | 'good'
  | 'excellent'
  | 'exceptional';

/**
 * Non-localized alpha quality data (colors and styling only)
 */
export interface AlphaQualityData {
  key: AlphaQualityKey;
  color: string;
  textClass: string;
  bgClass: string;
}

/**
 * Localized alpha quality with translated labels and descriptions
 */
export interface LocalizedAlphaQuality extends AlphaQualityData {
  label: string;
  description: string;
}

/**
 * Legacy interface for backward compatibility
 * @deprecated Use LocalizedAlphaQuality instead
 */
export interface AlphaQuality {
  label: string;
  labelEn: string;
  color: string;
  textClass: string;
  bgClass: string;
  description: string;
  descriptionEn: string;
}

/**
 * Non-localized alpha quality data by key
 * Contains only styling information, no text
 */
export const ALPHA_QUALITY_DATA: Record<AlphaQualityKey, Omit<AlphaQualityData, 'key'>> = {
  insufficient: {
    color: 'gray',
    textClass: 'text-muted-foreground',
    bgClass: 'bg-muted/50',
  },
  unacceptable: {
    color: 'red',
    textClass: 'text-red-600 dark:text-red-400',
    bgClass: 'bg-red-50 dark:bg-red-950/30',
  },
  poor: {
    color: 'orange',
    textClass: 'text-orange-600 dark:text-orange-400',
    bgClass: 'bg-orange-50 dark:bg-orange-950/30',
  },
  acceptable: {
    color: 'amber',
    textClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
  },
  good: {
    color: 'green',
    textClass: 'text-green-600 dark:text-green-400',
    bgClass: 'bg-green-50 dark:bg-green-950/30',
  },
  excellent: {
    color: 'emerald',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  exceptional: {
    color: 'emerald',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
};

/**
 * Get the alpha quality key based on the alpha value
 * Uses psychometric standards for thresholds
 *
 * Thresholds based on:
 * - Nunnally (1978): alpha >= 0.7 for research, >= 0.8 for applied settings
 * - George & Mallery (2003): alpha >= 0.9 excellent, >= 0.8 good, >= 0.7 acceptable
 */
export function getAlphaQualityKey(alpha: number | null): AlphaQualityKey {
  if (alpha === null) return 'insufficient';
  if (alpha >= 0.9) return 'exceptional';
  if (alpha >= 0.8) return 'excellent';
  if (alpha >= 0.7) return 'good';
  if (alpha >= 0.6) return 'acceptable';
  if (alpha >= 0.5) return 'poor';
  return 'unacceptable';
}

/**
 * Get non-localized alpha quality data (styling only)
 */
export function getAlphaQualityData(alpha: number | null): AlphaQualityData {
  const key = getAlphaQualityKey(alpha);
  return {
    key,
    ...ALPHA_QUALITY_DATA[key],
  };
}

/**
 * Translation function type for localization
 */
export type TranslationFunction = (key: string) => string;

/**
 * Get localized alpha quality information
 * Uses translation function to resolve label and description
 *
 * Translation keys:
 * - psychometrics.competencyDetail.quality.{key}.label
 * - psychometrics.competencyDetail.quality.{key}.description
 *
 * @param alpha - Cronbach's alpha value (null if insufficient data)
 * @param t - Translation function from i18n library
 * @returns Localized alpha quality with label, description, and styling
 */
export function getLocalizedAlphaQuality(
  alpha: number | null,
  t: TranslationFunction
): LocalizedAlphaQuality {
  const data = getAlphaQualityData(alpha);
  const baseKey = `psychometrics.competencyDetail.quality.${data.key}`;

  return {
    ...data,
    label: t(`${baseKey}.label`),
    description: t(`${baseKey}.description`),
  };
}

/**
 * Assessment of Cronbach's Alpha quality based on psychometric standards
 *
 * @deprecated Use getLocalizedAlphaQuality with a translation function instead.
 * This function is kept for backward compatibility but returns hardcoded strings.
 *
 * Thresholds based on:
 * - Nunnally (1978): alpha >= 0.7 for research, >= 0.8 for applied settings
 * - George & Mallery (2003): alpha >= 0.9 excellent, >= 0.8 good, >= 0.7 acceptable
 */
export function getAlphaQuality(alpha: number | null): AlphaQuality {
  if (alpha === null) {
    return {
      label: 'Нет данных',
      labelEn: 'No data',
      color: 'gray',
      textClass: 'text-muted-foreground',
      bgClass: 'bg-muted/50',
      description: 'Недостаточно данных для расчета',
      descriptionEn: 'Insufficient data for calculation',
    };
  }

  if (alpha >= 0.9) {
    return {
      label: 'Превосходный',
      labelEn: 'Exceptional',
      color: 'emerald',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
      description: 'Очень высокая внутренняя согласованность',
      descriptionEn: 'Very high internal consistency',
    };
  }

  if (alpha >= 0.8) {
    return {
      label: 'Отличный',
      labelEn: 'Excellent',
      color: 'emerald',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
      description: 'Отличная внутренняя согласованность',
      descriptionEn: 'Excellent internal consistency',
    };
  }

  if (alpha >= 0.7) {
    return {
      label: 'Хороший',
      labelEn: 'Good',
      color: 'green',
      textClass: 'text-green-600 dark:text-green-400',
      bgClass: 'bg-green-50 dark:bg-green-950/30',
      description: 'Хорошая внутренняя согласованность',
      descriptionEn: 'Good internal consistency',
    };
  }

  if (alpha >= 0.6) {
    return {
      label: 'Приемлемый',
      labelEn: 'Acceptable',
      color: 'amber',
      textClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50 dark:bg-amber-950/30',
      description: 'Приемлемая надежность',
      descriptionEn: 'Acceptable reliability',
    };
  }

  if (alpha >= 0.5) {
    return {
      label: 'Низкий',
      labelEn: 'Poor',
      color: 'orange',
      textClass: 'text-orange-600 dark:text-orange-400',
      bgClass: 'bg-orange-50 dark:bg-orange-950/30',
      description: 'Низкая надежность, требуется пересмотр',
      descriptionEn: 'Low reliability, requires review',
    };
  }

  return {
    label: 'Неприемлемый',
    labelEn: 'Unacceptable',
    color: 'red',
    textClass: 'text-red-600 dark:text-red-400',
    bgClass: 'bg-red-50 dark:bg-red-950/30',
    description: 'Крайне низкая надежность',
    descriptionEn: 'Extremely low reliability',
  };
}

// ============================================
// STATUS-BASED UI CONFIGURATION
// ============================================

export interface StatusGradientConfig {
  gradient: string;
  borderColor: string;
  iconColor: string;
}

/**
 * Get gradient background configuration based on reliability status
 * Used for hero section theming
 */
export function getStatusGradient(status: ReliabilityStatus): StatusGradientConfig {
  switch (status) {
    case ReliabilityStatus.RELIABLE:
      return {
        gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-500/20 dark:via-emerald-500/10',
        borderColor: 'border-l-emerald-500',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
      };
    case ReliabilityStatus.ACCEPTABLE:
      return {
        gradient: 'from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/20 dark:via-amber-500/10',
        borderColor: 'border-l-amber-500',
        iconColor: 'text-amber-600 dark:text-amber-400',
      };
    case ReliabilityStatus.UNRELIABLE:
      return {
        gradient: 'from-red-500/10 via-red-500/5 to-transparent dark:from-red-500/20 dark:via-red-500/10',
        borderColor: 'border-l-red-500',
        iconColor: 'text-red-600 dark:text-red-400',
      };
    case ReliabilityStatus.INSUFFICIENT_DATA:
    default:
      return {
        gradient: 'from-slate-500/10 via-slate-500/5 to-transparent dark:from-slate-500/20 dark:via-slate-500/10',
        borderColor: 'border-l-gray-300 dark:border-l-gray-600',
        iconColor: 'text-muted-foreground',
      };
  }
}

// ============================================
// ALPHA INTERPRETATION ZONES
// ============================================

/**
 * Non-localized zone data (styling and thresholds only)
 */
export interface AlphaZoneData {
  key: AlphaQualityKey;
  min: number;
  max: number;
  rangeLabel: string;
  color: string;
  bgColor: string;
}

/**
 * Localized zone with description
 */
export interface LocalizedAlphaZone extends AlphaZoneData {
  description: string;
}

/**
 * Legacy interface for backward compatibility
 * @deprecated Use LocalizedAlphaZone instead
 */
export interface AlphaZone {
  min: number;
  max: number;
  label: string;
  color: string;
  bgColor: string;
  description: string;
}

/**
 * Non-localized alpha interpretation zone data
 * Contains thresholds and styling, no text descriptions
 */
export const ALPHA_ZONE_DATA: AlphaZoneData[] = [
  {
    key: 'unacceptable',
    min: 0,
    max: 0.5,
    rangeLabel: '<0.5',
    color: 'bg-red-500',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
  {
    key: 'poor',
    min: 0.5,
    max: 0.6,
    rangeLabel: '0.5-0.6',
    color: 'bg-orange-500',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  {
    key: 'acceptable',
    min: 0.6,
    max: 0.7,
    rangeLabel: '0.6-0.7',
    color: 'bg-amber-500',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  {
    key: 'good',
    min: 0.7,
    max: 0.8,
    rangeLabel: '0.7-0.8',
    color: 'bg-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  {
    key: 'excellent',
    min: 0.8,
    max: 0.9,
    rangeLabel: '0.8-0.9',
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  {
    key: 'exceptional',
    min: 0.9,
    max: 1.0,
    rangeLabel: '>0.9',
    color: 'bg-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
];

/**
 * Get localized alpha interpretation zones
 * Uses translation function to resolve descriptions
 *
 * Translation keys use: psychometrics.competencyDetail.quality.{key}.label
 *
 * @param t - Translation function from i18n library
 * @returns Array of localized alpha zones
 */
export function getLocalizedAlphaZones(t: TranslationFunction): LocalizedAlphaZone[] {
  return ALPHA_ZONE_DATA.map((zone) => ({
    ...zone,
    description: t(`psychometrics.competencyDetail.quality.${zone.key}.label`),
  }));
}

/**
 * Standard Cronbach's Alpha interpretation zones
 * Used for scale visualization
 *
 * @deprecated Use ALPHA_ZONE_DATA with getLocalizedAlphaZones instead.
 * This constant is kept for backward compatibility but contains hardcoded Russian strings.
 */
export const ALPHA_INTERPRETATION_ZONES: AlphaZone[] = [
  {
    min: 0,
    max: 0.5,
    label: '<0.5',
    color: 'bg-red-500',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    description: 'Неприемлемо',
  },
  {
    min: 0.5,
    max: 0.6,
    label: '0.5-0.6',
    color: 'bg-orange-500',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    description: 'Низко',
  },
  {
    min: 0.6,
    max: 0.7,
    label: '0.6-0.7',
    color: 'bg-amber-500',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    description: 'Приемлемо',
  },
  {
    min: 0.7,
    max: 0.8,
    label: '0.7-0.8',
    color: 'bg-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    description: 'Хорошо',
  },
  {
    min: 0.8,
    max: 0.9,
    label: '0.8-0.9',
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    description: 'Отлично',
  },
  {
    min: 0.9,
    max: 1.0,
    label: '>0.9',
    color: 'bg-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    description: 'Превосходно',
  },
];

/**
 * Find the active zone data for a given alpha value (non-localized)
 */
export function getActiveAlphaZoneData(alpha: number | null): AlphaZoneData | null {
  if (alpha === null) return null;

  const zone = ALPHA_ZONE_DATA.find(
    (z) => alpha >= z.min && alpha < z.max
  );

  // Handle edge case where alpha === 1.0
  if (!zone && alpha >= 0.9 && alpha <= 1.0) {
    return ALPHA_ZONE_DATA[ALPHA_ZONE_DATA.length - 1];
  }

  return zone || null;
}

/**
 * Find the active zone for a given alpha value
 *
 * @deprecated Use getActiveAlphaZoneData with getLocalizedAlphaZones instead.
 */
export function getActiveAlphaZone(alpha: number | null): AlphaZone | null {
  if (alpha === null) return null;

  const zone = ALPHA_INTERPRETATION_ZONES.find(
    (z) => alpha >= z.min && alpha < z.max
  );

  // Handle edge case where alpha === 1.0
  if (!zone && alpha >= 0.9 && alpha <= 1.0) {
    return ALPHA_INTERPRETATION_ZONES[ALPHA_INTERPRETATION_ZONES.length - 1];
  }

  return zone || null;
}

// ============================================
// DATA QUALITY CHECKS
// ============================================

export interface DataQualityIssue {
  type: 'sample_size' | 'item_count' | 'alpha_missing';
  severity: 'warning' | 'error';
  message: string;
  recommendation: string;
}

/**
 * Check for data quality issues that should be displayed to users
 */
export function checkDataQuality(
  sampleSize: number | null,
  itemCount: number | null,
  cronbachAlpha: number | null
): DataQualityIssue[] {
  const issues: DataQualityIssue[] = [];

  // Sample size checks
  if (sampleSize === null || sampleSize < 30) {
    issues.push({
      type: 'sample_size',
      severity: 'warning',
      message: sampleSize === null
        ? 'Размер выборки неизвестен'
        : `Размер выборки (${sampleSize}) меньше рекомендуемого минимума`,
      recommendation: 'Рекомендуется минимум 100 респондентов для надежного расчета',
    });
  }

  // Item count checks
  if (itemCount === null || itemCount < 3) {
    issues.push({
      type: 'item_count',
      severity: 'error',
      message: itemCount === null
        ? 'Количество элементов неизвестно'
        : `Количество элементов (${itemCount}) недостаточно для шкалы`,
      recommendation: 'Рекомендуется минимум 3 элемента для расчета Alpha',
    });
  }

  // Alpha missing
  if (cronbachAlpha === null) {
    issues.push({
      type: 'alpha_missing',
      severity: 'error',
      message: 'Cronbach\'s Alpha не рассчитан',
      recommendation: 'Соберите больше ответов и запустите аудит для расчета',
    });
  }

  return issues;
}

// ============================================
// SORT HELPERS FOR ITEMS
// ============================================

/**
 * Sort alpha-if-deleted entries by improvement (descending)
 * Items with highest improvement should appear first
 */
export function sortAlphaIfDeleted(
  entries: Record<string, AlphaIfDeletedEntry> | null
): Array<[string, AlphaIfDeletedEntry]> {
  if (!entries) return [];

  return Object.entries(entries).sort(([, a], [, b]) => b.improvement - a.improvement);
}

/**
 * Filter items that would significantly improve alpha if removed
 * Threshold: improvement > 0.01
 */
export function getProblematicItems(
  sortedEntries: Array<[string, AlphaIfDeletedEntry]>
): Array<[string, AlphaIfDeletedEntry]> {
  return sortedEntries.filter(([, entry]) => entry.improvement > 0.01);
}

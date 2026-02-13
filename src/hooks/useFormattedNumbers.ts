/**
 * Locale-aware Number Formatting Hook
 *
 * Provides consistent number formatting across the application with full i18n support.
 * Uses next-intl's useFormatter for locale-aware formatting.
 *
 * Supports both English and Russian locales with proper decimal separators and grouping.
 *
 * @example
 * const { formatNumber, formatPercent, formatDecimal, formatCompact } = useFormattedNumbers();
 *
 * // Integer - "1,234" or "1 234"
 * formatNumber(1234)
 *
 * // Percentage - "75%" or "75 %"
 * formatPercent(0.75)
 *
 * // Decimal with precision - "0.25" or "0,25"
 * formatDecimal(0.254, 2)
 *
 * // Compact notation - "1.2K" or "1,2 тыс."
 * formatCompact(1234)
 */

import { useFormatter, useLocale } from 'next-intl';

type NumberInput = number | null | undefined;

interface FormattedNumbersReturn {
  /** Format as integer with grouping (e.g., "1,234" / "1 234") */
  formatNumber: (value: NumberInput) => string;

  /** Format as percentage (e.g., "75%" / "75 %") */
  formatPercent: (value: NumberInput, decimals?: number) => string;

  /** Format as decimal with specified precision (e.g., "0.25" / "0,25") */
  formatDecimal: (value: NumberInput, decimals?: number) => string;

  /** Format in compact notation (e.g., "1.2K" / "1,2 тыс.") */
  formatCompact: (value: NumberInput) => string;

  /** Format as ordinal if supported (e.g., "1st" / "1-й") */
  formatOrdinal: (value: NumberInput) => string;

  /** Format range (e.g., "0.2-0.8" / "0,2–0,8") */
  formatRange: (min: NumberInput, max: NumberInput, decimals?: number) => string;

  /** Current locale */
  locale: string;

  /** Check if current locale uses comma as decimal separator */
  usesCommaDecimal: boolean;
}

/**
 * Hook for locale-aware number formatting
 *
 * Uses next-intl's useFormatter for proper localization of numbers,
 * percentages, and compact notations.
 */
export function useFormattedNumbers(): FormattedNumbersReturn {
  const format = useFormatter();
  const locale = useLocale();

  // Russian and many European locales use comma as decimal separator
  const usesCommaDecimal = ['ru', 'de', 'fr', 'es', 'it', 'pt', 'pl', 'uk'].includes(locale);

  /**
   * Format as integer with grouping separators
   * English: "1,234"
   * Russian: "1 234"
   */
  const formatNumber = (value: NumberInput): string => {
    if (value == null || isNaN(value)) return '—';

    return format.number(value, {
      maximumFractionDigits: 0,
    });
  };

  /**
   * Format as percentage
   * English: "75%"
   * Russian: "75 %"
   *
   * @param value - Value between 0 and 1 (0.75 = 75%)
   * @param decimals - Number of decimal places (default: 0)
   */
  const formatPercent = (value: NumberInput, decimals: number = 0): string => {
    if (value == null || isNaN(value)) return '—';

    return format.number(value, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  /**
   * Format as decimal with specified precision
   * English: "0.25"
   * Russian: "0,25"
   *
   * @param value - Numeric value
   * @param decimals - Number of decimal places (default: 2)
   */
  const formatDecimal = (value: NumberInput, decimals: number = 2): string => {
    if (value == null || isNaN(value)) return '—';

    return format.number(value, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  /**
   * Format in compact notation
   * English: "1.2K", "1.5M"
   * Russian: "1,2 тыс.", "1,5 млн"
   */
  const formatCompact = (value: NumberInput): string => {
    if (value == null || isNaN(value)) return '—';

    return format.number(value, {
      notation: 'compact',
      maximumFractionDigits: 1,
    });
  };

  /**
   * Format as ordinal (where supported)
   * English: "1st", "2nd", "3rd"
   * Russian: "1-й", "2-й", "3-й"
   *
   * Note: Falls back to simple number + suffix for locales without full ordinal support
   */
  const formatOrdinal = (value: NumberInput): string => {
    if (value == null || isNaN(value)) return '—';

    // Use Intl.PluralRules for ordinals where available
    try {
      const pr = new Intl.PluralRules(locale, { type: 'ordinal' });
      const rule = pr.select(value);

      // English ordinal suffixes
      if (locale.startsWith('en')) {
        const suffixes: Record<string, string> = {
          one: 'st',
          two: 'nd',
          few: 'rd',
          other: 'th',
        };
        return `${value}${suffixes[rule] || 'th'}`;
      }

      // Russian ordinal suffix
      if (locale.startsWith('ru')) {
        return `${value}-й`;
      }

      // Fallback: just return the number
      return String(value);
    } catch {
      return String(value);
    }
  };

  /**
   * Format a numeric range
   * English: "0.2-0.8"
   * Russian: "0,2–0,8" (uses en-dash)
   */
  const formatRange = (min: NumberInput, max: NumberInput, decimals: number = 1): string => {
    if (min == null || max == null || isNaN(min) || isNaN(max)) return '—';

    const formattedMin = format.number(min, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    const formattedMax = format.number(max, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    // Use en-dash for ranges in Russian, hyphen for English
    const separator = locale.startsWith('ru') ? '–' : '-';
    return `${formattedMin}${separator}${formattedMax}`;
  };

  return {
    formatNumber,
    formatPercent,
    formatDecimal,
    formatCompact,
    formatOrdinal,
    formatRange,
    locale,
    usesCommaDecimal,
  };
}

/**
 * Server-side number formatting utility
 *
 * For use in Server Components where hooks cannot be used.
 *
 * @example
 * // In a Server Component:
 * import { getFormatter } from 'next-intl/server';
 *
 * const format = await getFormatter();
 * const result = serverFormatDecimal(0.25, format, 2);
 */
export function serverFormatDecimal(
  value: NumberInput,
  formatter: ReturnType<typeof useFormatter>,
  decimals: number = 2
): string {
  if (value == null || isNaN(value)) return '—';

  return formatter.number(value, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function serverFormatPercent(
  value: NumberInput,
  formatter: ReturnType<typeof useFormatter>,
  decimals: number = 0
): string {
  if (value == null || isNaN(value)) return '—';

  return formatter.number(value, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default useFormattedNumbers;

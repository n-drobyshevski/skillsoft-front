/**
 * Locale-aware Date Formatting Hook
 *
 * Provides consistent date/time formatting across the application with full i18n support.
 * Uses next-intl's useFormatter for locale-aware formatting and translation keys for
 * relative time labels.
 *
 * Supports both English and Russian locales with proper pluralization rules.
 *
 * @example
 * const { formatDate, formatDateTime, formatRelativeTime, formatShortDate } = useFormattedDates();
 *
 * // In tables - "Jan 5, 2024" or "5 янв. 2024"
 * formatDate(user.createdAt)
 *
 * // With time - "Jan 5, 2024, 3:30 PM" or "5 янв. 2024, 15:30"
 * formatDateTime(user.lastSignInAt)
 *
 * // Relative - "2 days ago" or "2 дня назад"
 * formatRelativeTime(user.lastSignInAt)
 *
 * // Short format - "01/05/24" or "05.01.24"
 * formatShortDate(user.createdAt)
 */

import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';

type DateInput = string | Date | null | undefined;

interface FormattedDatesReturn {
  /** Format as localized date (e.g., "Jan 5, 2024" / "5 янв. 2024") */
  formatDate: (date: DateInput) => string;

  /** Format with time (e.g., "Jan 5, 2024, 3:30 PM" / "5 янв. 2024, 15:30") */
  formatDateTime: (date: DateInput) => string;

  /** Relative time using translations ("2 days ago" / "2 дня назад") */
  formatRelativeTime: (date: DateInput) => string;

  /** Short format for compact displays (e.g., "01/05/24" / "05.01.24") */
  formatShortDate: (date: DateInput) => string;

  /** Full date format (e.g., "January 5, 2024" / "5 января 2024") */
  formatFullDate: (date: DateInput) => string;

  /** Time only (e.g., "3:30 PM" / "15:30") */
  formatTime: (date: DateInput) => string;

  /** Current locale */
  locale: string;
}

/**
 * Helper to safely parse date input
 */
function parseDate(date: DateInput): Date | null {
  if (!date) return null;

  try {
    const parsed = date instanceof Date ? date : new Date(date);
    // Check for invalid date
    if (isNaN(parsed.getTime())) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Hook for locale-aware date/time formatting
 *
 * Uses next-intl's useFormatter for proper localization and
 * the users.time.* translation keys for relative time labels.
 */
export function useFormattedDates(): FormattedDatesReturn {
  const format = useFormatter();
  const locale = useLocale();
  const t = useTranslations('users.time');

  /**
   * Format as localized medium date
   * English: "Jan 5, 2024"
   * Russian: "5 янв. 2024"
   */
  const formatDate = useCallback(
    (date: DateInput): string => {
      const parsed = parseDate(date);
      if (!parsed) return t('never');

      return format.dateTime(parsed, {
        dateStyle: 'medium',
      });
    },
    [format, t]
  );

  /**
   * Format with date and time
   * English: "Jan 5, 2024, 3:30 PM"
   * Russian: "5 янв. 2024, 15:30"
   */
  const formatDateTime = useCallback(
    (date: DateInput): string => {
      const parsed = parseDate(date);
      if (!parsed) return t('never');

      return format.dateTime(parsed, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    },
    [format, t]
  );

  /**
   * Format as relative time using translation keys
   * English: "2 days ago", "Yesterday", "Just now"
   * Russian: "2 дня назад", "Вчера", "Только что"
   *
   * Uses ICU MessageFormat for proper Russian pluralization
   */
  const formatRelativeTime = useCallback(
    (date: DateInput): string => {
      const parsed = parseDate(date);
      if (!parsed) return t('never');

      const now = new Date();
      const diffMs = now.getTime() - parsed.getTime();

      // Handle future dates
      if (diffMs < 0) return t('justNow');

      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      const diffWeeks = Math.floor(diffDays / 7);
      const diffMonths = Math.floor(diffDays / 30);
      const diffYears = Math.floor(diffDays / 365);

      // Just now (less than 1 minute)
      if (diffMinutes < 1) {
        return t('justNow');
      }

      // Today (same calendar day)
      if (diffDays === 0) {
        return t('today');
      }

      // Yesterday
      if (diffDays === 1) {
        return t('yesterday');
      }

      // Days ago (2-6 days)
      if (diffDays < 7) {
        return t('daysAgo', { count: diffDays });
      }

      // Weeks ago (1-4 weeks)
      if (diffDays < 30) {
        return t('weeksAgo', { count: diffWeeks });
      }

      // Months ago (1-11 months)
      if (diffDays < 365) {
        return t('monthsAgo', { count: diffMonths });
      }

      // Years ago
      return t('yearsAgo', { count: diffYears });
    },
    [t]
  );

  /**
   * Format as short date for compact displays
   * English: "1/5/24"
   * Russian: "05.01.24"
   */
  const formatShortDate = useCallback(
    (date: DateInput): string => {
      const parsed = parseDate(date);
      if (!parsed) return t('never');

      return format.dateTime(parsed, {
        dateStyle: 'short',
      });
    },
    [format, t]
  );

  /**
   * Format as full date
   * English: "January 5, 2024"
   * Russian: "5 января 2024 г."
   */
  const formatFullDate = useCallback(
    (date: DateInput): string => {
      const parsed = parseDate(date);
      if (!parsed) return t('never');

      return format.dateTime(parsed, {
        dateStyle: 'long',
      });
    },
    [format, t]
  );

  /**
   * Format time only
   * English: "3:30 PM"
   * Russian: "15:30"
   */
  const formatTime = useCallback(
    (date: DateInput): string => {
      const parsed = parseDate(date);
      if (!parsed) return t('never');

      return format.dateTime(parsed, {
        timeStyle: 'short',
      });
    },
    [format, t]
  );

  return useMemo(
    () => ({
      formatDate,
      formatDateTime,
      formatRelativeTime,
      formatShortDate,
      formatFullDate,
      formatTime,
      locale,
    }),
    [formatDate, formatDateTime, formatRelativeTime, formatShortDate, formatFullDate, formatTime, locale]
  );
}

/**
 * Server-side date formatting utility
 *
 * For use in Server Components where hooks cannot be used.
 * Requires passing the formatter and translations from server context.
 *
 * @example
 * // In a Server Component:
 * import { getFormatter, getTranslations } from 'next-intl/server';
 *
 * const format = await getFormatter();
 * const t = await getTranslations('users.time');
 * const result = serverFormatDate(date, format, t('never'));
 */
export function serverFormatDate(
  date: DateInput,
  formatter: ReturnType<typeof useFormatter>,
  neverLabel: string
): string {
  const parsed = parseDate(date);
  if (!parsed) return neverLabel;

  return formatter.dateTime(parsed, {
    dateStyle: 'medium',
  });
}

export function serverFormatDateTime(
  date: DateInput,
  formatter: ReturnType<typeof useFormatter>,
  neverLabel: string
): string {
  const parsed = parseDate(date);
  if (!parsed) return neverLabel;

  return formatter.dateTime(parsed, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default useFormattedDates;

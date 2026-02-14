/**
 * Server-safe date utilities using native Intl API.
 * Replaces date-fns for bundle size optimization (~5-7KB gzipped savings).
 *
 * For client components, prefer the `useFormattedDates` hook instead,
 * which provides i18n-aware formatting via next-intl.
 */

/**
 * Add days to a date. Replaces date-fns addDays.
 */
export function addDays(date: Date | string | number, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Format date as short month + day, e.g. "5 Jan" or "12 мар."
 * Replaces date-fns format(date, 'd MMM')
 */
export function formatShortMonthDay(date: Date | string | number, locale: string = 'en'): string {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(new Date(date));
}

/**
 * Format a relative time string like "2 days ago" or "in 3 hours".
 * Replaces date-fns formatDistanceToNow for server components.
 *
 * For client components, prefer `useFormattedDates().formatRelativeTime` instead.
 */
export function formatRelativeTime(date: Date | string | number, locale: string = 'en'): string {
  const now = Date.now();
  const target = new Date(date).getTime();
  const diffMs = target - now;
  const absDiffMs = Math.abs(diffMs);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  const seconds = Math.floor(absDiffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  const sign = diffMs < 0 ? -1 : 1;

  if (seconds < 60) return rtf.format(sign * seconds, 'second');
  if (minutes < 60) return rtf.format(sign * minutes, 'minute');
  if (hours < 24) return rtf.format(sign * hours, 'hour');
  if (days < 30) return rtf.format(sign * days, 'day');
  if (months < 12) return rtf.format(sign * months, 'month');
  return rtf.format(sign * years, 'year');
}

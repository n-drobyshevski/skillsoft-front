/**
 * Shared date/duration formatting utilities for activity pages.
 *
 * Used by both /my-tests (client) and /test-templates/history (server).
 * Locale-aware: supports "en" and "ru" via Intl.DateTimeFormat.
 */

/**
 * Format a date string for activity display (e.g. "15 Feb" or "15 Feb 2025").
 * Omits year if the date is in the current year.
 */
export function formatActivityDate(dateString: string | undefined, locale: string): string {
  if (!dateString) return '\u2014'; // em-dash
  const date = new Date(dateString);
  const localeCode = locale === 'ru' ? 'ru-RU' : 'en-US';
  return date.toLocaleDateString(localeCode, {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Format seconds into a human-readable duration (e.g. "1h 23m" / "1ч 23м").
 * Shows both hours and minutes when applicable.
 */
export function formatDuration(seconds: number, locale: string): string {
  if (!seconds || !Number.isFinite(seconds)) return locale === 'ru' ? '0м' : '0m';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (locale === 'ru') {
    if (hours > 0) return `${hours}ч ${mins}м`;
    return `${mins}м`;
  }
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

/**
 * Format total time in a compact form (e.g. "2h" / "2ч").
 * Only shows the largest unit for brevity in stat cards.
 */
export function formatTotalTime(seconds: number, locale: string): string {
  if (!seconds || !Number.isFinite(seconds)) return locale === 'ru' ? '0м' : '0m';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (locale === 'ru') {
    if (hours > 0) return `${hours}ч`;
    return `${mins}м`;
  }
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}

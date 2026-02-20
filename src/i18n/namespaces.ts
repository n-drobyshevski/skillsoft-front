/**
 * i18n Namespace Definitions for Bundle Optimization
 *
 * Defines which translation namespaces are loaded at each layout boundary.
 * Used with NextIntlClientProvider to reduce per-page i18n payload.
 *
 * Architecture:
 * - Root layout passes SHARED namespaces (used by global components like sidebar, header, etc.)
 * - Section layouts pass SHARED + section-specific namespaces
 * - Since nested NextIntlClientProvider treats `messages` as atomic (not merged),
 *   section layouts must include shared namespaces explicitly.
 *
 * @see https://next-intl.dev/docs/usage/configuration#nextintlclientprovider
 */

/**
 * Shared namespaces used by global client components.
 * These are loaded in the root layout and available on every page.
 *
 * Includes: sidebar (navigation, auth), lens switcher (lens),
 * language switcher (language), common UI (common, status, confirm, empty, time),
 * error handling (errors, feedback, validation, validationGuidance),
 * table/filter/sort (shared data display), and enum labels (enums).
 */
export const SHARED_NAMESPACES = [
  'common',
  'navigation',
  'auth',
  'errors',
  'status',
  'feedback',
  'validation',
  'validationGuidance',
  'language',
  'lens',
  'confirm',
  'empty',
  'time',
  'enums',
  'table',
  'filter',
  'sort',
  'accessibility',
] as const;

/**
 * Psychometrics section namespaces.
 * Used by: app/(workspace)/psychometrics/**
 */
export const PSYCHOMETRICS_NAMESPACES = [
  ...SHARED_NAMESPACES,
  'psychometrics',
] as const;

/**
 * Test templates section namespaces.
 * Used by: app/(workspace)/test-templates/**
 */
export const TEST_TEMPLATES_NAMESPACES = [
  ...SHARED_NAMESPACES,
  'template',
  'assessment',
  'likert',
  'frequency',
  'forms',
  'question',
  'competency',
  'indicator',
  'candidate',
  'results',
  'activity',
  'help',
  'shared',
  'myTests',
  'builder',
] as const;

/**
 * Profile section namespaces.
 * Used by: app/(workspace)/profile/**
 */
export const PROFILE_NAMESPACES = [
  ...SHARED_NAMESPACES,
  'profile',
  'users',
  'settings',
] as const;

/**
 * Dashboard section namespaces.
 * Used by: app/(workspace)/dashboard/**
 */
export const DASHBOARD_NAMESPACES = [
  ...SHARED_NAMESPACES,
  'dashboard',
  'activity',
  'competency',
  'indicator',
] as const;

/**
 * HR section namespaces.
 * Used by: app/(workspace)/hr/**
 */
export const HR_NAMESPACES = [
  ...SHARED_NAMESPACES,
  'competency',
  'forms',
  'indicator',
  'question',
] as const;

/**
 * Admin section namespaces.
 * Used by: app/(workspace)/admin/**
 */
export const ADMIN_NAMESPACES = [
  ...SHARED_NAMESPACES,
  'users',
  'teams',
] as const;

/**
 * Settings section namespaces.
 * Used by: app/(workspace)/settings/**
 */
export const SETTINGS_NAMESPACES = [
  ...SHARED_NAMESPACES,
  'settings',
] as const;

/**
 * My Tests section namespaces.
 * Used by: app/(workspace)/my-tests/**
 */
export const MY_TESTS_NAMESPACES = [
  ...SHARED_NAMESPACES,
  'myTests',
] as const;

/**
 * Test Results section namespaces.
 * Used by: app/(workspace)/test-results/**
 */
export const TEST_RESULTS_NAMESPACES = [
  ...SHARED_NAMESPACES,
  'results',
] as const;

/**
 * Shared Templates section namespaces.
 * Used by: app/(workspace)/shared/**
 */
export const SHARED_TEMPLATES_NAMESPACES = [
  ...SHARED_NAMESPACES,
  'shared',
] as const;

/**
 * Anonymous test (public) section namespaces.
 * Used by: app/(public)/take/**
 */
export const PUBLIC_TEST_NAMESPACES = [
  ...SHARED_NAMESPACES,
  'anonymousTest',
  'assessment',
  'likert',
  'frequency',
] as const;

/**
 * Landing page namespaces.
 * Used by: app/(public)/landing or root public pages
 */
export const LANDING_NAMESPACES = [
  ...SHARED_NAMESPACES,
  'landing',
  'anonymousTest',
] as const;

/**
 * Pick specific namespace keys from a messages object.
 * Inline replacement for lodash/pick to avoid adding a dependency.
 *
 * @param messages - Full messages object from getMessages()
 * @param keys - Namespace keys to include
 * @returns Filtered messages containing only the specified namespaces
 */
export function pickMessages(
  messages: Record<string, unknown>,
  keys: readonly string[],
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    if (key in messages) {
      result[key] = messages[key];
    }
  }
  return result;
}

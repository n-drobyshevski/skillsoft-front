/**
 * i18n Configuration
 *
 * Defines supported locales and default language settings for SkillSoft.
 * Russian is the default language to match existing UI state.
 */

export const locales = ['en', 'ru'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ru';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
};

export const localeFlags: Record<Locale, string> = {
  en: 'US',
  ru: 'RU',
};

/**
 * Check if a string is a valid locale
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

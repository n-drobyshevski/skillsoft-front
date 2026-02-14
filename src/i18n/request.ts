/**
 * Server-side i18n Request Configuration
 *
 * Detects locale from cookies with fallback to Accept-Language header.
 * This file is referenced by the next-intl plugin in next.config.ts.
 *
 * Messages are loaded from per-namespace split files (messages/{locale}/*.json)
 * via the aggregator index modules. This enables per-namespace code splitting
 * when used with NextIntlClientProvider at layout boundaries.
 */

import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { type Locale, locales, defaultLocale, isValidLocale } from './config';

// Type for internationalization messages
type IntlMessages = Record<string, unknown>;

/**
 * Static locale module map using per-namespace aggregator index files.
 * Each index.ts imports all namespace JSONs and re-exports them merged.
 * This satisfies the no-unsanitized/method ESLint rule by using a whitelist pattern.
 */
const localeModules: Record<Locale, () => Promise<{ default: IntlMessages }>> = {
  en: () => import('../../messages/en/index'),
  ru: () => import('../../messages/ru/index'),
};

/**
 * Safely load messages for a given locale with fallback to default.
 */
async function loadMessages(locale: Locale): Promise<IntlMessages> {
  const loader = localeModules[locale] ?? localeModules[defaultLocale];
  const module = await loader();
  return module.default;
}

export default getRequestConfig(async () => {
  // Priority: 1. Cookie, 2. Accept-Language header, 3. Default (Russian)
  const cookieStore = await cookies();
  const headerStore = await headers();

  let locale: Locale = defaultLocale;

  // 1. Check cookie preference (set by language switcher)
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    locale = cookieLocale;
  } else {
    // 2. Check Accept-Language header
    const acceptLanguage = headerStore.get('accept-language');
    if (acceptLanguage) {
      const preferredLocale = acceptLanguage
        .split(',')
        .map(lang => lang.split(';')[0].trim().substring(0, 2).toLowerCase())
        .find(lang => locales.includes(lang as Locale));

      if (preferredLocale && isValidLocale(preferredLocale)) {
        locale = preferredLocale;
      }
    }
  }

  return {
    locale,
    messages: await loadMessages(locale),
    // Default timezone for Russian users
    timeZone: 'Europe/Moscow',
    now: new Date(),
  };
});

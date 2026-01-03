/**
 * Language Store
 *
 * Zustand store for managing language preference with cookie synchronization.
 * Uses skipHydration for SSR safety to prevent hydration mismatches.
 */

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useEffect } from 'react';
import { type Locale, locales, defaultLocale, isValidLocale } from '@/i18n/config';

interface LanguageState {
  locale: Locale;
  isHydrated: boolean;

  // Actions
  setLocale: (locale: Locale) => void;
  setHydrated: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      locale: defaultLocale,
      isHydrated: false,

      setLocale: (locale: Locale) => {
        if (isValidLocale(locale)) {
          // Set cookie for server-side detection (1 year expiry)
          if (typeof document !== 'undefined') {
            document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
          }
          set({ locale });
        }
      },

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'skillsoft-language',
      storage: createJSONStorage(() => {
        // Return a no-op storage for SSR
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({ locale: state.locale }),
      skipHydration: true, // Manual hydration for SSR safety
    }
  )
);

/**
 * Hook to hydrate the language store on client-side.
 * Call this once in a root client component.
 */
export function useLanguageHydration() {
  const setHydrated = useLanguageStore((state) => state.setHydrated);
  const isHydrated = useLanguageStore((state) => state.isHydrated);

  useEffect(() => {
    // Rehydrate from localStorage
    useLanguageStore.persist.rehydrate();
    setHydrated();
  }, [setHydrated]);

  return isHydrated;
}

/**
 * Hook to get the current locale.
 * Returns the locale from the store or falls back to default.
 */
export function useCurrentLocale(): Locale {
  const locale = useLanguageStore((state) => state.locale);
  return locale;
}

/**
 * Hook to change the language.
 * Returns a function that updates the locale and triggers a page refresh.
 */
export function useChangeLanguage() {
  const setLocale = useLanguageStore((state) => state.setLocale);
  return setLocale;
}

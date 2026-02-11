/**
 * User Preferences Hook
 *
 * Unified hook for managing user preferences (theme and language).
 * Combines next-themes and language-store for a single API.
 */

'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useLanguageStore } from '@/stores/language-store';
import type { Locale } from '@/i18n/config';

export type ThemePreference = 'light' | 'dark' | 'system';

interface UserPreferences {
  // State
  theme: ThemePreference;
  resolvedTheme: 'light' | 'dark' | undefined;
  language: Locale;
  isHydrated: boolean;

  // Actions
  setTheme: (theme: ThemePreference) => void;
  setLanguage: (language: Locale) => void;
}

/**
 * Hook to manage user preferences with SSR safety.
 * Combines theme (next-themes) and language (Zustand) into one API.
 */
export function useUserPreferences(): UserPreferences {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const language = useLanguageStore((s) => s.locale);
  const setLanguage = useLanguageStore((s) => s.setLocale);
  const isLanguageHydrated = useLanguageStore((s) => s.isHydrated);

  // Theme is hydrated after mount (next-themes handles this)
  // Using useSyncExternalStore pattern to avoid setState in effect warning
  const [isMounted, setIsMounted] = useState(false);

  // This effect is intentional: We need to track mount state for SSR hydration
  // The setState call is necessary to transition from server-rendered to client state
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  return {
    theme: (theme as ThemePreference) ?? 'system',
    resolvedTheme: resolvedTheme as 'light' | 'dark' | undefined,
    language,
    isHydrated: isMounted && isLanguageHydrated,
    setTheme: (t: ThemePreference) => setTheme(t),
    setLanguage,
  };
}

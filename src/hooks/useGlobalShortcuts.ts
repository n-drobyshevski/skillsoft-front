/**
 * Global Keyboard Shortcuts Hook
 *
 * Registers application-wide keyboard shortcuts:
 * - Shift+D: Toggle theme (light/dark)
 * - Shift+L: Toggle language (en/ru)
 *
 * Must be mounted in a client component that persists across navigation
 * (e.g., SiteHeader). Skips events when focus is inside form elements.
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useLanguageStore } from '@/store/language-store';
import { toast } from 'sonner';
import type { Locale } from '@/i18n/config';

function isFormElement(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

export function useGlobalShortcuts() {
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const currentLocale = useLocale() as Locale;
  const setLocale = useLanguageStore((state) => state.setLocale);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
      if (isFormElement(e.target)) return;

      switch (e.key) {
        case 'D': {
          e.preventDefault();
          const next = resolvedTheme === 'dark' ? 'light' : 'dark';
          setTheme(next);
          toast.success(next === 'dark' ? 'Dark mode' : 'Light mode', {
            duration: 1500,
          });
          break;
        }
        case 'L': {
          e.preventDefault();
          const next: Locale = currentLocale === 'en' ? 'ru' : 'en';
          setLocale(next);
          router.refresh();
          toast.success(next === 'en' ? 'English' : 'Русский', {
            duration: 1500,
          });
          break;
        }
      }
    },
    [resolvedTheme, setTheme, currentLocale, setLocale, router],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

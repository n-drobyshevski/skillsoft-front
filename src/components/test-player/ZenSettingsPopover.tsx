'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Settings, Globe, Sun, Moon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { type Locale, locales } from '@/i18n/config';
import { useLanguageStore } from '@/store/language-store';
import { useZenTheme, useToggleZenTheme } from '@/store/zen-theme-store';
import { usePlayerPersistStore } from '@/store/player-persist-store';
import { cn } from '@/lib/utils';

interface ZenSettingsPopoverProps {
  questionIndex: number;
  currentAnswer: string | number | string[] | null | undefined;
}

export function ZenSettingsPopover({ questionIndex, currentAnswer }: ZenSettingsPopoverProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentLocale = useLocale() as Locale;
  const setLocale = useLanguageStore((s) => s.setLocale);
  const saveBeforeRefresh = usePlayerPersistStore((s) => s.saveBeforeRefresh);

  const zenTheme = useZenTheme();
  const toggleZenTheme = useToggleZenTheme();
  const t = useTranslations('assessment');

  const [open, setOpen] = useState(false);
  const zenClass = zenTheme === 'light' ? 'zen-light' : 'zen-dark';

  const handleLocaleChange = useCallback(
    (newLocale: Locale) => {
      if (newLocale === currentLocale || isPending) return;
      saveBeforeRefresh(questionIndex, currentAnswer ?? null);
      setLocale(newLocale);
      startTransition(() => {
        router.refresh();
      });
      setOpen(false);
    },
    [currentLocale, isPending, questionIndex, currentAnswer, saveBeforeRefresh, setLocale, router]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-8 w-8 text-[var(--zen-text-secondary)] hover:text-[var(--zen-text)] hover:bg-[var(--zen-ghost-hover)] transition-colors"
          aria-label={t('settings.title')}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Settings className="h-4 w-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className={cn(
          zenClass,
          'w-56 p-3 border-[var(--zen-border)] text-[var(--zen-text)] backdrop-blur-xl',
          zenTheme === 'light'
            ? 'bg-white/95 shadow-xl shadow-black/8'
            : 'bg-[var(--zen-card)] shadow-lg'
        )}
      >
        <div className="space-y-3">
          {/* Language Row */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--zen-text-muted)] uppercase tracking-wider">
              <Globe className="h-3.5 w-3.5" />
              {t('settings.language')}
            </div>
            <div className="flex rounded-md border border-[var(--zen-border)] overflow-hidden">
              {locales.map((locale) => (
                <button
                  key={locale}
                  type="button"
                  onClick={() => handleLocaleChange(locale)}
                  disabled={isPending}
                  className={cn(
                    'flex-1 py-1.5 text-sm font-medium transition-colors',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset',
                    locale === currentLocale
                      ? 'bg-[var(--zen-track)] text-[var(--zen-text)]'
                      : 'text-[var(--zen-text-secondary)] hover:text-[var(--zen-text)] hover:bg-[var(--zen-ghost-hover)]'
                  )}
                >
                  {locale.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[var(--zen-border)]" />

          {/* Theme Row */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--zen-text-muted)] uppercase tracking-wider">
              {zenTheme === 'dark' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              {t('settings.theme')}
            </div>
            <div className="flex rounded-md border border-[var(--zen-border)] overflow-hidden">
              <button
                type="button"
                onClick={() => zenTheme !== 'dark' && toggleZenTheme()}
                className={cn(
                  'flex-1 py-1.5 text-sm font-medium transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset',
                  zenTheme === 'dark'
                    ? 'bg-[var(--zen-track)] text-[var(--zen-text)]'
                    : 'text-[var(--zen-text-secondary)] hover:text-[var(--zen-text)] hover:bg-[var(--zen-ghost-hover)]'
                )}
              >
                {t('settings.dark')}
              </button>
              <button
                type="button"
                onClick={() => zenTheme !== 'light' && toggleZenTheme()}
                className={cn(
                  'flex-1 py-1.5 text-sm font-medium transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset',
                  zenTheme === 'light'
                    ? 'bg-[var(--zen-track)] text-[var(--zen-text)]'
                    : 'text-[var(--zen-text-secondary)] hover:text-[var(--zen-text)] hover:bg-[var(--zen-ghost-hover)]'
                )}
              >
                {t('settings.light')}
              </button>
            </div>
          </div>

          {/* Keyboard shortcut hint */}
          <p className="text-[10px] text-[var(--zen-text-muted)] text-center">
            {t('settings.shortcutHint')}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

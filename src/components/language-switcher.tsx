/**
 * Language Switcher Component
 *
 * Dropdown component for switching between English and Russian.
 * Uses Zustand for state persistence and router.refresh() for server component re-render.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check, Loader2 } from 'lucide-react';
import { type Locale, locales, localeNames } from '@/i18n/config';
import { useLanguageStore } from '@/stores/language-store';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  /** Additional CSS classes */
  className?: string;
  /** Show full language name instead of code */
  showLabel?: boolean;
  /** Variant for different contexts */
  variant?: 'default' | 'ghost' | 'outline';
  /** Size of the button */
  size?: 'sm' | 'default' | 'lg';
}

export function LanguageSwitcher({
  className,
  showLabel = false,
  variant = 'ghost',
  size = 'sm',
}: LanguageSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentLocale = useLocale() as Locale;
  const setLocale = useLanguageStore((state) => state.setLocale);
  const t = useTranslations('language');

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;

    startTransition(() => {
      // Update store and cookie
      setLocale(newLocale);
      // Trigger server component re-render to load new translations
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(
            'gap-2',
            size === 'sm' && 'h-8 px-2',
            isPending && 'opacity-50 pointer-events-none',
            className
          )}
          aria-label={t('select')}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          {showLabel ? (
            <span className="text-sm">{localeNames[currentLocale]}</span>
          ) : (
            <span className="text-xs font-medium uppercase">
              {currentLocale}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={cn(
              'flex items-center justify-between gap-2 cursor-pointer',
              locale === currentLocale && 'bg-accent'
            )}
          >
            <span>{localeNames[locale]}</span>
            {locale === currentLocale && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Compact language toggle for mobile navigation
 */
export function LanguageToggle({ className }: { className?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentLocale = useLocale() as Locale;
  const setLocale = useLanguageStore((state) => state.setLocale);

  const toggleLocale = () => {
    const newLocale = currentLocale === 'en' ? 'ru' : 'en';
    startTransition(() => {
      setLocale(newLocale);
      router.refresh();
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      disabled={isPending}
      className={cn('h-8 px-2 gap-1', className)}
      aria-label="Toggle language"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Globe className="h-4 w-4" />
          <span className="text-xs font-medium uppercase">
            {currentLocale === 'en' ? 'RU' : 'EN'}
          </span>
        </>
      )}
    </Button>
  );
}

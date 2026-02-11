/**
 * Language Selector Component
 *
 * Allows users to select their preferred language.
 * Supports English and Russian with flag emoji indicators.
 */

'use client';

import { useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';

interface LanguageSelectorProps {
  value: Locale;
  onChange: (locale: Locale) => void;
  disabled?: boolean;
}

/**
 * Convert country code to flag emoji
 */
function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function LanguageSelector({ value, onChange, disabled }: LanguageSelectorProps) {
  const t = useTranslations('settings');

  const handleChange = (newValue: string) => {
    onChange(newValue as Locale);
  };

  return (
    <Select value={value} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger className="w-full sm:w-[200px]">
        <SelectValue placeholder={t('language')} />
      </SelectTrigger>
      <SelectContent>
        {locales.map((loc) => {
          // Safe access - locales is a static readonly array defined in config
          // eslint-disable-next-line security/detect-object-injection
          const name = localeNames[loc] ?? loc;
          // eslint-disable-next-line security/detect-object-injection
          const flag = localeFlags[loc] ?? 'UN';
          return (
            <SelectItem key={loc} value={loc}>
              <span className="flex items-center gap-2">
                <span className="text-lg" role="img" aria-label={name}>
                  {getFlagEmoji(flag)}
                </span>
                <span>{name}</span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

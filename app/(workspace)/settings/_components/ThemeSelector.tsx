/**
 * Theme Selector Component
 *
 * Allows users to select their preferred color theme.
 * Uses next-themes under the hood via useUserPreferences.
 */

'use client';

import { useTranslations } from 'next-intl';
import { Sun, Moon, Monitor } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { ThemePreference } from '@/hooks/useUserPreferences';

interface ThemeSelectorProps {
  value: ThemePreference;
  onChange: (theme: ThemePreference) => void;
  disabled?: boolean;
}

const themes = [
  { value: 'light' as const, icon: Sun, labelKey: 'lightMode' },
  { value: 'dark' as const, icon: Moon, labelKey: 'darkMode' },
  { value: 'system' as const, icon: Monitor, labelKey: 'system' },
];

export function ThemeSelector({ value, onChange, disabled }: ThemeSelectorProps) {
  const t = useTranslations('settings');

  return (
    <RadioGroup
      value={value}
      onValueChange={(v) => onChange(v as ThemePreference)}
      disabled={disabled}
      className="grid grid-cols-3 gap-3"
    >
      {themes.map(({ value: themeValue, icon: Icon, labelKey }) => (
        <Label
          key={themeValue}
          htmlFor={`theme-${themeValue}`}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 cursor-pointer transition-all',
            'hover:bg-accent hover:text-accent-foreground',
            value === themeValue
              ? 'border-primary bg-accent'
              : 'border-muted bg-popover',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <RadioGroupItem
            id={`theme-${themeValue}`}
            value={themeValue}
            className="sr-only"
          />
          <Icon className="h-6 w-6" />
          <span className="text-sm font-medium">{t(labelKey)}</span>
        </Label>
      ))}
    </RadioGroup>
  );
}

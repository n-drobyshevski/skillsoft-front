/**
 * Settings Page Client Component
 *
 * Main client component for the settings page.
 * Handles hydration, preference updates, and user feedback.
 */

'use client';

import { useTranslations } from 'next-intl';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useLanguageHydration } from '@/stores/language-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ThemeSelector } from './ThemeSelector';
import { LanguageSelector } from './LanguageSelector';
import { SettingsSkeleton } from './SettingsSkeleton';
import { toast } from 'sonner';
import { useCallback, useEffect, useRef } from 'react';

export function SettingsPageClient() {
  const t = useTranslations('settings');
  const tLanguage = useTranslations('language');

  // Hydrate language store on mount
  useLanguageHydration();

  const { theme, language, isHydrated, setTheme, setLanguage } = useUserPreferences();

  // Track initial values to detect changes
  const initialValuesRef = useRef({ theme, language });
  const hasShownToast = useRef(false);

  // Reset initial values after hydration
  useEffect(() => {
    if (isHydrated) {
      initialValuesRef.current = { theme, language };
    }
  }, [isHydrated, theme, language]);

  // Theme change handler with feedback
  const handleThemeChange = useCallback(
    (newTheme: typeof theme) => {
      setTheme(newTheme);
      if (!hasShownToast.current) {
        toast.success(t('saved'), {
          duration: 2000,
        });
        hasShownToast.current = true;
        setTimeout(() => {
          hasShownToast.current = false;
        }, 3000);
      }
    },
    [setTheme, t]
  );

  // Language change handler with feedback
  const handleLanguageChange = useCallback(
    (newLanguage: typeof language) => {
      setLanguage(newLanguage);
      // Show toast and hint about potential page refresh
      toast.success(t('saved'), {
        description: tLanguage('refreshHint'),
        duration: 3000,
      });
    },
    [setLanguage, t, tLanguage]
  );

  // Show skeleton until hydrated
  if (!isHydrated) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Appearance Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('appearance')}</CardTitle>
          <CardDescription>{t('appearanceDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Section */}
          <div className="space-y-3">
            <div>
              <Label className="text-base font-medium">{t('theme')}</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {t('themeDescription')}
              </p>
            </div>
            <ThemeSelector value={theme} onChange={handleThemeChange} />
          </div>

          <Separator />

          {/* Language Section */}
          <div className="space-y-3">
            <div>
              <Label className="text-base font-medium">{t('language')}</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {t('languageDescription')}
              </p>
            </div>
            <LanguageSelector value={language} onChange={handleLanguageChange} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

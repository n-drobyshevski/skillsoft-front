/**
 * Settings Page
 *
 * User preferences page for theme and language settings.
 * Server component wrapper that renders the client form.
 */

import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { SettingsPageClient } from './_components/SettingsPageClient';
import { SettingsSkeleton } from './_components/SettingsSkeleton';

export async function generateMetadata() {
  const t = await getTranslations('settings');
  return {
    title: `${t('title')} | SkillSoft`,
  };
}

export default async function SettingsPage() {
  const t = await getTranslations('settings');

  return (
    <div className="container max-w-2xl py-6 px-4 sm:px-6">
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsPageClient />
      </Suspense>
    </div>
  );
}

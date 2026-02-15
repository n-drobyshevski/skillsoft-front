import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { testTemplatesApi } from '@/services/api';
import { SettingsForm } from './_components/SettingsForm';
import { isReservedTestTemplateSegment } from '@/lib/routing-constants';
import Loading from './loading';

interface SettingsPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Generate metadata for the settings page with i18n support
 */
export async function generateMetadata({ params }: SettingsPageProps) {
  const { id } = await params;
  const t = await getTranslations('template.metadata');

  // Reject reserved route segments
  if (isReservedTestTemplateSegment(id)) {
    return {
      title: t('invalidRoute'),
      description: t('invalidRouteDescription'),
    };
  }

  const template = await testTemplatesApi.getTemplateById(id);

  return {
    title: template
      ? t('settings', { name: template.name })
      : t('testTemplate'),
    description: t('settingsDescription'),
  };
}

async function getTemplateData(id: string) {
  // Reject reserved route segments to prevent routing conflicts
  if (isReservedTestTemplateSegment(id)) {
    return { template: null, error: 'Invalid route segment' };
  }

  try {
    const template = await testTemplatesApi.getTemplateById(id);
    if (!template) {
      return { template: null, error: 'Template not found' };
    }
    return { template, error: null };
  } catch (error) {
    console.error('Failed to fetch template:', error);
    return { template: null, error: 'Failed to load template' };
  }
}

/**
 * Async data-fetching component for settings content.
 * Wrapped in Suspense to enable PPR static shell.
 */
async function SettingsData({ id }: { id: string }) {
  const { template, error } = await getTemplateData(id);

  if (!template || error) {
    notFound();
  }

  return <SettingsForm template={template} />;
}

/**
 * Settings Page
 *
 * Full template configuration management:
 * - General Information (name, description)
 * - Assessment Goal (OVERVIEW, JOB_FIT, TEAM_FIT)
 * - Test Configuration (questions per indicator, time limit, passing score)
 * - Test Behavior (shuffle, skip, navigation, results display)
 * - Publication Status (active/inactive)
 * - Danger Zone (archive, delete)
 */
export default async function SettingsPage({ params }: SettingsPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure all template settings and behavior options
        </p>
      </div>

      <Suspense fallback={<Loading />}>
        <SettingsData id={id} />
      </Suspense>
    </div>
  );
}

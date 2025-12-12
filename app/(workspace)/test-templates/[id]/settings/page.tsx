import React from 'react';
import { notFound } from 'next/navigation';
import { testTemplatesApi } from '@/services/api';
import { SettingsForm } from './_components/SettingsForm';
import { isReservedTestTemplateSegment } from '@/lib/routing-constants';

interface SettingsPageProps {
  params: Promise<{ id: string }>;
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
 * Settings Page
 * 
 * Meta-data management and danger zone actions:
 * - Edit name and description (allowed even on published templates)
 * - Archive template
 * - Delete template
 */
export default async function SettingsPage({ params }: SettingsPageProps) {
  const { id } = await params;
  const { template, error } = await getTemplateData(id);

  if (!template || error) {
    notFound();
  }

  return (
    <div className="p-4 lg:p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage template settings and configuration
        </p>
      </div>

      <SettingsForm
        templateId={id}
        name={template.name}
        description={template.description || ''}
        status={template.isActive ? 'PUBLISHED' : 'DRAFT'}
      />
    </div>
  );
}

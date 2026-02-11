import React from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { testTemplatesApi } from '@/services/api';
import { TemplateHeader, type TemplateStatus } from './_components/TemplateHeader';
import { NavTabs } from './_components/NavTabs';
import { isReservedTestTemplateSegment } from '@/lib/routing-constants';

interface TemplateLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

/**
 * Derive status from isActive field
 * isActive=true means PUBLISHED, isActive=false means DRAFT
 */
function deriveStatus(isActive: boolean): TemplateStatus {
  return isActive ? 'PUBLISHED' : 'DRAFT';
}

/**
 * Fetch template data server-side (once per layout)
 */
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
    // eslint-disable-next-line no-console
    console.error('Failed to fetch template:', error);
    return { template: null, error: 'Failed to load template' };
  }
}

/**
 * Test Template Hub Layout
 * 
 * This layout provides the tabbed application shell for individual test templates.
 * It fetches template data once and renders:
 * - Sticky header with breadcrumb, status badge, and action buttons
 * - Navigation tabs (Overview, Builder, Candidates, Settings)
 * - Tab content (children)
 * 
 * Next.js 16 Optimization: Layout preserves state and doesn't re-render on navigation.
 * Only the tab content (children) re-renders when switching tabs.
 */
export default async function TemplateLayout({
  children,
  params,
}: TemplateLayoutProps) {
  const { id } = await params;
  const { template, error } = await getTemplateData(id);

  if (!template || error) {
    notFound();
  }

  const baseUrl = `/test-templates/${id}`;
  const status = deriveStatus(template.isActive);

  return (
    <>
      {/* <TemplateHeader
        templateId={id}
        templateName={template.name}
        status={status}
      /> */}

      {/* Navigation Tabs with inline published warning */}
      <NavTabs
        baseUrl={baseUrl}
        status={status}
        templateId={id}
        templateName={template.name}
      />

      {/* Tab Content - min-h-0 allows shrinking in flex, overflow-hidden contains scroll */}
      <main className="flex-1 min-h-0 overflow-hidden">
        {children}
      </main>
    </>
  );
}

/**
 * Generate metadata for the template pages with i18n support
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations('template.metadata');

  // Reject reserved route segments
  if (isReservedTestTemplateSegment(id)) {
    return {
      title: t('invalidRoute'),
      description: t('invalidRouteDescription'),
    };
  }

  const { template } = await getTemplateData(id);

  return {
    title: template
      ? t('testTemplate').replace(' | SkillSoft', '') + ` - ${template.name}`
      : t('testTemplate'),
    description: template?.description || t('defaultDescription'),
  };
}

import React from 'react';
import { notFound } from 'next/navigation';
import { testTemplatesApi } from '@/services/api';
import { TemplateHeader, type TemplateStatus } from './_components/TemplateHeader';
import { NavTabs } from './_components/NavTabs';

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
    <div className="flex min-h-0 flex-col">
      {/* Sticky Header with Breadcrumb & Actions */}
      <TemplateHeader
        templateId={id}
        templateName={template.name}
        status={status}
      />

      {/* Navigation Tabs */}
      <NavTabs baseUrl={baseUrl} />

      {/* Tab Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

/**
 * Generate metadata for the template pages
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { template } = await getTemplateData(id);

  return {
    title: template ? `${template.name} | Test Templates` : 'Test Template',
    description: template?.description || 'Manage your test template',
  };
}

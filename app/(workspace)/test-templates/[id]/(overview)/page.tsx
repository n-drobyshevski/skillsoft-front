import React from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getOverviewDataCached } from '@/lib/cached-data';
import { isReservedTestTemplateSegment } from '@/lib/routing-constants';
import { OverviewContent } from './_components/OverviewContent';

interface OverviewPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Generate metadata for the overview page with i18n support
 */
export async function generateMetadata({ params }: OverviewPageProps) {
  const { id } = await params;

  // Reject reserved route segments
  if (isReservedTestTemplateSegment(id)) {
    const t = await getTranslations('template.metadata');
    return {
      title: t('invalidRoute'),
      description: t('invalidRouteDescription'),
    };
  }

  const t = await getTranslations('template.metadata');
  const { template } = await getOverviewDataCached(id);

  return {
    title: template
      ? t('overview', { name: template.name })
      : t('testTemplate'),
    description: template?.description || t('overviewDescription'),
  };
}

/**
 * Overview Page - Template Management Dashboard
 *
 * Redesigned Overview tab featuring:
 * - Hero section with template identity and primary actions
 * - Configuration card with test settings (read-only)
 * - Sharing summary with quick access to share modal
 * - Quick stats grid showing performance metrics
 * - Recent activity list with mobile-friendly card layout
 *
 * Mobile-first responsive design using shadcn/ui components.
 *
 * Uses cached data functions for request deduplication - competencies
 * fetched here are shared with builder layout if navigated to.
 */
export default async function OverviewPage({ params }: OverviewPageProps) {
  const { id } = await params;

  // Reject reserved route segments to prevent routing conflicts
  if (isReservedTestTemplateSegment(id)) {
    notFound();
  }

  const { template, competencies, activities, stats, error } = await getOverviewDataCached(id);

  if (!template || error) {
    notFound();
  }

  // TODO: Get actual ownership/permission data from auth context
  // For now, assume owner for demo purposes
  const isOwner = true;
  const canEdit = true;

  return (
    <OverviewContent
      template={template}
      competencies={competencies}
      activities={activities}
      stats={stats}
      isOwner={isOwner}
      canEdit={canEdit}
    />
  );
}

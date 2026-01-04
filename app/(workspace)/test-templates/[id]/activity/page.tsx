import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { testTemplatesApi, activityApi } from '@/services/api';
import { TemplateActivityStats } from '@/components/templates/TemplateActivityStats';
import { TemplateActivityTable } from '@/components/templates/TemplateActivityTable';
import { ActivityPageHeader } from '@/components/templates/activity';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface TemplateActivityPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Template Activity Page - Admin/Editor view for tracking candidate test activity.
 *
 * Features:
 * - Mobile-first responsive design
 * - Activity statistics cards with tap-to-expand on mobile
 * - QuickFilterPills for status, result, and date range filtering
 * - Paginated activity table (desktop) / card list (mobile)
 * - URL-synced filters for shareable views
 *
 * Access: Requires ADMIN or EDITOR role (enforced by backend API)
 */
export default async function TemplateActivityPage({ params }: TemplateActivityPageProps) {
  const { id: templateId } = await params;
  const t = await getTranslations('activity');

  // Fetch template and initial stats in parallel
  const [template, stats] = await Promise.all([
    testTemplatesApi.getTemplateById(templateId),
    activityApi.getTemplateActivityStats(templateId),
  ]);

  if (!template) {
    notFound();
  }

  return (
    <div className="space-y-3 md:space-y-4 lg:space-y-6">
      {/* Page Header - Compact on mobile */}
      <ActivityPageHeader templateName={template.name} />

      {/* Stats Cards - Tap to expand on mobile */}
      <TemplateActivityStats stats={stats} />

      {/* Activity Table/Cards */}
      <Suspense fallback={<ActivityTableSkeleton />}>
        <TemplateActivityTable templateId={templateId} />
      </Suspense>
    </div>
  );
}

/**
 * Loading skeleton for activity table
 */
function ActivityTableSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Metadata for the page
 */
export async function generateMetadata({ params }: TemplateActivityPageProps) {
  const { id: templateId } = await params;
  const t = await getTranslations('activity');

  const template = await testTemplatesApi.getTemplateById(templateId);

  return {
    title: template
      ? `${t('templateActivity')} - ${template.name}`
      : t('templateActivity'),
  };
}

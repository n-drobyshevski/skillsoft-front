import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { testTemplatesApi, activityApi } from '@/services/api';
import { TemplateActivityTable } from '@/components/templates/TemplateActivityTable';
import { ActivityStatsCard } from '@/components/templates/activity';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

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
    <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('stats.description')}
        </p>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Stats Card - FIRST on mobile, sidebar on desktop */}
        <ActivityStatsCard
          stats={stats}
          className="order-first lg:order-last"
        />

        {/* Main Activity List - 2 columns on desktop */}
        <Suspense fallback={<ActivityListSkeleton />}>
          <TemplateActivityTable
            templateId={templateId}
            className="lg:col-span-2"
          />
        </Suspense>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for activity list (matches new grid layout)
 */
function ActivityListSkeleton() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
        {/* Filter skeleton */}
        <div className="flex gap-2 mt-3">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-28" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Metadata for the page with i18n support
 */
export async function generateMetadata({ params }: TemplateActivityPageProps) {
  const { id: templateId } = await params;
  const t = await getTranslations('template.metadata');

  const template = await testTemplatesApi.getTemplateById(templateId);

  return {
    title: template
      ? t('activity', { name: template.name })
      : t('testTemplate'),
    description: t('activityDescription'),
  };
}

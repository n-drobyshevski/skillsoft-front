'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  GraduationCap,
  ChevronRight,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { TestTemplateSummary } from '@/types/domain';
import { useTranslations } from 'next-intl';

export interface TestTemplatesWidgetProps {
  templates?: TestTemplateSummary[];
  loading?: boolean;
  className?: string;
  maxItems?: number;
  title?: string;
}

/**
 * TestTemplatesWidget - Displays active test templates with accent-left cards.
 *
 * Features:
 * - Color-coded left border per assessment goal type
 * - Hybrid grid: 1 col mobile/tablet, 2 col on lg+
 * - Passing score visible on desktop only
 * - Dashed ghost-card empty state
 */
export function TestTemplatesWidget({
  templates = [],
  loading = false,
  className,
  maxItems = 6,
  title,
}: TestTemplatesWidgetProps) {
  const t = useTranslations('dashboard');
  const tEnums = useTranslations('enums');
  const displayTitle = title ?? t('activeAssessments');

  if (loading) {
    return (
      <TestTemplatesWidgetSkeleton
        className={className}
        count={Math.min(maxItems, 4)}
      />
    );
  }

  const activeTemplates = templates.filter((tmpl) => tmpl.isActive).slice(0, maxItems);

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-muted flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-base">{displayTitle}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {t('templatesAvailable', { count: activeTemplates.length })}
            </p>
          </div>
        </div>
        <Button asChild variant="ghost" size="sm" className="h-7 px-2 min-h-[44px] sm:min-h-0">
          <Link href="/test-templates">
            <span className="text-xs mr-1 hidden sm:inline">{t('viewAll')}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-2">
        {activeTemplates.length === 0 ? (
          <EmptyState t={t} />
        ) : (
          <div className="grid gap-2.5 sm:gap-3 grid-cols-1 lg:grid-cols-2">
            {activeTemplates.map((template) => (
              <TemplatePreviewCard key={template.id} template={template} t={t} tEnums={tEnums} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// CONSTANTS

const GOAL_ACCENT_COLORS: Record<string, { border: string; badge: string }> = {
  OVERVIEW: {
    border: 'border-l-purple-500',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  },
  JOB_FIT: {
    border: 'border-l-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  TEAM_FIT: {
    border: 'border-l-blue-600',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
};

// TEMPLATE PREVIEW CARD

function TemplatePreviewCard({
  template,
  className,
  t,
  tEnums,
}: {
  template: TestTemplateSummary;
  className?: string;
  t: ReturnType<typeof useTranslations<'dashboard'>>;
  tEnums: ReturnType<typeof useTranslations<'enums'>>;
}) {
  const goalKey = `assessmentGoal.${template.goal}` as Parameters<typeof tEnums>[0];
  const goalLabel = tEnums.has(goalKey) ? tEnums(goalKey) : template.goal;

  const colors = GOAL_ACCENT_COLORS[template.goal] || {
    border: 'border-l-muted-foreground',
    badge: 'bg-muted text-muted-foreground',
  };

  return (
    <Link href={`/test-templates/${template.id}`} className={cn('block w-full', className)}>
      <div
        className={cn(
          'w-full rounded-xl border border-border/60 bg-card',
          'border-l-[3px]',
          colors.border,
          'flex items-center gap-3 p-3 pl-3.5',
          'hover:border-border hover:shadow-sm cursor-pointer',
          'active:scale-[0.99]',
          'transition-all duration-200 motion-reduce:transition-none',
          'touch-manipulation min-h-[44px]',
        )}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{template.name}</p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <Badge
              className={cn(
                'text-[10px] px-1.5 py-0 h-[18px] shrink-0 border-0',
                colors.badge,
              )}
            >
              {goalLabel}
            </Badge>
            <span className="text-muted-foreground/40 text-xs">·</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {t('competencyCountShort', { count: template.competencyCount })}
            </span>
            {template.timeLimitMinutes > 0 && (
              <>
                <span className="text-muted-foreground/40 text-xs">·</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {t('timeLimitShort', { minutes: template.timeLimitMinutes })}
                </span>
              </>
            )}
            {template.passingScore > 0 && (
              <>
                <span className="text-muted-foreground/30 text-xs hidden sm:inline">·</span>
                <span className="text-xs text-muted-foreground/50 tabular-nums hidden sm:inline">
                  {t('passingScoreShort', { score: template.passingScore })}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
          <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
        </div>
      </div>
    </Link>
  );
}

// EMPTY STATE

function EmptyState({ t }: { t: ReturnType<typeof useTranslations<'dashboard'>> }) {
  return (
    <div className="border-2 border-dashed border-border/60 rounded-xl p-8 text-center bg-muted/20">
      <div className="flex justify-center gap-2 mb-3.5">
        <div className="w-8 h-10 rounded-md bg-muted/60 opacity-60" />
        <div className="w-8 h-10 rounded-md bg-muted/60 opacity-40" />
        <div className="w-8 h-10 rounded-md bg-muted/60 opacity-20" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        {t('noActiveAssessments')}
      </p>
      <p className="text-xs text-muted-foreground/70 mt-1 max-w-[280px] mx-auto">
        {t('createTemplateToStart')}
      </p>
      <Button asChild variant="outline" size="sm" className="mt-4 gap-1.5">
        <Link href="/test-templates/new">
          <Plus className="w-3.5 h-3.5" />
          {t('createTemplate')}
        </Link>
      </Button>
    </div>
  );
}

// SKELETON

function TestTemplatesWidgetSkeleton({
  className,
  count = 4,
}: {
  className?: string;
  count?: number;
}) {
  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg" />
          <div>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="w-8 h-7 rounded" />
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid gap-2.5 sm:gap-3 grid-cols-1 lg:grid-cols-2">
          {Array.from({ length: count }).map((_, i) => (
            <Skeleton key={i} className="h-[62px] w-full rounded-xl" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

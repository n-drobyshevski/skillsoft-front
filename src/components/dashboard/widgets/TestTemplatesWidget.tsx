'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  GraduationCap,
  ChevronRight,
  ArrowRight,
  Clock,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { TestTemplateSummary, AssessmentGoal } from '@/types/domain';
import { AssessmentGoalInfo } from '@/types/domain';
import { useTranslations } from 'next-intl';

/**
 * Props for TestTemplatesWidget
 */
export interface TestTemplatesWidgetProps {
  /** Templates data */
  templates?: TestTemplateSummary[];
  /** Loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Maximum items to display */
  maxItems?: number;
  /** Title override */
  title?: string;
  /** Whether to show as compact (for sidebar) */
  compact?: boolean;
}

/**
 * TestTemplatesWidget - Displays active test templates.
 *
 * Features:
 * - Template cards with goal badges
 * - Competency count
 * - Time limit display
 * - Click-through to template detail
 *
 * @example
 * ```tsx
 * <TestTemplatesWidget templates={activeTemplates} maxItems={6} />
 * ```
 */
export function TestTemplatesWidget({
  templates = [],
  loading = false,
  className,
  maxItems = 6,
  title,
  compact = false,
}: TestTemplatesWidgetProps) {
  const t = useTranslations('dashboard');
  const displayTitle = title ?? t('activeAssessments');

  if (loading) {
    return (
      <TestTemplatesWidgetSkeleton
        className={className}
        compact={compact}
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
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">{t('noActiveAssessments')}</p>
            <p className="text-xs mt-1">{t('createTemplateToStart')}</p>
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link href="/test-templates/new">
                {t('createTemplate')}
              </Link>
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              'grid gap-2.5 sm:gap-3',
              compact
                ? 'grid-cols-1'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            )}
          >
            {activeTemplates.map((template, index) => (
              // Hide items beyond 3 on mobile for cleaner layout
              <div key={template.id} className={index >= 3 ? 'hidden sm:block' : undefined}>
                <TemplatePreviewCard
                  template={template}
                  compact={compact}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Template preview card component - fills available width, compact on mobile
 */
function TemplatePreviewCard({
  template,
  compact,
  className,
}: {
  template: TestTemplateSummary;
  compact?: boolean;
  className?: string;
}) {
  const goalInfo = AssessmentGoalInfo[template.goal as AssessmentGoal] || {
    displayName: template.goal,
    description: 'Assessment',
  };

  const goalColors: Record<string, string> = {
    OVERVIEW: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    JOB_FIT: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    TEAM_FIT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return (
    <Link href={`/test-templates/${template.id}`} className={cn('block w-full', className)}>
      <div
        className={cn(
          // Base styles - fill width, rounded corners, border
          'w-full p-3 rounded-xl border border-border/60 bg-card',
          // Hover states
          'hover:border-border hover:shadow-sm cursor-pointer group',
          // Hover/tap animations (replaces framer-motion whileHover/whileTap)
          'hover:-translate-y-px active:scale-[0.99]',
          'transition-all duration-200 motion-reduce:transition-none',
          // Touch-friendly
          'touch-manipulation',
          // Compact mode layout
          compact && 'flex items-center gap-3'
        )}
      >
        {compact ? (
          // Compact layout (single row)
          <>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{template.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {goalInfo.displayName}
              </p>
            </div>
            <Badge variant="outline" className="text-xs shrink-0">
              {template.competencyCount}
            </Badge>
          </>
        ) : (
          // Full card layout - optimized for mobile
          <>
            {/* Title row with arrow */}
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium line-clamp-2 flex-1 min-w-0">{template.name}</p>
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
            </div>

            {/* Badge + metadata row */}
            <div className="flex items-center gap-2 mt-1.5">
              <Badge
                className={cn(
                  'text-[10px] px-1.5 py-0.5 shrink-0',
                  goalColors[template.goal] || 'bg-muted text-muted-foreground'
                )}
              >
                {goalInfo.displayName}
              </Badge>
              <span className="text-muted-foreground/50">•</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{template.competencyCount}</span>
                </div>
                {template.timeLimitMinutes > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{template.timeLimitMinutes}m</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Link>
  );
}

/**
 * Loading skeleton for TestTemplatesWidget
 */
function TestTemplatesWidgetSkeleton({
  className,
  compact,
  count = 4,
}: {
  className?: string;
  compact?: boolean;
  count?: number;
}) {
  return (
    <Card className={cn('h-full animate-pulse', className)}>
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
        <div
          className={cn(
            'grid gap-2.5 sm:gap-3',
            compact
              ? 'grid-cols-1'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          )}
        >
          {Array.from({ length: count }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

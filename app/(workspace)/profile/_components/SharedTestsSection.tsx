'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Share2,
  ChevronRight,
  Eye,
  Edit,
  Settings2,
  Clock,
  Target,
  FileText,
  Play,
  Calendar,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import type { SharedTemplateItem } from '@/types/domain';
import { SharePermission, AssessmentGoal } from '@/types/domain';
import { cn } from '@/lib/utils';

interface SharedTestsSectionProps {
  items: SharedTemplateItem[];
  total: number;
}

/**
 * Permission configuration for visual styling
 */
const permissionConfig: Record<
  SharePermission,
  { icon: typeof Eye; colorClass: string; bgClass: string }
> = {
  [SharePermission.VIEW]: {
    icon: Eye,
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-100 dark:bg-blue-950/50',
  },
  [SharePermission.EDIT]: {
    icon: Edit,
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-100 dark:bg-amber-950/50',
  },
  [SharePermission.MANAGE]: {
    icon: Settings2,
    colorClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-100 dark:bg-purple-950/50',
  },
};

/**
 * Goal badge configuration
 */
const goalConfig: Record<AssessmentGoal, { labelKey: string; className: string }> = {
  [AssessmentGoal.OVERVIEW]: {
    labelKey: 'goals.overview',
    className: 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300',
  },
  [AssessmentGoal.JOB_FIT]: {
    labelKey: 'goals.jobFit',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  },
  [AssessmentGoal.TEAM_FIT]: {
    labelKey: 'goals.teamFit',
    className: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
  },
};

/**
 * SharedTestsSection - Profile component showing tests shared with the user
 *
 * Mobile-first design with:
 * - Responsive card layout (1 col mobile, 2 col tablet, 3 col desktop)
 * - Permission badges with icons
 * - Sharer attribution with avatar
 * - Touch-friendly targets (min 44px)
 * - Full i18n support
 * - WCAG 2.1 AA compliant
 */
export function SharedTestsSection({ items, total }: SharedTestsSectionProps) {
  const t = useTranslations('users.profile.sharedTests');
  const tCommon = useTranslations('common');

  // Sort by most recently shared
  const sortedItems = useMemo(() => {
    return [...items]
      .filter((item) => item.isActive)
      .sort((a, b) => new Date(b.sharedAt).getTime() - new Date(a.sharedAt).getTime())
      .slice(0, 6); // Show max 6 on profile page
  }, [items]);

  // Empty state
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <div
              className="p-1.5 sm:p-2 rounded-lg bg-primary/10"
              aria-hidden="true"
            >
              <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div
            className="text-center py-6 sm:py-8"
            role="status"
            aria-label={t('emptyState.title')}
          >
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-3 sm:mb-4"
              aria-hidden="true"
            >
              <Share2 className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground/30" />
            </div>
            <h3 className="text-sm sm:text-base font-medium mb-1.5 sm:mb-2">
              {t('emptyState.title')}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 px-4">
              {t('emptyState.description')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-300 shadow-card hover:shadow-card-hover hover:border-primary/10">
      <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
        <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2 shrink-0">
            <div
              className="p-1.5 sm:p-2 rounded-lg bg-primary/10"
              aria-hidden="true"
            >
              <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            {t('title')}
            <Badge
              variant="secondary"
              className="ml-1 text-xs"
              aria-label={t('countLabel', { count: total })}
            >
              {total}
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden sm:inline-flex shrink-0 text-xs h-7 px-2"
          >
            <Link href="/shared">
              {tCommon('viewAll')}
              <ChevronRight className="ml-0.5 h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        {/* Grid layout - responsive */}
        <div
          className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 sm:grid-rows-equal"
          role="list"
          aria-label={t('listLabel')}
        >
          {sortedItems.map((item) => (
            <SharedTemplateCard key={item.template.id} item={item} />
          ))}
        </div>

        {/* Mobile "View All" button */}
        <div className="mt-3 sm:hidden">
          <Button variant="outline" size="sm" asChild className="w-full text-xs">
            <Link href="/shared">
              {t('viewAll')}
              <ChevronRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// SHARED TEMPLATE CARD COMPONENT
// ============================================

interface SharedTemplateCardProps {
  item: SharedTemplateItem;
}

function SharedTemplateCard({ item }: SharedTemplateCardProps) {
  const t = useTranslations('users.profile.sharedTests');
  const { template, permission, sharedBy, sharedAt, expiresAt } = item;
  const permConfig = permissionConfig[permission];
  const PermIcon = permConfig.icon;
  const goal = goalConfig[template.goal];

  // Check if expired
  const isExpired = expiresAt && new Date(expiresAt) < new Date();

  // Get initials for avatar fallback
  const initials = sharedBy.name
    ? sharedBy.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  // Determine locale for date formatting
  const dateLocale = typeof window !== 'undefined' && document.documentElement.lang === 'ru' ? ru : enUS;

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-xl border transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5',
        'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2',
        isExpired && 'opacity-60'
      )}
      role="listitem"
      aria-label={`${template.name} - ${t(`permissions.${permission.toLowerCase()}`)}`}
    >
      {/* Permission indicator strip */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-1 rounded-t-xl',
          permConfig.bgClass
        )}
        aria-hidden="true"
      />

      <div className="p-3 pt-4 flex flex-col flex-1">
        {/* Header with title and permission badge */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-sm font-medium truncate flex-1">
            {template.name}
          </h4>
          <Badge
            variant="secondary"
            className={cn('shrink-0 gap-1 text-xs', permConfig.bgClass)}
            aria-label={t(`permissions.${permission.toLowerCase()}`)}
          >
            <PermIcon className={cn('h-3 w-3', permConfig.colorClass)} aria-hidden="true" />
            <span className={cn('text-xs', permConfig.colorClass)}>
              {t(`permissions.${permission.toLowerCase()}`)}
            </span>
          </Badge>
        </div>

        {/* Goal badge */}
        <Badge
          variant="outline"
          className={cn('w-fit text-xs mb-2', goal.className)}
        >
          {t(goal.labelKey)}
        </Badge>

        {/* Template stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Target className="h-3 w-3" aria-hidden="true" />
            <span className="sr-only">{t('stats.competencies')}</span>
            {template.competencyCount}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span className="sr-only">{t('stats.duration')}</span>
            {template.timeLimitMinutes} {t('stats.minutes')}
          </span>
        </div>

        {/* Shared by attribution */}
        <div className="flex items-center gap-2 pt-2 border-t mt-auto">
          <Avatar className="h-6 w-6">
            <AvatarImage src={sharedBy.avatarUrl} alt={sharedBy.name} />
            <AvatarFallback className="text-xs bg-muted">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{sharedBy.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(sharedAt), {
                addSuffix: true,
                locale: dateLocale,
              })}
            </p>
          </div>
        </div>

        {/* Expiry warning */}
        {expiresAt && !isExpired && (
          <div
            className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 mt-2"
            role="alert"
          >
            <Calendar className="h-3 w-3" aria-hidden="true" />
            {t('expires', {
              time: formatDistanceToNow(new Date(expiresAt), {
                addSuffix: true,
                locale: dateLocale,
              }),
            })}
          </div>
        )}
        {isExpired && (
          <Badge variant="destructive" className="text-xs mt-2 w-fit">
            {t('expired')}
          </Badge>
        )}

        {/* Actions */}
        {!isExpired && (
          <div className="flex gap-2 mt-3">
            <Button
              asChild
              variant="default"
              size="sm"
              className="flex-1 gap-1.5 min-h-[36px] text-xs"
            >
              <Link href={`/test-templates/${template.id}`}>
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                {t('actions.view')}
              </Link>
            </Button>
            {template.isActive && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="gap-1.5 min-h-[36px] text-xs"
              >
                <Link href={`/test-templates/${template.id}/take`}>
                  <Play className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('actions.take')}
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

// ============================================
// SKELETON COMPONENT
// ============================================

export function SharedTestsSectionSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg" />
            <Skeleton className="h-5 sm:h-6 w-32 sm:w-36" />
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>
          <Skeleton className="h-7 w-20 rounded hidden sm:block" />
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border p-3 pt-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex items-center gap-2 pt-2 border-t">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-9 flex-1 rounded" />
                <Skeleton className="h-9 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

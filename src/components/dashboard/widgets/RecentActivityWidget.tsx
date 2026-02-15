'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, Clock, AlertCircle, XCircle, Timer } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { RecentCompletion } from '@/types/dashboard';
import type { TestActivity, ActivityEventType } from '@/types/activity';
import { AssessmentGoal, AssessmentGoalInfo } from '@/types/domain';
import { useTranslations } from 'next-intl';
import { activityApi } from '@/services/api';
import { createLogger } from '@/lib/logger';

const log = createLogger('RecentActivityWidget');

// Polling interval: 30 seconds
const POLL_INTERVAL_MS = 30_000;

/**
 * Props for RecentActivityWidget
 */
export interface RecentActivityWidgetProps {
  /** Recent completions data (optional - will fetch from API if not provided) */
  completions?: RecentCompletion[];
  /** Loading state (only used when completions are provided externally) */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Maximum items to display */
  maxItems?: number;
  /** Disable API fetching (use provided completions only) */
  disableFetch?: boolean;
}

/**
 * Map TestActivity from API to RecentCompletion for display
 */
function mapActivityToCompletion(activity: TestActivity): RecentCompletion {
  return {
    id: activity.sessionId,
    userId: activity.clerkUserId,
    userName: activity.userName,
    templateName: activity.templateName,
    templateGoal: activity.templateGoal,
    completedAt: activity.occurredAt,
    score: activity.score,
    passed: activity.passed,
  };
}

/**
 * RecentActivityWidget - Displays recent test completions with live updates.
 *
 * Features:
 * - User avatar with initials (or image if available)
 * - Assessment type badge
 * - Pass/fail/abandoned/timed-out indicators
 * - Relative time display
 * - Auto-refresh every 30 seconds
 *
 * @example
 * ```tsx
 * // With auto-fetching (recommended)
 * <RecentActivityWidget maxItems={5} />
 *
 * // With provided data (server-side rendering)
 * <RecentActivityWidget completions={serverCompletions} disableFetch />
 * ```
 */
export function RecentActivityWidget({
  completions: externalCompletions,
  loading: externalLoading = false,
  className,
  maxItems = 5,
  disableFetch = false,
}: RecentActivityWidgetProps) {
  const t = useTranslations('dashboard');
  const tActivity = useTranslations('activity');

  const [activities, setActivities] = useState<TestActivity[]>([]);
  const [isLoading, setIsLoading] = useState(!disableFetch && !externalCompletions);
  const [error, setError] = useState<string | null>(null);

  // Fetch activity from API
  const fetchActivity = useCallback(async () => {
    if (disableFetch) return;

    try {
      const data = await activityApi.getRecentActivity(maxItems);
      setActivities(data);
      setError(null);
    } catch (err) {
      const errorInfo = err instanceof Error
        ? { message: err.message, name: err.name, ...(('status' in err) ? { status: (err as { status?: number }).status } : {}) }
        : { raw: String(err) };
      log.error('Failed to fetch recent activity', errorInfo);
      setError('Failed to load activity');
    } finally {
      setIsLoading(false);
    }
  }, [disableFetch, maxItems]);

  // Initial fetch and polling
  useEffect(() => {
    if (disableFetch) return;

    // Initial fetch
    fetchActivity();

    // Set up polling interval
    const intervalId = setInterval(fetchActivity, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [fetchActivity, disableFetch]);

  // Determine what to display
  const isLoadingState = externalLoading || isLoading;

  if (isLoadingState) {
    return <RecentActivityWidgetSkeleton className={className} />;
  }

  // Use external completions if provided, otherwise use fetched activities
  let displayCompletions: RecentCompletion[];
  if (externalCompletions && externalCompletions.length > 0) {
    displayCompletions = externalCompletions.slice(0, maxItems);
  } else if (activities.length > 0) {
    displayCompletions = activities.slice(0, maxItems).map(mapActivityToCompletion);
  } else {
    displayCompletions = [];
  }

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-base">{t('recentActivity')}</CardTitle>
        </div>
        <Link href="/test-results">
          <Button variant="ghost" size="sm" className="h-7 px-2">
            <ChevronRight className="w-4 h-4" />
            <span className="sr-only">{t('viewAllActivity')}</span>
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="pt-1">
        {error ? (
          <div className="text-center py-6 text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-destructive/60" />
            <p className="text-sm text-destructive/80">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => {
                setIsLoading(true);
                fetchActivity();
              }}
            >
              {tActivity('retry')}
            </Button>
          </div>
        ) : displayCompletions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">{t('noRecentActivity')}</p>
            <p className="text-xs mt-1">{t('completionsAppearHere')}</p>
          </div>
        ) : (
          <div className="space-y-0.5 divide-y divide-border/50">
            {displayCompletions.map((completion, index) => (
              <ActivityItem
                key={completion.id || index}
                completion={completion}
                activity={activities.find(a => a.sessionId === completion.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Individual activity item
 * Mobile: Multi-row stacked layout for better readability
 * Desktop: Compact horizontal layout
 */
function ActivityItem({
  completion,
  activity,
}: {
  completion: RecentCompletion;
  activity?: TestActivity;
}) {
  const tActivity = useTranslations('activity');
  const initials = getInitials(completion.userName);
  const goalInfo =
    AssessmentGoalInfo[completion.templateGoal as AssessmentGoal] || {
      displayName: completion.templateGoal,
    };
  const variant = getActivityVariant(completion, activity?.eventType);
  const eventType = activity?.eventType || 'COMPLETED';
  const eventLabel = getEventLabel(eventType, tActivity);
  const EventIcon = getEventIcon(eventType);

  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="relative shrink-0">
        <Avatar className="h-7 w-7">
          {activity?.userImageUrl && (
            <AvatarImage src={activity.userImageUrl} alt={completion.userName} />
          )}
          <AvatarFallback className="text-[10px] bg-muted font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-background',
            variant === 'success' && 'bg-emerald-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'error' && 'bg-red-500',
            variant === 'info' && 'bg-blue-500',
            variant === 'default' && 'bg-muted-foreground/40'
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        {/* Mobile layout: stacked rows */}
        <div className="sm:hidden">
          {/* Row 1: Username */}
          <span className="text-sm font-medium line-clamp-1">{completion.userName}</span>
          {/* Row 2: Event + Template name */}
          <p className="text-sm text-muted-foreground mt-0.5">
            <span className="inline-flex items-center gap-1">
              <EventIcon className="w-3 h-3" />
              {eventLabel}
            </span>
            {' '}
            <span className="font-medium text-foreground">{completion.templateName}</span>
          </p>
          {/* Row 3: Badges + Time */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {goalInfo.displayName}
            </Badge>
            {completion.score !== undefined && eventType === 'COMPLETED' && (
              <Badge
                variant={completion.passed ? 'default' : 'secondary'}
                className={cn(
                  'text-[10px] px-1.5 py-0',
                  completion.passed && 'bg-emerald-600'
                )}
              >
                {completion.score}%
              </Badge>
            )}
            <span className="text-[10px] text-muted-foreground">
              {formatTimeAgo(new Date(completion.completedAt))}
            </span>
          </div>
        </div>

        {/* Desktop layout: compact horizontal */}
        <div className="hidden sm:block">
          <p className="text-sm leading-snug">
            <span className="font-medium">{completion.userName}</span>
            <span className="text-muted-foreground inline-flex items-center gap-1 mx-1">
              <EventIcon className="w-3 h-3" />
              {eventLabel}
            </span>
            <span className="font-medium">{completion.templateName}</span>
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
              {goalInfo.displayName}
            </Badge>
            {completion.score !== undefined && eventType === 'COMPLETED' && (
              <Badge
                variant={completion.passed ? 'default' : 'secondary'}
                className={cn(
                  'text-[10px] px-1.5 py-0 shrink-0',
                  completion.passed && 'bg-emerald-600'
                )}
              >
                {completion.score}%
              </Badge>
            )}
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatTimeAgo(new Date(completion.completedAt))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Get initials from name
 */
function getInitials(name: string): string {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Get activity variant based on completion result and event type
 */
function getActivityVariant(
  completion: RecentCompletion,
  eventType?: ActivityEventType
): 'success' | 'warning' | 'error' | 'info' | 'default' {
  // Handle non-completion events
  if (eventType === 'ABANDONED') return 'warning';
  if (eventType === 'TIMED_OUT') return 'error';

  // Handle completion events
  if (completion.passed === true) return 'success';
  if (completion.passed === false) return 'default';
  return 'info';
}

/**
 * Get event label based on event type
 */
function getEventLabel(
  eventType: ActivityEventType,
  t: ReturnType<typeof useTranslations<'activity'>>
): string {
  switch (eventType) {
    case 'COMPLETED':
      return t('completed');
    case 'ABANDONED':
      return t('abandoned');
    case 'TIMED_OUT':
      return t('timedOut');
    default:
      return t('completed');
  }
}

/**
 * Get icon for event type
 */
function getEventIcon(eventType: ActivityEventType) {
  switch (eventType) {
    case 'ABANDONED':
      return XCircle;
    case 'TIMED_OUT':
      return Timer;
    default:
      return Clock;
  }
}

/**
 * Format date as relative time
 */
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString();
}

/**
 * Loading skeleton for RecentActivityWidget
 */
function RecentActivityWidgetSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('h-full animate-pulse', className)}>
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <Skeleton className="h-4 w-28" />
      </CardHeader>
      <CardContent className="pt-1">
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="w-7 h-7 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

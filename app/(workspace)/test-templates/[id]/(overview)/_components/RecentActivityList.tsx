'use client';

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Activity } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useFormattedDates } from "@/hooks/useFormattedDates";
import type { TestActivity, ActivityEventType } from "@/types/activity";

interface RecentActivityListProps {
  activities: TestActivity[];
  templateId: string;
  passingScore: number;
}

/**
 * Get initials from name for avatar display.
 */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Get status badge styling based on event type.
 */
function getEventBadgeStyles(eventType: ActivityEventType): string {
  switch (eventType) {
    case "COMPLETED":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "ABANDONED":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "TIMED_OUT":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  }
}

/**
 * Get score color based on pass/fail status.
 */
function getScoreColor(passed: boolean): string {
  return passed
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400";
}

/**
 * RecentActivityList displays recent test activity in a mobile-friendly card list format.
 * Shows candidate information, status, score, duration, and relative time.
 * Links to the Activity page for full activity history.
 */
export function RecentActivityList({
  activities,
  templateId,
  passingScore,
}: RecentActivityListProps) {
  const t = useTranslations('template.hub.overview.activity');
  const tOverview = useTranslations('template.hub.overview');
  const tEventTypes = useTranslations('template.hub.overview.activity.eventTypes');
  const { formatRelativeTimeShort, formatDuration } = useFormattedDates();

  const recentActivities = activities.slice(0, 5);
  const hasNoActivity = recentActivities.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tOverview('recentActivity')}</CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/test-templates/${templateId}/activity`}>{t('viewAll')}</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {hasNoActivity ? (
          <EmptyState t={t} tOverview={tOverview} />
        ) : (
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <ActivityCard
                key={activity.sessionId}
                activity={activity}
                passingScore={passingScore}
                tEventTypes={tEventTypes}
                formatRelativeTimeShort={formatRelativeTimeShort}
                formatDuration={formatDuration}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface EmptyStateProps {
  t: ReturnType<typeof useTranslations>;
  tOverview: ReturnType<typeof useTranslations>;
}

/**
 * Empty state when no activity exists.
 */
function EmptyState({ t, tOverview }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="mb-3 rounded-full bg-muted p-3">
        <Activity className="size-6 text-muted-foreground" />
      </div>
      <p className="font-medium text-foreground">{tOverview('noActivity')}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('noActivityDescription')}
      </p>
    </div>
  );
}

interface ActivityCardProps {
  activity: TestActivity;
  passingScore: number;
  tEventTypes: ReturnType<typeof useTranslations>;
  formatRelativeTimeShort: (date: string | Date | null | undefined) => string;
  formatDuration: (seconds: number | undefined | null) => string;
}

/**
 * Get translated event type label.
 */
function getEventTypeLabel(eventType: ActivityEventType, t: ReturnType<typeof useTranslations>): string {
  switch (eventType) {
    case "COMPLETED":
      return t('completed');
    case "ABANDONED":
      return t('abandoned');
    case "TIMED_OUT":
      return t('timedOut');
    default:
      return eventType;
  }
}

/**
 * Individual activity card with responsive layout.
 * Desktop: horizontal row layout
 * Mobile: stacked vertical layout
 */
function ActivityCard({
  activity,
  passingScore,
  tEventTypes,
  formatRelativeTimeShort,
  formatDuration
}: ActivityCardProps) {
  const initials = getInitials(activity.userName);
  const hasScore = activity.score !== undefined && activity.eventType === "COMPLETED";
  const hasDuration = activity.timeSpentSeconds !== undefined;

  const isCompleted = activity.eventType === 'COMPLETED';
  const cardClassName = "flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50";

  const content = (
    <>
      {/* Avatar */}
      <Avatar className="size-10 shrink-0">
        {activity.userImageUrl ? (
          <AvatarImage src={activity.userImageUrl} alt={activity.userName} />
        ) : null}
        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Content - Desktop: row layout, Mobile: stacked */}
      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
        {/* Name and mobile status/score row */}
        <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:gap-4">
          {/* Name */}
          <span className="truncate font-medium text-foreground">
            {activity.userName}
          </span>

          {/* Mobile: Status + Score inline */}
          <div className="flex items-center gap-2 sm:hidden">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getEventBadgeStyles(activity.eventType)}`}
            >
              {getEventTypeLabel(activity.eventType, tEventTypes)}
            </span>
            {hasScore && activity.passed !== undefined && (
              <span
                className={`text-sm font-semibold ${getScoreColor(activity.passed)}`}
              >
                {activity.score!.toFixed(2)}%
              </span>
            )}
          </div>

          {/* Mobile: Time */}
          <span className="text-xs text-muted-foreground sm:hidden">
            {formatRelativeTimeShort(activity.occurredAt)}
          </span>
        </div>

        {/* Desktop: Status badge */}
        <span
          className={`hidden shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium sm:inline-flex ${getEventBadgeStyles(activity.eventType)}`}
        >
          {getEventTypeLabel(activity.eventType, tEventTypes)}
        </span>

        {/* Desktop: Score */}
        {hasScore && activity.passed !== undefined && (
          <span
            className={`hidden shrink-0 text-sm font-semibold sm:block ${getScoreColor(activity.passed)}`}
          >
            {activity.score!.toFixed(2)}%
          </span>
        )}

        {/* Desktop: Duration */}
        {hasDuration && (
          <span className="hidden shrink-0 text-sm text-muted-foreground sm:block">
            {formatDuration(activity.timeSpentSeconds!)}
          </span>
        )}

        {/* Desktop: Time */}
        <span className="hidden shrink-0 text-sm text-muted-foreground sm:block">
          {formatRelativeTimeShort(activity.occurredAt)}
        </span>
      </div>
    </>
  );

  if (isCompleted) {
    return (
      <Link href={`/test-templates/results/${activity.sessionId}`} className={cardClassName}>
        {content}
      </Link>
    );
  }

  return <div className={cardClassName}>{content}</div>;
}

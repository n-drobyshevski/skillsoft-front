'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { CheckCircle, XCircle, Timer } from 'lucide-react';
import type { TestActivity, ActivityEventType } from '@/types/activity';

/**
 * Status configuration for visual styling
 */
const STATUS_CONFIG: Record<
  ActivityEventType,
  {
    border: string;
    icon: typeof CheckCircle;
    iconColor: string;
  }
> = {
  COMPLETED: {
    border: 'border-l-emerald-500',
    icon: CheckCircle,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  ABANDONED: {
    border: 'border-l-amber-500',
    icon: XCircle,
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  TIMED_OUT: {
    border: 'border-l-red-500',
    icon: Timer,
    iconColor: 'text-red-600 dark:text-red-400',
  },
};

export interface ActivityCardProps {
  /** Activity data to display */
  activity: TestActivity;
  /** Optional className */
  className?: string;
}

/**
 * ActivityCard - Compact mobile card for displaying activity items.
 *
 * Features:
 * - Status-colored left border (emerald/amber/red)
 * - Two-row layout: Avatar + Name + StatusIcon, then Score + Badge + Time + Date
 * - 44px minimum touch targets
 * - Dark mode support
 * - Follows MobileItemCard patterns
 */
export function ActivityCard({ activity, className }: ActivityCardProps) {
  const t = useTranslations('activity');
  const config = STATUS_CONFIG[activity.eventType];
  const StatusIcon = config.icon;

  return (
    <div
      className={cn(
        // Base card styles
        'relative bg-card rounded-lg border shadow-sm',
        // Status border on left
        'border-l-4',
        config.border,
        // Overflow handling
        'overflow-hidden',
        className
      )}
    >
      {/* Row 1: Avatar + Name + Status Icon */}
      <div className="flex items-center gap-2 p-3 pb-2">
        <Avatar className="h-8 w-8 shrink-0">
          {activity.userImageUrl && (
            <AvatarImage src={activity.userImageUrl} alt={activity.userName} />
          )}
          <AvatarFallback className="text-xs bg-muted">
            {getInitials(activity.userName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <span className="font-medium text-sm truncate block">
            {activity.userName}
          </span>
          <span className={cn('text-xs flex items-center gap-1', config.iconColor)}>
            <StatusIcon className="h-3 w-3" />
            {getStatusLabel(activity.eventType, t)}
          </span>
        </div>
        {/* Result Badge */}
        {activity.passed !== undefined && (
          <Badge
            variant={activity.passed ? 'default' : 'secondary'}
            className={cn(
              'shrink-0 text-[10px] px-1.5 py-0.5',
              activity.passed && 'bg-emerald-600 hover:bg-emerald-600'
            )}
          >
            {activity.passed ? t('passed') : t('failed')}
          </Badge>
        )}
      </div>

      {/* Row 2: Score + Time + Date */}
      <div className="flex items-center gap-3 px-3 pb-3 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">
          {activity.score !== undefined ? `${Math.round(activity.score)}%` : '--'}
        </span>
        <span className="flex items-center gap-1">
          <Timer className="h-3 w-3" />
          {formatDuration(activity.timeSpentSeconds)}
        </span>
        <span className="ml-auto">{formatDate(activity.occurredAt)}</span>
      </div>
    </div>
  );
}

/**
 * Get user initials from name
 */
function getInitials(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Get localized status label
 */
function getStatusLabel(
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
 * Format duration in seconds to human-readable string
 */
function formatDuration(seconds?: number): string {
  if (!seconds) return '--';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

/**
 * Format date to relative or short format
 */
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default ActivityCard;

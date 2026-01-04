'use client';

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Timer } from 'lucide-react';
import type { TestActivity, ActivityEventType } from '@/types/activity';

export interface ActivityTableProps {
  /** Activity data to display */
  data: TestActivity[];
  /** Optional className */
  className?: string;
}

/**
 * ActivityTable - Desktop table view for activity list.
 *
 * Features:
 * - Clean table layout with proper column widths
 * - User avatar + name column
 * - Status with icon and color
 * - Score, Result badge, Time, Date columns
 */
export function ActivityTable({ data, className }: ActivityTableProps) {
  const t = useTranslations('activity');
  const tTable = useTranslations('activity.table');

  return (
    <div className={cn('overflow-hidden rounded-md border', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">{tTable('user')}</TableHead>
            <TableHead className="w-[100px]">{tTable('status')}</TableHead>
            <TableHead className="w-[80px] text-right">{tTable('score')}</TableHead>
            <TableHead className="w-[80px]">{tTable('result')}</TableHead>
            <TableHead className="w-[100px]">{tTable('timeSpent')}</TableHead>
            <TableHead className="w-[120px]">{tTable('date')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((activity) => (
            <ActivityRow key={activity.sessionId} activity={activity} t={t} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * Table row for individual activity
 */
interface ActivityRowProps {
  activity: TestActivity;
  t: ReturnType<typeof useTranslations<'activity'>>;
}

function ActivityRow({ activity, t }: ActivityRowProps) {
  const initials = getInitials(activity.userName);
  const StatusIcon = getStatusIcon(activity.eventType);
  const statusColor = getStatusColor(activity.eventType);

  return (
    <TableRow>
      {/* User */}
      <TableCell>
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7 shrink-0">
            {activity.userImageUrl && (
              <AvatarImage src={activity.userImageUrl} alt={activity.userName} />
            )}
            <AvatarFallback className="text-[10px] bg-muted">{initials}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm truncate max-w-[150px]">
            {activity.userName}
          </span>
        </div>
      </TableCell>

      {/* Status */}
      <TableCell>
        <div className={cn('flex items-center gap-1.5 text-xs', statusColor)}>
          <StatusIcon className="w-3.5 h-3.5" />
          {getStatusLabel(activity.eventType, t)}
        </div>
      </TableCell>

      {/* Score */}
      <TableCell className="text-right font-medium">
        {activity.score !== undefined ? `${Math.round(activity.score)}%` : '-'}
      </TableCell>

      {/* Result */}
      <TableCell>
        {activity.passed !== undefined ? (
          <Badge
            variant={activity.passed ? 'default' : 'secondary'}
            className={cn(
              'text-[10px]',
              activity.passed && 'bg-emerald-600 hover:bg-emerald-600'
            )}
          >
            {activity.passed ? t('passed') : t('failed')}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>

      {/* Time Spent */}
      <TableCell className="text-xs text-muted-foreground">
        {activity.timeSpentSeconds ? formatDuration(activity.timeSpentSeconds) : '-'}
      </TableCell>

      {/* Date */}
      <TableCell className="text-xs text-muted-foreground">
        {formatDate(activity.occurredAt)}
      </TableCell>
    </TableRow>
  );
}

// Helper functions

function getInitials(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function getStatusIcon(eventType: ActivityEventType) {
  switch (eventType) {
    case 'COMPLETED':
      return CheckCircle;
    case 'ABANDONED':
      return XCircle;
    case 'TIMED_OUT':
      return Timer;
    default:
      return CheckCircle;
  }
}

function getStatusColor(eventType: ActivityEventType): string {
  switch (eventType) {
    case 'COMPLETED':
      return 'text-emerald-600 dark:text-emerald-400';
    case 'ABANDONED':
      return 'text-amber-600 dark:text-amber-400';
    case 'TIMED_OUT':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-muted-foreground';
  }
}

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

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

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

export default ActivityTable;

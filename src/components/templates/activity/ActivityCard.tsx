'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslations } from 'next-intl';
import { Timer } from 'lucide-react';
import type { UserResultSummary } from '@/types/activity';

export interface ActivityCardProps {
  /** User result summary */
  result: UserResultSummary;
  /** Whether this is a TEAM_FIT template (enables selection) */
  isTeamFit?: boolean;
  /** Whether this card is selected for comparison */
  isSelected?: boolean;
  /** Callback when checkbox is toggled */
  onCheckboxChange?: (sessionId: string, checked: boolean) => void;
  /** Optional className */
  className?: string;
}

/**
 * ActivityCard - Mobile card for displaying user result summary.
 *
 * Features:
 * - Pass/fail colored left border (emerald for pass, amber for fail)
 * - Two-row layout: Avatar + Name + Attempts + Badge, then Score + Time + Date
 * - Prominent score display with color coding
 * - 44px minimum touch targets
 * - Dark mode support
 */
export function ActivityCard({ result, isTeamFit, isSelected, onCheckboxChange, className }: ActivityCardProps) {
  const t = useTranslations('activity');
  const { latestSession } = result;
  const isCompleted = latestSession.eventType === 'COMPLETED';

  // Determine border color based on pass/fail
  const borderColor = latestSession.passed === undefined
    ? 'border-l-muted'
    : latestSession.passed
      ? 'border-l-emerald-500'
      : 'border-l-amber-500';

  return (
    <div
      className={cn(
        // Base card styles
        'relative bg-card rounded-lg border shadow-sm',
        // Status border on left
        'border-l-4',
        borderColor,
        // Selection highlight
        isTeamFit && isSelected && 'ring-2 ring-primary/30',
        // Overflow handling
        'overflow-hidden',
        className
      )}
    >
      {/* Row 1: Avatar + Name + Badge */}
      <div className="flex items-center gap-2 p-3 pb-2">
        {/* Checkbox for TEAM_FIT comparison */}
        {isTeamFit && isCompleted && (
          <Checkbox
            checked={!!isSelected}
            onCheckedChange={(checked) =>
              onCheckboxChange?.(latestSession.sessionId, !!checked)
            }
            aria-label={`Select ${result.userName}`}
            className="shrink-0"
          />
        )}
        <Avatar className="h-9 w-9 shrink-0">
          {result.userImageUrl && (
            <AvatarImage src={result.userImageUrl} alt={result.userName} />
          )}
          <AvatarFallback className="text-xs bg-muted">
            {getInitials(result.userName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <span className="font-medium text-sm truncate block">
            {result.userName}
          </span>
          {result.totalAttempts > 1 && (
            <span className="text-[10px] text-muted-foreground">
              {result.totalAttempts} {t('attempts')}
            </span>
          )}
        </div>

        {/* Result Badge */}
        {latestSession.passed !== undefined && (
          <Badge
            variant={latestSession.passed ? 'default' : 'secondary'}
            className={cn(
              'shrink-0 text-[10px] px-2 py-0.5',
              latestSession.passed && 'bg-emerald-600 hover:bg-emerald-600'
            )}
          >
            {latestSession.passed ? t('passed') : t('failed')}
          </Badge>
        )}
      </div>

      {/* Row 2: Score + Time + Date */}
      <div className="flex items-center gap-4 px-3 pb-3 text-xs">
        {/* Score - Prominent */}
        <span className={cn(
          'font-bold text-base',
          latestSession.passed
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-foreground'
        )}>
          {latestSession.score !== undefined ? `${Math.round(latestSession.score)}%` : '--'}
        </span>

        {/* Time */}
        <span className="flex items-center gap-1 text-muted-foreground">
          <Timer className="h-3 w-3" />
          {formatDuration(latestSession.timeSpentSeconds)}
        </span>

        {/* Date - Right aligned */}
        <span className="ml-auto text-muted-foreground">
          {formatDate(latestSession.occurredAt)}
        </span>
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

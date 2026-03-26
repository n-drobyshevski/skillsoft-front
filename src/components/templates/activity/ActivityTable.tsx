'use client';

import { useRouter } from 'next/navigation';
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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ExternalLink, MoreHorizontal, Trash2 } from 'lucide-react';
import type { UserResultSummary } from '@/types/activity';

export interface ActivityTableProps {
  /** User-grouped result data */
  data: UserResultSummary[];
  /** Whether this is a TEAM_FIT template (enables selection) */
  isTeamFit?: boolean;
  /** Currently selected session IDs for comparison */
  selectedIds?: Set<string>;
  /** Callback when a checkbox is toggled */
  onCheckboxChange?: (sessionId: string, checked: boolean) => void;
  /** Whether the current user is admin */
  isAdmin?: boolean;
  /** Admin-selected session IDs for bulk delete */
  adminSelectedIds?: Set<string>;
  /** Callback when admin checkbox toggled */
  onAdminCheckboxChange?: (sessionId: string, checked: boolean) => void;
  /** Toggle all admin checkboxes */
  onAdminSelectAll?: () => void;
  /** Callback for single delete action */
  onDeleteSingle?: (sessionId: string, userName: string) => void;
  /** Optional className */
  className?: string;
}

/**
 * ActivityTable - Desktop table view for user-grouped results.
 *
 * Features:
 * - Clean table layout with proper column widths
 * - User avatar + name with attempt count
 * - Score with color coding (emerald for pass)
 * - Pass/Fail badge, Time, Date columns
 * - Admin: separate checkbox column + actions dropdown
 */
export function ActivityTable({
  data,
  isTeamFit,
  selectedIds,
  onCheckboxChange,
  isAdmin,
  adminSelectedIds,
  onAdminCheckboxChange,
  onAdminSelectAll,
  onDeleteSingle,
  className,
}: ActivityTableProps) {
  const t = useTranslations('activity');
  const tTable = useTranslations('activity.table');

  const allAdminSelected =
    data.length > 0 && adminSelectedIds?.size === data.length;
  const someAdminSelected =
    (adminSelectedIds?.size ?? 0) > 0 && !allAdminSelected;

  return (
    <div className={cn('overflow-x-auto', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {/* Admin bulk-delete checkbox column */}
            {isAdmin && (
              <TableHead className="w-[40px] pl-4">
                <Checkbox
                  checked={allAdminSelected}
                  data-state={someAdminSelected ? 'indeterminate' : undefined}
                  onCheckedChange={onAdminSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
            )}
            {isTeamFit && (
              <TableHead className="w-[40px] pl-4">
                <span className="sr-only">Select</span>
              </TableHead>
            )}
            <TableHead className="w-[200px]">{tTable('user')}</TableHead>
            <TableHead className="w-[80px] text-right">{tTable('score')}</TableHead>
            <TableHead className="w-[80px]">{tTable('result')}</TableHead>
            <TableHead className="w-[100px]">{tTable('timeSpent')}</TableHead>
            <TableHead className="w-[120px]">{tTable('date')}</TableHead>
            {isAdmin && (
              <TableHead className="w-[60px] text-right pr-4">
                <span className="sr-only">Actions</span>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((result) => (
            <UserResultRow
              key={result.latestSession.sessionId}
              result={result}
              t={t}
              isTeamFit={isTeamFit}
              isSelected={selectedIds?.has(result.latestSession.sessionId)}
              onCheckboxChange={onCheckboxChange}
              isAdmin={isAdmin}
              isAdminSelected={adminSelectedIds?.has(result.latestSession.sessionId)}
              onAdminCheckboxChange={onAdminCheckboxChange}
              onDeleteSingle={onDeleteSingle}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * Table row for user result summary
 */
interface UserResultRowProps {
  result: UserResultSummary;
  t: ReturnType<typeof useTranslations<'activity'>>;
  isTeamFit?: boolean;
  isSelected?: boolean;
  onCheckboxChange?: (sessionId: string, checked: boolean) => void;
  isAdmin?: boolean;
  isAdminSelected?: boolean;
  onAdminCheckboxChange?: (sessionId: string, checked: boolean) => void;
  onDeleteSingle?: (sessionId: string, userName: string) => void;
}

function UserResultRow({
  result,
  t,
  isTeamFit,
  isSelected,
  onCheckboxChange,
  isAdmin,
  isAdminSelected,
  onAdminCheckboxChange,
  onDeleteSingle,
}: UserResultRowProps) {
  const router = useRouter();
  const initials = getInitials(result.userName);
  const { latestSession } = result;
  const isCompleted = latestSession.eventType === 'COMPLETED';

  return (
    <TableRow
      className={cn(
        isTeamFit && isSelected && 'bg-primary/5',
        isAdmin && isAdminSelected && 'bg-destructive/5',
        isCompleted && 'cursor-pointer',
      )}
      onClick={isCompleted ? () => router.push(`/test-templates/results/${latestSession.sessionId}`) : undefined}
    >
      {/* Admin checkbox — separate from TEAM_FIT comparison */}
      {isAdmin && (
        <TableCell className="pl-4 py-2">
          <Checkbox
            checked={!!isAdminSelected}
            onCheckedChange={(checked) =>
              onAdminCheckboxChange?.(latestSession.sessionId, !!checked)
            }
            onClick={(e) => e.stopPropagation()}
            aria-label={`Admin select ${result.userName}`}
          />
        </TableCell>
      )}
      {/* Checkbox for TEAM_FIT comparison */}
      {isTeamFit && (
        <TableCell className="pl-4 py-2">
          {isCompleted && (
            <Checkbox
              checked={!!isSelected}
              onCheckedChange={(checked) =>
                onCheckboxChange?.(latestSession.sessionId, !!checked)
              }
              onClick={(e) => e.stopPropagation()}
              aria-label={`Select ${result.userName}`}
            />
          )}
        </TableCell>
      )}
      {/* User */}
      <TableCell>
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7 shrink-0">
            {result.userImageUrl && (
              <AvatarImage src={result.userImageUrl} alt={result.userName} />
            )}
            <AvatarFallback className="text-[10px] bg-muted">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-sm truncate max-w-[150px]">
              {result.userName}
            </span>
            {result.totalAttempts > 1 && (
              <span className="text-[10px] text-muted-foreground">
                {result.totalAttempts} {t('attempts')}
              </span>
            )}
          </div>
        </div>
      </TableCell>

      {/* Score */}
      <TableCell className="text-right">
        <span className={cn(
          'text-lg font-bold',
          latestSession.passed
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-foreground'
        )}>
          {latestSession.score !== undefined ? `${latestSession.score.toFixed(2)}%` : '-'}
        </span>
      </TableCell>

      {/* Result Badge */}
      <TableCell>
        {latestSession.passed !== undefined ? (
          <Badge
            variant={latestSession.passed ? 'default' : 'secondary'}
            className={cn(
              'text-[10px]',
              latestSession.passed && 'bg-emerald-600 hover:bg-emerald-600'
            )}
          >
            {latestSession.passed ? t('passed') : t('failed')}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>

      {/* Time Spent */}
      <TableCell className="text-xs text-muted-foreground">
        {latestSession.timeSpentSeconds ? formatDuration(latestSession.timeSpentSeconds) : '-'}
      </TableCell>

      {/* Date */}
      <TableCell className="text-xs text-muted-foreground">
        {formatDate(latestSession.occurredAt)}
      </TableCell>

      {/* Admin Actions dropdown */}
      {isAdmin && (
        <TableCell className="pr-4 py-2 text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isCompleted && (
                <>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/test-templates/results/${latestSession.sessionId}`);
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Results
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSingle?.(latestSession.sessionId, result.userName);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      )}
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

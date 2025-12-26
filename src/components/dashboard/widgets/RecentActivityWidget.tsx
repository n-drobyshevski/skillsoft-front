'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { RecentCompletion } from '@/types/dashboard';
import { AssessmentGoal, AssessmentGoalInfo } from '@/types/domain';

/**
 * Props for RecentActivityWidget
 */
export interface RecentActivityWidgetProps {
  /** Recent completions data */
  completions?: RecentCompletion[];
  /** Loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Maximum items to display */
  maxItems?: number;
}

/**
 * RecentActivityWidget - Displays recent test completions.
 *
 * Features:
 * - User avatar with initials
 * - Assessment type badge
 * - Pass/fail indicator
 * - Relative time display
 *
 * @example
 * ```tsx
 * <RecentActivityWidget completions={recentCompletions} />
 * ```
 */
export function RecentActivityWidget({
  completions = [],
  loading = false,
  className,
  maxItems = 5,
}: RecentActivityWidgetProps) {
  if (loading) {
    return <RecentActivityWidgetSkeleton className={className} />;
  }

  // Fallback mock data if no real data available
  const displayCompletions =
    completions.length > 0 ? completions.slice(0, maxItems) : MOCK_ACTIVITY;

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </div>
        <Link href="/test-results">
          <Button variant="ghost" size="sm" className="h-7 px-2">
            <ChevronRight className="w-4 h-4" />
            <span className="sr-only">View all activity</span>
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="pt-1">
        {displayCompletions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">No recent activity</p>
            <p className="text-xs mt-1">Completions will appear here</p>
          </div>
        ) : (
          <div className="space-y-0.5 divide-y divide-border/50">
            {displayCompletions.map((completion, index) => (
              <ActivityItem key={completion.id || index} completion={completion} />
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
function ActivityItem({ completion }: { completion: RecentCompletion }) {
  const initials = getInitials(completion.userName);
  const goalInfo =
    AssessmentGoalInfo[completion.templateGoal as AssessmentGoal] || {
      displayName: completion.templateGoal,
    };
  const variant = getActivityVariant(completion);

  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="relative shrink-0">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="text-[10px] bg-muted font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-background',
            variant === 'success' && 'bg-emerald-500',
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
          {/* Row 2: Template name */}
          <p className="text-sm text-muted-foreground mt-0.5">
            <span>completed </span>
            <span className="font-medium text-foreground">{completion.templateName}</span>
          </p>
          {/* Row 3: Badges + Time */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {goalInfo.displayName}
            </Badge>
            {completion.score !== undefined && (
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
              • {formatTimeAgo(new Date(completion.completedAt))}
            </span>
          </div>
        </div>

        {/* Desktop layout: compact horizontal */}
        <div className="hidden sm:block">
          <p className="text-sm leading-snug">
            <span className="font-medium">{completion.userName}</span>
            <span className="text-muted-foreground"> completed </span>
            <span className="font-medium">{completion.templateName}</span>
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
              {goalInfo.displayName}
            </Badge>
            {completion.score !== undefined && (
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
 * Get activity variant based on completion result
 */
function getActivityVariant(
  completion: RecentCompletion
): 'success' | 'info' | 'default' {
  if (completion.passed === true) return 'success';
  if (completion.passed === false) return 'default';
  return 'info';
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
 * Mock activity data for demo purposes
 */
const MOCK_ACTIVITY: RecentCompletion[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Alex Johnson',
    templateName: 'Team Leadership',
    templateGoal: 'OVERVIEW',
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    score: 85,
    passed: true,
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Sarah Chen',
    templateName: 'Digital Communication',
    templateGoal: 'JOB_FIT',
    completedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    score: 72,
    passed: true,
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'John Miller',
    templateName: 'Skills Assessment',
    templateGoal: 'TEAM_FIT',
    completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    score: 65,
    passed: false,
  },
];

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

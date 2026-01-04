'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  UserPlus,
  LogIn,
  PlayCircle,
  AlertTriangle,
  Timer,
} from 'lucide-react';
import type { TestResult } from '@/types/domain';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface UserActivityTabProps {
  results: {
    content: TestResult[];
    totalElements: number;
    totalPages: number;
  } | null;
  user: {
    clerkCreatedAt?: string | null;
    createdAt: string;
    lastSignInAt?: string | null;
  };
  locale?: string;
}

/**
 * Activity event types for timeline display.
 */
type ActivityEventType =
  | 'account_created'
  | 'last_sign_in'
  | 'test_started'
  | 'test_completed'
  | 'test_passed'
  | 'test_failed'
  | 'test_abandoned'
  | 'test_timed_out';

/**
 * Activity event structure for timeline.
 */
interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  timestamp: string;
  metadata?: {
    templateName?: string;
    score?: number;
    duration?: number;
  };
}

/**
 * Get icon and color configuration for each event type.
 */
function getEventConfig(type: ActivityEventType): {
  icon: React.ElementType;
  color: string;
  ringColor: string;
  bgColor: string;
} {
  switch (type) {
    case 'account_created':
      return {
        icon: UserPlus,
        color: 'text-primary',
        ringColor: 'ring-primary/20',
        bgColor: 'bg-primary',
      };
    case 'last_sign_in':
      return {
        icon: LogIn,
        color: 'text-emerald-500',
        ringColor: 'ring-emerald-500/20',
        bgColor: 'bg-emerald-500',
      };
    case 'test_started':
      return {
        icon: PlayCircle,
        color: 'text-blue-500',
        ringColor: 'ring-blue-500/20',
        bgColor: 'bg-blue-500',
      };
    case 'test_completed':
    case 'test_passed':
      return {
        icon: CheckCircle2,
        color: 'text-emerald-500',
        ringColor: 'ring-emerald-500/20',
        bgColor: 'bg-emerald-500',
      };
    case 'test_failed':
      return {
        icon: XCircle,
        color: 'text-red-500',
        ringColor: 'ring-red-500/20',
        bgColor: 'bg-red-500',
      };
    case 'test_abandoned':
      return {
        icon: AlertTriangle,
        color: 'text-amber-500',
        ringColor: 'ring-amber-500/20',
        bgColor: 'bg-amber-500',
      };
    case 'test_timed_out':
      return {
        icon: Timer,
        color: 'text-orange-500',
        ringColor: 'ring-orange-500/20',
        bgColor: 'bg-orange-500',
      };
  }
}

/**
 * Format relative time from timestamp.
 */
function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString();
}

/**
 * Format date to localized string.
 */
function formatDateTime(
  dateString?: string | null,
  neverLabel = 'Never',
  locale = 'en-US'
): string {
  if (!dateString) return neverLabel;
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format duration from seconds.
 */
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

/**
 * Build activity events from user data and test results.
 */
function buildActivityEvents(
  user: UserActivityTabProps['user'],
  results: UserActivityTabProps['results']
): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  // Add account created event
  const createdAt = user.clerkCreatedAt || user.createdAt;
  events.push({
    id: 'account-created',
    type: 'account_created',
    timestamp: createdAt,
  });

  // Add test result events
  if (results?.content) {
    results.content.forEach((result) => {
      // Determine event type based on result status
      let eventType: ActivityEventType = 'test_completed';
      if (result.status === 'PENDING') {
        eventType = 'test_started';
      } else if (result.passed === true) {
        eventType = 'test_passed';
      } else if (result.passed === false) {
        eventType = 'test_failed';
      }

      events.push({
        id: `test-${result.id}`,
        type: eventType,
        timestamp: result.completedAt,
        metadata: {
          templateName: result.templateName,
          score: result.overallPercentage ?? undefined,
          duration: result.totalTimeSeconds,
        },
      });
    });
  }

  // Add last sign-in event (if different from created)
  if (user.lastSignInAt && user.lastSignInAt !== createdAt) {
    events.push({
      id: 'last-sign-in',
      type: 'last_sign_in',
      timestamp: user.lastSignInAt,
    });
  }

  // Sort events by timestamp descending (most recent first)
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return events;
}

/**
 * User Activity Tab
 *
 * Displays a timeline of user activities including:
 * - Account creation
 * - Test sessions (started, completed, passed, failed, abandoned, timed out)
 * - Last sign-in
 */
export function UserActivityTab({ results, user, locale = 'en-US' }: UserActivityTabProps) {
  const t = useTranslations('users.profile');
  const events = buildActivityEvents(user, results);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          {t('sections.recentActivity')}
          {events.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {events.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {events.map((event, index) => {
            const config = getEventConfig(event.type);
            const Icon = config.icon;
            const isLast = index === events.length - 1;

            return (
              <div key={event.id} className="flex gap-4 py-3">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-3 h-3 rounded-full ring-4',
                      config.bgColor,
                      config.ringColor
                    )}
                  />
                  {!isLast && <div className="w-px flex-1 bg-border mt-2" />}
                </div>
                <div className={cn('flex-1', !isLast && 'pb-4')}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold flex items-center gap-2">
                        <Icon className={cn('h-4 w-4 shrink-0', config.color)} />
                        <span className="truncate">
                          {getEventLabel(event.type, event.metadata?.templateName, t)}
                        </span>
                      </p>
                      {event.metadata && (
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          {event.metadata.score != null && (
                            <span
                              className={cn(
                                'font-medium',
                                event.metadata.score >= 70
                                  ? 'text-emerald-600'
                                  : event.metadata.score >= 50
                                    ? 'text-blue-600'
                                    : 'text-amber-600'
                              )}
                            >
                              {Math.round(event.metadata.score)}%
                            </span>
                          )}
                          {event.metadata.duration != null && (
                            <>
                              <span className="mx-1">·</span>
                              <Clock className="h-3 w-3" />
                              {formatDuration(event.metadata.duration)}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(event.timestamp)}
                      </p>
                      <p className="text-xs text-muted-foreground/70 hidden sm:block">
                        {formatDateTime(event.timestamp, t('time.never'), locale)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {events.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {t('activity.noActivity')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Get human-readable label for event type.
 */
function getEventLabel(
  type: ActivityEventType,
  templateName?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t?: any
): string {
  const labels: Record<ActivityEventType, string> = {
    account_created: t?.('activity.accountCreated') || 'Account created',
    last_sign_in: t?.('activity.lastSignIn') || 'Signed in',
    test_started: templateName
      ? `${t?.('activity.testStarted') || 'Started'}: ${templateName}`
      : t?.('activity.testStarted') || 'Started test',
    test_completed: templateName
      ? `${t?.('activity.testCompleted') || 'Completed'}: ${templateName}`
      : t?.('activity.testCompleted') || 'Completed test',
    test_passed: templateName
      ? `${t?.('activity.testPassed') || 'Passed'}: ${templateName}`
      : t?.('activity.testPassed') || 'Passed test',
    test_failed: templateName
      ? `${t?.('activity.testFailed') || 'Failed'}: ${templateName}`
      : t?.('activity.testFailed') || 'Failed test',
    test_abandoned: templateName
      ? `${t?.('activity.testAbandoned') || 'Abandoned'}: ${templateName}`
      : t?.('activity.testAbandoned') || 'Abandoned test',
    test_timed_out: templateName
      ? `${t?.('activity.testTimedOut') || 'Timed out'}: ${templateName}`
      : t?.('activity.testTimedOut') || 'Test timed out',
  };

  return labels[type];
}

export default UserActivityTab;

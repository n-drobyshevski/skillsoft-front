'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  PlayCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  RotateCcw,
  ArrowRight,
  Trophy,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EnrichedTestSession } from './MyTestsContent';
import { SessionStatus } from '@/types/domain';

interface HistoryTestCardProps {
  session: EnrichedTestSession;
}

// Compact status configuration with left border
const STATUS_CONFIG: Record<
  SessionStatus,
  {
    label: string;
    icon: typeof Clock;
    borderClass: string;
    badgeClassName: string;
  }
> = {
  NOT_STARTED: {
    label: 'Ожидает',
    icon: Clock,
    borderClass: 'border-l-blue-500',
    badgeClassName:
      'border-blue-500/30 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400',
  },
  IN_PROGRESS: {
    label: 'В работе',
    icon: PlayCircle,
    borderClass: 'border-l-amber-500',
    badgeClassName:
      'border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400',
  },
  COMPLETED: {
    label: 'Завершен',
    icon: CheckCircle2,
    borderClass: 'border-l-emerald-500',
    badgeClassName:
      'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400',
  },
  ABANDONED: {
    label: 'Прерван',
    icon: XCircle,
    borderClass: 'border-l-red-500',
    badgeClassName:
      'border-red-500/30 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400',
  },
  TIMED_OUT: {
    label: 'Время истекло',
    icon: AlertCircle,
    borderClass: 'border-l-gray-400',
    badgeClassName:
      'border-gray-500/30 bg-gray-50 dark:bg-gray-950/30 text-gray-700 dark:text-gray-400',
  },
};

/**
 * Compact History Test Card Component
 * Displays a previous attempt in a condensed row format for the collapsible history section
 */
export function HistoryTestCard({ session }: HistoryTestCardProps) {
  const config = STATUS_CONFIG[session.status];
  const StatusIcon = config.icon;

  // Determine action link
  const actionConfig = getActionConfig(session);

  return (
    <div
      className={cn(
        'flex items-center gap-3 py-2.5 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors',
        'border-l-2',
        config.borderClass
      )}
    >
      {/* Status Badge */}
      <Badge variant="outline" className={cn('gap-1 shrink-0 text-xs', config.badgeClassName)}>
        <StatusIcon className="size-3" />
        <span className="hidden xs:inline">{config.label}</span>
      </Badge>

      {/* Date */}
      <span className="text-xs text-muted-foreground shrink-0">
        {formatCompactDate(session.completedAt || session.startedAt || session.createdAt)}
      </span>

      {/* Score (if completed) */}
      {session.status === SessionStatus.COMPLETED && session.result && (
        <Badge
          variant="outline"
          className={cn(
            "gap-1 shrink-0 text-xs ml-auto",
            session.result.passed
              ? "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
              : "border-red-500/30 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
          )}
        >
          {session.result.passed ? (
            <Trophy className="size-3" />
          ) : (
            <Target className="size-3" />
          )}
          {Math.round(session.result.overallPercentage)}%
        </Badge>
      )}

      {/* Progress (if in progress) */}
      {session.status === SessionStatus.IN_PROGRESS && session.totalQuestions && (
        <span className="text-xs text-muted-foreground ml-auto">
          {session.answeredQuestions || 0}/{session.totalQuestions}
        </span>
      )}

      {/* Spacer for non-completed/non-in-progress */}
      {session.status !== SessionStatus.COMPLETED && session.status !== SessionStatus.IN_PROGRESS && (
        <span className="flex-1" />
      )}

      {/* Action Button */}
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="shrink-0 h-8 px-2 gap-1"
      >
        <Link href={actionConfig.href}>
          <actionConfig.icon className="size-3.5" />
          <span className="hidden sm:inline text-xs">{actionConfig.label}</span>
        </Link>
      </Button>
    </div>
  );
}

function getActionConfig(session: EnrichedTestSession) {
  switch (session.status) {
    case SessionStatus.NOT_STARTED:
      return {
        href: `/test-templates/${session.templateId}/start`,
        label: 'Начать',
        icon: PlayCircle,
      };
    case SessionStatus.IN_PROGRESS:
      return {
        href: `/test-templates/take/${session.id}`,
        label: 'Продолжить',
        icon: ArrowRight,
      };
    case SessionStatus.COMPLETED:
      return {
        href: `/test-templates/results/${session.id}`,
        label: 'Результаты',
        icon: Eye,
      };
    case SessionStatus.ABANDONED:
    case SessionStatus.TIMED_OUT:
      return {
        href: `/test-templates/${session.templateId}/start`,
        label: 'Повторить',
        icon: RotateCcw,
      };
    default:
      return {
        href: '#',
        label: 'Открыть',
        icon: ArrowRight,
      };
  }
}

/**
 * Format date in compact format (e.g., "12 дек" or "12 дек 2024")
 */
function formatCompactDate(dateString?: string): string {
  if (!dateString) return '--';

  const date = new Date(dateString);
  const now = new Date();
  const isCurrentYear = date.getFullYear() === now.getFullYear();

  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const day = date.getDate();
  const month = months[date.getMonth()];

  if (isCurrentYear) {
    return `${day} ${month}`;
  }

  return `${day} ${month} ${date.getFullYear()}`;
}

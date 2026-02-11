'use client';

import { CSSProperties, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  PlayCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Eye,
  Trophy,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EnrichedTestSession } from './MyTestsContent';
import { SessionStatus } from '@/types/domain';
import { CircularProgress, ScoreGauge } from './CircularProgress';
import { useTranslations, useFormatter } from 'next-intl';

interface TestCardProps {
  session: EnrichedTestSession;
  style?: CSSProperties;
  /** When true, renders a more compact card without template name (used inside TemplateGroup) */
  compact?: boolean;
}

// Status configuration with left border colors
const STATUS_CONFIG: Record<
  SessionStatus,
  {
    labelKey: 'status.notStarted' | 'status.inProgress' | 'status.completed' | 'status.abandoned' | 'status.timedOut';
    icon: typeof Clock;
    borderClass: string;
    badgeClassName: string;
    progressColor: string;
    progressTrack: string;
  }
> = {
  NOT_STARTED: {
    labelKey: 'status.notStarted',
    icon: Clock,
    borderClass: 'border-l-blue-500',
    badgeClassName:
      'border-blue-500/30 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400',
    progressColor: 'text-blue-500',
    progressTrack: 'text-blue-100 dark:text-blue-950',
  },
  IN_PROGRESS: {
    labelKey: 'status.inProgress',
    icon: PlayCircle,
    borderClass: 'border-l-amber-500',
    badgeClassName:
      'border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400',
    progressColor: 'text-amber-500',
    progressTrack: 'text-amber-100 dark:text-amber-950',
  },
  COMPLETED: {
    labelKey: 'status.completed',
    icon: CheckCircle2,
    borderClass: 'border-l-emerald-500',
    badgeClassName:
      'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400',
    progressColor: 'text-emerald-500',
    progressTrack: 'text-emerald-100 dark:text-emerald-950',
  },
  ABANDONED: {
    labelKey: 'status.abandoned',
    icon: XCircle,
    borderClass: 'border-l-red-500',
    badgeClassName:
      'border-red-500/30 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400',
    progressColor: 'text-red-500',
    progressTrack: 'text-red-100 dark:text-red-950',
  },
  TIMED_OUT: {
    labelKey: 'status.timedOut',
    icon: AlertCircle,
    borderClass: 'border-l-gray-400',
    badgeClassName:
      'border-gray-500/30 bg-gray-50 dark:bg-gray-950/30 text-gray-700 dark:text-gray-400',
    progressColor: 'text-gray-400',
    progressTrack: 'text-gray-100 dark:text-gray-900',
  },
};

/**
 * Test Card Component - Redesigned
 *
 * New layout features:
 * - Status-colored left border for quick visual scanning
 * - Action button in header row for immediate access
 * - Circular progress for in-progress tests
 * - Reduced redundancy and cleaner hierarchy
 */
export function TestCard({ session, style, compact = false }: TestCardProps) {
  const t = useTranslations('myTests');
  const format = useFormatter();
  const config = STATUS_CONFIG[session.status];
  const StatusIcon = config.icon;

  // Calculate progress for IN_PROGRESS sessions
  const progress = useMemo(() => {
    if (session.status !== SessionStatus.IN_PROGRESS || !session.totalQuestions) return null;

    const answeredCount = session.answeredQuestions || 0;
    const percentage = Math.round((answeredCount / session.totalQuestions) * 100);

    return { answeredCount, percentage };
  }, [session]);

  // Get action button configuration
  const actionConfig = useMemo(() => {
    switch (session.status) {
      case SessionStatus.NOT_STARTED:
        return {
          href: `/test-templates/${session.templateId}/start`,
          label: t('actions.start'),
          labelFull: t('actions.startTest'),
          icon: PlayCircle,
          variant: 'default' as const,
        };
      case SessionStatus.IN_PROGRESS:
        return {
          href: `/test-templates/take/${session.id}`,
          label: t('actions.continue'),
          labelFull: t('actions.continue'),
          icon: ArrowRight,
          variant: 'default' as const,
        };
      case SessionStatus.COMPLETED:
        return {
          href: `/test-templates/results/${session.id}`,
          label: t('actions.viewResults'),
          labelFull: t('actions.viewResults'),
          icon: Eye,
          variant: 'outline' as const,
        };
      case SessionStatus.ABANDONED:
      case SessionStatus.TIMED_OUT:
        return {
          href: `/test-templates/${session.templateId}/start`,
          label: t('actions.retry'),
          labelFull: t('actions.retry'),
          icon: RotateCcw,
          variant: 'secondary' as const,
        };
      default:
        return {
          href: '#',
          label: t('actions.open'),
          labelFull: t('actions.open'),
          icon: ArrowRight,
          variant: 'outline' as const,
        };
    }
  }, [session, t]);

  const ActionIcon = actionConfig.icon;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border bg-card transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5',
        'border-l-4 max-w-full',
        config.borderClass
      )}
      style={style}
    >
      <div className="p-2.5 sm:p-4 min-w-0">
        {/* Header Row: Status Badge + Action Button */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
          <Badge variant="outline" className={cn('gap-1 sm:gap-1.5 text-xs font-medium', config.badgeClassName)}>
            <StatusIcon className="size-3 sm:size-3.5" />
            <span className="hidden xs:inline">{t(config.labelKey)}</span>
          </Badge>

          <Button
            asChild
            variant={actionConfig.variant}
            size="sm"
            className="shrink-0 group h-7 sm:h-8 px-2 sm:px-3"
          >
            <Link
              href={actionConfig.href}
              aria-label={`${actionConfig.labelFull} - ${session.templateName}`}
            >
              <ActionIcon className="size-3.5 sm:mr-1.5 transition-transform group-hover:scale-110" />
              <span className="hidden sm:inline">{actionConfig.label}</span>
            </Link>
          </Button>
        </div>

        {/* Template Name (only in non-compact mode) */}
        {!compact && (
          <h3 className="font-semibold text-sm sm:text-base line-clamp-2 sm:line-clamp-1 mb-2">{session.templateName}</h3>
        )}

        {/* Content Row: Progress/Score + Metadata - Stack on mobile for complex content */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
          {/* IN_PROGRESS: Circular Progress - uses CSS to adjust visual density */}
          {session.status === SessionStatus.IN_PROGRESS && progress && (
            <div className="flex items-center gap-2 sm:gap-3">
              <CircularProgress
                value={progress.percentage}
                size={40}
                strokeWidth={3}
                progressClassName={config.progressColor}
                trackClassName={config.progressTrack}
              />
              <div>
                <p className="text-xs sm:text-sm font-medium tabular-nums">
                  {progress.answeredCount} {t('of')} {session.totalQuestions}
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">{t('questions')}</p>
              </div>
            </div>
          )}

          {/* COMPLETED: Score Gauge - uses responsive sizing internally */}
          {session.status === SessionStatus.COMPLETED && session.result && (
            <ScoreGauge
              score={session.result.overallPercentage ?? 0}
              passed={session.result.passed ?? false}
              size={40}
              showLabel={true}
            />
          )}

          {/* NOT_STARTED: Question count - simplified on mobile */}
          {session.status === SessionStatus.NOT_STARTED && session.totalQuestions && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span className="tabular-nums">{session.totalQuestions} {t('questionsShort')}</span>
              <span className="text-muted-foreground/50 hidden xs:inline">|</span>
              <span className="hidden xs:inline">{formatRelativeDate(session.createdAt, format)}</span>
            </div>
          )}

          {/* ABANDONED/TIMED_OUT: Show date - shorter on mobile */}
          {(session.status === SessionStatus.ABANDONED ||
            session.status === SessionStatus.TIMED_OUT) && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span className="truncate">
                <span className="hidden xs:inline">{t(config.labelKey)}: </span>
                {formatRelativeDate(session.completedAt || session.createdAt, format)}
              </span>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Score Badge for completed (compact additional indicator) */}
          {session.status === SessionStatus.COMPLETED && session.result && compact && (
            <Badge
              variant="outline"
              className={cn(
                'gap-1 text-xs shrink-0',
                session.result.passed
                  ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                  : 'border-red-500/30 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
              )}
            >
              {session.result.passed ? <Trophy className="size-3" /> : <Target className="size-3" />}
              {Math.round(session.result.overallPercentage ?? 0)}%
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Format date as relative time using intl formatter
 */
function formatRelativeDate(dateString?: string, formatter?: ReturnType<typeof useFormatter>): string {
  if (!dateString) return '—';

  const date = new Date(dateString);

  if (formatter) {
    return formatter.relativeTime(date);
  }

  // Fallback
  return date.toLocaleDateString();
}

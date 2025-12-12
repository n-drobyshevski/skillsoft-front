'use client';

import { CSSProperties, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  PlayCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  ArrowRight,
  RotateCcw,
  Eye,
  Trophy,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EnrichedTestSession } from './MyTestsContent';
import { SessionStatus } from '@/types/domain';

interface TestCardProps {
  session: EnrichedTestSession;
  style?: CSSProperties;
}

// Status configuration
const STATUS_CONFIG: Record<SessionStatus, {
  label: string;
  icon: typeof Clock;
  className: string;
  badgeClassName: string;
}> = {
  NOT_STARTED: {
    label: 'Ожидает',
    icon: Clock,
    className: 'border-blue-500/20 hover:border-blue-500/40',
    badgeClassName: 'border-blue-500/30 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400',
  },
  IN_PROGRESS: {
    label: 'В работе',
    icon: PlayCircle,
    className: 'border-amber-500/20 hover:border-amber-500/40',
    badgeClassName: 'border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400',
  },
  COMPLETED: {
    label: 'Завершен',
    icon: CheckCircle2,
    className: 'border-emerald-500/20 hover:border-emerald-500/40',
    badgeClassName: 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400',
  },
  ABANDONED: {
    label: 'Прерван',
    icon: XCircle,
    className: 'border-red-500/20 hover:border-red-500/40',
    badgeClassName: 'border-red-500/30 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400',
  },
  TIMED_OUT: {
    label: 'Время истекло',
    icon: AlertCircle,
    className: 'border-gray-500/20 hover:border-gray-500/40',
    badgeClassName: 'border-gray-500/30 bg-gray-50 dark:bg-gray-950/30 text-gray-700 dark:text-gray-400',
  },
};

/**
 * Test Card Component
 * Displays a single test session with status-specific styling and actions
 */
export function TestCard({ session, style }: TestCardProps) {
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
          label: 'Начать тест',
          icon: PlayCircle,
          variant: 'default' as const,
        };
      case SessionStatus.IN_PROGRESS:
        return {
          href: `/test-templates/take/${session.id}`,
          label: 'Продолжить',
          icon: ArrowRight,
          variant: 'default' as const,
        };
      case SessionStatus.COMPLETED:
        return {
          href: `/test-templates/results/${session.id}`,
          label: 'Результаты',
          icon: Eye,
          variant: 'outline' as const,
        };
      case SessionStatus.ABANDONED:
      case SessionStatus.TIMED_OUT:
        return {
          href: `/test-templates/${session.templateId}/start`,
          label: 'Повторить',
          icon: RotateCcw,
          variant: 'secondary' as const,
        };
      default:
        return {
          href: '#',
          label: 'Подробнее',
          icon: ArrowRight,
          variant: 'outline' as const,
        };
    }
  }, [session]);

  const ActionIcon = actionConfig.icon;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fadeInUp",
        config.className
      )}
      style={style}
    >
      <CardHeader className="pb-3">
        {/* Status Row */}
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <Badge variant="outline" className={cn("gap-1.5", config.badgeClassName)}>
            <StatusIcon className="size-3" />
            {config.label}
          </Badge>

          {/* Score Badge for completed tests */}
          {session.status === SessionStatus.COMPLETED && session.result && (
            <Badge
              variant="outline"
              className={cn(
                "gap-1.5",
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
        </div>

        {/* Template Name */}
        <CardTitle className="text-lg sm:text-xl line-clamp-2 mt-2">
          {session.templateName}
        </CardTitle>

        {/* Description placeholder - can be added if templates have descriptions */}
        {session.totalQuestions && (
          <CardDescription className="line-clamp-1">
            {session.totalQuestions} вопросов
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="pb-3 space-y-3">
        {/* Progress Bar (IN_PROGRESS only) */}
        {session.status === SessionStatus.IN_PROGRESS && progress && (
          <div className="space-y-2">
            <Progress value={progress.percentage} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {progress.answeredCount}/{session.totalQuestions} вопросов ({progress.percentage}%)
            </p>
          </div>
        )}

        {/* Score Display (COMPLETED only) */}
        {session.status === SessionStatus.COMPLETED && session.result && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className={cn(
              "text-2xl sm:text-3xl font-bold tabular-nums",
              session.result.passed
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            )}>
              {Math.round(session.result.overallPercentage)}%
            </div>
            <div className="text-sm">
              {session.result.passed ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="size-4" />
                  Тест пройден
                </span>
              ) : (
                <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                  <XCircle className="size-4" />
                  Не пройден
                </span>
              )}
            </div>
          </div>
        )}

        {/* Timeline Metadata */}
        <div className="flex flex-col sm:flex-row gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3" />
            <span>
              {session.status === SessionStatus.COMPLETED ? 'Завершен' : 'Создан'}:{' '}
              {formatRelativeDate(session.status === SessionStatus.COMPLETED ? session.completedAt : session.createdAt)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          asChild
          variant={actionConfig.variant}
          className="w-full group touch-manipulation"
        >
          <Link href={actionConfig.href}>
            <ActionIcon className="size-4 mr-2 transition-transform group-hover:translate-x-0.5" />
            {actionConfig.label}
            <ArrowRight className="size-4 ml-auto opacity-50 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * Format date as relative time (e.g., "2 дня назад")
 */
function formatRelativeDate(dateString?: string): string {
  if (!dateString) return '—';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      if (diffMinutes < 5) return 'только что';
      return `${diffMinutes} мин назад`;
    }
    return `${diffHours} ч назад`;
  }

  if (diffDays === 1) return 'вчера';
  if (diffDays < 7) return `${diffDays} дн назад`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} нед назад`;
  }

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

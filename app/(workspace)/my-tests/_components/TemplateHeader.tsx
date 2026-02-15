'use client';

import { Badge } from '@/components/ui/badge';
import { Trophy, History, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EnrichedTestSession } from './MyTestsContent';
import { SessionStatus } from '@/types/domain';
import { useTranslations } from 'next-intl';

export interface TemplateStats {
  templateId: string;
  templateName: string;
  totalAttempts: number;
  completedAttempts: number;
  bestScore: number | null;
  latestDate: string;
  hasInProgress: boolean;
  hasPending: boolean;
}

interface TemplateHeaderProps {
  stats: TemplateStats;
}

/**
 * Template Header Component
 * Displays template name with aggregate statistics
 */
export function TemplateHeader({ stats }: TemplateHeaderProps) {
  const t = useTranslations('myTests');
  const showBestScore = stats.bestScore !== null && stats.completedAttempts > 0;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full py-1">
      {/* Template Name */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base sm:text-lg truncate pr-2">
          {stats.templateName}
        </h3>
      </div>

      {/* Stats Row - Mobile stacked, Desktop inline */}
      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        {/* Attempts Badge */}
        <Badge
          variant="secondary"
          className="gap-1 font-normal"
        >
          <History className="size-3" />
          {t('attempts', { count: stats.totalAttempts })}
        </Badge>

        {/* Best Score Badge (if completed any) */}
        {showBestScore && (
          <Badge
            variant="outline"
            className={cn(
              "gap-1 font-normal",
              stats.bestScore! >= 70
                ? "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                : "border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
            )}
          >
            <Trophy className="size-3" />
            {Math.round(stats.bestScore!)}%
          </Badge>
        )}

        {/* Status Indicator */}
        {stats.hasInProgress && (
          <Badge
            variant="outline"
            className="gap-1 font-normal border-blue-500/30 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
          >
            <TrendingUp className="size-3" />
            {t('status.inProgress')}
          </Badge>
        )}

        {stats.hasPending && !stats.hasInProgress && (
          <Badge
            variant="outline"
            className="gap-1 font-normal border-slate-500/30 bg-slate-50 dark:bg-slate-950/30 text-slate-700 dark:text-slate-400"
          >
            {t('status.notStarted')}
          </Badge>
        )}
      </div>
    </div>
  );
}

/**
 * Calculate aggregate stats for a template group
 */
export function calculateTemplateStats(sessions: EnrichedTestSession[]): TemplateStats {
  if (sessions.length === 0) {
    throw new Error('Cannot calculate stats for empty sessions array');
  }

  const first = sessions[0];
  const completed = sessions.filter(s => s.status === SessionStatus.COMPLETED);

  // Find best score from completed sessions with results
  const scores = completed
    .filter(s => s.result?.overallPercentage != null)
    .map(s => s.result!.overallPercentage!);
  const bestScore = scores.length > 0 ? Math.max(...scores) : null;

  // Find latest activity date
  const dates = sessions.map(s => {
    if (s.completedAt) return new Date(s.completedAt).getTime();
    if (s.startedAt) return new Date(s.startedAt).getTime();
    return new Date(s.createdAt).getTime();
  });
  const latestDate = new Date(Math.max(...dates)).toISOString();

  return {
    templateId: first.templateId,
    templateName: first.templateName,
    totalAttempts: sessions.length,
    completedAttempts: completed.length,
    bestScore,
    latestDate,
    hasInProgress: sessions.some(s => s.status === SessionStatus.IN_PROGRESS),
    hasPending: sessions.some(s => s.status === SessionStatus.NOT_STARTED),
  };
}


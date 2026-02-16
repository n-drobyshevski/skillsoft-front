'use client';

import { useTranslations } from 'next-intl';
import { Trophy, Heart, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CandidateSummary } from '@/types/domain';
import { CANDIDATE_COLORS } from './ComparisonView';

interface RankingCardsProps {
  candidates: CandidateSummary[];
  colorMap: Map<string, number>;
  /** When true, adapts labels for JOB_FIT context. */
  isJobFit?: boolean;
}

/** Medal colors for ranks 1-3. */
const RANK_STYLES: Record<number, string> = {
  1: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300',
  2: 'bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300 border-slate-300',
  3: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-300',
};

/**
 * Horizontal scrollable ranking cards on mobile, grid on desktop.
 * Each card shows rank, name, overall percentage, pass/fail, and key metrics.
 */
export function RankingCards({ candidates, colorMap, isJobFit = false }: RankingCardsProps) {
  const t = useTranslations('results.comparison');
  const overallLabel = isJobFit ? t('jobFit.overallFit') : t('overallFit');

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:overflow-visible lg:pb-0">
      {candidates.map((candidate) => {
        const colorIdx = colorMap.get(candidate.resultId) ?? 0;
        const color = CANDIDATE_COLORS[colorIdx];
        const rankStyle = RANK_STYLES[candidate.overallRank];

        return (
          <Card
            key={candidate.resultId}
            className={cn(
              'min-w-[260px] snap-start shrink-0 lg:min-w-0 lg:shrink',
              'border-l-4 transition-shadow hover:shadow-md',
              color.border,
            )}
          >
            <CardContent className="p-4 space-y-3">
              {/* Top row: rank + name + pass/fail */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Badge
                    variant="outline"
                    className={cn(
                      'shrink-0 text-xs font-bold tabular-nums',
                      rankStyle ?? 'bg-muted text-muted-foreground',
                    )}
                  >
                    <Trophy className="h-3 w-3 mr-1" />
                    {t('rank', { rank: candidate.overallRank })}
                  </Badge>
                  <span className="text-sm font-semibold truncate">
                    {candidate.displayName}
                  </span>
                </div>
                <Badge
                  variant={candidate.passed ? 'default' : 'secondary'}
                  className={cn(
                    'shrink-0 text-[10px]',
                    candidate.passed
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
                  )}
                >
                  {candidate.passed ? t('recommended') : t('notRecommended')}
                </Badge>
              </div>

              {/* Overall percentage */}
              <div className="text-center py-2">
                <div
                  className={cn(
                    'text-3xl font-extrabold tabular-nums',
                    color.text,
                  )}
                >
                  {Math.round(candidate.overallPercentage)}%
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                  {overallLabel}
                </p>
              </div>

              {/* Key metrics */}
              <div className="grid grid-cols-2 gap-2">
                <MetricBadge
                  icon={<Users className="h-3 w-3" />}
                  label={t('diversityContribution')}
                  value={`${Math.round(candidate.diversityRatio * 100)}%`}
                />
                {candidate.personalityCompatibility !== null && (
                  <MetricBadge
                    icon={<Heart className="h-3 w-3" />}
                    label={t('personalityFit')}
                    value={`${Math.round(candidate.personalityCompatibility)}%`}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/** Small metric display used inside ranking cards. */
function MetricBadge({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5 p-2 bg-muted/40 rounded-lg">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[9px] text-muted-foreground uppercase tracking-wide truncate">
          {label}
        </p>
        <p className="text-xs font-bold tabular-nums">{value}</p>
      </div>
    </div>
  );
}

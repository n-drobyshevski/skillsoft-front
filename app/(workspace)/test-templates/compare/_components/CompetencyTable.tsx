'use client';

import { useTranslations } from 'next-intl';
import { Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CandidateSummary, CompetencyComparisonEntry } from '@/types/domain';
import { CANDIDATE_COLORS } from './ComparisonView';

interface CompetencyTableProps {
  candidates: CandidateSummary[];
  competencyComparison: CompetencyComparisonEntry[];
  colorMap: Map<string, number>;
}

/** Returns Tailwind classes for a percentage cell background. */
function getScoreCellClasses(percentage: number): string {
  if (percentage >= 60) {
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300';
  }
  if (percentage >= 30) {
    return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300';
  }
  return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300';
}

/**
 * Competency comparison table with color-coded score cells.
 * Rows are competencies, columns are team saturation + one per candidate.
 * Mobile: horizontal scroll with sticky first column.
 */
export function CompetencyTable({
  candidates,
  competencyComparison,
  colorMap,
}: CompetencyTableProps) {
  const t = useTranslations('results.comparison');

  if (competencyComparison.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <CardTitle className="text-sm sm:text-lg font-semibold flex items-center gap-2">
          <Target className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          {t('competencyBreakdown')}
        </CardTitle>
        <CardDescription className="text-[10px] sm:text-sm">
          {t('competencyBreakdownDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:px-6 pb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="sticky left-0 z-10 bg-background px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[140px]">
                  {t('competency')}
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[70px]">
                  {t('teamSaturation')}
                </th>
                {candidates.map((candidate) => {
                  const colorIdx = colorMap.get(candidate.resultId) ?? 0;
                  const color = CANDIDATE_COLORS[colorIdx];
                  return (
                    <th
                      key={candidate.resultId}
                      className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider min-w-[90px]"
                    >
                      <span className={cn('inline-block', color.text)}>
                        {candidate.displayName}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {competencyComparison.map((entry) => (
                <tr
                  key={entry.competencyId}
                  className={cn(
                    'border-b last:border-b-0 hover:bg-muted/30 transition-colors',
                    entry.isTeamGap && 'border-l-2 border-l-amber-400',
                  )}
                >
                  {/* Competency name (sticky) */}
                  <td className="sticky left-0 z-10 bg-background px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium truncate max-w-[180px]">
                        {entry.competencyName}
                      </span>
                      {entry.isTeamGap && (
                        <Badge
                          variant="outline"
                          className="text-[9px] shrink-0 bg-amber-50 text-amber-600 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300"
                        >
                          {t('teamGap')}
                        </Badge>
                      )}
                    </div>
                  </td>

                  {/* Team saturation */}
                  <td className="px-3 py-2.5 text-center">
                    {entry.teamSaturation !== null ? (
                      <span className="text-xs font-medium tabular-nums text-muted-foreground">
                        {Math.round(entry.teamSaturation)}%
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">--</span>
                    )}
                  </td>

                  {/* Candidate scores */}
                  {candidates.map((candidate) => {
                    const score = entry.candidateScores[candidate.resultId];
                    const isBest = entry.bestCandidateId === candidate.resultId;

                    if (score === undefined || score === null) {
                      return (
                        <td key={candidate.resultId} className="px-3 py-2.5 text-center">
                          <span className="text-xs text-muted-foreground/50">--</span>
                        </td>
                      );
                    }

                    const rounded = Math.round(score);

                    return (
                      <td key={candidate.resultId} className="px-3 py-2.5 text-center">
                        <span
                          className={cn(
                            'inline-block px-2 py-0.5 rounded-md text-xs tabular-nums',
                            getScoreCellClasses(rounded),
                            isBest && 'font-bold ring-1 ring-current/20',
                          )}
                        >
                          {rounded}%
                          {isBest && (
                            <span className="ml-1 text-[9px] opacity-70">
                              {t('best')}
                            </span>
                          )}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

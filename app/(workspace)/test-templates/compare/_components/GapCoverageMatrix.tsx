'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Target, Check, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { CandidateSummary, GapCoverageEntry } from '@/types/domain';
import { CANDIDATE_COLORS } from './ComparisonView';

interface GapCoverageMatrixProps {
  candidates: CandidateSummary[];
  gapCoverageMatrix: GapCoverageEntry[];
  colorMap: Map<string, number>;
}

/**
 * Gap coverage matrix showing which candidates can fill team skill gaps.
 * Gaps are sorted by team saturation ascending (most critical first).
 * Each gap row shows: competency name, team %, coverage per candidate,
 * and a progress bar indicating how many candidates can fill the gap.
 */
export function GapCoverageMatrix({
  candidates,
  gapCoverageMatrix,
  colorMap,
}: GapCoverageMatrixProps) {
  const t = useTranslations('results.comparison');

  // Sort gaps by team saturation ascending (most critical first)
  const sortedGaps = useMemo(
    () => [...gapCoverageMatrix].sort((a, b) => a.teamSaturation - b.teamSaturation),
    [gapCoverageMatrix],
  );

  if (sortedGaps.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <CardTitle className="text-sm sm:text-lg font-semibold flex items-center gap-2">
          <Target className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          {t('gapCoverage')}
        </CardTitle>
        <CardDescription className="text-[10px] sm:text-sm">
          {t('gapCoverageDescription')}
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
                      className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider min-w-[80px]"
                    >
                      <span className={cn('inline-block', color.text)}>
                        {candidate.displayName}
                      </span>
                    </th>
                  );
                })}
                <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[100px]">
                  {t('score')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedGaps.map((gap) => {
                // Count how many candidates can fill this gap (coverage > 0)
                const fillingCount = candidates.filter(
                  (c) => (gap.candidateCoverage[c.resultId] ?? 0) > 0,
                ).length;
                const coveragePercent =
                  candidates.length > 0
                    ? Math.round((fillingCount / candidates.length) * 100)
                    : 0;

                return (
                  <tr
                    key={gap.competencyId}
                    className="border-b last:border-b-0 hover:bg-muted/30 transition-colors border-l-2 border-l-amber-400"
                  >
                    {/* Gap name */}
                    <td className="sticky left-0 z-10 bg-background px-3 py-2.5">
                      <span className="text-sm font-medium truncate max-w-[180px] inline-block">
                        {gap.competencyName}
                      </span>
                    </td>

                    {/* Team saturation */}
                    <td className="px-3 py-2.5 text-center">
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-red-50 text-red-600 border-red-300 dark:bg-red-900/30 dark:text-red-300"
                      >
                        {Math.round(gap.teamSaturation)}%
                      </Badge>
                    </td>

                    {/* Candidate coverage */}
                    {candidates.map((candidate) => {
                      const coverage = gap.candidateCoverage[candidate.resultId] ?? 0;
                      const isBest = gap.bestCandidateId === candidate.resultId;
                      const fills = coverage > 0;

                      return (
                        <td key={candidate.resultId} className="px-3 py-2.5 text-center">
                          {fills ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <Check
                                className={cn(
                                  'h-4 w-4',
                                  isBest
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-emerald-500/70',
                                )}
                              />
                              {isBest && (
                                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">
                                  {t('bestForGap')}
                                </span>
                              )}
                            </div>
                          ) : (
                            <Minus className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                          )}
                        </td>
                      );
                    })}

                    {/* Coverage progress */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2 min-w-[80px]">
                        <Progress value={coveragePercent} className="h-1.5 flex-1" />
                        <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                          {fillingCount}/{candidates.length}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

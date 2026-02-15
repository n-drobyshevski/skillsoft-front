'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Puzzle, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { CandidatePairComplementarity } from '@/types/domain';
import { CANDIDATE_COLORS } from './ComparisonView';

interface ComplementarityPairsProps {
  complementarityPairs: CandidatePairComplementarity[];
  colorMap: Map<string, number>;
}

/**
 * Shows candidate pairs sorted by complementarity score descending.
 * Each pair displays two candidate names, a progress bar for their combined score,
 * and how many team gaps they cover together.
 * The top pair receives a highlight accent.
 */
export function ComplementarityPairs({
  complementarityPairs,
  colorMap,
}: ComplementarityPairsProps) {
  const t = useTranslations('results.comparison');

  // Sort by complementarityScore descending
  const sortedPairs = useMemo(
    () => [...complementarityPairs].sort((a, b) => b.complementarityScore - a.complementarityScore),
    [complementarityPairs],
  );

  if (sortedPairs.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <CardTitle className="text-sm sm:text-lg font-semibold flex items-center gap-2">
          <Puzzle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          {t('complementarity')}
        </CardTitle>
        <CardDescription className="text-[10px] sm:text-sm">
          {t('complementarityDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 space-y-3">
        {sortedPairs.map((pair, index) => {
          const isTop = index === 0;
          const colorIdxA = colorMap.get(pair.candidateA) ?? 0;
          const colorIdxB = colorMap.get(pair.candidateB) ?? 0;
          const colorA = CANDIDATE_COLORS[colorIdxA];
          const colorB = CANDIDATE_COLORS[colorIdxB];

          return (
            <div
              key={`${pair.candidateA}-${pair.candidateB}`}
              className={cn(
                'p-3 sm:p-4 rounded-xl border transition-colors',
                isTop
                  ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/10'
                  : 'bg-muted/20 border-border/50 hover:bg-muted/40',
              )}
            >
              {/* Candidate pair names */}
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                  <span className={cn('text-sm font-semibold', colorA.text)}>
                    {pair.candidateAName}
                  </span>
                  <span className="text-xs text-muted-foreground">+</span>
                  <span className={cn('text-sm font-semibold', colorB.text)}>
                    {pair.candidateBName}
                  </span>
                </div>
                {isTop && (
                  <span className="ml-auto text-[10px] font-semibold text-primary uppercase tracking-wider shrink-0">
                    {t('recommended')}
                  </span>
                )}
              </div>

              {/* Score progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {t('complementarityScore', {
                      score: Math.round(pair.complementarityScore),
                    })}
                  </span>
                  <span className="text-sm font-bold tabular-nums">
                    {Math.round(pair.complementarityScore)}%
                  </span>
                </div>
                <Progress
                  value={pair.complementarityScore}
                  className={cn('h-2', isTop && '[&>[data-slot=progress-indicator]]:bg-primary')}
                />
              </div>

              {/* Gaps covered text */}
              <p className="text-xs text-muted-foreground mt-2">
                {pair.totalTeamGaps > 0
                  ? t('gapsCovered', {
                      covered: pair.combinedGapsCovered,
                      total: pair.totalTeamGaps,
                    })
                  : t('noGaps')}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

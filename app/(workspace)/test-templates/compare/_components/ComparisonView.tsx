'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CandidateComparison } from '@/types/domain';

import { RankingCards } from './RankingCards';
import { ComparisonRadar } from './ComparisonRadar';
import { CompetencyTable } from './CompetencyTable';
import { GapCoverageMatrix } from './GapCoverageMatrix';
import { ComplementarityPairs } from './ComplementarityPairs';

/**
 * Color palette for up to 5 candidates.
 * Each entry provides Tailwind classes and a hex fill for Recharts.
 */
export const CANDIDATE_COLORS = [
  { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-500', fill: '#3b82f6' },
  { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-500', fill: '#10b981' },
  { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-500', fill: '#f59e0b' },
  { bg: 'bg-violet-500', text: 'text-violet-600', border: 'border-violet-500', fill: '#8b5cf6' },
  { bg: 'bg-rose-500', text: 'text-rose-600', border: 'border-rose-500', fill: '#f43f5e' },
] as const;

interface ComparisonViewProps {
  data: CandidateComparison;
}

/**
 * Main orchestrator for the candidate comparison page.
 * Renders all sections in order: Header, RankingCards, ComparisonRadar,
 * CompetencyTable, GapCoverageMatrix, and ComplementarityPairs.
 */
export function ComparisonView({ data }: ComparisonViewProps) {
  const t = useTranslations('results.comparison');
  const router = useRouter();

  const {
    templateName,
    targetRole,
    teamSize,
    candidates,
    competencyComparison,
    gapCoverageMatrix,
    complementarityPairs,
  } = data;

  // Build a map from resultId to color index for consistent coloring
  const colorMap = new Map<string, number>();
  const sortedCandidates = [...candidates].sort(
    (a, b) => a.overallRank - b.overallRank,
  );
  sortedCandidates.forEach((c, i) => {
    colorMap.set(c.resultId, i % CANDIDATE_COLORS.length);
  });

  if (candidates.length === 0) {
    return (
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <p className="text-muted-foreground">{t('noCandidates')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-3 sm:py-4 md:py-8">
      <div className="container max-w-7xl mx-auto px-2 sm:px-4 space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="animate-fadeInUp-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
                <h1 className="text-lg sm:text-2xl font-bold tracking-tight">
                  {t('title')}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('subtitle', { count: candidates.length })}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="self-start sm:self-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              {t('back')}
            </Button>
          </div>

          {/* Team context badges */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge variant="secondary" className="text-xs">
              {templateName}
            </Badge>
            {targetRole && (
              <Badge variant="outline" className="text-xs">
                {t('targetRole', { role: targetRole })}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {t('teamSize', { count: teamSize })}
            </Badge>
          </div>
        </div>

        {/* Ranking Cards */}
        <div className="animate-fadeInUp-1">
          <RankingCards
            candidates={sortedCandidates}
            colorMap={colorMap}
          />
        </div>

        {/* Comparison Radar */}
        <div className="animate-fadeInUp-2">
          <ComparisonRadar
            candidates={sortedCandidates}
            competencyComparison={competencyComparison}
            colorMap={colorMap}
          />
        </div>

        {/* Competency Table */}
        <div className="animate-fadeInUp-3">
          <CompetencyTable
            candidates={sortedCandidates}
            competencyComparison={competencyComparison}
            colorMap={colorMap}
          />
        </div>

        {/* Gap Coverage Matrix */}
        {gapCoverageMatrix.length > 0 && (
          <div className="animate-fadeInUp-4">
            <GapCoverageMatrix
              candidates={sortedCandidates}
              gapCoverageMatrix={gapCoverageMatrix}
              colorMap={colorMap}
            />
          </div>
        )}

        {/* Complementarity Pairs */}
        {complementarityPairs.length > 0 && (
          <div className="animate-fadeInUp-5">
            <ComplementarityPairs
              complementarityPairs={complementarityPairs}
              colorMap={colorMap}
            />
          </div>
        )}
      </div>
    </div>
  );
}

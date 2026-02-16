'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Users, ArrowLeft, Info, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

/** Comparison goal context inferred from response data. */
export type ComparisonGoalContext = 'TEAM_FIT' | 'JOB_FIT';

/**
 * Infer the comparison goal context from the response data.
 * JOB_FIT: teamAvailable is false and teamId is absent/empty.
 * Otherwise defaults to TEAM_FIT.
 */
export function inferGoalContext(data: CandidateComparison): ComparisonGoalContext {
  if (data.goal === 'JOB_FIT') return 'JOB_FIT';
  if (data.goal === 'TEAM_FIT') return 'TEAM_FIT';
  // Infer from structure when goal is not explicitly set
  if (!data.teamAvailable && (!data.teamId || data.teamId.trim() === '')) {
    return 'JOB_FIT';
  }
  return 'TEAM_FIT';
}

interface ComparisonViewProps {
  data: CandidateComparison;
}

/**
 * Main orchestrator for the candidate comparison page.
 * Detects assessment goal context (TEAM_FIT vs JOB_FIT) and adjusts
 * section titles, visibility, and labels accordingly.
 *
 * Renders: Header, RankingCards, ComparisonRadar,
 * CompetencyTable, GapCoverageMatrix, and ComplementarityPairs (TEAM_FIT only).
 */
export function ComparisonView({ data }: ComparisonViewProps) {
  const t = useTranslations('results.comparison');
  const router = useRouter();

  const {
    templateName,
    targetRole,
    teamSize,
    teamAvailable,
    candidates,
    competencyComparison,
    gapCoverageMatrix,
    complementarityPairs,
  } = data;

  const goalContext = useMemo(() => inferGoalContext(data), [data]);
  const isJobFit = goalContext === 'JOB_FIT';

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
                {isJobFit ? (
                  <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
                ) : (
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
                )}
                <h1 className="text-lg sm:text-2xl font-bold tracking-tight">
                  {t('title')}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {isJobFit
                  ? t('jobFit.subtitle', { count: candidates.length })
                  : t('subtitle', { count: candidates.length })}
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

          {/* Context badges */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge variant="secondary" className="text-xs">
              {templateName}
            </Badge>
            {targetRole && (
              <Badge variant="outline" className="text-xs">
                {t('targetRole', { role: targetRole })}
              </Badge>
            )}
            {!isJobFit && teamAvailable && (
              <Badge variant="outline" className="text-xs">
                {t('teamSize', { count: teamSize })}
              </Badge>
            )}
            {isJobFit && (
              <Badge variant="outline" className="text-xs border-blue-300 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
                Job Fit
              </Badge>
            )}
          </div>

          {/* Team unavailable banner (only for TEAM_FIT context) */}
          {!isJobFit && !teamAvailable && (
            <Alert variant="default" className="mt-3 border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-xs text-amber-700 dark:text-amber-300">
                {t('teamUnavailable')}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Ranking Cards */}
        <div className="animate-fadeInUp-1">
          <RankingCards
            candidates={sortedCandidates}
            colorMap={colorMap}
            isJobFit={isJobFit}
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
            isJobFit={isJobFit}
          />
        </div>

        {/* Gap Coverage Matrix / Benchmark Gap Analysis */}
        {gapCoverageMatrix.length > 0 && (
          <div className="animate-fadeInUp-4">
            <GapCoverageMatrix
              candidates={sortedCandidates}
              gapCoverageMatrix={gapCoverageMatrix}
              colorMap={colorMap}
              isJobFit={isJobFit}
            />
          </div>
        )}

        {/* Complementarity Pairs (TEAM_FIT only - not applicable for JOB_FIT) */}
        {!isJobFit && complementarityPairs.length > 0 && (
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

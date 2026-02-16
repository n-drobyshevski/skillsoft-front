'use client';

import { useMemo, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart3,
  Award,
  AlertTriangle,
  CheckCircle2,
  Target,
  Briefcase
} from 'lucide-react';
import CompetencyRadarChart from '@/components/data-display/charts/CompetencyRadarChart';
import { JobFitHero } from './JobFitHero';
import { CompetencyProfile } from '../shared/CompetencyProfile';
import { ActionButtonsBar } from '../shared/ActionButtonsBar';
import { BaseResultViewProps } from '../shared/types';
import {
  GapAnalysisChart,
  DevelopmentRecommendations,
} from '@/components/results';
import {
  toGapData,
  generateRecommendationsFromGaps,
} from '@/lib/result-transformers';
import type { GapDataPoint } from '@/types/results';

/**
 * Job Fit Result View for Scenario B (O*NET Benchmark Comparison).
 *
 * Key features:
 * - Score percentage circle in hero (appropriate for job fit)
 * - Pass/fail badge (Qualified/Not Qualified)
 * - Gap analysis visualization comparing to job benchmarks
 * - O*NET job context display
 * - Green/Amber color palette for pass/fail states
 */
export function JobFitResultView({ result, template }: BaseResultViewProps) {
  const onetSocCode = template.blueprint?.onet_soc_code;
  const isPassed = result.passed ?? false;
  const passingScore = template.passingScore || 70;

  const competencyScores = result.competencyScores ?? [];

  // V2: State and ref for gap bar click -> competency profile scroll/expand
  const [focusedCompetencyId, setFocusedCompetencyId] = useState<string | null>(null);
  const competencyProfileRef = useRef<HTMLDivElement>(null);

  // Transform data for enhanced gap analysis chart
  const gapData = useMemo(() => {
    return toGapData(competencyScores, { defaultTarget: passingScore });
  }, [competencyScores, passingScore]);

  // Generate development recommendations from gaps
  const recommendations = useMemo(() => {
    return generateRecommendationsFromGaps(gapData, {
      minGap: 5,
      maxRecommendations: 5,
    });
  }, [gapData]);

  // Prepare data for radar chart (V1: includes CI bands)
  const radarData = useMemo(() => {
    return competencyScores.map(cs => ({
      subject: cs.competencyName,
      A: Math.round(cs.percentage),
      fullMark: 100,
      ciLower: cs.ciLower != null ? Math.round(cs.ciLower) : undefined,
      ciUpper: cs.ciUpper != null ? Math.round(cs.ciUpper) : undefined,
    }));
  }, [competencyScores]);

  // Calculate insights
  const insights = useMemo(() => {
    const strengths = competencyScores.filter(c => c.percentage >= passingScore);
    const gaps = competencyScores.filter(c => c.percentage < passingScore);
    const avgScore = competencyScores.length > 0
      ? Math.round(competencyScores.reduce((sum, c) => sum + c.percentage, 0) / competencyScores.length)
      : 0;

    return { strengths, gaps, avgScore };
  }, [competencyScores, passingScore]);

  // V2: Handler for gap bar click -> scroll to competency profile and expand
  const handleGapBarClick = useCallback((dataPoint: GapDataPoint) => {
    const match = competencyScores.find(
      cs => cs.competencyName === dataPoint.name
    );
    if (match) {
      setFocusedCompetencyId(match.competencyId);
      competencyProfileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [competencyScores]);

  return (
    <div className="min-h-screen bg-muted/30 py-3 sm:py-4 md:py-8">
      <div className="container max-w-7xl mx-auto px-2 sm:px-4 space-y-3 sm:space-y-4">
        {/* Hero with score circle and pass/fail badge */}
        <JobFitHero
          templateName={result.templateName}
          completedAt={result.completedAt}
          overallPercentage={result.overallPercentage ?? 0}
          passed={isPassed}
          onetSocCode={onetSocCode}
          questionsAnswered={result.questionsAnswered}
          totalQuestions={result.totalQuestions}
          timeSpent={result.totalTimeSeconds}
          percentile={result.percentile ?? undefined}
        />

        {/* Charts + Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 animate-fadeInUp-2">
          {/* Enhanced Gap Analysis Chart */}
          <Card className="h-full">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                Gap Analysis
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Your scores vs. job requirements ({passingScore}%)
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <GapAnalysisChart
                data={gapData}
                passingThreshold={passingScore}
                animate={true}
                sortBy="gap"
                sortDirection="desc"
                onBarClick={handleGapBarClick}
              />
            </CardContent>
          </Card>

          {/* Key Insights - Enhanced Visual Hierarchy */}
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2.5">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-4 sm:space-y-5 px-4 sm:px-6">
              {/* Job context - Primary context */}
              {onetSocCode && (
                <div className="p-3 sm:p-4 bg-muted/40 rounded-xl border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted shrink-0">
                      <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm sm:text-base font-medium text-foreground">Job Requirements</span>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        O*NET: <code className="text-primary font-mono">{onetSocCode}</code>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Pass/Fail summary - Primary focal point */}
              {isPassed ? (
                <div className="p-3 sm:p-4 bg-linear-to-br from-green-500/10 to-green-500/5 rounded-xl border border-green-500/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-500/15 shrink-0">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm sm:text-base text-green-800 dark:text-green-300 mb-1">
                        Qualified
                      </h4>
                      <p className="text-xs sm:text-sm text-green-700 dark:text-green-400 leading-relaxed">
                        You meet the benchmark requirements.
                        {insights.strengths.length > 0 && (
                          <span className="hidden sm:inline"> Excel in: {insights.strengths.slice(0, 2).map(s => s.competencyName).join(', ')}.</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 sm:p-4 bg-linear-to-br from-amber-500/10 to-amber-500/5 rounded-xl border border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/15 shrink-0">
                      <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm sm:text-base text-amber-800 dark:text-amber-300 mb-1">
                        Below Requirements
                      </h4>
                      <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
                        Some competencies need development.
                        {insights.gaps.length > 0 && (
                          <span className="hidden sm:inline"> Focus on: {insights.gaps.slice(0, 2).map(g => g.competencyName).join(', ')}.</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Strengths - Secondary importance */}
              {insights.strengths.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-4 bg-green-500/60 rounded-full" />
                    Strengths ({insights.strengths.length})
                  </h5>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {insights.strengths.slice(0, 3).map(s => (
                      <span
                        key={s.competencyId}
                        className="text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5 bg-green-500/10 text-green-700 dark:text-green-400 rounded-full font-medium border border-green-500/20"
                      >
                        {s.competencyName} ({Math.round(s.percentage)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Development Areas - Tertiary */}
              {insights.gaps.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-4 bg-amber-500/60 rounded-full" />
                    Gaps ({insights.gaps.length})
                  </h5>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {insights.gaps.slice(0, 3).map(g => (
                      <span
                        key={g.competencyId}
                        className="text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full font-medium border border-amber-500/20"
                      >
                        {g.competencyName} ({Math.round(g.percentage)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Percentile - Footer info */}
              {result.percentile !== undefined && result.percentile !== null && (
                <div className="p-3 sm:p-4 bg-muted/30 rounded-xl border border-border/40 mt-auto">
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">
                    Better than <span className="font-bold text-foreground text-sm sm:text-base">{result.percentile}%</span> of candidates
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Competency Radar (optional secondary visualization) */}
        {radarData.length >= 3 && (
          <Card className="animate-fadeInUp-3">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <CardTitle className="text-sm sm:text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                Competency Map
              </CardTitle>
              <CardDescription className="text-[10px] sm:text-sm">
                Visual profile
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <div className="flex justify-center items-center min-h-[220px] sm:min-h-[280px] md:min-h-[340px]">
                <CompetencyRadarChart
                  data={radarData}
                  passingScore={passingScore}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed competency breakdown - Mobile-First */}
        <div ref={competencyProfileRef}>
          <CompetencyProfile
            competencies={competencyScores}
            resultId={result.id}
            showPassFail={true}
            passingScore={passingScore}
            expandedCompetencyId={focusedCompetencyId}
          />
        </div>

        {/* Development Recommendations */}
        {recommendations.length > 0 && (
          <Card className="animate-fadeInUp-4">
            <CardContent className="p-4 sm:p-6">
              <DevelopmentRecommendations
                recommendations={recommendations}
                initialCount={3}
                showPriority={true}
                showEstimatedTime={true}
                showResources={false}
              />
            </CardContent>
          </Card>
        )}

        {/* Action buttons */}
        <ActionButtonsBar
          templateId={result.templateId}
          resultId={result.id}
          actions={['download_report', 'retake', 'share']}
        />
      </div>
    </div>
  );
}

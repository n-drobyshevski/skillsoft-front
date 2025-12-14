'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart3,
  Award,
  AlertTriangle,
  CheckCircle2,
  Target,
  Briefcase
} from 'lucide-react';
import GapAnalysisBarChart from '@/components/data-display/charts/GapAnalysisBarChart';
import CompetencyRadarChart from '@/components/data-display/charts/CompetencyRadarChart';
import { JobFitHero } from './JobFitHero';
import { CompetencyDetailAccordion } from '../shared/CompetencyDetailAccordion';
import { ActionButtonsBar } from '../shared/ActionButtonsBar';
import { BaseResultViewProps } from '../shared/types';

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
  const isPassed = result.passed;
  const passingScore = template.passingScore || 70;

  // Prepare data for gap analysis chart
  const gapData = useMemo(() => {
    return result.competencyScores.map(cs => ({
      name: cs.competencyName,
      score: Math.round(cs.percentage),
      target: passingScore
    }));
  }, [result.competencyScores, passingScore]);

  // Prepare data for radar chart
  const radarData = useMemo(() => {
    return result.competencyScores.map(cs => ({
      subject: cs.competencyName,
      A: Math.round(cs.percentage),
      fullMark: 100
    }));
  }, [result.competencyScores]);

  // Calculate insights
  const insights = useMemo(() => {
    const strengths = result.competencyScores.filter(c => c.percentage >= passingScore);
    const gaps = result.competencyScores.filter(c => c.percentage < passingScore);
    const avgScore = Math.round(
      result.competencyScores.reduce((sum, c) => sum + c.percentage, 0) / result.competencyScores.length
    );

    return { strengths, gaps, avgScore };
  }, [result.competencyScores, passingScore]);

  return (
    <div className="min-h-screen bg-muted/30 py-4 md:py-8">
      <div className="container max-w-7xl mx-auto px-4 space-y-4">
        {/* Hero with score circle and pass/fail badge */}
        <JobFitHero
          templateName={result.templateName}
          completedAt={result.completedAt}
          overallPercentage={result.overallPercentage}
          passed={isPassed}
          onetSocCode={onetSocCode}
          questionsAnswered={result.questionsAnswered}
          totalQuestions={result.totalQuestions}
          timeSpent={result.totalTimeSeconds}
          percentile={result.percentile}
        />

        {/* Charts + Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fadeInUp-2">
          {/* Gap Analysis Chart */}
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Gap Analysis
              </CardTitle>
              <CardDescription className="text-sm">
                Your scores vs. job requirements (target: {passingScore}%)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Chart container */}
              <div className="flex justify-center items-center min-h-[280px] md:min-h-[340px]">
                <GapAnalysisBarChart data={gapData} />
              </div>

              {/* Gap summary stats */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                <div className="text-center p-2.5 bg-muted/40 rounded-lg">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
                    Average
                  </div>
                  <div className="text-base font-bold tabular-nums">
                    {insights.avgScore}%
                  </div>
                </div>
                <div className="text-center p-2.5 bg-green-500/10 rounded-lg">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
                    Exceeds
                  </div>
                  <div className="text-base font-bold tabular-nums text-green-600 dark:text-green-400">
                    {insights.strengths.length}
                  </div>
                </div>
                <div className="text-center p-2.5 bg-amber-500/10 rounded-lg">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
                    Below
                  </div>
                  <div className="text-base font-bold tabular-nums text-amber-600 dark:text-amber-400">
                    {insights.gaps.length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Insights */}
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Job context */}
              {onetSocCode && (
                <div className="p-3 bg-muted/30 rounded-lg border">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Job Requirements</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Assessment based on O*NET occupation code: <code className="text-primary">{onetSocCode}</code>
                  </p>
                </div>
              )}

              {/* Pass/Fail summary */}
              {isPassed ? (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
                  <h4 className="font-semibold text-sm text-green-800 dark:text-green-300 mb-1.5 flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Qualified for Position
                  </h4>
                  <p className="text-xs text-green-700 dark:text-green-400 leading-relaxed">
                    You meet the benchmark requirements for this role.
                    {insights.strengths.length > 0 && (
                      <> You excel in: {insights.strengths.slice(0, 3).map(s => s.competencyName).join(', ')}.</>
                    )}
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/30">
                  <h4 className="font-semibold text-sm text-amber-800 dark:text-amber-300 mb-1.5 flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Below Requirements
                  </h4>
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                    Some competencies need development to meet the job requirements.
                    {insights.gaps.length > 0 && (
                      <> Focus on: {insights.gaps.slice(0, 3).map(g => g.competencyName).join(', ')}.</>
                    )}
                  </p>
                </div>
              )}

              {/* Strengths */}
              {insights.strengths.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Strengths ({insights.strengths.length})
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {insights.strengths.slice(0, 4).map(s => (
                      <span
                        key={s.competencyId}
                        className="text-xs px-2 py-1 bg-green-500/10 text-green-700 dark:text-green-400 rounded-full"
                      >
                        {s.competencyName} ({Math.round(s.percentage)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Development Areas */}
              {insights.gaps.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Target className="h-3 w-3 text-amber-500" />
                    Development Areas ({insights.gaps.length})
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {insights.gaps.slice(0, 4).map(g => (
                      <span
                        key={g.competencyId}
                        className="text-xs px-2 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full"
                      >
                        {g.competencyName} ({Math.round(g.percentage)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Percentile if available */}
              {result.percentile !== undefined && result.percentile !== null && (
                <div className="p-3 bg-muted/50 rounded-lg border">
                  <p className="text-xs text-muted-foreground">
                    Your result is better than <span className="font-semibold text-foreground">{result.percentile}%</span> of candidates
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Competency Radar (optional secondary visualization) */}
        {radarData.length >= 3 && (
          <Card className="animate-fadeInUp-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Competency Map
              </CardTitle>
              <CardDescription className="text-sm">
                Visual profile of your competencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center min-h-[280px] md:min-h-[340px]">
                <CompetencyRadarChart
                  data={radarData}
                  passingScore={passingScore}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed competency breakdown */}
        <CompetencyDetailAccordion
          competencies={result.competencyScores}
          showPassFail={true}
          passingScore={passingScore}
        />

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

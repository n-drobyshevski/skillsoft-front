'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart3,
  Users,
  UserCheck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Target
} from 'lucide-react';
import CompetencyRadarChart from '@/components/data-display/charts/CompetencyRadarChart';
import { useBigFiveProjection, getBigFiveLabels, bigFiveToArray } from '@/hooks/useBigFiveProjection';
import { TeamFitHero } from './TeamFitHero';
import { CompetencyDetailAccordion } from '../shared/CompetencyDetailAccordion';
import { ActionButtonsBar } from '../shared/ActionButtonsBar';
import { BaseResultViewProps } from '../shared/types';

/**
 * Team Fit Result View for Scenario C (Team Compatibility Analysis).
 *
 * Key features:
 * - Compatibility percentage (blue collaborative palette)
 * - Team context hero section
 * - You vs. team comparison (when team data available)
 * - Complementary skills display
 * - Focus on collaboration rather than individual achievement
 */
export function TeamFitResultView({ result, template }: BaseResultViewProps) {
  const teamId = template.blueprint?.team_id;
  const isGoodFit = result.passed;
  const passingScore = template.passingScore || 70;

  // Project competencies to Big Five for personality fit visualization
  const bigFiveProfile = useBigFiveProjection(result.competencyScores);
  const bigFiveLabels = getBigFiveLabels();
  const bigFiveData = bigFiveToArray(bigFiveProfile);

  // Prepare data for radar chart
  const radarData = useMemo(() => {
    return result.competencyScores.map(cs => ({
      subject: cs.competencyName,
      A: Math.round(cs.percentage),
      fullMark: 100
    }));
  }, [result.competencyScores]);

  // Calculate team contribution insights
  const insights = useMemo(() => {
    const strengths = result.competencyScores.filter(c => c.percentage >= 70);
    const developing = result.competencyScores.filter(c => c.percentage < 50);
    const avgScore = Math.round(
      result.competencyScores.reduce((sum, c) => sum + c.percentage, 0) / result.competencyScores.length
    );

    // Simulated complementary skills (in real implementation, compare against team average)
    const complementary = strengths.slice(0, 3);
    const gapAreas = developing.slice(0, 3);

    return { strengths, developing, avgScore, complementary, gapAreas };
  }, [result.competencyScores]);

  // Check if we have Big Five data
  const hasBigFiveData = useMemo(() => {
    const values = Object.values(bigFiveProfile);
    return values.some(v => v !== 50);
  }, [bigFiveProfile]);

  return (
    <div className="min-h-screen bg-muted/30 py-4 md:py-8">
      <div className="container max-w-7xl mx-auto px-4 space-y-4">
        {/* Hero with team context and compatibility score */}
        <TeamFitHero
          templateName={result.templateName}
          completedAt={result.completedAt}
          overallPercentage={result.overallPercentage}
          passed={isGoodFit}
          teamId={teamId}
          questionsAnswered={result.questionsAnswered}
          totalQuestions={result.totalQuestions}
          timeSpent={result.totalTimeSeconds}
        />

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fadeInUp-2">
          {/* Competency Profile */}
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Your Skills Profile
              </CardTitle>
              <CardDescription className="text-sm">
                How your competencies contribute to the team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Radar chart */}
              {radarData.length >= 3 ? (
                <div className="flex justify-center items-center min-h-[280px] md:min-h-[320px]">
                  <CompetencyRadarChart
                    data={radarData}
                    passingScore={passingScore}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[280px] text-center">
                  <Lightbulb className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Need at least 3 competencies for radar visualization
                  </p>
                </div>
              )}

              {/* Profile stats */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                <div className="text-center p-2.5 bg-muted/40 rounded-lg">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
                    Average
                  </div>
                  <div className="text-base font-bold tabular-nums">
                    {insights.avgScore}%
                  </div>
                </div>
                <div className="text-center p-2.5 bg-blue-500/10 rounded-lg">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
                    Strengths
                  </div>
                  <div className="text-base font-bold tabular-nums text-blue-600 dark:text-blue-400">
                    {insights.strengths.length}
                  </div>
                </div>
                <div className="text-center p-2.5 bg-muted/40 rounded-lg">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
                    Developing
                  </div>
                  <div className="text-base font-bold tabular-nums text-muted-foreground">
                    {insights.developing.length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Insights */}
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team Contribution Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Team context */}
              {teamId && (
                <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Team Analysis</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Evaluating compatibility with team: <code className="text-blue-600 dark:text-blue-400">{teamId}</code>
                  </p>
                </div>
              )}

              {/* Fit summary */}
              {isGoodFit ? (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                  <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-300 mb-1.5 flex items-center gap-2">
                    <UserCheck className="h-3.5 w-3.5" />
                    Strong Team Fit
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                    Your skills complement the team well. You bring valuable strengths that enhance team capabilities.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-100 dark:border-slate-900/30">
                  <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Alignment Opportunities
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-400 leading-relaxed">
                    Some skill areas could benefit from development to better complement the team dynamics.
                  </p>
                </div>
              )}

              {/* Complementary skills you bring */}
              {insights.complementary.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-blue-500" />
                    You Bring to the Team
                  </h5>
                  <div className="space-y-1.5">
                    {insights.complementary.map(c => (
                      <div
                        key={c.competencyId}
                        className="flex items-center justify-between p-2 bg-blue-500/5 rounded-lg"
                      >
                        <span className="text-xs font-medium text-foreground">
                          {c.competencyName}
                        </span>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                          {Math.round(c.percentage)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Development areas for team alignment */}
              {insights.gapAreas.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <TrendingDown className="h-3 w-3 text-slate-500" />
                    Team Alignment Areas
                  </h5>
                  <div className="space-y-1.5">
                    {insights.gapAreas.map(c => (
                      <div
                        key={c.competencyId}
                        className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
                      >
                        <span className="text-xs font-medium text-muted-foreground">
                          {c.competencyName}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground tabular-nums">
                          {Math.round(c.percentage)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Collaboration note */}
              <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t">
                Team fit assessments help identify how individual skills complement team dynamics and where collaborative growth opportunities exist.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Personality Fit Section (if Big Five data available) */}
        {hasBigFiveData && (
          <Card className="animate-fadeInUp-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5" />
                Personality Profile for Team Dynamics
              </CardTitle>
              <CardDescription className="text-sm">
                Big Five dimensions relevant to team collaboration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {bigFiveData.map(({ trait, value }) => (
                  <div
                    key={trait}
                    className="text-center p-4 bg-muted/30 rounded-lg border"
                  >
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      {trait}
                    </div>
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="text-muted/30"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeDasharray={`${2 * Math.PI * 28}`}
                          strokeDashoffset={`${2 * Math.PI * 28 * (1 - value / 100)}`}
                          className="text-blue-500 transition-all duration-1000"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                          {value}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {value >= 70 ? 'High' : value >= 40 ? 'Moderate' : 'Low'}
                    </div>
                  </div>
                ))}
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
          actions={['team_dashboard', 'retake', 'share_with_team']}
        />
      </div>
    </div>
  );
}

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BigFiveRadar } from '@/components/charts/BigFiveRadar';
import { useBigFiveProjection } from '@/hooks/useBigFiveProjection';
import { TestResult, CompetencyScore } from '@/types/domain';
import { CheckCircle2, XCircle, Clock, FileText, Target, TrendingUp } from 'lucide-react';

interface TestResultViewProps {
  result: TestResult;
}

/**
 * Test Result View Component (Client Component)
 * 
 * Displays test results with:
 * - Overall score card with pass/fail indicator
 * - Competency scores in table/card format
 * - Big Five personality radar chart
 * - Test metadata (time, questions answered)
 */
export default function TestResultView({ result }: TestResultViewProps) {
  // Transform competency scores to Big Five profile using O*NET mapping
  const bigFiveProfile = useBigFiveProjection(result.competencyScores);

  // Sort competencies by percentage (descending)
  const sortedCompetencies = [...result.competencyScores].sort(
    (a, b) => b.percentage - a.percentage
  );

  const timeInMinutes = Math.floor(result.totalTimeSeconds / 60);
  const timeInSeconds = result.totalTimeSeconds % 60;

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{result.templateName}</h1>
          <Badge variant={result.passed ? "default" : "destructive"} className="text-sm px-3 py-1">
            {result.passed ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Passed
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-1" />
                Failed
              </>
            )}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Completed {new Date(result.completedAt).toLocaleString()}
        </p>
      </div>

      {/* Overall Score Card */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Score</CardTitle>
          <CardDescription>Your performance on this assessment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Score Circle */}
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 45} ${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - result.overallPercentage / 100)}`}
                    className={result.passed ? "text-primary" : "text-destructive"}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-bold">
                    {result.overallPercentage.toFixed(0)}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {result.overallScore.toFixed(1)}/{result.competencyScores.reduce((sum, c) => sum + c.maxScore, 0).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="text-2xl font-semibold">
                    {result.questionsAnswered}/{result.totalQuestions}
                  </p>
                  {result.questionsSkipped > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {result.questionsSkipped} skipped
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time Taken</p>
                  <p className="text-2xl font-semibold">
                    {timeInMinutes}:{timeInSeconds.toString().padStart(2, '0')}
                  </p>
                  <p className="text-xs text-muted-foreground">minutes</p>
                </div>
              </div>

              {result.percentile !== undefined && result.percentile !== null && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Percentile</p>
                    <p className="text-2xl font-semibold">{result.percentile}th</p>
                    <p className="text-xs text-muted-foreground">ranking</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Competencies</p>
                  <p className="text-2xl font-semibold">{result.competencyScores.length}</p>
                  <p className="text-xs text-muted-foreground">assessed</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout for Competencies and Big Five */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competency Scores */}
        <Card>
          <CardHeader>
            <CardTitle>Competency Scores</CardTitle>
            <CardDescription>
              Breakdown of your performance by competency area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedCompetencies.map((competency) => (
                <CompetencyScoreCard key={competency.competencyId} competency={competency} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Big Five Personality Profile */}
        <BigFiveRadar
          profile={bigFiveProfile}
          title="Personality Profile"
          description="Big Five (OCEAN) dimensions derived from your competency assessment using O*NET mapping"
          showLegend={true}
        />
      </div>
    </div>
  );
}

/**
 * Individual Competency Score Card Component
 */
function CompetencyScoreCard({ competency }: { competency: CompetencyScore }) {
  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-emerald-600 dark:text-emerald-400';
    if (percentage >= 70) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{competency.competencyName}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              {competency.score.toFixed(1)}/{competency.maxScore.toFixed(1)}
            </span>
            {competency.questionsAnswered && (
              <>
                <span>•</span>
                <span>{competency.questionsAnswered} questions</span>
              </>
            )}
            {competency.onetCode && (
              <>
                <span>•</span>
                <span className="font-mono text-xs">{competency.onetCode}</span>
              </>
            )}
          </div>
        </div>
        <div className={`text-right font-semibold ${getScoreColor(competency.percentage)}`}>
          {competency.percentage.toFixed(0)}%
        </div>
      </div>
      <Progress value={competency.percentage} className="h-2" />
    </div>
  );
}

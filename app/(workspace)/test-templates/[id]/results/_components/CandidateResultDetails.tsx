"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import CompetencyRadarChart from "@/components/data-display/charts/CompetencyRadarChart";
import {
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { testResultsApi } from "@/services/api";
import { TestResult, AssessmentGoal } from "@/types/domain";

interface CandidateResultDetailsProps {
  sessionId: string;
  templateGoal?: AssessmentGoal;
  passingScore?: number;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

export function CandidateResultDetails({
  sessionId,
  templateGoal,
  passingScore = 70,
}: CandidateResultDetailsProps) {
  const [result, setResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResult() {
      setIsLoading(true);
      setError(null);

      try {
        // Try to get by session ID first
        const data = await testResultsApi.getResultBySession(sessionId);
        setResult(data);
      } catch {
        try {
          // Fallback to result ID
          const data = await testResultsApi.getResultById(sessionId);
          setResult(data);
        } catch {
          setError("Failed to load result data");
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (sessionId) {
      fetchResult();
    }
  }, [sessionId]);

  if (isLoading) {
    return <CandidateResultDetailsSkeleton />;
  }

  if (error || !result) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <AlertTriangle className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">
          {error || "Result not found"}
        </p>
      </div>
    );
  }

  const isPassed = result.passed;
  const percentScore = Math.round(result.overallPercentage ?? 0);
  const formattedTime = formatDuration(result.totalTimeSeconds);

  // Prepare data for radar chart
  const radarData = (result.competencyScores ?? []).map((cs) => ({
    subject: cs.competencyName,
    A: Math.round(cs.percentage),
    fullMark: 100,
  }));

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-1">
        {/* Score Header */}
        <div className="text-center space-y-3">
          <div
            className={cn(
              "inline-flex items-center justify-center w-16 h-16 rounded-full",
              isPassed
                ? "bg-green-100 dark:bg-green-950/50"
                : "bg-amber-100 dark:bg-amber-950/50"
            )}
          >
            {isPassed ? (
              <Trophy className="h-8 w-8 text-green-600 dark:text-green-400" />
            ) : (
              <Target className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            )}
          </div>

          <div>
            <div className="text-4xl font-bold">
              <span
                className={
                  isPassed
                    ? "text-green-600 dark:text-green-400"
                    : "text-amber-600 dark:text-amber-400"
                }
              >
                {percentScore}%
              </span>
            </div>
            <Badge
              variant={isPassed ? "default" : "secondary"}
              className="mt-2"
            >
              {isPassed ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Passed
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Not Passed
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Clock className="h-4 w-4" />}
            label="Duration"
            value={formattedTime}
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Answered"
            value={`${result.questionsAnswered}/${result.totalQuestions}`}
          />
          <StatCard
            icon={<Target className="h-4 w-4" />}
            label="Score"
            value={`${result.overallScore}`}
          />
          <StatCard
            icon={<BarChart3 className="h-4 w-4" />}
            label="Skipped"
            value={`${result.questionsSkipped}`}
          />
        </div>

        {result.percentile && (
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              Better than{" "}
              <span className="font-semibold text-foreground">
                {result.percentile}%
              </span>{" "}
              of participants
            </p>
          </div>
        )}

        <Separator />

        {/* Radar Chart - Only for OVERVIEW goal */}
        {templateGoal !== AssessmentGoal.JOB_FIT &&
          templateGoal !== AssessmentGoal.TEAM_FIT &&
          radarData.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Competency Map
              </h4>
              <CompetencyRadarChart data={radarData} />
            </div>
          )}

        <Separator />

        {/* Competency Breakdown */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Detailed Breakdown
          </h4>
          <div className="space-y-4">
            {(result.competencyScores ?? []).map((competency) => (
              <CompetencyScoreItem
                key={competency.competencyId}
                competency={competency}
                passingScore={passingScore}
              />
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-muted/50 rounded-lg p-3 text-center">
      <div className="flex justify-center mb-1 text-muted-foreground">
        {icon}
      </div>
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function CompetencyScoreItem({
  competency,
  passingScore,
}: {
  competency: {
    competencyId: string;
    competencyName: string;
    competencyCategory?: string;
    score: number;
    maxScore: number;
    percentage: number;
    indicatorScores?: Array<{
      indicatorId: string;
      indicatorTitle: string;
      score: number;
      maxScore: number;
      percentage: number;
    }>;
  };
  passingScore: number;
}) {
  const percentage = Math.round(competency.percentage);
  const isGood = percentage >= passingScore;
  const isAverage = percentage >= 50 && percentage < passingScore;

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h5 className="text-sm font-medium truncate">
            {competency.competencyName}
          </h5>
          {competency.competencyCategory && (
            <Badge variant="outline" className="mt-1 text-[10px]">
              {competency.competencyCategory}
            </Badge>
          )}
        </div>
        <div className="text-right shrink-0">
          <span
            className={cn(
              "text-lg font-bold",
              isGood
                ? "text-green-600 dark:text-green-400"
                : isAverage
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-red-600 dark:text-red-400"
            )}
          >
            {percentage}%
          </span>
        </div>
      </div>

      <Progress
        value={percentage}
        className={cn(
          "h-1.5",
          isGood
            ? "[&>div]:bg-green-500"
            : isAverage
              ? "[&>div]:bg-amber-500"
              : "[&>div]:bg-red-500"
        )}
      />

      {/* Indicator breakdown if available */}
      {competency.indicatorScores && competency.indicatorScores.length > 0 && (
        <div className="pl-3 space-y-1.5 mt-2">
          {competency.indicatorScores.map((indicator) => (
            <div
              key={indicator.indicatorId}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-muted-foreground truncate mr-2 flex-1">
                {indicator.indicatorTitle}
              </span>
              <span
                className={cn(
                  "font-medium shrink-0",
                  indicator.percentage >= passingScore
                    ? "text-green-600"
                    : indicator.percentage >= 50
                      ? "text-amber-600"
                      : "text-red-600"
                )}
              >
                {Math.round(indicator.percentage)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CandidateResultDetailsSkeleton() {
  return (
    <div className="space-y-6 p-1">
      {/* Score Header Skeleton */}
      <div className="text-center space-y-3">
        <Skeleton className="w-16 h-16 rounded-full mx-auto" />
        <Skeleton className="h-10 w-24 mx-auto" />
        <Skeleton className="h-6 w-20 mx-auto" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>

      <Separator />

      {/* Chart Skeleton */}
      <div>
        <Skeleton className="h-5 w-32 mb-3" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
      </div>

      <Separator />

      {/* Breakdown Skeleton */}
      <div>
        <Skeleton className="h-5 w-40 mb-3" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-12" />
              </div>
              <Skeleton className="h-1.5 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

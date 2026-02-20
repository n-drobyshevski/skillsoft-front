'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Printer,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  FileText,
  Target,
} from 'lucide-react';
import type { TestResult, TestTemplate, CompetencyScore, AssessmentGoal } from '@/types/domain';

// ============================================================================
// Types
// ============================================================================

interface ManagerSummaryProps {
  result: TestResult;
  template: TestTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ============================================================================
// Helpers
// ============================================================================

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

/**
 * Get top N competencies by score.
 */
function getTopCompetencies(
  scores: CompetencyScore[],
  n: number
): CompetencyScore[] {
  return [...scores]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, n);
}

/**
 * Get bottom N competencies by score (development areas).
 */
function getBottomCompetencies(
  scores: CompetencyScore[],
  n: number
): CompetencyScore[] {
  return [...scores]
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, n);
}

/**
 * Generate recommendation text key based on pass/fail and score.
 */
function getRecommendationKey(
  goal: AssessmentGoal,
  passed: boolean,
  overallPercentage: number
): string {
  if (goal === 'OVERVIEW') {
    if (overallPercentage >= 80) return 'strongProfile';
    if (overallPercentage >= 60) return 'moderateProfile';
    return 'developingProfile';
  }

  if (passed) {
    if (overallPercentage >= 90) return 'stronglyRecommend';
    return 'recommend';
  }

  if (overallPercentage >= 60) return 'conditionalConsider';
  return 'notRecommend';
}

// ============================================================================
// Component
// ============================================================================

/**
 * Manager Summary dialog component.
 *
 * Renders a printable one-page summary with:
 * - Candidate name/ID, assessment date, template name
 * - Overall score with pass/fail recommendation
 * - Top 3 strengths (highest-scoring competencies)
 * - Top 3 development areas (lowest-scoring)
 * - One-line recommendation text
 *
 * Print styles ensure a clean, professional PDF output.
 */
export function ManagerSummary({
  result,
  template,
  open,
  onOpenChange,
}: ManagerSummaryProps) {
  const t = useTranslations('results.nextSteps.managerSummary');

  const competencyScores = result.competencyScores ?? [];
  const overallPercentage = result.overallPercentage ?? 0;
  const isPassed = result.passed ?? false;

  const strengths = useMemo(
    () => getTopCompetencies(competencyScores, 3),
    [competencyScores]
  );

  const developmentAreas = useMemo(
    () => getBottomCompetencies(competencyScores, 3),
    [competencyScores]
  );

  const recommendationKey = useMemo(
    () => getRecommendationKey(template.goal, isPassed, overallPercentage),
    [template.goal, isPassed, overallPercentage]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none print:overflow-visible print:shadow-none print:border-0"
      >
        <DialogHeader className="print:text-center">
          <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2 print:justify-center">
            <FileText className="h-5 w-5 text-primary print:hidden" />
            {t('title')}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t('dialogDescription')}
          </DialogDescription>
        </DialogHeader>

        {/* Printable Summary Content */}
        <div className="space-y-5 py-2 print:space-y-4" id="manager-summary-content">
          {/* Header: Assessment Info */}
          <div className="grid grid-cols-2 gap-3 p-3 sm:p-4 bg-muted/30 rounded-xl border border-border/40 print:bg-transparent print:border print:border-black/20">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground shrink-0 print:text-black" />
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground print:text-black/60">
                  {t('candidateId')}
                </p>
                <p className="text-xs sm:text-sm font-medium text-foreground truncate print:text-black">
                  {result.clerkUserId.slice(0, 16)}...
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0 print:text-black" />
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground print:text-black/60">
                  {t('assessmentDate')}
                </p>
                <p className="text-xs sm:text-sm font-medium text-foreground print:text-black">
                  {formatDate(result.completedAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0 print:text-black" />
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground print:text-black/60">
                  {t('templateName')}
                </p>
                <p className="text-xs sm:text-sm font-medium text-foreground truncate print:text-black">
                  {result.templateName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground shrink-0 print:text-black" />
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground print:text-black/60">
                  {t('duration')}
                </p>
                <p className="text-xs sm:text-sm font-medium text-foreground print:text-black">
                  {formatDuration(result.totalTimeSeconds)}
                </p>
              </div>
            </div>
          </div>

          {/* Overall Score & Verdict */}
          <div className={`p-4 sm:p-5 rounded-xl border-2 text-center print:border print:border-black/30 ${
            template.goal === 'OVERVIEW'
              ? 'bg-primary/5 border-primary/20'
              : isPassed
                ? 'bg-green-500/5 border-green-500/20'
                : 'bg-amber-500/5 border-amber-500/20'
          }`}>
            <div className="text-3xl sm:text-4xl font-bold tabular-nums mb-1 print:text-black">
              {Math.round(overallPercentage)}%
            </div>
            {template.goal !== 'OVERVIEW' && (
              <div className="flex items-center justify-center gap-2">
                {isPassed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 print:text-green-700" />
                ) : (
                  <XCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 print:text-amber-700" />
                )}
                <span className={`text-sm sm:text-base font-semibold ${
                  isPassed
                    ? 'text-green-700 dark:text-green-300 print:text-green-700'
                    : 'text-amber-700 dark:text-amber-300 print:text-amber-700'
                }`}>
                  {isPassed ? t('passed') : t('notPassed')}
                </span>
              </div>
            )}
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 print:text-black/60">
              {t('questionsCompleted', {
                answered: result.questionsAnswered,
                total: result.totalQuestions,
              })}
            </p>
          </div>

          {/* Strengths & Development Areas Side by Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Top Strengths */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 print:text-black">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 print:text-green-700" />
                {t('strengths')}
              </h3>
              <div className="space-y-1.5">
                {strengths.length > 0 ? (
                  strengths.map((c, idx) => (
                    <div
                      key={c.competencyId}
                      className="flex items-center justify-between p-2 sm:p-2.5 bg-green-500/5 rounded-lg border border-green-500/15 print:bg-transparent print:border-black/10"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-xs font-bold text-green-600 dark:text-green-400 tabular-nums print:text-green-700">
                          {idx + 1}.
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-foreground truncate print:text-black">
                          {c.competencyName}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400 tabular-nums shrink-0 print:text-green-700">
                        {Math.round(c.percentage)}%
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic p-2">
                    {t('noData')}
                  </p>
                )}
              </div>
            </div>

            {/* Development Areas */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 print:text-black">
                <TrendingDown className="h-4 w-4 text-amber-600 dark:text-amber-400 print:text-amber-700" />
                {t('development')}
              </h3>
              <div className="space-y-1.5">
                {developmentAreas.length > 0 ? (
                  developmentAreas.map((c, idx) => (
                    <div
                      key={c.competencyId}
                      className="flex items-center justify-between p-2 sm:p-2.5 bg-amber-500/5 rounded-lg border border-amber-500/15 print:bg-transparent print:border-black/10"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums print:text-amber-700">
                          {idx + 1}.
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-foreground truncate print:text-black">
                          {c.competencyName}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums shrink-0 print:text-amber-700">
                        {Math.round(c.percentage)}%
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic p-2">
                    {t('noData')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="p-3 sm:p-4 bg-primary/5 rounded-xl border border-primary/15 print:bg-transparent print:border-black/20">
            <h3 className="text-sm font-semibold text-foreground mb-1.5 print:text-black">
              {t('recommendation')}
            </h3>
            <p className="text-xs sm:text-sm text-foreground leading-relaxed print:text-black">
              {t(`recommendations.${recommendationKey}`)}
            </p>
          </div>
        </div>

        {/* Footer with Print button */}
        <DialogFooter className="print:hidden">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t('close')}
          </Button>
          <Button
            onClick={() => window.print()}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            {t('print')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

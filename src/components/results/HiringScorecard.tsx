'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CompetencyScore } from '@/types/domain';

interface HiringScorecardProps {
  overallPercentage: number;
  passed: boolean;
  competencyScores: CompetencyScore[];
  passingScore: number;
  onetSocCode?: string;
  confidenceLevel?: string;
  confidenceMessage?: string;
  /** Response consistency score (0-1) from extendedMetrics. */
  consistencyScore?: number;
  /** Human-readable consistency warning flags from extendedMetrics. */
  consistencyFlags?: string[];
  className?: string;
}

interface RankedCompetency {
  name: string;
  percentage: number;
  gap: number;
}

/**
 * HiringScorecard - Consolidated hiring decision card for Job Fit results.
 *
 * Acts as an executive summary with verdict, strengths/gaps breakdown,
 * and decision quality metrics. Print-friendly with no hover effects in print.
 */
export function HiringScorecard({
  overallPercentage,
  passed,
  competencyScores,
  passingScore,
  onetSocCode,
  confidenceLevel,
  confidenceMessage,
  consistencyScore,
  consistencyFlags,
  className,
}: HiringScorecardProps) {
  const { strengths, gaps, evidenceQuality, computedConfidenceMessage } = useMemo(() => {
    const sorted = [...competencyScores].sort((a, b) => b.percentage - a.percentage);

    const strengthsList: RankedCompetency[] = sorted
      .filter(c => c.percentage >= passingScore)
      .slice(0, 3)
      .map(c => ({
        name: c.competencyName,
        percentage: Math.round(c.percentage),
        gap: Math.round(c.percentage - passingScore),
      }));

    const gapsList: RankedCompetency[] = sorted
      .filter(c => c.percentage < passingScore)
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 3)
      .map(c => ({
        name: c.competencyName,
        percentage: Math.round(c.percentage),
        gap: Math.round(passingScore - c.percentage),
      }));

    // Evidence quality based on number of competencies and questions answered
    const totalQuestions = competencyScores.reduce(
      (sum, c) => sum + (c.questionsAnswered ?? 0),
      0
    );
    const hasCI = competencyScores.some(c => c.ciLower != null && c.ciUpper != null);

    let quality: 'high' | 'moderate' | 'low';
    if (competencyScores.length >= 5 && totalQuestions >= 20 && hasCI) {
      quality = 'high';
    } else if (competencyScores.length >= 3 && totalQuestions >= 10) {
      quality = 'moderate';
    } else {
      quality = 'low';
    }

    // Compute fallback confidence message
    let fallbackMessage: string;
    if (quality === 'high') {
      fallbackMessage = 'High confidence assessment based on comprehensive competency coverage and statistical reliability.';
    } else if (quality === 'moderate') {
      fallbackMessage = 'Moderate confidence. Consider supplementary assessment for borderline competencies.';
    } else {
      fallbackMessage = 'Limited data points. Results should be interpreted alongside other evaluation methods.';
    }

    return {
      strengths: strengthsList,
      gaps: gapsList,
      evidenceQuality: quality,
      computedConfidenceMessage: fallbackMessage,
    };
  }, [competencyScores, passingScore]);

  const displayConfidenceLevel = confidenceLevel ?? evidenceQuality;
  const displayConfidenceMessage = confidenceMessage ?? computedConfidenceMessage;

  const confidenceColorClass =
    displayConfidenceLevel === 'high'
      ? 'text-green-700 dark:text-green-400'
      : displayConfidenceLevel === 'moderate'
        ? 'text-amber-700 dark:text-amber-400'
        : 'text-red-700 dark:text-red-400';

  return (
    <Card className={cn('animate-fadeInUp-1', className)}>
      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* Top: Verdict + Overall Score */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <div
            className={cn(
              'flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2',
              passed
                ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400'
                : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400'
            )}
          >
            {passed ? (
              <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 shrink-0" />
            ) : (
              <XCircle className="h-6 w-6 sm:h-7 sm:w-7 shrink-0" />
            )}
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-bold">
                {passed ? 'Recommended' : 'Not Recommended'}
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold tabular-nums">
                {Math.round(overallPercentage)}%
              </span>
            </div>
          </div>
          {onetSocCode && (
            <Badge variant="outline" className="text-xs print:border-foreground">
              O*NET: {onetSocCode}
            </Badge>
          )}
        </div>

        {/* Three-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Column 1: Strengths */}
          <div className="space-y-2.5 p-3 sm:p-4 rounded-xl bg-green-500/5 border border-green-500/15">
            <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-green-700 dark:text-green-400 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              Strengths
            </h4>
            {strengths.length > 0 ? (
              <ul className="space-y-1.5">
                {strengths.map(s => (
                  <li
                    key={s.name}
                    className="flex items-center justify-between text-xs sm:text-sm"
                  >
                    <span className="truncate text-foreground font-medium mr-2">
                      {s.name}
                    </span>
                    <span className="tabular-nums font-semibold text-green-600 dark:text-green-400 shrink-0">
                      {s.percentage}%
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No competencies above threshold
              </p>
            )}
          </div>

          {/* Column 2: Gaps */}
          <div className="space-y-2.5 p-3 sm:p-4 rounded-xl bg-red-500/5 border border-red-500/15">
            <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center gap-1.5">
              <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              Gaps
            </h4>
            {gaps.length > 0 ? (
              <ul className="space-y-1.5">
                {gaps.map(g => (
                  <li
                    key={g.name}
                    className="flex items-center justify-between text-xs sm:text-sm"
                  >
                    <span className="truncate text-foreground font-medium mr-2">
                      {g.name}
                    </span>
                    <span className="tabular-nums font-semibold text-red-600 dark:text-red-400 shrink-0">
                      -{g.gap}%
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No competencies below threshold
              </p>
            )}
          </div>

          {/* Column 3: Decision Quality */}
          <div className="space-y-2.5 p-3 sm:p-4 rounded-xl bg-muted/40 border border-border/50">
            <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              Decision Quality
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Evidence</span>
                <Badge
                  variant={evidenceQuality === 'high' ? 'default' : evidenceQuality === 'moderate' ? 'secondary' : 'destructive'}
                  className="text-[10px] sm:text-xs capitalize"
                >
                  {evidenceQuality}
                </Badge>
              </li>
              <li className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Confidence</span>
                <span className={cn('font-semibold capitalize', confidenceColorClass)}>
                  {displayConfidenceLevel}
                </span>
              </li>
              <li className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Assessed</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <BarChart3 className="h-3 w-3 shrink-0" />
                  {competencyScores.length}
                </span>
              </li>
              {consistencyScore != null && (
                <li className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Response Quality</span>
                  <ConsistencyBadge score={consistencyScore} />
                </li>
              )}
            </ul>
            {consistencyFlags && consistencyFlags.length > 0 && (
              <div className="space-y-1 pt-1">
                {consistencyFlags.map((flag, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-1.5 text-[10px] sm:text-xs leading-tight"
                  >
                    <AlertTriangle className="h-3 w-3 shrink-0 text-amber-500 dark:text-amber-400 mt-0.5" />
                    <span className="text-amber-700 dark:text-amber-300">{flag}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom: Confidence message */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/40">
          <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-muted-foreground mt-0.5" />
          <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
            {displayConfidenceMessage}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Small badge indicating response quality level based on consistency score.
 * High (>= 0.8): green with ShieldCheck icon
 * Medium (>= 0.5): amber with ShieldAlert icon
 * Low (< 0.5): red with ShieldX icon
 */
function ConsistencyBadge({ score }: { score: number }) {
  if (score >= 0.8) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-green-700 dark:text-green-400">
        <ShieldCheck className="h-3 w-3 shrink-0" />
        High
      </span>
    );
  }
  if (score >= 0.5) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-amber-700 dark:text-amber-400">
        <ShieldAlert className="h-3 w-3 shrink-0" />
        Medium
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-red-700 dark:text-red-400">
      <ShieldX className="h-3 w-3 shrink-0" />
      Low
    </span>
  );
}

export default HiringScorecard;

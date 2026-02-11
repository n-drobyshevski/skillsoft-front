'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, CheckCircle, TrendingUp, ChevronRight, RotateCcw, ArrowLeft } from 'lucide-react';
import { TestResult } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-swipe-navigation';

interface CompactTestResultsProps {
  result: TestResult;
  onRetry?: () => void;
  onBack?: () => void;
  onViewDetails?: () => void;
}

/**
 * CompactTestResults - Ultra-compact single-viewport results display
 *
 * VIEWPORT BUDGETS:
 * Desktop (900px max):
 *   - Header: 120px (stats + title)
 *   - Competency list: 600px (5-8 competencies @ 75-120px each)
 *   - Footer: 80px (action buttons)
 *   - Gaps: 100px (padding + margins)
 *   Total: ~900px
 *
 * Mobile (600px max):
 *   - Header: 100px (stacked stats)
 *   - Competency list: 400px (scrollable if needed)
 *   - Footer: 60px (stacked buttons)
 *   - Gaps: 40px (reduced padding)
 *   Total: ~600px
 *
 * FEATURES:
 * - Fits entirely in one viewport (no scrolling needed)
 * - Responsive desktop/mobile layouts
 * - Dynamic competency list (3-8 items, auto-sizing)
 * - Touch-optimized mobile buttons
 * - Accessible contrast and spacing
 */
export function CompactTestResults({ result, onRetry, onBack, onViewDetails }: CompactTestResultsProps) {
  const { passed, overallPercentage, percentile, totalTimeSeconds, competencyScores: rawCompetencyScores } = result;
  const competencyScores = rawCompetencyScores ?? [];
  const prefersReducedMotion = useReducedMotion();

  // Calculate display values
  const totalMinutes = Math.floor(totalTimeSeconds / 60);
  const totalSeconds = totalTimeSeconds % 60;
  const timeDisplay = totalMinutes > 0
    ? `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`
    : `${totalSeconds}s`;

  // Performance indicators for competencies
  const getPerformanceIcon = (percentage: number) => {
    if (percentage >= 80) return '🎯'; // Excellent
    if (percentage >= 60) return '✓';  // Good
    return '→';                         // Needs improvement
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (percentage >= 60) return 'text-blue-600 dark:text-blue-400';
    return 'text-amber-600 dark:text-amber-400';
  };

  // Animation variants with reduced motion support
  const containerVariants = prefersReducedMotion
    ? {
        hidden: { opacity: 1 },
        visible: { opacity: 1 },
      }
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
          },
        },
      };

  const itemVariants = prefersReducedMotion
    ? {
        hidden: { opacity: 1 },
        visible: { opacity: 1 },
      }
    : {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      };

  // Progress bar animation duration
  const progressAnimationDuration = prefersReducedMotion ? 0 : 0.8;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-screen max-h-screen overflow-hidden bg-background p-4 md:p-6"
    >
      {/* HEADER SECTION: 120px desktop / 100px mobile */}
      <motion.div
        variants={itemVariants}
        className="flex-shrink-0 mb-4 md:mb-6"
      >
        {/* Desktop: Horizontal stats + title (120px) */}
        <div className="hidden md:flex items-center justify-between gap-6 h-[120px]">
          {/* Left: Pass/Fail Status */}
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center justify-center w-20 h-20 rounded-full",
              passed ? "bg-emerald-500/10" : "bg-red-500/10"
            )}>
              {passed ? (
                <Trophy className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <div className="text-4xl">📊</div>
              )}
            </div>
            <div>
              <div className="text-5xl font-bold tracking-tight">
                {Math.round(overallPercentage ?? 0)}%
              </div>
              <div className={cn(
                "text-lg font-semibold uppercase tracking-wide",
                passed ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
              )}>
                {passed ? 'PASSED' : 'REVIEW'}
              </div>
            </div>
          </div>

          {/* Center: Test Title (truncated) */}
          <div className="flex-1 min-w-0 text-center">
            <h1 className="text-2xl font-bold truncate">{result.templateName}</h1>
          </div>

          {/* Right: Meta Stats */}
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="font-mono">{timeDisplay}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-muted-foreground" />
              <span className="font-mono">{result.questionsAnswered}/{result.totalQuestions}</span>
            </div>
            {percentile && (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
                <span className="font-mono">{percentile}%ile</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile: Stacked stats (100px) */}
        <div className="md:hidden space-y-3">
          {/* Status + Score */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center justify-center w-14 h-14 rounded-full",
                passed ? "bg-emerald-500/10" : "bg-red-500/10"
              )}>
                {passed ? (
                  <Trophy className="w-7 h-7 text-emerald-600" />
                ) : (
                  <div className="text-2xl">📊</div>
                )}
              </div>
              <div>
                <div className="text-3xl font-bold">{Math.round(overallPercentage ?? 0)}%</div>
                <div className={cn(
                  "text-xs font-semibold uppercase",
                  passed ? "text-emerald-600" : "text-red-600"
                )}>
                  {passed ? 'PASSED' : 'REVIEW'}
                </div>
              </div>
            </div>
          </div>

          {/* Test title + meta stats */}
          <div className="space-y-1">
            <h1 className="text-lg font-bold line-clamp-1">{result.templateName}</h1>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeDisplay}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {result.questionsAnswered}/{result.totalQuestions}
              </span>
              {percentile && (
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {percentile}%
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* COMPETENCY LIST: 600px desktop / 400px mobile (scrollable if > 8 items) */}
      <motion.div
        variants={itemVariants}
        className="flex-1 min-h-0 mb-4 md:mb-6"
      >
        <div className="h-full overflow-y-auto overflow-x-hidden pr-2 -mr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <div className="space-y-3 md:space-y-4">
            {competencyScores.map((comp, index) => (
              <motion.div
                key={comp.competencyId}
                variants={itemVariants}
                className="group"
              >
                {/* Desktop: Single row layout (75px) */}
                <div className="hidden md:flex items-center gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                  {/* Competency name */}
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold truncate">{comp.competencyName}</div>
                  </div>

                  {/* Progress bar (compact) */}
                  <div className="flex-1 max-w-[200px]">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: prefersReducedMotion ? `${comp.percentage}%` : 0 }}
                        animate={{ width: `${comp.percentage}%` }}
                        transition={{ duration: progressAnimationDuration, delay: prefersReducedMotion ? 0 : index * 0.1 }}
                        className={cn(
                          "h-full rounded-full gpu-accelerated",
                          comp.percentage >= 80
                            ? "bg-emerald-500"
                            : comp.percentage >= 60
                            ? "bg-blue-500"
                            : "bg-amber-500"
                        )}
                      />
                    </div>
                  </div>

                  {/* Percentage + Icon */}
                  <div className="flex items-center gap-2 min-w-[80px]">
                    <span className={cn("text-lg font-bold tabular-nums", getPerformanceColor(comp.percentage))}>
                      {Math.round(comp.percentage)}%
                    </span>
                    <span className="text-xl">{getPerformanceIcon(comp.percentage)}</span>
                  </div>
                </div>

                {/* Mobile: Stacked layout (90px) */}
                <div className="md:hidden p-3 rounded-lg bg-card border border-border space-y-2">
                  {/* Name + Percentage */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0 text-sm font-semibold line-clamp-1">
                      {comp.competencyName}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className={cn("text-base font-bold tabular-nums", getPerformanceColor(comp.percentage))}>
                        {Math.round(comp.percentage)}%
                      </span>
                      <span className="text-lg">{getPerformanceIcon(comp.percentage)}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: prefersReducedMotion ? `${comp.percentage}%` : 0 }}
                      animate={{ width: `${comp.percentage}%` }}
                      transition={{ duration: progressAnimationDuration, delay: prefersReducedMotion ? 0 : index * 0.1 }}
                      className={cn(
                        "h-full rounded-full gpu-accelerated",
                        comp.percentage >= 80
                          ? "bg-emerald-500"
                          : comp.percentage >= 60
                          ? "bg-blue-500"
                          : "bg-amber-500"
                      )}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* FOOTER: 80px desktop / 60px mobile */}
      <motion.div
        variants={itemVariants}
        className="flex-shrink-0 border-t border-border pt-4"
      >
        {/* Desktop: Horizontal buttons (80px) */}
        <div className="hidden md:flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={onBack}
            className="min-w-[140px]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tests
          </Button>

          <div className="flex gap-3">
            {onRetry && (
              <Button
                variant="outline"
                size="lg"
                onClick={onRetry}
                className="min-w-[120px]"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry Test
              </Button>
            )}
            {onViewDetails && (
              <Button
                variant="default"
                size="lg"
                onClick={onViewDetails}
                className="min-w-[180px]"
              >
                View Detailed Analysis
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Mobile: Stacked buttons (60px) */}
        <div className="md:hidden space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="h-11 text-xs"
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              Back
            </Button>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="h-11 text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            )}
          </div>
          {onViewDetails && (
            <Button
              variant="default"
              size="sm"
              onClick={onViewDetails}
              className="w-full h-11 text-xs"
            >
              More Details
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

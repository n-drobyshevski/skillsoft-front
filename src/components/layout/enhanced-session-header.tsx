'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useIsTestDriveMode } from '@/store/test-drive-store';
import { TimerProgressBar } from '@/components/test-player/components';
import type { QuestionState } from '@/components/test-player/ImmersivePlayer';

interface EnhancedSessionHeaderProps {
  testName: string;
  currentQuestion: number;
  totalQuestions: number;
  questionStates: QuestionState[];
  timeRemaining: number | null;
  /** Total time the timer was started with (for progress bar percentage) */
  totalSeconds?: number | null;
  /** Compact formatted time (M:SS) for numeric countdown */
  compactFormattedTime?: string;
  /** Whether timer is in warning state (<3 min) */
  timerIsWarning?: boolean;
  /** Whether timer is in critical state (<1 min) */
  timerIsCritical?: boolean;
  allowNavigation?: boolean;
  allowSkip?: boolean;
  onExit: () => void;
  onNavigate?: (index: number) => void;
  settingsSlot?: React.ReactNode;
}

interface SegmentCounts {
  answered: number;
  skipped: number;
  current: number;
  pending: number;
}

interface ProgressSegments {
  answered: number;
  skipped: number;
  current: number;
  pending: number;
  counts: SegmentCounts;
}

/**
 * EnhancedSessionHeader - Unified progress display for test sessions
 *
 * Features:
 * - Mobile-first responsive layout with test name as hero
 * - Color-segmented progress bar showing question states
 * - Emerald (answered), Amber (skipped), Blue (current), Gray (pending)
 * - Conditional minimal dots for navigation (when allowNavigation && totalQuestions <= 30)
 * - Hover tooltip showing breakdown: "Answered: X, Skipped: Y, Remaining: Z"
 * - Timer with urgency warning states and visual feedback
 * - Test-Drive mode badge with responsive display
 * - Touch-optimized navigation dots
 */
export function EnhancedSessionHeader({
  testName,
  currentQuestion,
  totalQuestions,
  questionStates,
  timeRemaining,
  totalSeconds = null,
  compactFormattedTime = '--:--',
  timerIsWarning = false,
  timerIsCritical = false,
  allowNavigation = false,
  allowSkip = false,
  onExit,
  onNavigate,
  settingsSlot,
}: EnhancedSessionHeaderProps) {
  const isTestDriveMode = useIsTestDriveMode();
  const t = useTranslations('assessment');

  // Calculate segment widths based on question states
  const segments = useMemo<ProgressSegments>(() => {
    const counts = questionStates.reduce(
      (acc, state) => {
        acc[state] = (acc[state] || 0) + 1;
        return acc;
      },
      { answered: 0, skipped: 0, current: 0, pending: 0 } as SegmentCounts
    );

    return {
      answered: (counts.answered / totalQuestions) * 100,
      skipped: (counts.skipped / totalQuestions) * 100,
      current: (counts.current / totalQuestions) * 100,
      pending: (counts.pending / totalQuestions) * 100,
      counts,
    };
  }, [questionStates, totalQuestions]);

  // Whether we have timer data for the progress bar
  const hasTimer = timeRemaining !== null && totalSeconds !== null && totalSeconds > 0;

  // Determine if dots should be shown
  const showDots = (allowNavigation || allowSkip) && totalQuestions <= 30;

  // Progress percentage based on answered questions
  const progressPercentage = Math.round(
    ((segments.counts.answered + segments.counts.skipped) / totalQuestions) * 100
  );

  const tooltipContent = (
    <div className="flex flex-col gap-1 text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span>{t('progressTooltip.answered', { count: segments.counts.answered })}</span>
      </div>
      {segments.counts.skipped > 0 && (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>{t('progressTooltip.skipped', { count: segments.counts.skipped })}</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[var(--zen-text-muted)]" />
        <span>{t('progressTooltip.remaining', { count: segments.counts.pending + segments.counts.current })}</span>
      </div>
    </div>
  );

  // Handle dot click for navigation
  const handleDotClick = (index: number) => {
    const state = questionStates[index];
    if (allowNavigation && onNavigate && state !== 'pending' && index !== currentQuestion - 1) {
      onNavigate(index);
    }
  };

  // Get dot styling based on state
  const getDotClasses = (state: QuestionState, index: number): string => {
    const isNavigable = allowNavigation && state !== 'pending' && index !== currentQuestion - 1;
    const baseClasses = cn(
      // Larger dots on mobile, standard on desktop
      'w-2 h-2 sm:w-1.5 sm:h-1.5 rounded-full transition-all duration-200 shrink-0',
      // Touch-friendly hover scale
      isNavigable && 'cursor-pointer hover:scale-[2] sm:hover:scale-150',
      // Focus states for accessibility
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--zen-ring-offset)]'
    );

    switch (state) {
      case 'answered':
        return cn(baseClasses, 'bg-emerald-500 focus:ring-emerald-500/50');
      case 'skipped':
        return cn(baseClasses, 'bg-amber-500 focus:ring-amber-500/50');
      case 'current':
        return cn(baseClasses, 'bg-blue-500 ring-1 ring-blue-500/50 focus:ring-blue-500/50');
      case 'pending':
      default:
        return cn(baseClasses, 'bg-[var(--zen-muted)] focus:ring-[var(--zen-text-muted)]');
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 pt-safe',
        'bg-[var(--zen-surface)] backdrop-blur-sm',
        'border-b',
        isTestDriveMode ? 'border-amber-500/30' : 'border-[var(--zen-border)]'
      )}
    >
      {/* Full-width container with minimal padding */}
      <div className="w-full px-3 py-2 md:px-4 lg:px-6 overflow-hidden">
        {/* Desktop: Single row with all elements */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          {/* Exit Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onExit}
            className="shrink-0 h-8 w-8 text-[var(--zen-text-secondary)] hover:text-[var(--zen-text)] hover:bg-[var(--zen-ghost-hover)] transition-colors"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Exit test</span>
          </Button>

          {/* Test Name */}
          <h1 className="text-sm lg:text-base font-semibold text-[var(--zen-text)] truncate max-w-xs lg:max-w-md xl:max-w-lg" title={testName}>
            {testName}
          </h1>

          {/* Test-Drive Badge */}
          {isTestDriveMode && (
            <Badge variant="outline" className="shrink-0 bg-amber-500/10 border-amber-500/30 text-amber-400 text-xs gap-1">
              <Eye className="h-3 w-3" />
              Test-Drive
            </Badge>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Settings */}
          {settingsSlot}

          {/* Question Counter */}
          <span className="text-sm text-[var(--zen-text-secondary)] whitespace-nowrap">
            <span className="text-[var(--zen-text)] font-medium">{currentQuestion || 0}</span>
            <span className="mx-1 text-[var(--zen-text-muted)]">/</span>
            <span>{totalQuestions || 0}</span>
          </span>

          {/* Divider */}
          <div className="w-px h-4 bg-[var(--zen-muted)]" />

          {/* Progress Bar (inline) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <div
                  className="relative w-24 lg:w-32 xl:w-40 h-1.5 bg-[var(--zen-track)] rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={progressPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-600 to-emerald-500 transition-all duration-500"
                    style={{ width: `${segments.answered}%` }}
                  />
                  <div
                    className="absolute top-0 h-full bg-amber-500 transition-all duration-500"
                    style={{ left: `${segments.answered}%`, width: `${segments.skipped}%` }}
                  />
                  <div
                    className="absolute top-0 h-full bg-blue-500 transition-all duration-500"
                    style={{ left: `${segments.answered + segments.skipped}%`, width: `${segments.current}%` }}
                  />
                </div>
                <span className="text-xs text-[var(--zen-text-muted)] tabular-nums w-8 text-right">{progressPercentage}%</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-[var(--zen-track)] border-[var(--zen-muted)]">
              {tooltipContent}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Mobile: Compact 2-row layout */}
        <div className="md:hidden space-y-1.5 overflow-hidden">
          {/* Row 1: Exit + Name + Badge + Timer */}
          <div className="flex items-center gap-1.5 min-w-0">
            {/* Exit */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onExit}
              className="shrink-0 h-8 w-8 text-[var(--zen-text-secondary)] hover:text-[var(--zen-text)] hover:bg-[var(--zen-ghost-hover)] -ml-1"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Exit test</span>
            </Button>

            {/* Test Name */}
            <h1 className="flex-1 min-w-0 text-sm font-semibold text-[var(--zen-text)] truncate" title={testName}>
              {testName}
            </h1>

            {/* Test-Drive Badge (compact) */}
            {isTestDriveMode && (
              <Badge variant="outline" className="shrink-0 bg-amber-500/10 border-amber-500/30 text-amber-400 text-[10px] px-1.5 py-0.5 gap-0.5">
                <Eye className="h-2.5 w-2.5" />
                <span className="sr-only sm:not-sr-only">TD</span>
              </Badge>
            )}

            {/* Settings */}
            {settingsSlot}

          </div>

          {/* Row 2: Counter + Progress Bar + Percentage */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Counter */}
            <span className="text-xs text-[var(--zen-text-secondary)] whitespace-nowrap">
              <span className="text-[var(--zen-text)] font-medium">{currentQuestion || 0}</span>
              <span className="text-[var(--zen-text-muted)]">/</span>
              <span>{totalQuestions || 0}</span>
            </span>

            {/* Progress Bar */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="flex-1 relative h-1.5 bg-[var(--zen-track)] rounded-full overflow-hidden cursor-help"
                  role="progressbar"
                  aria-valuenow={progressPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-600 to-emerald-500 transition-all duration-500"
                    style={{ width: `${segments.answered}%` }}
                  />
                  <div
                    className="absolute top-0 h-full bg-amber-500 transition-all duration-500"
                    style={{ left: `${segments.answered}%`, width: `${segments.skipped}%` }}
                  />
                  <div
                    className="absolute top-0 h-full bg-blue-500 transition-all duration-500"
                    style={{ left: `${segments.answered + segments.skipped}%`, width: `${segments.current}%` }}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-[var(--zen-track)] border-[var(--zen-muted)]">
                {tooltipContent}
              </TooltipContent>
            </Tooltip>

            {/* Percentage */}
            <span className="text-xs text-[var(--zen-text-muted)] tabular-nums w-8 text-right">{progressPercentage}%</span>
          </div>
        </div>

        {/* Navigation dots (both mobile and desktop, if enabled) */}
        {showDots && (
          <div
            className="flex items-center justify-center gap-1 mt-2 overflow-x-auto pb-1"
            role="navigation"
            aria-label={t('progressTooltip.questionNavigation')}
          >
            {questionStates.map((state, index) => {
              const isNavigable = allowNavigation && state !== 'pending' && index !== currentQuestion - 1;
              const stateKey = state === 'answered' ? 'questionAnswered' : state === 'skipped' ? 'questionSkipped' : state === 'current' ? 'questionCurrent' : 'questionPending';
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDotClick(index)}
                  disabled={!isNavigable}
                  className={cn(
                    'flex items-center justify-center shrink-0',
                    'min-w-[24px] min-h-[24px] md:min-w-0 md:min-h-0',
                    getDotClasses(state, index)
                  )}
                  aria-label={t(`progressTooltip.${stateKey}`, { number: index + 1 })}
                  aria-current={index === currentQuestion - 1 ? 'step' : undefined}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Timer Progress Bar — full-width bar under header content */}
      {hasTimer && (
        <TimerProgressBar
          totalSeconds={totalSeconds}
          remainingSeconds={timeRemaining}
          compactFormattedTime={compactFormattedTime}
          isWarning={timerIsWarning}
          isCritical={timerIsCritical}
        />
      )}
    </header>
  );
}

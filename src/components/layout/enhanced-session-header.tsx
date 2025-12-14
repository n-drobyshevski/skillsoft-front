'use client';

import React, { useMemo } from 'react';
import { X, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useIsTestDriveMode } from '@/store/test-drive-store';
import type { QuestionState } from '@/components/test-player/ImmersivePlayer';

interface EnhancedSessionHeaderProps {
  testName: string;
  currentQuestion: number;
  totalQuestions: number;
  questionStates: QuestionState[];
  timeRemaining: number | null;
  allowNavigation?: boolean;
  allowSkip?: boolean;
  onExit: () => void;
  onNavigate?: (index: number) => void;
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
  allowNavigation = false,
  allowSkip = false,
  onExit,
  onNavigate,
}: EnhancedSessionHeaderProps) {
  const isTestDriveMode = useIsTestDriveMode();

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

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Time warning states
  const isTimeWarning = timeRemaining !== null && timeRemaining <= 300; // 5 min
  const isTimeCritical = timeRemaining !== null && timeRemaining <= 60; // 1 min

  // Determine if dots should be shown
  const showDots = (allowNavigation || allowSkip) && totalQuestions <= 30;

  // Progress percentage based on answered questions
  const progressPercentage = Math.round(
    ((segments.counts.answered + segments.counts.skipped) / totalQuestions) * 100
  );

  // Tooltip content in Russian
  const tooltipContent = (
    <div className="flex flex-col gap-1 text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span>Отвечено: {segments.counts.answered}</span>
      </div>
      {segments.counts.skipped > 0 && (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Пропущено: {segments.counts.skipped}</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-neutral-600" />
        <span>Осталось: {segments.counts.pending + segments.counts.current}</span>
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
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-950'
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
        return cn(baseClasses, 'bg-neutral-700 focus:ring-neutral-500/50');
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 pt-safe',
        'bg-neutral-950/95 backdrop-blur-sm',
        'border-b',
        isTestDriveMode ? 'border-amber-500/30' : 'border-neutral-800'
      )}
    >
      {/* Full-width container with minimal padding */}
      <div className="w-full px-3 py-2 md:px-4 lg:px-6 overflow-hidden">
        {/* Desktop: Single row with all elements */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          {/* Exit Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Выйти из теста</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-neutral-900 border-neutral-800">
              <AlertDialogHeader>
                <AlertDialogTitle>Выйти из теста?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ваш прогресс будет сохранён. Вы сможете продолжить этот тест позже.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700">
                  Продолжить тест
                </AlertDialogCancel>
                <AlertDialogAction onClick={onExit} className="bg-neutral-700 hover:bg-neutral-600">
                  Сохранить и выйти
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Test Name */}
          <h1 className="text-sm lg:text-base font-semibold text-white truncate max-w-xs lg:max-w-md xl:max-w-lg" title={testName}>
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

          {/* Question Counter */}
          <span className="text-sm text-neutral-400 whitespace-nowrap">
            <span className="text-white font-medium">{currentQuestion || 0}</span>
            <span className="mx-1 text-neutral-600">/</span>
            <span>{totalQuestions || 0}</span>
          </span>

          {/* Divider */}
          <div className="w-px h-4 bg-neutral-700" />

          {/* Timer */}
          {timeRemaining !== null ? (
            <div
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-md font-mono text-sm whitespace-nowrap transition-all',
                isTimeCritical
                  ? 'bg-red-950/40 text-red-400 animate-pulse'
                  : isTimeWarning
                    ? 'bg-amber-950/40 text-amber-400'
                    : 'bg-neutral-800/50 text-neutral-400'
              )}
              role="timer"
              aria-live={isTimeCritical ? 'assertive' : isTimeWarning ? 'polite' : 'off'}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          ) : (
            <span className="text-xs text-neutral-500">Без ограничений</span>
          )}

          {/* Divider */}
          <div className="w-px h-4 bg-neutral-700" />

          {/* Progress Bar (inline) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <div
                  className="relative w-24 lg:w-32 xl:w-40 h-1.5 bg-neutral-800 rounded-full overflow-hidden"
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
                <span className="text-xs text-neutral-500 tabular-nums w-8 text-right">{progressPercentage}%</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-neutral-800 border-neutral-700">
              {tooltipContent}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Mobile: Compact 2-row layout */}
        <div className="md:hidden space-y-1.5 overflow-hidden">
          {/* Row 1: Exit + Name + Badge + Timer */}
          <div className="flex items-center gap-1.5 min-w-0">
            {/* Exit */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800/50 -ml-1"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Выйти из теста</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-neutral-900 border-neutral-800">
                <AlertDialogHeader>
                  <AlertDialogTitle>Выйти из теста?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ваш прогресс будет сохранён. Вы сможете продолжить этот тест позже.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700">
                    Продолжить тест
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={onExit} className="bg-neutral-700 hover:bg-neutral-600">
                    Сохранить и выйти
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Test Name */}
            <h1 className="flex-1 min-w-0 text-sm font-semibold text-white truncate" title={testName}>
              {testName}
            </h1>

            {/* Test-Drive Badge (compact) */}
            {isTestDriveMode && (
              <Badge variant="outline" className="shrink-0 bg-amber-500/10 border-amber-500/30 text-amber-400 text-[10px] px-1.5 py-0.5 gap-0.5">
                <Eye className="h-2.5 w-2.5" />
                <span className="sr-only sm:not-sr-only">TD</span>
              </Badge>
            )}

            {/* Timer */}
            {timeRemaining !== null && (
              <div
                className={cn(
                  'shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[11px] transition-all',
                  isTimeCritical
                    ? 'bg-red-950/40 text-red-400 animate-pulse'
                    : isTimeWarning
                      ? 'bg-amber-950/40 text-amber-400'
                      : 'bg-neutral-800/50 text-neutral-400'
                )}
                role="timer"
                aria-live={isTimeCritical ? 'assertive' : isTimeWarning ? 'polite' : 'off'}
              >
                <Clock className="h-3 w-3" />
                <span>{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>

          {/* Row 2: Counter + Progress Bar + Percentage */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Counter */}
            <span className="text-xs text-neutral-400 whitespace-nowrap">
              <span className="text-white font-medium">{currentQuestion || 0}</span>
              <span className="text-neutral-600">/</span>
              <span>{totalQuestions || 0}</span>
            </span>

            {/* Progress Bar */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="flex-1 relative h-1.5 bg-neutral-800 rounded-full overflow-hidden cursor-help"
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
              <TooltipContent side="bottom" className="bg-neutral-800 border-neutral-700">
                {tooltipContent}
              </TooltipContent>
            </Tooltip>

            {/* Percentage */}
            <span className="text-xs text-neutral-500 tabular-nums w-8 text-right">{progressPercentage}%</span>
          </div>
        </div>

        {/* Navigation dots (both mobile and desktop, if enabled) */}
        {showDots && (
          <div
            className="flex items-center justify-center gap-1 mt-2 overflow-x-auto pb-1"
            role="navigation"
            aria-label="Навигация по вопросам"
          >
            {questionStates.map((state, index) => {
              const isNavigable = allowNavigation && state !== 'pending' && index !== currentQuestion - 1;
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
                  aria-label={`Вопрос ${index + 1}: ${
                    state === 'answered' ? 'Отвечен' : state === 'skipped' ? 'Пропущен' : state === 'current' ? 'Текущий' : 'Ожидает'
                  }`}
                  aria-current={index === currentQuestion - 1 ? 'step' : undefined}
                />
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}

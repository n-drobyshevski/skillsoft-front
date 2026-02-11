'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface SummaryHeroProps {
  totalQuestions: number;
  answeredCount: number;
  skippedCount: number;
  flaggedCount?: number;
  templateName?: string;
  timeRemaining?: number | null;
}

/**
 * SummaryHero - Completion status overview with circular progress
 *
 * Displays:
 * - Circular progress ring showing completion percentage
 * - Stats for answered, skipped, and flagged questions
 * - Optional time remaining indicator
 */
export function SummaryHero({
  totalQuestions,
  answeredCount,
  skippedCount,
  flaggedCount = 0,
  templateName,
  timeRemaining,
}: SummaryHeroProps) {
  const t = useTranslations('assessment');
  const completionPercentage = Math.round((answeredCount / totalQuestions) * 100);
  const isComplete = answeredCount >= totalQuestions;
  const hasSkipped = skippedCount > 0;

  // SVG circle calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * completionPercentage) / 100;

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 mb-6">
      {/* Template name */}
      {templateName && (
        <h2 className="text-center text-neutral-400 text-sm font-medium mb-4 truncate">
          {templateName}
        </h2>
      )}

      {/* Completion Ring */}
      <div className="flex items-center justify-center mb-5">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
            {/* Background circle */}
            <circle
              className="text-neutral-800"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="48"
              cy="48"
            />
            {/* Progress circle */}
            <circle
              className={cn(
                "transition-all duration-700 ease-out",
                isComplete && !hasSkipped
                  ? "text-emerald-500"
                  : hasSkipped
                    ? "text-amber-500"
                    : "text-emerald-500"
              )}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="48"
              cy="48"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">
              {completionPercentage}%
            </span>
            <span className="text-[10px] text-neutral-500 uppercase tracking-wide">
              {t('completed')}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="space-y-1">
          <div className="text-2xl font-bold text-emerald-400 tabular-nums">
            {answeredCount}
          </div>
          <div className="text-xs text-neutral-500">{t('answered')}</div>
        </div>
        <div className="space-y-1">
          <div className={cn(
            "text-2xl font-bold tabular-nums",
            skippedCount > 0 ? "text-amber-400" : "text-neutral-600"
          )}>
            {skippedCount}
          </div>
          <div className="text-xs text-neutral-500">{t('skipped')}</div>
        </div>
        <div className="space-y-1">
          <div className={cn(
            "text-2xl font-bold tabular-nums",
            flaggedCount > 0 ? "text-blue-400" : "text-neutral-600"
          )}>
            {flaggedCount}
          </div>
          <div className="text-xs text-neutral-500">{t('flagged')}</div>
        </div>
      </div>

      {/* Time remaining */}
      {timeRemaining !== null && timeRemaining !== undefined && (
        <div className={cn(
          "mt-4 pt-4 border-t border-neutral-800 text-center",
          timeRemaining < 300 ? "text-amber-400" : "text-neutral-400"
        )}>
          <span className="text-sm">
            {t('timeRemaining')}: <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
          </span>
        </div>
      )}
    </div>
  );
}

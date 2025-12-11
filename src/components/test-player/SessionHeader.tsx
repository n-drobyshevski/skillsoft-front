'use client';

import React from 'react';
import { X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface SessionHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
  progress: number;
  timeRemaining: number | null;
  onExit: () => void;
}

/**
 * SessionHeader - Top bar with progress, timer, and exit button
 */
export function SessionHeader({
  currentQuestion,
  totalQuestions,
  progress,
  timeRemaining,
  onExit,
}: SessionHeaderProps) {
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemaining !== null && timeRemaining < 300; // Less than 5 minutes

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-3xl mx-auto px-4 py-3">
        {/* Top row: Exit, Question counter, Timer */}
        <div className="flex items-center justify-between mb-3">
          {/* Exit button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            className="text-slate-400 hover:text-white hover:bg-slate-800 -ml-2"
          >
            <X className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Exit</span>
          </Button>

          {/* Question counter */}
          <div className="text-sm font-medium text-slate-300">
            <span className="text-white">{currentQuestion}</span>
            <span className="text-slate-500"> / {totalQuestions}</span>
          </div>

          {/* Timer */}
          {timeRemaining !== null && (
            <div className={cn(
              "flex items-center gap-1.5 text-sm font-mono",
              isLowTime ? "text-red-400" : "text-slate-400"
            )}>
              <Clock className={cn("w-4 h-4", isLowTime && "animate-pulse")} />
              {formatTime(timeRemaining)}
            </div>
          )}

          {/* Empty spacer when no timer */}
          {timeRemaining === null && <div className="w-16" />}
        </div>

        {/* Progress bar */}
        <Progress
          value={progress}
          className="h-1.5 bg-slate-800"
        />
      </div>
    </header>
  );
}

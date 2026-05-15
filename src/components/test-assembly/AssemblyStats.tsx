'use client';

import React from 'react';
import { FileQuestion, Timer, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types

interface AssemblyStatsProps {
  /** Number of questions selected so far */
  questionsSelected: number;
  /** Time elapsed in milliseconds */
  elapsedMillis: number;
  /** Optional status message from backend */
  message?: string;
  /** Optional className */
  className?: string;
}

// Helpers

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

// Component

export function AssemblyStats({
  questionsSelected,
  elapsedMillis,
  message,
  className,
}: AssemblyStatsProps) {
  return (
    <div className={cn('rounded-lg border bg-muted/30 p-3', className)}>
      {/* Stats Row */}
      <div className="flex items-center justify-between gap-4">
        {/* Questions Selected */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <FileQuestion className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold tabular-nums">{questionsSelected}</p>
            <p className="text-xs text-muted-foreground">Questions</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-border" />

        {/* Time Elapsed */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-muted">
            <Timer className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-semibold tabular-nums">
              {formatElapsed(elapsedMillis)}
            </p>
            <p className="text-xs text-muted-foreground">Elapsed</p>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className="mt-3 pt-3 border-t flex items-start gap-2">
          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground line-clamp-2">{message}</p>
        </div>
      )}
    </div>
  );
}

export default AssemblyStats;

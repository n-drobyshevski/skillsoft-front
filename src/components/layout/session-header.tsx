"use client";

import React from "react";
import { X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface SessionHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
  progress: number;
  timeRemaining: number | null;
  onExit: () => void;
}

/**
 * SessionHeader - Displays progress and timer during test
 */
export function SessionHeader({
  currentQuestion,
  totalQuestions,
  progress,
  timeRemaining,
  onExit,
}: SessionHeaderProps) {
  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Time warning states
  const isTimeWarning = timeRemaining !== null && timeRemaining <= 300; // 5 min
  const isTimeCritical = timeRemaining !== null && timeRemaining <= 60; // 1 min

  return (
    <header className="sticky top-0 z-50 bg-neutral-950/95 backdrop-blur-sm border-b border-neutral-800 pt-safe">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Exit Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Exit assessment</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-neutral-900 border-neutral-800">
              <AlertDialogHeader>
                <AlertDialogTitle>Exit Assessment?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your progress will be saved. You can resume this assessment later.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700">
                  Continue Test
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onExit}
                  className="bg-neutral-700 hover:bg-neutral-600"
                >
                  Save & Exit
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Progress Section */}
          <div className="flex-1 flex items-center gap-2 sm:gap-4">
            {/* Question Counter - announced to screen readers */}
            <span
              className="text-xs sm:text-sm text-neutral-400 whitespace-nowrap min-w-[3rem] sm:min-w-[4rem]"
              aria-live="polite"
              aria-atomic="true"
              aria-label={`Question ${currentQuestion || 0} of ${totalQuestions || 0}`}
            >
              <span className="text-white font-medium">{currentQuestion || 0}</span>
              <span className="mx-0.5 sm:mx-1">/</span>
              <span>{totalQuestions || 0}</span>
            </span>

            {/* Progress Bar */}
            <div className="flex-1 max-w-md">
              <Progress
                value={progress}
                className="h-1.5 sm:h-2 bg-neutral-800"
                aria-label={`Assessment progress: ${Math.round(progress)}% complete`}
              />
            </div>
          </div>

          {/* Timer - announces when time is low */}
          {timeRemaining !== null && (
            <div
              className={cn(
                "flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-colors",
                isTimeCritical
                  ? "bg-red-500/20 text-red-400 animate-pulse"
                  : isTimeWarning
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-neutral-800 text-neutral-300"
              )}
              role="timer"
              aria-live={isTimeCritical ? "assertive" : isTimeWarning ? "polite" : "off"}
              aria-atomic="true"
              aria-label={`Time remaining: ${formatTime(timeRemaining)}${isTimeCritical ? ', less than 1 minute remaining' : isTimeWarning ? ', less than 5 minutes remaining' : ''}`}
            >
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
              <span className="font-mono font-medium text-xs sm:text-sm">
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

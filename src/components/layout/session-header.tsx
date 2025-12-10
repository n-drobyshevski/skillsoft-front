"use client";

import React from "react";
import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface SessionHeaderProps {
  currentQuestion?: number;
  totalQuestions?: number;
  timeLeft?: string; // e.g. "14:30"
  onQuit?: () => void;
}

export function SessionHeader({ 
  currentQuestion = 1, 
  totalQuestions = 10, 
  timeLeft = "15:00",
  onQuit 
}: SessionHeaderProps) {
  const progress = (currentQuestion / totalQuestions) * 100;
  
  // Parse time to check for warning colors (simple check)
  const isWarning = timeLeft.startsWith("0") && parseInt(timeLeft.split(":")[1]) < 5; // < 5 mins (rough check)
  const isCritical = timeLeft.startsWith("00") && parseInt(timeLeft.split(":")[1]) < 1; // < 1 min

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between gap-4">
        {/* Left: Quit / Logo */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onQuit} className="h-9 w-9 text-muted-foreground hover:text-destructive">
            <X className="h-5 w-5" />
            <span className="sr-only">Quit Assessment</span>
          </Button>
          <span className="font-bold tracking-tight hidden sm:inline-block">Skillsoft Assessment</span>
        </div>

        {/* Center: Progress */}
        <div className="flex-1 max-w-md flex flex-col gap-1">
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>Question {currentQuestion} of {totalQuestions}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Right: Timer */}
        <div className={cn(
          "flex items-center gap-2 font-mono font-medium tabular-nums px-3 py-1.5 rounded-md bg-muted/50",
          isWarning && "text-amber-500 bg-amber-500/10",
          isCritical && "text-red-500 bg-red-500/10 animate-pulse"
        )}>
          <Clock className="h-4 w-4" />
          <span>{timeLeft}</span>
        </div>
      </div>
    </header>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookmarkCheck,
  ArrowLeft,
  Clock,
  PlayCircle,
  RefreshCw,
  CheckCircle2,
  Info
} from 'lucide-react';
import { TestSession } from '@/types/domain';

interface ExistingSessionDialogProps {
  session: TestSession;
  onResume: () => void;
  onStartNew: () => Promise<{ success: boolean; sessionId?: string; error?: string }>;
}

export function ExistingSessionDialog({
  session,
  onResume,
  onStartNew,
}: ExistingSessionDialogProps) {
  const router = useRouter();
  const [isStartingNew, setIsStartingNew] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartNew = async () => {
    setIsStartingNew(true);
    setError(null);
    try {
      const result = await onStartNew();

      if (result.success && result.sessionId) {
        router.push(`/test-templates/take/${result.sessionId}`);
      } else {
        setError(result.error || 'Failed to start new session');
        setIsStartingNew(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start new session');
      setIsStartingNew(false);
    }
  };

  const progressPercentage = session.totalQuestions > 0
    ? Math.round((session.answeredQuestions / session.totalQuestions) * 100)
    : 0;

  const remainingQuestions = session.totalQuestions - session.answeredQuestions;

  const startTime = session.startedAt
    ? new Date(session.startedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Unknown';

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[540px]" showCloseButton={false}>
        <DialogHeader className="space-y-3">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-muted flex items-center justify-center border border-muted-foreground/20">
              <BookmarkCheck className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-1.5">
              <DialogTitle className="text-xl sm:text-2xl leading-tight">
                Welcome Back!
              </DialogTitle>
              <DialogDescription className="text-base leading-relaxed">
                You have a saved assessment in progress. Pick up where you left off or start fresh.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Session Overview Card */}
        <div className="relative overflow-hidden rounded-xl border bg-muted/50">
          {/* Progress indicator background */}
          <div
            className="absolute inset-0 bg-muted-foreground/5 transition-all duration-500"
            style={{
              clipPath: `inset(0 ${100 - progressPercentage}% 0 0)`,
            }}
          />

          <div className="relative p-5 space-y-4">
            {/* Template Name */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Assessment Template
              </div>
              <div className="text-base font-semibold text-foreground">
                {session.templateName}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background/60 dark:bg-background/40 border border-border/50">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                    Started
                  </div>
                  <div className="text-sm font-semibold text-foreground truncate">
                    {startTime}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-background/60 dark:bg-background/40 border border-border/50">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                    Completed
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {session.answeredQuestions} / {session.totalQuestions}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Your Progress
                </span>
                <Badge
                  variant="outline"
                  className="bg-background/80 dark:bg-background/60 border-muted-foreground/30 text-foreground font-semibold px-2 py-0.5"
                >
                  {progressPercentage}% Complete
                </Badge>
              </div>

              {/* Enhanced Progress Bar */}
              <div className="relative h-2.5 bg-background/80 dark:bg-background/60 rounded-full overflow-hidden border border-border/50">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-muted-foreground/60 to-muted-foreground/80 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                </div>
              </div>

              {remainingQuestions > 0 && (
                <p className="text-xs text-muted-foreground">
                  {remainingQuestions} question{remainingQuestions !== 1 ? 's' : ''} remaining
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 dark:bg-destructive/10 p-3.5 flex items-start gap-3">
            <Info className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive leading-relaxed">{error}</p>
          </div>
        )}

        {/* Info Note */}
        <div className="rounded-lg border border-blue-500/20 bg-blue-950/30 p-3.5 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-400/80 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-300/90 leading-relaxed">
            Starting a new session will permanently discard your current progress. This action cannot be undone.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2.5 pt-2">
          {/* Primary Action - Resume (Most Prominent) */}
          <Button
            size="lg"
            onClick={onResume}
            disabled={isStartingNew}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
          >
            <PlayCircle className="w-4 h-4" />
            Continue Assessment
          </Button>

          {/* Secondary Actions Row */}
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              variant="outline"
              onClick={handleStartNew}
              disabled={isStartingNew}
              className="flex-1 border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted/50"
            >
              {isStartingNew ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Start New
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={() => router.push('/test-templates')}
              disabled={isStartingNew}
              className="flex-1 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

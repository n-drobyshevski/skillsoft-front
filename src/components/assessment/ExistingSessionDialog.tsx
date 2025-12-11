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
import { AlertTriangle, Clock, PlayCircle, RefreshCw } from 'lucide-react';
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
        // Navigate to the new session using client-side routing
        router.push(`/test-templates/take/${result.sessionId}`);
      } else {
        // Show error message
        setError(result.error || 'Failed to start new session');
        setIsStartingNew(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start new session');
      setIsStartingNew(false);
    }
  };

  // Calculate progress percentage
  const progressPercentage = session.totalQuestions > 0
    ? Math.round((session.answeredQuestions / session.totalQuestions) * 100)
    : 0;

  // Format start time
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-yellow-500/10 dark:bg-yellow-500/20">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <DialogTitle className="text-2xl">Assessment In Progress</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            You have an existing assessment session for this template. Would you like to resume where you left off or start fresh?
          </DialogDescription>
        </DialogHeader>

        {/* Session Details */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3 border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Template</span>
            <span className="font-medium text-foreground">{session.templateName}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Started
            </span>
            <span className="font-medium text-foreground">{startTime}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">
                {session.answeredQuestions} / {session.totalQuestions} questions
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Warning message */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            <strong>Warning:</strong> Starting a new session will abandon your current progress and cannot be undone.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleStartNew}
            disabled={isStartingNew}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            {isStartingNew ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Starting New...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Start New Session
              </>
            )}
          </Button>
          <Button
            onClick={onResume}
            disabled={isStartingNew}
            className="w-full sm:w-auto order-1 sm:order-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            Resume Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

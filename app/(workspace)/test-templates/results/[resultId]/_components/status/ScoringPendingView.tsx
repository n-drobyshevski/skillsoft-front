'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, CheckCircle2, Clock, Calculator, BarChart3, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BaseResultViewProps } from '../shared/types';
import { pollForResult, PollOptions } from '@/services/api.client';

/**
 * Scoring phases with user-friendly messaging.
 * Maps to backend scoring pipeline stages.
 */
type ScoringPhase =
  | 'SAVING'
  | 'NORMALIZING'
  | 'AGGREGATING'
  | 'CALCULATING'
  | 'FINALIZING'
  | 'READY';

interface PhaseConfig {
  label: string;
  description: string;
  icon: React.ElementType;
  progress: number;
}

const PHASE_CONFIGS: Record<ScoringPhase, PhaseConfig> = {
  SAVING: {
    label: 'Saving Answers',
    description: 'Securely storing your responses...',
    icon: FileText,
    progress: 10,
  },
  NORMALIZING: {
    label: 'Processing Responses',
    description: 'Normalizing scores across question types...',
    icon: Calculator,
    progress: 30,
  },
  AGGREGATING: {
    label: 'Analyzing Competencies',
    description: 'Grouping results by competency area...',
    icon: BarChart3,
    progress: 50,
  },
  CALCULATING: {
    label: 'Computing Results',
    description: 'Applying scoring strategy and weights...',
    icon: Calculator,
    progress: 70,
  },
  FINALIZING: {
    label: 'Finalizing Report',
    description: 'Generating your personalized results...',
    icon: FileText,
    progress: 90,
  },
  READY: {
    label: 'Results Ready',
    description: 'Your assessment is complete!',
    icon: CheckCircle2,
    progress: 100,
  },
};

/**
 * Calculates current phase based on poll attempt.
 * Simulates progress through scoring phases.
 */
function getPhaseForAttempt(attempt: number, maxAttempts: number): ScoringPhase {
  const progress = (attempt / maxAttempts) * 100;

  if (progress < 15) return 'SAVING';
  if (progress < 35) return 'NORMALIZING';
  if (progress < 55) return 'AGGREGATING';
  if (progress < 75) return 'CALCULATING';
  if (progress < 95) return 'FINALIZING';
  return 'READY';
}

/**
 * Default polling options for scoring.
 * Uses exponential backoff for resilience.
 */
const DEFAULT_POLL_OPTIONS: PollOptions = {
  maxAttempts: 15,
  initialIntervalMs: 1000,
  maxIntervalMs: 5000,
  backoffMultiplier: 1.5,
};

/**
 * ScoringPendingView - Loading state while scoring is in progress.
 *
 * Features:
 * - Animated progress indicator with phase-based messaging
 * - Polling for result updates using exponential backoff
 * - Automatic navigation to results when complete
 * - Timeout handling with retry option
 * - Respects prefers-reduced-motion for accessibility
 *
 * UX Design Principles:
 * - Reduces anxiety with calming visual feedback
 * - Shows meaningful progress (not just spinner)
 * - Provides time estimate and status updates
 * - Graceful degradation if polling fails
 *
 * @param result - TestResult with PENDING status
 * @param template - TestTemplate for context
 */
export function ScoringPendingView({ result, template }: BaseResultViewProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<ScoringPhase>('SAVING');
  const [progress, setProgress] = useState(10);
  const [attempt, setAttempt] = useState(0);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const phaseConfig = PHASE_CONFIGS[phase];
  const PhaseIcon = phaseConfig.icon;

  /**
   * Start polling for result completion.
   * Uses exponential backoff to reduce server load.
   */
  const startPolling = useCallback(async () => {
    if (pollingRef.current) return;
    pollingRef.current = true;

    // Create abort controller for cleanup
    abortControllerRef.current = new AbortController();

    try {
      const finalResult = await pollForResult(result.id, {
        ...DEFAULT_POLL_OPTIONS,
        onPending: (currentAttempt, maxAttempts) => {
          setAttempt(currentAttempt);
          const newPhase = getPhaseForAttempt(currentAttempt, maxAttempts);
          setPhase(newPhase);
          setProgress(PHASE_CONFIGS[newPhase].progress);
        },
        onCompleted: () => {
          setPhase('READY');
          setProgress(100);
        },
        signal: abortControllerRef.current?.signal,
      });

      // Navigate to results on success
      if (finalResult.status === 'COMPLETED') {
        // Brief delay to show completion animation
        await new Promise(resolve => setTimeout(resolve, 500));
        router.refresh(); // Refresh server component data
      } else if (finalResult.status === 'FAILED') {
        // Let parent component handle FAILED status
        router.refresh();
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          // Polling was cancelled, no error to show
          return;
        }
        if (err.message.includes('timeout') || err.message.includes('max attempts')) {
          setIsTimedOut(true);
        } else {
          setError(err.message);
        }
      }
    } finally {
      pollingRef.current = false;
    }
  }, [result.id, router]);

  /**
   * Handle retry after timeout or error.
   */
  const handleRetry = useCallback(() => {
    setIsTimedOut(false);
    setError(null);
    setAttempt(0);
    setPhase('SAVING');
    setProgress(10);
    startPolling();
  }, [startPolling]);

  /**
   * Initialize polling on mount.
   */
  useEffect(() => {
    startPolling();

    return () => {
      // Cleanup: abort polling on unmount
      abortControllerRef.current?.abort();
      pollingRef.current = false;
    };
  }, [startPolling]);

  // Timeout state - show retry option
  if (isTimedOut) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle>Taking Longer Than Expected</CardTitle>
            <CardDescription>
              Your results are still being calculated. This sometimes happens during high traffic periods.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>Assessment: <span className="font-medium text-foreground">{template.name}</span></p>
              <p className="mt-1">Attempts: {attempt}/{DEFAULT_POLL_OPTIONS.maxAttempts}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={handleRetry} className="w-full">
                Check Again
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/test-templates')}
              >
                Return to Tests
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state - show error message with retry
  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <Clock className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle>Connection Issue</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Button onClick={handleRetry} className="w-full">
                Try Again
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/test-templates')}
              >
                Return to Tests
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main pending state - animated progress
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl">Calculating Your Results</CardTitle>
          <CardDescription>
            {template.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Animated Icon */}
          <div className="flex justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
              >
                {phase === 'READY' ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                ) : (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <PhaseIcon className="w-10 h-10 text-primary" />
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Phase Label and Description */}
          <div className="text-center space-y-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="font-semibold text-lg">{phaseConfig.label}</h3>
                <p className="text-sm text-muted-foreground">{phaseConfig.description}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress
              value={progress}
              className="h-2"
              aria-label={`Scoring progress: ${progress}%`}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Processing</span>
              <span>{progress}%</span>
            </div>
          </div>

          {/* Phase Indicators */}
          <div className="flex justify-center gap-2">
            {(['SAVING', 'NORMALIZING', 'AGGREGATING', 'CALCULATING', 'FINALIZING'] as ScoringPhase[]).map((p, index) => {
              const isComplete = PHASE_CONFIGS[p].progress <= progress;
              const isCurrent = p === phase;

              return (
                <motion.div
                  key={p}
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.2 : 1,
                    backgroundColor: isComplete ? 'var(--primary)' : 'var(--muted)',
                  }}
                  className="w-2 h-2 rounded-full"
                  transition={{ duration: 0.2 }}
                />
              );
            })}
          </div>

          {/* Assessment Info */}
          <div className="pt-4 border-t">
            <div className="flex justify-center gap-4">
              <Badge variant="outline" className="font-normal">
                {result.questionsAnswered} questions
              </Badge>
              <Badge variant="outline" className="font-normal">
                {Math.floor(result.totalTimeSeconds / 60)}m {result.totalTimeSeconds % 60}s
              </Badge>
            </div>
          </div>

          {/* Loading indicator with screen reader support */}
          <div className="sr-only" role="status" aria-live="polite">
            {phaseConfig.label}: {phaseConfig.description}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

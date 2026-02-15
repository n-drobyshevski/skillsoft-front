'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  Sparkles,
  PlayCircle,
  ListChecks,
  Shield,
  Shuffle,
} from 'lucide-react';
import { AssemblyStageIndicator, type StageStatus } from './AssemblyStageIndicator';
import { AssemblyStats } from './AssemblyStats';
import { DeltaSkippedInfo, type SkippedCompetency } from '@/components/passport';
import type { AssemblyProgress, AssemblyPhase } from '@/types/domain';

// ============================================================================
// Types
// ============================================================================

export interface DeltaInfo {
  /** Whether delta testing is enabled */
  enabled: boolean;
  /** Competencies skipped from passport */
  skippedCompetencies: SkippedCompetency[];
  /** Estimated time saved in minutes */
  timeSaved: number;
  /** Number of questions saved */
  questionsSaved: number;
}

interface AssemblyProgressModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Current assembly progress data */
  progress: AssemblyProgress | null;
  /** Current assembly phase */
  phase: AssemblyPhase;
  /** Whether assembly is in progress */
  isAssembling: boolean;
  /** Whether assembly completed successfully */
  isComplete: boolean;
  /** Whether assembly failed */
  isFailed: boolean;
  /** Error message if failed */
  error: string | null;
  /** Session ID on success */
  sessionId: string | null;
  /** Number of retry attempts */
  retryCount: number;
  /** Delta testing information (optional) */
  deltaInfo?: DeltaInfo;
  /** Callback to retry failed assembly */
  onRetry: () => void;
  /** Callback to continue to test (on success) */
  onContinue: (sessionId: string) => void;
  /** Callback to cancel assembly */
  onCancel: () => void;
}

// ============================================================================
// Stage Configuration
// ============================================================================

const STAGES: Array<{
  phase: AssemblyPhase;
  title: string;
  titleRu: string;
  description: string;
  descriptionRu: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    phase: 'INITIALIZING',
    title: 'Initializing',
    titleRu: 'Инициализация',
    description: 'Setting up assessment parameters',
    descriptionRu: 'Настройка параметров оценки',
    Icon: PlayCircle,
  },
  {
    phase: 'SELECTING',
    title: 'Selecting Questions',
    titleRu: 'Выбор вопросов',
    description: 'Choosing questions for each competency',
    descriptionRu: 'Подбор вопросов для каждой компетенции',
    Icon: ListChecks,
  },
  {
    phase: 'VALIDATING',
    title: 'Validating',
    titleRu: 'Валидация',
    description: 'Checking psychometric criteria',
    descriptionRu: 'Проверка психометрических критериев',
    Icon: Shield,
  },
  {
    phase: 'SHUFFLING',
    title: 'Preparing',
    titleRu: 'Подготовка',
    description: 'Randomizing question order',
    descriptionRu: 'Перемешивание порядка вопросов',
    Icon: Shuffle,
  },
];

// ============================================================================
// Component
// ============================================================================

export function AssemblyProgressModal({
  open,
  onOpenChange,
  progress,
  phase,
  isAssembling,
  isComplete,
  isFailed,
  error,
  sessionId,
  retryCount,
  deltaInfo,
  onRetry,
  onContinue,
  onCancel,
}: AssemblyProgressModalProps) {
  // Calculate overall progress percentage
  const overallProgress = progress?.percentComplete ?? 0;

  // Determine stage status for each phase
  const getStageStatus = (stagePhase: AssemblyPhase): StageStatus => {
    if (isFailed) {
      const currentIndex = STAGES.findIndex((s) => s.phase === phase);
      const stageIndex = STAGES.findIndex((s) => s.phase === stagePhase);
      if (stagePhase === phase) return 'failed';
      return stageIndex < currentIndex ? 'complete' : 'pending';
    }

    if (isComplete) return 'complete';

    const currentIndex = STAGES.findIndex((s) => s.phase === phase);
    const stageIndex = STAGES.findIndex((s) => s.phase === stagePhase);

    if (stageIndex < currentIndex) return 'complete';
    if (stageIndex === currentIndex) return 'active';
    return 'pending';
  };

  // Prevent closing during assembly
  const handleOpenChange = (newOpen: boolean) => {
    if (!isAssembling) {
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          'sm:max-w-md',
          // Mobile: full-width bottom sheet style
          'max-sm:max-w-full max-sm:h-auto max-sm:top-auto max-sm:bottom-0',
          'max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-2xl',
          'max-sm:data-[state=open]:slide-in-from-bottom max-sm:data-[state=closed]:slide-out-to-bottom'
        )}
        // Prevent accidental dismissal during assembly
        onPointerDownOutside={(e) => isAssembling && e.preventDefault()}
        onEscapeKeyDown={(e) => isAssembling && e.preventDefault()}
        showCloseButton={!isAssembling}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isComplete ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span>Тест готов</span>
              </>
            ) : isFailed ? (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                <span>Ошибка сборки</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                <span>Подготовка теста</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Progress Bar */}
          {!isFailed && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Прогресс</span>
                <span className="font-medium tabular-nums">
                  {Math.round(overallProgress)}%
                </span>
              </div>
              <Progress
                value={overallProgress}
                className={cn(
                  'h-2 transition-all',
                  isComplete && 'bg-emerald-100 [&>div]:bg-emerald-500'
                )}
              />
            </div>
          )}

          {/* Stage Indicators */}
          <div className="space-y-1.5">
            <AnimatePresence mode="wait">
              {STAGES.map((stage) => (
                <AssemblyStageIndicator
                  key={stage.phase}
                  title={stage.titleRu}
                  description={stage.descriptionRu}
                  status={getStageStatus(stage.phase)}
                  isActive={phase === stage.phase && isAssembling}
                  progress={
                    stage.phase === 'SELECTING' && progress
                      ? {
                          current: progress.processedCompetencies,
                          total: progress.totalCompetencies,
                        }
                      : undefined
                  }
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Stats Display */}
          {progress && !isFailed && (
            <AssemblyStats
              questionsSelected={progress.questionsSelected}
              elapsedMillis={progress.elapsedMillis}
              message={progress.message}
            />
          )}

          {/* Delta Testing Info */}
          {deltaInfo?.enabled && deltaInfo.skippedCompetencies.length > 0 && (
            <DeltaSkippedInfo
              skippedCompetencies={deltaInfo.skippedCompetencies}
              questionsSaved={deltaInfo.questionsSaved}
              timeSaved={deltaInfo.timeSaved}
            />
          )}

          {/* Error Message */}
          {isFailed && error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/50"
            >
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end pt-2 border-t">
          {isFailed ? (
            <>
              <Button
                variant="outline"
                onClick={onCancel}
                className="h-11 sm:h-10"
              >
                Отмена
              </Button>
              <Button
                onClick={onRetry}
                disabled={retryCount >= 3}
                className="h-11 sm:h-10"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {retryCount > 0
                  ? `Повторить (${3 - retryCount} осталось)`
                  : 'Повторить'}
              </Button>
            </>
          ) : isComplete && sessionId ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-full sm:w-auto"
            >
              <Button
                onClick={() => onContinue(sessionId)}
                className="w-full sm:w-auto h-11 sm:h-10 bg-emerald-600 hover:bg-emerald-700"
              >
                Начать тест
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <Button
              variant="ghost"
              disabled
              className="w-full sm:w-auto h-11 sm:h-10"
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Подготовка...
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AssemblyProgressModal;

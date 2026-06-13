'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { TestSession, SessionQuestion, CurrentQuestionResponse, TestAnswer } from '@/types/domain';
import { testSessionsClientApi, type ApiError } from '@/services/api.client';
import { useTestSessionAdapter, useSessionFeatures } from '@/context/test-session-context';
import type { CompletionResult } from '@/adapters';
import { EnhancedSessionHeader } from '@/components/layout/enhanced-session-header';
import { QuestionCard } from './QuestionCard';
import { QuestionNavigation } from './QuestionNavigation';
import { CompletionDialog } from './CompletionDialog';
import { AnswerSummaryScreen } from './answer-summary';
import { NavigationErrorDialog, AbandonDialog, TimeoutDialog, SwipeIndicators, SaveIndicator } from './components';
import { TestDriveInsights, InsightsToggle, AnalyticsPanel } from './insights';
import { useSwipeNavigation, useReducedMotion } from '@/hooks/use-swipe-navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useZenTheme } from '@/store/zen-theme-store';
import { usePlayerPersistStore } from '@/store/player-persist-store';
import { ZenSettingsPopover } from './ZenSettingsPopover';

// Composed hooks
import { useTimerManagement } from './hooks/useTimerManagement';
import { useAnswerManagement } from './hooks/useAnswerManagement';
import { useQuestionNavigation } from './hooks/useQuestionNavigation';
import { useAnswerSummary } from './hooks/useAnswerSummary';
import { useTestDriveSync } from './hooks/useTestDriveSync';
import { useImmersiveMode } from './hooks/useImmersiveMode';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { usePersistOnExit } from './hooks/usePersistOnExit';
import { useNavigationState } from './hooks/useNavigationState';
import { extractAnswerValue } from './hooks/useAnswerManagement';

// Types

interface ImmersivePlayerProps {
  session: TestSession;
  initialQuestion: CurrentQuestionResponse;
  /**
   * @deprecated Use TestSessionProvider with adapter instead.
   * Auth headers for backward compatibility during migration.
   */
  authHeaders?: Record<string, string>;
  /** Enable test-drive mode for HR insights panel */
  testDriveMode?: boolean;
  /**
   * Called when test is completed successfully.
   * If not provided, defaults to router.push to results page.
   */
  onComplete?: (result: CompletionResult) => void;
  /**
   * Called when test is abandoned.
   * If not provided, defaults to router.push to templates page.
   */
  onAbandon?: () => void;
  /**
   * Called on terminal errors.
   * If not provided, shows toast and redirects.
   */
  onError?: (error: ApiError) => void;
}

/** Question state for progress tracking */
export type QuestionState = 'answered' | 'skipped' | 'current' | 'pending';

interface PlayerState {
  currentQuestion: SessionQuestion | null;
  questionIndex: number;
  totalQuestions: number;
  previousAnswer?: TestAnswer;
  allowSkip: boolean;
  allowBackNavigation: boolean;
  timeRemainingSeconds?: number;
  isSubmitting: boolean;
  direction: 'forward' | 'backward';
  answeredCount: number;
  skippedCount: number;
  questionStates: QuestionState[];
}

// Component

/**
 * ImmersivePlayer - Main test-taking experience
 *
 * Decomposed into composable hooks:
 * - useImmersiveMode: UI store lifecycle + dirty tracking init
 * - useAnswerManagement: answer state, validation, request building
 * - useTimerManagement: countdown timer + timeout dialog
 * - useAnswerSummary: summary screen, submission, edit-from-summary
 * - useQuestionNavigation: next/prev/skip/jump + error recovery
 * - useKeyboardNavigation: keyboard shortcuts (Enter, arrows, S, Esc)
 * - useTestDriveSync: test-drive mode data sync
 */
export function ImmersivePlayer({
  session,
  initialQuestion,
  authHeaders,
  testDriveMode = false,
  onComplete,
  onAbandon,
  onError,
}: ImmersivePlayerProps) {
  const t = useTranslations('assessment');

  // Adapter Resolution (new pattern vs legacy authHeaders)

  let adapter: ReturnType<typeof useTestSessionAdapter> | null = null;
  let sessionFeatures = { supportsTestDrive: true, supportsAnswerReview: true, requiresTakerInfo: false };
  try {
    adapter = useTestSessionAdapter();
    sessionFeatures = useSessionFeatures();
  } catch {
    // Not wrapped in TestSessionProvider - use legacy authHeaders mode
  }

  const effectiveAuthHeaders = authHeaders || { 'X-User-Id': '' };
  const testDriveAvailable = testDriveMode && sessionFeatures.supportsTestDrive;

  // Player State (core state kept in component for shared access)

  const [state, setState] = useState<PlayerState>(() => {
    const questionStates: QuestionState[] = Array.from(
      { length: initialQuestion.totalQuestions },
      () => 'pending' as QuestionState
    );
    for (let i = 0; i < Math.min(initialQuestion.questionIndex, session.answeredQuestions); i++) {
      questionStates[i] = 'answered';
    }
    if (initialQuestion.questionIndex < initialQuestion.totalQuestions) {
      questionStates[initialQuestion.questionIndex] = 'current';
    }
    return {
      currentQuestion: initialQuestion.question,
      questionIndex: initialQuestion.questionIndex,
      totalQuestions: initialQuestion.totalQuestions,
      previousAnswer: initialQuestion.previousAnswer,
      allowSkip: initialQuestion.allowSkip,
      allowBackNavigation: initialQuestion.allowBackNavigation,
      timeRemainingSeconds: initialQuestion.timeRemainingSeconds,
      isSubmitting: false,
      direction: 'forward',
      answeredCount: session.answeredQuestions,
      skippedCount: 0,
      questionStates,
    };
  });

  const currentQuestion = state.currentQuestion;

  // Hook: Immersive Mode (UI store + dirty tracking lifecycle)

  useImmersiveMode({
    initialQuestionId: initialQuestion.question?.id,
    initialAnswerValue: extractAnswerValue(initialQuestion.previousAnswer),
  });

  // Hook: Answer Management

  const {
    currentAnswer,
    setCurrentAnswer,
    validationError,
    setValidationError,
    isAnswerValid,
    validateAnswer,
    buildAnswerRequest,
    handleAnswer,
    questionStartTime,
  } = useAnswerManagement({
    sessionId: session.id,
    currentQuestion,
    initialQuestion,
  });

  // Hook: Timer Management

  const {
    timeRemaining,
    totalSeconds,
    showTimeoutDialog,
    compactFormattedTime,
    isWarning: timerIsWarning,
    isCritical: timerIsCritical,
    syncTimer,
  } = useTimerManagement({
    initialSeconds: initialQuestion.timeRemainingSeconds ?? null,
  });

  // Timer persistence (continue countdown on resume)

  const isTimed = initialQuestion.timeRemainingSeconds != null;
  const timeRemainingRef = useRef<number | null>(timeRemaining);
  useEffect(() => {
    timeRemainingRef.current = timeRemaining;
  });

  /** Push the current remaining time to the server (awaited, for Save & Exit). */
  const persistTimerToServer = useCallback(async () => {
    const tr = timeRemainingRef.current;
    if (tr == null || tr <= 0) return;
    if (adapter) {
      await adapter.syncTimeRemaining(session.id, tr);
    } else {
      await testSessionsClientApi.updateTimeRemaining(session.id, tr, effectiveAuthHeaders);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adapter, session.id]);

  // Hook: Answer Summary

  const {
    showSummary,
    summaryAnswers,
    summaryGroups,
    isSummarySubmitting,
    handleEnterSummary,
    handleGoBackFromSummary,
    handleEditFromSummary,
    handleSubmitFromSummary,
    cacheQuestion,
  } = useAnswerSummary({
    session,
    adapter,
    effectiveAuthHeaders,
    state,
    setState,
    setCurrentAnswer,
    setValidationError,
    questionStartTime,
    initialQuestion,
    onTimerSync: syncTimer,
    onComplete,
    onError,
  });

  // Hook: Question Navigation

  const {
    handleNext,
    handlePrevious,
    handleSkip,
    handleNavigateToQuestion,
    handleComplete,
    handleExit,
    handleSaveAndExit,
    handleDiscardTest,
    isExiting,
    isDiscarding,
    handleRetryNavigation,
    handleDismissNavigationError,
    handleContinueWithoutSaving,
    canSkip,
    showAbandonDialog,
    setShowAbandonDialog,
    showCompletion,
    setShowCompletion,
    showNavigationError,
    setShowNavigationError,
    navigationError,
    isRetryingNavigation,
    hasUnsavedChanges,
    saveStatus,
  } = useQuestionNavigation({
    session,
    adapter,
    effectiveAuthHeaders,
    state,
    setState,
    currentAnswer,
    setCurrentAnswer,
    currentQuestion,
    setValidationError,
    validateAnswer,
    buildAnswerRequest,
    isAnswerValid,
    questionStartTime,
    onTimerSync: syncTimer,
    onEnterSummary: handleEnterSummary,
    onQuestionLoaded: cacheQuestion,
    onComplete,
    onAbandon,
    onError,
    onPersistState: persistTimerToServer,
  });

  // Hook: Keyboard Navigation

  useKeyboardNavigation({
    canGoNext: isAnswerValid,
    canGoBack: state.allowBackNavigation && state.questionIndex > 0,
    canSkip: canSkip && !state.isSubmitting,
    isSubmitting: state.isSubmitting,
    onNext: handleNext,
    onPrevious: handlePrevious,
    onSkip: handleSkip,
  });

  // Exit Persistence (flush in-flight answer + timer on accidental exit)

  const unsavedRef = useRef(false);
  useEffect(() => {
    unsavedRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  // Rebuilt every render so the once-registered exit listeners read fresh state.
  const flushOnExitRef = useRef<() => void>(() => {});
  useEffect(() => {
    flushOnExitRef.current = () => {
      // 1) Flush the current question's answer if it has unsaved changes.
      try {
        const qId = currentQuestion?.id;
        if (
          qId &&
          useNavigationState.getState().isDirty(qId) &&
          currentAnswer !== undefined &&
          validateAnswer(currentAnswer).valid
        ) {
          const request = buildAnswerRequest(currentAnswer);
          if (adapter) {
            void adapter.submitAnswer(session.id, request, { keepalive: true }).catch(() => {});
          } else {
            void testSessionsClientApi
              .submitAnswer(session.id, request, effectiveAuthHeaders, { keepalive: true })
              .catch(() => {});
          }
          useNavigationState.getState().markClean(qId);
        }
      } catch {
        // Best-effort — never throw from an unload handler.
      }
      // 2) Persist the remaining time so resume continues the countdown.
      try {
        const tr = timeRemainingRef.current;
        if (tr != null && tr > 0) {
          if (adapter) {
            void adapter.syncTimeRemaining(session.id, tr, { keepalive: true }).catch(() => {});
          } else {
            void testSessionsClientApi
              .updateTimeRemaining(session.id, tr, effectiveAuthHeaders, { keepalive: true })
              .catch(() => {});
          }
        }
      } catch {
        // Best-effort.
      }
    };
  });

  usePersistOnExit({ enabled: true, flushRef: flushOnExitRef, unsavedRef });

  // Flush on unmount too: browser back / in-app (soft) navigation tears the
  // player down without firing pagehide/beforeunload. This cleanup runs before
  // useImmersiveMode's dirty-clearing cleanup (declared earlier), so the dirty
  // in-flight answer is still present to be saved. No-op after Save & Exit
  // (dirty already cleared) or completion (answer already submitted).
  useEffect(() => {
    return () => {
      flushOnExitRef.current();
    };
  }, []);

  // Periodically persist the timer so a crash/close loses at most one interval.
  useEffect(() => {
    if (!isTimed) return;
    const intervalId = setInterval(() => {
      const tr = timeRemainingRef.current;
      if (tr != null && tr > 0) {
        if (adapter) {
          void adapter.syncTimeRemaining(session.id, tr).catch(() => {});
        } else {
          void testSessionsClientApi
            .updateTimeRemaining(session.id, tr, effectiveAuthHeaders)
            .catch(() => {});
        }
      }
    }, 15000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimed, adapter, session.id]);

  // Hook: Test-Drive Sync

  useTestDriveSync({
    testDriveAvailable,
    testDriveMode,
    currentQuestion,
    questionIndex: state.questionIndex,
    totalQuestions: state.totalQuestions,
  });

  // Zen Theme & Language Restore

  const zenTheme = useZenTheme();
  const zenClass = zenTheme === 'dark' ? 'zen-dark' : 'zen-light';

  useEffect(() => {
    document.body.classList.add(zenClass);
    return () => document.body.classList.remove(zenClass);
  }, [zenClass]);

  // Responsive & Swipe Navigation

  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const animationDistance = isMobile ? 100 : 300;

  const canSwipeNext = isAnswerValid && !state.isSubmitting;
  const canSwipePrevious = state.allowBackNavigation && state.questionIndex > 0 && !state.isSubmitting;

  const { swipeState, handlers: swipeHandlers } = useSwipeNavigation({
    enabled: isMobile && (canSwipeNext || canSwipePrevious),
    minSwipeDistance: 50,
    maxVerticalDistance: 100,
    onSwipeLeft: canSwipeNext ? handleNext : undefined,
    onSwipeRight: canSwipePrevious ? handlePrevious : undefined,
  });

  // Animation Variants

  const slideVariants = prefersReducedMotion
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        enter: (direction: 'forward' | 'backward') => ({
          x: direction === 'forward' ? animationDistance : -animationDistance,
          opacity: 0,
        }),
        center: { x: 0, opacity: 1 },
        exit: (direction: 'forward' | 'backward') => ({
          x: direction === 'forward' ? -animationDistance : animationDistance,
          opacity: 0,
        }),
      };

  const transitionSettings = prefersReducedMotion
    ? { duration: 0.01 }
    : isMobile
      ? { x: { type: 'spring' as const, stiffness: 400, damping: 35 }, opacity: { duration: 0.15 } }
      : { x: { type: 'spring' as const, stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } };

  // Render: Empty State

  if (!currentQuestion) {
    return (
      <div className={cn('min-h-screen flex items-center justify-center bg-[var(--zen-bg)]', zenClass)}>
        <p className="text-[var(--zen-text-secondary)]">No questions available</p>
      </div>
    );
  }

  // Render: Answer Summary Screen

  if (showSummary) {
    return (
      <AnswerSummaryScreen
        session={session}
        answers={summaryAnswers}
        competencyGroups={summaryGroups}
        timeRemaining={timeRemaining}
        onGoBack={handleGoBackFromSummary}
        onSubmit={handleSubmitFromSummary}
        onEditAnswer={handleEditFromSummary}
        isSubmitting={isSummarySubmitting}
      />
    );
  }

  // Render: Main Player

  return (
    <div className={cn('min-h-screen min-h-[100dvh] bg-[var(--zen-bg)] flex flex-col safe-area-inset-all', zenClass)}>
      <EnhancedSessionHeader
        testName={session.templateName}
        currentQuestion={state.questionIndex + 1}
        totalQuestions={state.totalQuestions}
        questionStates={state.questionStates}
        timeRemaining={timeRemaining}
        totalSeconds={totalSeconds}
        compactFormattedTime={compactFormattedTime}
        timerIsWarning={timerIsWarning}
        timerIsCritical={timerIsCritical}
        allowNavigation={state.allowBackNavigation}
        allowSkip={state.allowSkip}
        onExit={handleExit}
        onNavigate={handleNavigateToQuestion}
        settingsSlot={
          <ZenSettingsPopover
            questionIndex={state.questionIndex}
            currentAnswer={currentAnswer}
          />
        }
      />

      {/* Split-screen grid when test-drive is active on lg+, otherwise single column */}
      <div className={cn('flex-1 flex flex-col', testDriveAvailable && 'lg:grid lg:grid-cols-[1fr_auto]')}>
        {/* Left panel — Question + Navigation */}
        <div className="flex-1 flex flex-col overflow-hidden lg:overflow-y-auto">
          <main
            className="flex-1 flex items-center justify-center px-3 sm:px-4 py-4 sm:py-8 overflow-hidden pb-safe swipe-container"
            {...swipeHandlers}
          >
            <div className={cn('w-full relative will-change-slide', testDriveAvailable ? 'max-w-2xl' : 'max-w-3xl')}>
              {isMobile && (
                <SwipeIndicators
                  swipeState={swipeState}
                  canSwipeNext={canSwipeNext}
                  canSwipePrevious={canSwipePrevious}
                />
              )}

              <AnimatePresence mode="wait" custom={state.direction}>
                <motion.div
                  key={currentQuestion.id}
                  custom={state.direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={transitionSettings}
                  className="gpu-accelerated"
                >
                  <QuestionCard
                    question={currentQuestion}
                    selectedValue={currentAnswer}
                    onAnswer={handleAnswer}
                    questionNumber={state.questionIndex + 1}
                    validationError={validationError || undefined}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

          {/* Save status indicator */}
          <SaveIndicator status={saveStatus} className="fixed top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none" />

          {/* Navigation bar — sticky at bottom of left panel */}
          <QuestionNavigation
            canGoBack={state.allowBackNavigation && state.questionIndex > 0}
            canGoForward={isAnswerValid}
            canSkip={canSkip}
            isLastQuestion={state.questionIndex + 1 >= state.totalQuestions}
            isSubmitting={state.isSubmitting}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSkip={handleSkip}
            validationError={validationError}
            hasUnsavedChanges={hasUnsavedChanges}
            backDisabledReason={
              !state.allowBackNavigation
                ? t('player.navigation.backDisabled')
                : state.questionIndex <= 0
                  ? t('player.navigation.firstQuestion')
                  : undefined
            }
          />
        </div>

        {/* Right panel — Analytics (desktop only, always visible in test-drive mode) */}
        {testDriveAvailable && (
          <aside
            className="hidden lg:flex flex-col px-4 py-4 bg-[var(--zen-card)] border-l border-[var(--zen-border)] overflow-y-auto"
            aria-label={t('insights.analysisPanel')}
          >
            <div className="w-[500px] min-w-[500px] mx-auto my-auto">
              <AnalyticsPanel />
            </div>
          </aside>
        )}
      </div>

      <CompletionDialog
        open={showCompletion}
        onOpenChange={setShowCompletion}
        onComplete={handleComplete}
        answeredCount={state.answeredCount}
        totalQuestions={state.totalQuestions}
        skippedCount={state.skippedCount}
        isSubmitting={state.isSubmitting}
      />

      <AbandonDialog
        open={showAbandonDialog}
        onOpenChange={setShowAbandonDialog}
        onAbandon={handleSaveAndExit}
        onDiscard={handleDiscardTest}
        isSubmitting={isExiting}
        isDiscarding={isDiscarding}
      />

      <TimeoutDialog
        open={showTimeoutDialog}
        onComplete={handleComplete}
      />

      <NavigationErrorDialog
        open={showNavigationError}
        onOpenChange={setShowNavigationError}
        error={navigationError}
        onRetry={handleRetryNavigation}
        onDismiss={handleDismissNavigationError}
        onContinueWithoutSaving={handleContinueWithoutSaving}
        isRetrying={isRetryingNavigation}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Mobile only: toggle + drawer (hidden on lg+ where analytics panel is inline) */}
      <div className={cn(testDriveAvailable && 'lg:hidden')}>
        <InsightsToggle />
        <TestDriveInsights />
      </div>
    </div>
  );
}

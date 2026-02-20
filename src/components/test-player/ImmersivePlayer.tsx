'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { TestSession, SessionQuestion, CurrentQuestionResponse, TestAnswer } from '@/types/domain';
import { type ApiError } from '@/services/api.client';
import { useTestSessionAdapter, useSessionFeatures } from '@/context/test-session-context';
import type { CompletionResult } from '@/adapters';
import { EnhancedSessionHeader } from '@/components/layout/enhanced-session-header';
import { QuestionCard } from './QuestionCard';
import { QuestionNavigation } from './QuestionNavigation';
import { CompletionDialog } from './CompletionDialog';
import { AnswerSummaryScreen } from './answer-summary';
import { NavigationErrorDialog, AbandonDialog, TimeoutDialog, SwipeIndicators, SaveIndicator } from './components';
import { TestDriveInsights, InsightsToggle } from './insights';
import { useSwipeNavigation, useReducedMotion } from '@/hooks/use-swipe-navigation';
import { useIsMobile } from '@/hooks/use-mobile';

// Composed hooks
import { useTimerManagement } from './hooks/useTimerManagement';
import { useAnswerManagement } from './hooks/useAnswerManagement';
import { useQuestionNavigation } from './hooks/useQuestionNavigation';
import { useAnswerSummary } from './hooks/useAnswerSummary';
import { useTestDriveSync } from './hooks/useTestDriveSync';
import { useImmersiveMode } from './hooks/useImmersiveMode';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { extractAnswerValue } from './hooks/useAnswerManagement';

// ============================================================================
// Types
// ============================================================================

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

// ============================================================================
// Component
// ============================================================================

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

  // ========================================================================
  // Adapter Resolution (new pattern vs legacy authHeaders)
  // ========================================================================

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

  // ========================================================================
  // Player State (core state kept in component for shared access)
  // ========================================================================

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

  // ========================================================================
  // Hook: Immersive Mode (UI store + dirty tracking lifecycle)
  // ========================================================================

  useImmersiveMode({
    initialQuestionId: initialQuestion.question?.id,
    initialAnswerValue: extractAnswerValue(initialQuestion.previousAnswer),
  });

  // ========================================================================
  // Hook: Answer Management
  // ========================================================================

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

  // ========================================================================
  // Hook: Timer Management
  // ========================================================================

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

  // ========================================================================
  // Hook: Answer Summary
  // ========================================================================

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

  // ========================================================================
  // Hook: Question Navigation
  // ========================================================================

  const {
    handleNext,
    handlePrevious,
    handleSkip,
    handleNavigateToQuestion,
    handleComplete,
    handleExit,
    handleAbandonTest,
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
  });

  // ========================================================================
  // Hook: Keyboard Navigation
  // ========================================================================

  useKeyboardNavigation({
    canGoNext: isAnswerValid,
    canGoBack: state.allowBackNavigation && state.questionIndex > 0,
    canSkip: canSkip && !state.isSubmitting,
    isSubmitting: state.isSubmitting,
    onNext: handleNext,
    onPrevious: handlePrevious,
    onSkip: handleSkip,
  });

  // ========================================================================
  // Hook: Test-Drive Sync
  // ========================================================================

  useTestDriveSync({
    testDriveAvailable,
    testDriveMode,
    currentQuestion,
  });

  // ========================================================================
  // Responsive & Swipe Navigation
  // ========================================================================

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

  // ========================================================================
  // Animation Variants
  // ========================================================================

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

  // ========================================================================
  // Render: Empty State
  // ========================================================================

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <p className="text-neutral-400">No questions available</p>
      </div>
    );
  }

  // ========================================================================
  // Render: Answer Summary Screen
  // ========================================================================

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

  // ========================================================================
  // Render: Main Player
  // ========================================================================

  return (
    <div className="min-h-screen min-h-[100dvh] bg-neutral-950 flex flex-col safe-area-inset-all">
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
      />

      <main
        className="flex-1 flex items-center justify-center px-3 sm:px-4 py-4 sm:py-8 overflow-hidden pb-safe swipe-container"
        {...swipeHandlers}
      >
        <div className="w-full max-w-3xl relative will-change-slide">
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
      <div className="flex justify-center pb-1">
        <SaveIndicator status={saveStatus} />
      </div>

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
        onConfirm={handleAbandonTest}
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

      <InsightsToggle />
      <TestDriveInsights />
    </div>
  );
}

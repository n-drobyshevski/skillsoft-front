'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { TestSession, SessionQuestion, CurrentQuestionResponse, TestAnswer, SubmitAnswerRequest, QuestionType } from '@/types/domain';
import { testSessionsApi } from '@/services/api';
import { SessionHeader } from './SessionHeader';
import { QuestionCard } from './QuestionCard';
import { QuestionNavigation } from './QuestionNavigation';
import { CompletionDialog } from './CompletionDialog';
import { useUIStore } from '@/store/ui-store';
import { toast } from 'sonner';

interface ImmersivePlayerProps {
  session: TestSession;
  initialQuestion: CurrentQuestionResponse;
}

interface PlayerState {
  currentQuestion: SessionQuestion | null;
  questionNumber: number;
  totalQuestions: number;
  previousAnswer?: TestAnswer;
  allowSkip: boolean;
  allowBackNavigation: boolean;
  timeRemainingSeconds?: number;
  isSubmitting: boolean;
  direction: 'forward' | 'backward';
  answeredCount: number;
}

/**
 * ImmersivePlayer - Main test-taking experience
 *
 * Features:
 * - Animated question transitions
 * - Keyboard navigation
 * - Auto-save answers
 * - Progress tracking
 * - Timer management
 */
export function ImmersivePlayer({ session, initialQuestion }: ImmersivePlayerProps) {
  const router = useRouter();
  const enterImmersiveMode = useUIStore((state) => state.enterImmersiveMode);
  const exitImmersiveMode = useUIStore((state) => state.exitImmersiveMode);

  // Player state
  const [state, setState] = useState<PlayerState>({
    currentQuestion: initialQuestion.question,
    questionNumber: initialQuestion.questionNumber,
    totalQuestions: initialQuestion.totalQuestions,
    previousAnswer: initialQuestion.previousAnswer,
    allowSkip: initialQuestion.allowSkip,
    allowBackNavigation: initialQuestion.allowBackNavigation,
    timeRemainingSeconds: initialQuestion.timeRemainingSeconds,
    isSubmitting: false,
    direction: 'forward',
    answeredCount: session.answeredQuestions,
  });

  // Current answer value
  const [currentAnswer, setCurrentAnswer] = useState<string | number | string[] | undefined>(() => {
    if (initialQuestion.previousAnswer) {
      if (initialQuestion.previousAnswer.likertValue !== undefined) {
        return initialQuestion.previousAnswer.likertValue;
      }
      if (initialQuestion.previousAnswer.selectedOptionIds?.length) {
        return initialQuestion.previousAnswer.selectedOptionIds.length === 1
          ? initialQuestion.previousAnswer.selectedOptionIds[0]
          : initialQuestion.previousAnswer.selectedOptionIds;
      }
    }
    return undefined;
  });

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    initialQuestion.timeRemainingSeconds ?? null
  );

  // Completion dialog
  const [showCompletion, setShowCompletion] = useState(false);

  // Track answer timing
  const questionStartTime = useRef(Date.now());

  // Enter immersive mode on mount
  useEffect(() => {
    enterImmersiveMode();
    return () => exitImmersiveMode();
  }, [enterImmersiveMode, exitImmersiveMode]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const currentQuestion = state.currentQuestion;
  const progress = state.totalQuestions > 0
    ? (state.questionNumber / state.totalQuestions) * 100
    : 0;

  /**
   * Build SubmitAnswerRequest from answer value
   */
  const buildAnswerRequest = useCallback((value: string | number | string[]): SubmitAnswerRequest => {
    const timeSpentSeconds = Math.floor((Date.now() - questionStartTime.current) / 1000);
    const request: SubmitAnswerRequest = {
      sessionId: session.id,
      questionId: state.currentQuestion?.id || '',
      timeSpentSeconds,
    };

    if (typeof value === 'number') {
      request.likertValue = value;
    } else if (Array.isArray(value)) {
      request.selectedOptionIds = value;
    } else {
      request.selectedOptionIds = [value];
    }

    return request;
  }, [session.id, state.currentQuestion?.id]);

  /**
   * Handle answer selection
   */
  const handleAnswer = useCallback(async (value: string | number | string[]) => {
    if (!currentQuestion || state.isSubmitting) return;

    // Optimistic update
    setCurrentAnswer(value);
  }, [currentQuestion, state.isSubmitting]);

  /**
   * Fetch and display question at given index
   */
  const loadQuestion = useCallback(async (direction: 'forward' | 'backward') => {
    try {
      const response = await testSessionsApi.getCurrentQuestion(session.id);
      if (response) {
        setState(prev => ({
          ...prev,
          currentQuestion: response.question,
          questionNumber: response.questionNumber,
          totalQuestions: response.totalQuestions,
          previousAnswer: response.previousAnswer,
          allowSkip: response.allowSkip,
          allowBackNavigation: response.allowBackNavigation,
          timeRemainingSeconds: response.timeRemainingSeconds,
          direction,
        }));

        // Set previous answer if exists
        if (response.previousAnswer) {
          if (response.previousAnswer.likertValue !== undefined) {
            setCurrentAnswer(response.previousAnswer.likertValue);
          } else if (response.previousAnswer.selectedOptionIds?.length) {
            setCurrentAnswer(
              response.previousAnswer.selectedOptionIds.length === 1
                ? response.previousAnswer.selectedOptionIds[0]
                : response.previousAnswer.selectedOptionIds
            );
          } else {
            setCurrentAnswer(undefined);
          }
        } else {
          setCurrentAnswer(undefined);
        }

        if (response.timeRemainingSeconds !== undefined) {
          setTimeRemaining(response.timeRemainingSeconds);
        }
      }
    } catch (error) {
      console.error('Failed to load question:', error);
      toast.error('Failed to load question. Please try again.');
    }
    questionStartTime.current = Date.now();
  }, [session.id]);

  /**
   * Navigate to next question
   */
  const handleNext = useCallback(async () => {
    if (state.isSubmitting) return;

    // Check if current question is answered
    if (currentQuestion && currentAnswer === undefined) {
      toast.warning('Please select an answer before continuing.');
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Submit answer
      if (currentQuestion && currentAnswer !== undefined) {
        const request = buildAnswerRequest(currentAnswer);
        await testSessionsApi.submitAnswer(session.id, request);
        setState(prev => ({ ...prev, answeredCount: prev.answeredCount + 1 }));
      }

      // Check if last question
      if (state.questionNumber >= state.totalQuestions) {
        setShowCompletion(true);
        setState(prev => ({ ...prev, isSubmitting: false }));
        return;
      }

      // Navigate to next question
      await testSessionsApi.navigateToQuestion(session.id, session.currentQuestionIndex + 1);
      await loadQuestion('forward');
    } catch (error) {
      console.error('Failed to submit answer:', error);
      toast.error('Failed to save answer. Please try again.');
    }

    setState(prev => ({ ...prev, isSubmitting: false }));
  }, [state.isSubmitting, state.questionNumber, state.totalQuestions, currentQuestion, currentAnswer, buildAnswerRequest, session.id, session.currentQuestionIndex, loadQuestion]);

  /**
   * Navigate to previous question
   */
  const handlePrevious = useCallback(async () => {
    if (!state.allowBackNavigation || state.isSubmitting) return;

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      await testSessionsApi.navigateToQuestion(session.id, session.currentQuestionIndex - 1);
      await loadQuestion('backward');
    } catch (error) {
      console.error('Failed to navigate back:', error);
      toast.error('Failed to go back. Please try again.');
    }

    setState(prev => ({ ...prev, isSubmitting: false }));
  }, [state.allowBackNavigation, state.isSubmitting, session.id, session.currentQuestionIndex, loadQuestion]);

  /**
   * Handle test completion
   */
  const handleComplete = useCallback(async () => {
    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Submit current answer if exists
      if (currentQuestion && currentAnswer !== undefined) {
        const request = buildAnswerRequest(currentAnswer);
        await testSessionsApi.submitAnswer(session.id, request);
      }

      const result = await testSessionsApi.completeSession(session.id);
      router.push(`/test-templates/results/${result.id}`);
    } catch (error) {
      console.error('Failed to complete session:', error);
      toast.error('Failed to submit assessment. Please try again.');
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [session.id, router, currentQuestion, currentAnswer, buildAnswerRequest]);

  /**
   * Handle time expiration
   */
  const handleTimeExpired = useCallback(async () => {
    toast.warning('Time expired! Submitting your answers...');
    await handleComplete();
  }, [handleComplete]);

  /**
   * Handle exit/abandon
   */
  const handleExit = useCallback(() => {
    router.push('/test-templates');
  }, [router]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'Enter':
          if (!e.shiftKey && currentAnswer !== undefined) {
            e.preventDefault();
            handleNext();
          }
          break;
        case 'ArrowRight':
          if (currentAnswer !== undefined) {
            handleNext();
          }
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'Escape':
          // Could show exit confirmation
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentAnswer, handleNext, handlePrevious]);

  // Animation variants
  const slideVariants = {
    enter: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? -300 : 300,
      opacity: 0,
    }),
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">No questions available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Session Header */}
      <SessionHeader
        currentQuestion={state.questionNumber}
        totalQuestions={state.totalQuestions}
        progress={progress}
        timeRemaining={timeRemaining}
        onExit={handleExit}
      />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 overflow-hidden">
        <div className="w-full max-w-3xl relative">
          <AnimatePresence mode="wait" custom={state.direction}>
            <motion.div
              key={currentQuestion.id}
              custom={state.direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
            >
              <QuestionCard
                question={currentQuestion}
                selectedValue={currentAnswer}
                onAnswer={handleAnswer}
                questionNumber={state.questionNumber}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Navigation Footer */}
      <QuestionNavigation
        canGoBack={state.allowBackNavigation && state.questionNumber > 1}
        canGoForward={currentAnswer !== undefined}
        isLastQuestion={state.questionNumber >= state.totalQuestions}
        isSubmitting={state.isSubmitting}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />

      {/* Completion Dialog */}
      <CompletionDialog
        open={showCompletion}
        onOpenChange={setShowCompletion}
        onComplete={handleComplete}
        answeredCount={state.answeredCount}
        totalQuestions={state.totalQuestions}
        isSubmitting={state.isSubmitting}
      />
    </div>
  );
}

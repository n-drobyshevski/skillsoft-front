'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { TestSession, SessionQuestion, AnswerValue } from '@/types/domain';
import { testSessionsApi } from '@/services/api';
import { SessionHeader } from './SessionHeader';
import { QuestionCard } from './QuestionCard';
import { QuestionNavigation } from './QuestionNavigation';
import { CompletionDialog } from './CompletionDialog';
import { useUIStore } from '@/store/ui-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImmersivePlayerProps {
  session: TestSession;
}

interface PlayerState {
  currentQuestionIndex: number;
  answers: Map<string, AnswerValue>;
  questions: SessionQuestion[];
  isSubmitting: boolean;
  direction: 'forward' | 'backward';
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
export function ImmersivePlayer({ session }: ImmersivePlayerProps) {
  const router = useRouter();
  const enterImmersiveMode = useUIStore((state) => state.enterImmersiveMode);
  const exitImmersiveMode = useUIStore((state) => state.exitImmersiveMode);

  // Player state
  const [state, setState] = useState<PlayerState>({
    currentQuestionIndex: session.currentQuestionIndex || 0,
    answers: new Map(
      session.answers?.map(a => [a.questionId, a.value]) || []
    ),
    questions: session.questions || [],
    isSubmitting: false,
    direction: 'forward',
  });

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    session.endTime 
      ? Math.max(0, Math.floor((new Date(session.endTime).getTime() - Date.now()) / 1000))
      : null
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

  // Current question
  const currentQuestion = state.questions[state.currentQuestionIndex];
  const currentAnswer = currentQuestion 
    ? state.answers.get(currentQuestion.id) 
    : undefined;
  const totalQuestions = state.questions.length;
  const progress = totalQuestions > 0 
    ? ((state.currentQuestionIndex + 1) / totalQuestions) * 100 
    : 0;

  /**
   * Handle answer selection
   */
  const handleAnswer = useCallback(async (value: AnswerValue) => {
    if (!currentQuestion || state.isSubmitting) return;

    const timeSpentMs = Date.now() - questionStartTime.current;

    // Optimistic update
    setState(prev => ({
      ...prev,
      answers: new Map(prev.answers).set(currentQuestion.id, value),
    }));

    // Submit to server
    try {
      await testSessionsApi.submitAnswer(session.id, {
        questionId: currentQuestion.id,
        value,
        timeSpentMs,
      });
    } catch (error) {
      console.error('Failed to save answer:', error);
      toast.error('Failed to save answer. Please try again.');
    }
  }, [currentQuestion, session.id, state.isSubmitting]);

  /**
   * Navigate to next question
   */
  const handleNext = useCallback(async () => {
    if (state.isSubmitting) return;

    // Check if current question is answered
    if (currentQuestion && !state.answers.has(currentQuestion.id)) {
      toast.warning('Please select an answer before continuing.');
      return;
    }

    // Check if last question
    if (state.currentQuestionIndex >= totalQuestions - 1) {
      setShowCompletion(true);
      return;
    }

    setState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      direction: 'forward',
    }));
    questionStartTime.current = Date.now();
  }, [state.isSubmitting, state.answers, currentQuestion, state.currentQuestionIndex, totalQuestions]);

  /**
   * Navigate to previous question
   */
  const handlePrevious = useCallback(() => {
    if (state.currentQuestionIndex <= 0 || state.isSubmitting) return;

    setState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex - 1,
      direction: 'backward',
    }));
    questionStartTime.current = Date.now();
  }, [state.currentQuestionIndex, state.isSubmitting]);

  /**
   * Handle test completion
   */
  const handleComplete = useCallback(async () => {
    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      await testSessionsApi.completeSession(session.id);
      router.push(`/test-templates/results/${session.id}`);
    } catch (error) {
      console.error('Failed to complete session:', error);
      toast.error('Failed to submit assessment. Please try again.');
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [session.id, router]);

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
        currentQuestion={state.currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
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
                questionNumber={state.currentQuestionIndex + 1}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Navigation Footer */}
      <QuestionNavigation
        canGoBack={state.currentQuestionIndex > 0}
        canGoForward={currentAnswer !== undefined}
        isLastQuestion={state.currentQuestionIndex >= totalQuestions - 1}
        isSubmitting={state.isSubmitting}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />

      {/* Completion Dialog */}
      <CompletionDialog
        open={showCompletion}
        onOpenChange={setShowCompletion}
        onComplete={handleComplete}
        answeredCount={state.answers.size}
        totalQuestions={totalQuestions}
        isSubmitting={state.isSubmitting}
      />
    </div>
  );
}
'use client';

import { useRef, useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { useShallow } from 'zustand/react/shallow';
import { SummaryHero } from './SummaryHero';
import { AllCompleteState } from './AllCompleteState';
import { AttentionSegment } from './AttentionSegment';
import { CompletedSegment } from './CompletedSegment';
import { ActionFooter } from './ActionFooter';
import { SubmissionProgress } from './SubmissionProgress';
import { CompletionDialog } from '../CompletionDialog';
import {
  useReviewStore,
  AnswerSummaryItem,
} from '@/store/review-store';
import type { CompetencyGroup } from '@/store/review-store';
import { TestSession } from '@/types/domain';

interface AnswerSummaryScreenProps {
  session: TestSession;
  answers: AnswerSummaryItem[];
  competencyGroups: CompetencyGroup[];
  timeRemaining: number | null;
  onGoBack: () => void;
  onSubmit: () => void;
  onEditAnswer: (questionId: string, questionIndex: number) => void;
  isSubmitting: boolean;
}

/**
 * AnswerSummaryScreen - Segmented attention flow layout
 *
 * Two segments:
 * 1. "Needs Attention" (skipped + flagged) -- always visible
 * 2. "All Answered" (completed) -- collapsed by default
 *
 * When all questions are answered, shows celebration state.
 * Wires CompletionDialog for submit confirmation.
 */
export function AnswerSummaryScreen({
  session,
  answers,
  onGoBack,
  onSubmit,
  onEditAnswer,
  isSubmitting,
}: AnswerSummaryScreenProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  // Store state
  const {
    isCompletedExpanded,
    scrollPosition,
    submissionError,
    submissionAttempts,
  } = useReviewStore(
    useShallow((state) => ({
      isCompletedExpanded: state.isCompletedExpanded,
      scrollPosition: state.scrollPosition,
      submissionError: state.lastSubmissionError,
      submissionAttempts: state.submissionAttempts,
    }))
  );

  // Store actions
  const {
    toggleCompletedExpanded,
    saveScrollPosition,
    retrySubmission,
    cancelSubmission,
  } = useReviewStore(
    useShallow((state) => ({
      toggleCompletedExpanded: state.toggleCompletedExpanded,
      saveScrollPosition: state.saveScrollPosition,
      retrySubmission: state.retrySubmission,
      cancelSubmission: state.cancelSubmission,
    }))
  );

  // Derive segments
  const attentionItems = answers
    .filter(a => a.status === 'skipped' || a.status === 'flagged')
    .sort((a, b) => a.questionIndex - b.questionIndex);

  const completedItems = answers
    .filter(a => a.status === 'answered')
    .sort((a, b) => a.questionIndex - b.questionIndex);

  const stats = {
    total: answers.length,
    answered: completedItems.length,
    skipped: answers.filter(a => a.status === 'skipped').length,
    flagged: answers.filter(a => a.status === 'flagged').length,
  };

  const isAllAnswered = stats.answered >= stats.total;
  const hasSkipped = stats.skipped > 0;
  const canSubmit = stats.answered > 0;

  // Restore scroll position on mount
  useEffect(() => {
    if (scrollPosition > 0 && scrollRef.current) {
      scrollRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

  // Handle edit - save scroll position before navigating
  const handleEditAnswer = (questionId: string, questionIndex: number) => {
    if (scrollRef.current) {
      saveScrollPosition(scrollRef.current.scrollTop);
    }
    onEditAnswer(questionId, questionIndex);
  };

  // Handle submit button click -- open confirmation dialog
  const handleSubmitClick = () => {
    setShowCompletionDialog(true);
  };

  // Handle confirmed submission
  const handleConfirmSubmit = () => {
    setShowCompletionDialog(false);
    onSubmit();
  };

  // Handle retry submission
  const handleRetry = () => {
    retrySubmission();
    onSubmit();
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[var(--zen-bg)] flex flex-col">
      {/* Scrollable content area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        {/* Hero section */}
        <div className="px-3 sm:px-4 pt-4 sm:pt-6">
          <div className="max-w-3xl mx-auto">
            <SummaryHero
              totalQuestions={stats.total}
              answeredCount={stats.answered}
              skippedCount={stats.skipped}
              flaggedCount={stats.flagged}
              templateName={session.templateName}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="px-3 sm:px-4 py-4 sm:py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Celebration state OR segmented flow */}
            {isAllAnswered ? (
              <AllCompleteState />
            ) : (
              <>
                {/* Attention segment: skipped + flagged */}
                <AttentionSegment
                  items={attentionItems}
                  onEditAnswer={handleEditAnswer}
                />
              </>
            )}

            {/* Completed segment: collapsible answered items */}
            {completedItems.length > 0 && (
              <CompletedSegment
                items={completedItems}
                isExpanded={isCompletedExpanded}
                onToggle={toggleCompletedExpanded}
              />
            )}
          </div>
        </div>
      </div>

      {/* Action footer - sticky */}
      <ActionFooter
        onGoBack={onGoBack}
        onSubmit={handleSubmitClick}
        isSubmitting={isSubmitting}
        isAllAnswered={isAllAnswered}
        hasSkipped={hasSkipped}
        canSubmit={canSubmit}
      />

      {/* Completion confirmation dialog */}
      <CompletionDialog
        open={showCompletionDialog}
        onOpenChange={setShowCompletionDialog}
        onComplete={handleConfirmSubmit}
        answeredCount={stats.answered}
        totalQuestions={stats.total}
        skippedCount={stats.skipped}
        isSubmitting={isSubmitting}
      />

      {/* Submission progress overlay */}
      <AnimatePresence>
        {(isSubmitting || submissionError) && (
          <SubmissionProgress
            isSubmitting={isSubmitting}
            error={submissionError}
            attempts={submissionAttempts}
            onRetry={handleRetry}
            onCancel={cancelSubmission}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

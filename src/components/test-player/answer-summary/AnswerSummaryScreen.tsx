'use client';

import { useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SummaryHero } from './SummaryHero';
import { FilterBar } from './FilterBar';
import { SkippedWarningBanner } from './SkippedWarningBanner';
import { AnswerCardList } from './AnswerCardList';
import { ActionFooter } from './ActionFooter';
import { SubmissionProgress } from './SubmissionProgress';
import {
  useReviewStore,
  useFilteredAnswers,
  useSummaryStats,
  AnswerSummaryItem,
  CompetencyGroup,
} from '@/store/review-store';
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
 * AnswerSummaryScreen - Main container for the answer review interface
 *
 * Displays:
 * - Summary hero with completion stats
 * - Filter bar for filtering answers
 * - Skipped questions warning (if any)
 * - Scrollable list of answer cards
 * - Action footer with back/submit buttons
 * - Submission progress overlay
 *
 * Uses the review-store for state management of:
 * - Filters and sorting
 * - Expanded card states
 * - Scroll position preservation
 */
export function AnswerSummaryScreen({
  session,
  answers,
  competencyGroups,
  timeRemaining,
  onGoBack,
  onSubmit,
  onEditAnswer,
  isSubmitting,
}: AnswerSummaryScreenProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Store state
  const activeFilter = useReviewStore((state) => state.activeFilter);
  const sortOrder = useReviewStore((state) => state.sortOrder);
  const expandedCardIds = useReviewStore((state) => state.expandedCardIds);
  const scrollPosition = useReviewStore((state) => state.scrollPosition);
  const submissionError = useReviewStore((state) => state.lastSubmissionError);
  const submissionAttempts = useReviewStore((state) => state.submissionAttempts);

  // Store actions
  const setActiveFilter = useReviewStore((state) => state.setActiveFilter);
  const setSortOrder = useReviewStore((state) => state.setSortOrder);
  const toggleCardExpanded = useReviewStore((state) => state.toggleCardExpanded);
  const saveScrollPosition = useReviewStore((state) => state.saveScrollPosition);
  const retrySubmission = useReviewStore((state) => state.retrySubmission);
  const cancelSubmission = useReviewStore((state) => state.cancelSubmission);

  // Calculate stats
  const stats = {
      total: answers.length,
      answered: answers.filter((a) => a.status === 'answered').length,
      skipped: answers.filter((a) => a.status === 'skipped').length,
      flagged: answers.filter((a) => a.status === 'flagged').length,
    };

  // Filter answers based on active filter
  const filteredAnswers = activeFilter === 'all'
      ? answers
      : answers.filter((item) => item.status === activeFilter);

  // Sort filtered answers
  const sortedAnswers = (() => {
    const sorted = [...filteredAnswers];

    switch (sortOrder) {
      case 'status':
        // Sort by status: skipped first, then answered, then pending
        const statusOrder = { skipped: 0, flagged: 1, pending: 2, answered: 3 };
        sorted.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        break;
      case 'competency':
        // Sort by competency name, then by question index
        sorted.sort((a, b) => {
          const compCompare = (a.competencyName || '').localeCompare(b.competencyName || '');
          if (compCompare !== 0) return compCompare;
          return a.questionIndex - b.questionIndex;
        });
        break;
      case 'order':
      default:
        // Sort by question index (original order)
        sorted.sort((a, b) => a.questionIndex - b.questionIndex);
        break;
    }

    return sorted;
  })();

  // Filter counts for FilterBar
  const filterCounts = {
    all: answers.length,
    answered: stats.answered,
    skipped: stats.skipped,
    flagged: stats.flagged,
  };

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

  // Handle review skipped - filter to skipped and scroll to top
  const handleReviewSkipped = () => {
    setActiveFilter('skipped');
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };

  // Handle retry submission
  const handleRetry = () => {
    retrySubmission();
    onSubmit();
  };

  // Handle cancel submission
  const handleCancelSubmission = () => {
    cancelSubmission();
  };

  const isAllAnswered = stats.answered >= stats.total;
  const hasSkipped = stats.skipped > 0;
  const canSubmit = stats.answered > 0;

  return (
    <div className="min-h-screen min-h-[100dvh] bg-neutral-950 flex flex-col">
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
              timeRemaining={timeRemaining}
            />
          </div>
        </div>

        {/* Filter bar - sticky */}
        <FilterBar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
          counts={filterCounts}
        />

        {/* Main content */}
        <div className="px-3 sm:px-4 py-4 sm:py-6">
          <div className="max-w-3xl mx-auto">
            {/* Skipped warning banner */}
            {hasSkipped && activeFilter === 'all' && (
              <SkippedWarningBanner
                skippedCount={stats.skipped}
                onReviewSkipped={handleReviewSkipped}
              />
            )}

            {/* Answer list */}
            <AnswerCardList
              items={sortedAnswers}
              competencyGroups={sortOrder === 'competency' ? competencyGroups : undefined}
              expandedCardIds={expandedCardIds}
              onToggleCard={toggleCardExpanded}
              onEditAnswer={handleEditAnswer}
              groupByCompetency={sortOrder === 'competency'}
            />

            {/* Empty state for filtered view */}
            {sortedAnswers.length === 0 && activeFilter !== 'all' && (
              <div className="text-center py-12">
                <p className="text-neutral-500">
                  Нет вопросов с выбранным статусом
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action footer - sticky */}
      <ActionFooter
        onGoBack={onGoBack}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        isAllAnswered={isAllAnswered}
        hasSkipped={hasSkipped}
        canSubmit={canSubmit}
      />

      {/* Submission progress overlay */}
      <AnimatePresence>
        {(isSubmitting || submissionError) && (
          <SubmissionProgress
            isSubmitting={isSubmitting}
            error={submissionError}
            attempts={submissionAttempts}
            onRetry={handleRetry}
            onCancel={handleCancelSubmission}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

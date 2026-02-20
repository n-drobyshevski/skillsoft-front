'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { useShallow } from 'zustand/react/shallow';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SummaryHero } from './SummaryHero';
import { FilterBar } from './FilterBar';
import { SkippedWarningBanner } from './SkippedWarningBanner';
import { AnswerCardList } from './AnswerCardList';
import { CompactAnswerRow } from './cards/CompactAnswerRow';
import { ActionFooter } from './ActionFooter';
import { SubmissionProgress } from './SubmissionProgress';
import { Button } from '@/components/ui/button';
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
 * Progressive disclosure pattern:
 * - Default: compact summary view showing question status at a glance
 * - Detailed: full expandable answer cards with filtering/sorting
 * - Auto-expands to detailed view when skipped questions exist
 *
 * Displays:
 * - Summary hero with completion stats
 * - Compact answer list (default) or detailed answer cards (toggle)
 * - Filter bar for filtering answers (detailed mode only)
 * - Skipped questions warning (if any)
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
  const t = useTranslations('assessment');

  // Store state
  const { activeFilter, sortOrder, expandedCardIds, scrollPosition, submissionError, submissionAttempts } = useReviewStore(
    useShallow((state) => ({
      activeFilter: state.activeFilter,
      sortOrder: state.sortOrder,
      expandedCardIds: state.expandedCardIds,
      scrollPosition: state.scrollPosition,
      submissionError: state.lastSubmissionError,
      submissionAttempts: state.submissionAttempts,
    }))
  );

  // Store actions
  const { setActiveFilter, setSortOrder, toggleCardExpanded, saveScrollPosition, retrySubmission, cancelSubmission } = useReviewStore(
    useShallow((state) => ({
      setActiveFilter: state.setActiveFilter,
      setSortOrder: state.setSortOrder,
      toggleCardExpanded: state.toggleCardExpanded,
      saveScrollPosition: state.saveScrollPosition,
      retrySubmission: state.retrySubmission,
      cancelSubmission: state.cancelSubmission,
    }))
  );

  // Calculate stats
  const stats = {
      total: answers.length,
      answered: answers.filter((a) => a.status === 'answered').length,
      skipped: answers.filter((a) => a.status === 'skipped').length,
      flagged: answers.filter((a) => a.status === 'flagged').length,
    };

  const hasSkipped = stats.skipped > 0;

  // Progressive disclosure: compact (default) vs detailed view
  // Auto-expand to detailed mode when skipped questions exist
  const [isDetailedView, setIsDetailedView] = useState(hasSkipped);

  // Filter answers based on active filter
  const filteredAnswers = activeFilter === 'all'
      ? answers
      : answers.filter((item) => item.status === activeFilter);

  // Sort filtered answers
  const sortedAnswers = useMemo(() => {
    const sorted = [...filteredAnswers];

    switch (sortOrder) {
      case 'status': {
        // Sort by status: skipped first, then answered, then pending
        const statusOrder: Record<string, number> = { skipped: 0, flagged: 1, pending: 2, answered: 3 };
        sorted.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        break;
      }
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
  }, [filteredAnswers, sortOrder]);

  // Compact view always shows answers in original order (no filtering/sorting)
  const compactAnswers = useMemo(() => {
    return [...answers].sort((a, b) => a.questionIndex - b.questionIndex);
  }, [answers]);

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

  // Handle review skipped - switch to detailed view, filter to skipped, scroll to top
  const handleReviewSkipped = () => {
    setIsDetailedView(true);
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

        {/* Filter bar - only visible in detailed mode */}
        {isDetailedView && (
          <FilterBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            counts={filterCounts}
          />
        )}

        {/* Main content */}
        <div className="px-3 sm:px-4 py-4 sm:py-6">
          <div className="max-w-3xl mx-auto">
            {/* Skipped warning banner - visible in both modes */}
            {hasSkipped && (isDetailedView ? activeFilter === 'all' : true) && (
              <SkippedWarningBanner
                skippedCount={stats.skipped}
                onReviewSkipped={handleReviewSkipped}
              />
            )}

            {/* Compact answer list (default view) */}
            {!isDetailedView && (
              <div className="space-y-1">
                {compactAnswers.map((item) => (
                  <CompactAnswerRow
                    key={item.questionId}
                    item={item}
                    questionNumber={item.questionIndex + 1}
                  />
                ))}
              </div>
            )}

            {/* Detailed answer list (toggled view) */}
            <AnimatePresence mode="wait">
              {isDetailedView && (
                <motion.div
                  key="detailed-view"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
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
                        {t('answerCard.noQuestionsWithStatus')}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Review Details toggle button */}
            <div className="mt-4 flex justify-center">
              <Button
                variant="ghost"
                onClick={() => setIsDetailedView((prev) => !prev)}
                className="text-sm text-neutral-400 hover:text-white hover:bg-neutral-800/50 gap-2"
              >
                {isDetailedView ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    {t('answerSummary.hideDetails')}
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    {t('answerSummary.reviewDetails')}
                  </>
                )}
              </Button>
            </div>
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

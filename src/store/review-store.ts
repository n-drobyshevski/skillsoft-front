import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { TestAnswer, SessionQuestion, QuestionType } from '@/types/domain';

/**
 * Answer Summary Review Store
 *
 * Manages state for the answer summary review screen that appears
 * after a user completes all questions but before final submission.
 * Implements a state machine for the review flow with support for
 * editing answers, submission with retry, and error recovery.
 */

// ============================================
// STATE MACHINE TYPES
// ============================================

/**
 * Review flow phases following a state machine pattern.
 *
 * State transitions:
 * - ANSWERING → REVIEWING (last question answered)
 * - REVIEWING → EDITING (edit answer clicked)
 * - REVIEWING → SUBMITTING (confirm submission)
 * - EDITING → REVIEWING (save or cancel)
 * - SUBMITTING → COMPLETED (success)
 * - SUBMITTING → SUBMIT_FAILED (error)
 * - SUBMIT_FAILED → SUBMITTING (retry)
 * - SUBMIT_FAILED → REVIEWING (cancel)
 */
export type ReviewPhase =
  | 'ANSWERING'      // User is actively answering questions
  | 'REVIEWING'      // User is on the Answer Summary screen
  | 'EDITING'        // User clicked to edit a specific answer
  | 'SUBMITTING'     // Submission in progress
  | 'COMPLETED'      // Successfully submitted, redirecting
  | 'SUBMIT_FAILED'; // Submission failed, showing retry options

/**
 * Question status for visual indicators in the summary.
 */
export type QuestionStatus = 'answered' | 'skipped' | 'flagged' | 'pending';

/**
 * Enriched answer data for display in the summary screen.
 * Combines answer data with question metadata for a complete view.
 */
export interface AnswerSummaryItem {
  questionId: string;
  questionIndex: number;
  questionText: string;
  questionType: QuestionType;
  behavioralIndicatorId: string;
  competencyId?: string;
  competencyName?: string;

  // Answer data
  answer: TestAnswer | null;
  answerDisplayText: string;  // Human-readable answer summary
  status: QuestionStatus;

  // Metadata
  timeSpentSeconds: number;
  answeredAt: string | null;
}

/**
 * Grouped answers by competency for organized display.
 */
export interface CompetencyGroup {
  competencyId: string;
  competencyName: string;
  items: AnswerSummaryItem[];
  answeredCount: number;
  skippedCount: number;
}

/**
 * Submission error details for retry handling.
 */
export interface SubmissionError {
  code?: string;
  message: string;
  isRetryable: boolean;
  timestamp: number;
}

// ============================================
// STORE STATE & ACTIONS
// ============================================

interface ReviewState {
  /** Current phase in the review flow state machine */
  phase: ReviewPhase;

  /** Session ID being reviewed */
  sessionId: string | null;

  /** Cached answers for review display */
  answersCache: AnswerSummaryItem[];

  /** Answers grouped by competency */
  competencyGroups: CompetencyGroup[];

  /** Timestamp when cache was populated */
  answersCacheTimestamp: number | null;

  /** Question ID being edited (when in EDITING phase) */
  editingQuestionId: string | null;

  /** Question index being edited (for navigation) */
  editingQuestionIndex: number | null;

  /** Scroll position to restore after editing */
  scrollPosition: number;

  /** Number of submission attempts */
  submissionAttempts: number;

  /** Last submission error */
  lastSubmissionError: SubmissionError | null;

  /** When submission started (for timeout detection) */
  submissionStartedAt: number | null;

  /** Active filter in the summary view */
  activeFilter: 'all' | 'answered' | 'skipped' | 'flagged';

  /** Sort order for the answer list */
  sortOrder: 'order' | 'status' | 'competency';

  /** Expanded card IDs (for accordion behavior) */
  expandedCardIds: Set<string>;
}

interface ReviewActions {
  // Phase transitions
  /** Transition to REVIEWING phase after last question */
  enterReviewPhase: (sessionId: string, answers: AnswerSummaryItem[]) => void;

  /** Transition to EDITING phase for a specific question */
  enterEditPhase: (questionId: string, questionIndex: number) => void;

  /** Return to REVIEWING phase after editing */
  exitEditPhase: (updatedAnswer?: AnswerSummaryItem) => void;

  /** Transition to SUBMITTING phase */
  startSubmission: () => void;

  /** Handle successful submission */
  completeSubmission: () => void;

  /** Handle submission failure */
  failSubmission: (error: SubmissionError) => void;

  /** Retry failed submission */
  retrySubmission: () => void;

  /** Cancel submission and return to review */
  cancelSubmission: () => void;

  /** Reset to ANSWERING phase (go back to test) */
  returnToAnswering: () => void;

  // Cache management
  /** Update the answers cache */
  setAnswersCache: (answers: AnswerSummaryItem[]) => void;

  /** Update a single answer in the cache (optimistic update) */
  updateAnswerInCache: (questionId: string, answer: AnswerSummaryItem) => void;

  /** Group answers by competency */
  groupAnswersByCompetency: (answers: AnswerSummaryItem[]) => void;

  // UI state
  /** Set the active filter */
  setActiveFilter: (filter: ReviewState['activeFilter']) => void;

  /** Set the sort order */
  setSortOrder: (order: ReviewState['sortOrder']) => void;

  /** Toggle a card's expanded state */
  toggleCardExpanded: (cardId: string) => void;

  /** Expand all cards */
  expandAllCards: () => void;

  /** Collapse all cards */
  collapseAllCards: () => void;

  /** Save scroll position before editing */
  saveScrollPosition: (position: number) => void;

  /** Reset store to initial state */
  reset: () => void;
}

type ReviewStore = ReviewState & ReviewActions;

const initialState: ReviewState = {
  phase: 'ANSWERING',
  sessionId: null,
  answersCache: [],
  competencyGroups: [],
  answersCacheTimestamp: null,
  editingQuestionId: null,
  editingQuestionIndex: null,
  scrollPosition: 0,
  submissionAttempts: 0,
  lastSubmissionError: null,
  submissionStartedAt: null,
  activeFilter: 'all',
  sortOrder: 'order',
  expandedCardIds: new Set(),
};

/**
 * Review Store
 *
 * Uses subscribeWithSelector for optimized component re-renders.
 * Components can subscribe to specific slices of state.
 */
export const useReviewStore = create<ReviewStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    ...initialState,

    // Phase transitions
    enterReviewPhase: (sessionId, answers) => {
      const groups = groupByCompetency(answers);
      set({
        phase: 'REVIEWING',
        sessionId,
        answersCache: answers,
        competencyGroups: groups,
        answersCacheTimestamp: Date.now(),
        submissionAttempts: 0,
        lastSubmissionError: null,
      });
    },

    enterEditPhase: (questionId, questionIndex) => {
      set({
        phase: 'EDITING',
        editingQuestionId: questionId,
        editingQuestionIndex: questionIndex,
      });
    },

    exitEditPhase: (updatedAnswer) => {
      const { answersCache, editingQuestionId } = get();

      let newCache = answersCache;
      if (updatedAnswer && editingQuestionId) {
        newCache = answersCache.map(item =>
          item.questionId === editingQuestionId ? updatedAnswer : item
        );
      }

      const groups = groupByCompetency(newCache);

      set({
        phase: 'REVIEWING',
        answersCache: newCache,
        competencyGroups: groups,
        editingQuestionId: null,
        editingQuestionIndex: null,
      });
    },

    startSubmission: () => {
      set({
        phase: 'SUBMITTING',
        submissionStartedAt: Date.now(),
        lastSubmissionError: null,
      });
    },

    completeSubmission: () => {
      set({
        phase: 'COMPLETED',
      });
    },

    failSubmission: (error) => {
      set(state => ({
        phase: 'SUBMIT_FAILED',
        submissionAttempts: state.submissionAttempts + 1,
        lastSubmissionError: error,
        submissionStartedAt: null,
      }));
    },

    retrySubmission: () => {
      set({
        phase: 'SUBMITTING',
        submissionStartedAt: Date.now(),
        lastSubmissionError: null,
      });
    },

    cancelSubmission: () => {
      set({
        phase: 'REVIEWING',
        submissionStartedAt: null,
      });
    },

    returnToAnswering: () => {
      set({
        phase: 'ANSWERING',
        editingQuestionId: null,
        editingQuestionIndex: null,
      });
    },

    // Cache management
    setAnswersCache: (answers) => {
      const groups = groupByCompetency(answers);
      set({
        answersCache: answers,
        competencyGroups: groups,
        answersCacheTimestamp: Date.now(),
      });
    },

    updateAnswerInCache: (questionId, answer) => {
      set(state => {
        const newCache = state.answersCache.map(item =>
          item.questionId === questionId ? answer : item
        );
        return {
          answersCache: newCache,
          competencyGroups: groupByCompetency(newCache),
        };
      });
    },

    groupAnswersByCompetency: (answers) => {
      const groups = groupByCompetency(answers);
      set({ competencyGroups: groups });
    },

    // UI state
    setActiveFilter: (filter) => {
      set({ activeFilter: filter });
    },

    setSortOrder: (order) => {
      set({ sortOrder: order });
    },

    toggleCardExpanded: (cardId) => {
      set(state => {
        const newSet = new Set(state.expandedCardIds);
        if (newSet.has(cardId)) {
          newSet.delete(cardId);
        } else {
          newSet.add(cardId);
        }
        return { expandedCardIds: newSet };
      });
    },

    expandAllCards: () => {
      set(state => ({
        expandedCardIds: new Set(state.answersCache.map(a => a.questionId)),
      }));
    },

    collapseAllCards: () => {
      set({ expandedCardIds: new Set() });
    },

    saveScrollPosition: (position) => {
      set({ scrollPosition: position });
    },

    reset: () => {
      set(initialState);
    },
  }))
);

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Group answers by competency for organized display.
 */
function groupByCompetency(answers: AnswerSummaryItem[]): CompetencyGroup[] {
  const groups = new Map<string, CompetencyGroup>();

  for (const item of answers) {
    const competencyId = item.competencyId || 'uncategorized';
    const competencyName = item.competencyName || 'Other Questions';

    if (!groups.has(competencyId)) {
      groups.set(competencyId, {
        competencyId,
        competencyName,
        items: [],
        answeredCount: 0,
        skippedCount: 0,
      });
    }

    const group = groups.get(competencyId)!;
    group.items.push(item);

    if (item.status === 'answered') {
      group.answeredCount++;
    } else if (item.status === 'skipped') {
      group.skippedCount++;
    }
  }

  // Sort groups by competency name, with 'uncategorized' last
  return Array.from(groups.values()).sort((a, b) => {
    if (a.competencyId === 'uncategorized') return 1;
    if (b.competencyId === 'uncategorized') return -1;
    return a.competencyName.localeCompare(b.competencyName);
  });
}

// ============================================
// SELECTOR HOOKS
// ============================================

/** Get current review phase */
export const useReviewPhase = () =>
  useReviewStore(state => state.phase);

/** Check if in review mode (REVIEWING phase) */
export const useIsReviewing = () =>
  useReviewStore(state => state.phase === 'REVIEWING');

/** Check if submission is in progress */
export const useIsSubmitting = () =>
  useReviewStore(state => state.phase === 'SUBMITTING');

/** Get submission error if any */
export const useSubmissionError = () =>
  useReviewStore(state => state.lastSubmissionError);

/** Get answers cache */
export const useAnswersCache = () =>
  useReviewStore(state => state.answersCache);

/** Get competency groups */
export const useCompetencyGroups = () =>
  useReviewStore(state => state.competencyGroups);

/** Get active filter */
export const useActiveFilter = () =>
  useReviewStore(state => state.activeFilter);

/** Get expanded card IDs */
export const useExpandedCardIds = () =>
  useReviewStore(state => state.expandedCardIds);

/** Get editing state */
export const useEditingState = () =>
  useReviewStore(
    useShallow((state) => ({
      isEditing: state.phase === 'EDITING',
      questionId: state.editingQuestionId,
      questionIndex: state.editingQuestionIndex,
    }))
  );

/** Get summary stats */
export const useSummaryStats = () =>
  useReviewStore(
    useShallow((state) => {
      const answers = state.answersCache;
      return {
        total: answers.length,
        answered: answers.filter((a) => a.status === 'answered').length,
        skipped: answers.filter((a) => a.status === 'skipped').length,
        flagged: answers.filter((a) => a.status === 'flagged').length,
        pending: answers.filter((a) => a.status === 'pending').length,
      };
    })
  );

/** Get filtered answers based on active filter */
export const useFilteredAnswers = () =>
  useReviewStore(state => {
    const { answersCache, activeFilter } = state;

    if (activeFilter === 'all') {
      return answersCache;
    }

    return answersCache.filter(item => item.status === activeFilter);
  });

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format an answer for human-readable display.
 */
export function formatAnswerDisplay(
  answer: TestAnswer | null,
  question: SessionQuestion
): string {
  if (!answer || answer.isSkipped) {
    return 'Skipped';
  }

  switch (question.questionType) {
    case 'LIKERT':
    case 'LIKERT_SCALE': {
      if (answer.likertValue !== undefined) {
        const option = question.answerOptions?.find(
          opt => opt.value === answer.likertValue
        );
        return option?.label || option?.text || `${answer.likertValue}/5`;
      }
      return 'Not answered';
    }

    case 'SJT':
    case 'SITUATIONAL_JUDGMENT': {
      if (answer.selectedOptionIds?.length) {
        const optionId = answer.selectedOptionIds[0];
        const optionIndex = question.answerOptions?.findIndex(
          opt => opt.id === optionId
        );
        if (optionIndex !== undefined && optionIndex >= 0) {
          const letter = String.fromCharCode(65 + optionIndex); // A, B, C, D
          // Safe array access using .at() method
          const option = question.answerOptions?.at(optionIndex);
          const text = option?.text || option?.label || '';
          return `${letter}${text ? `: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}` : ''}`;
        }
      }
      return 'Not answered';
    }

    case 'MCQ':
    case 'MULTIPLE_CHOICE':
    case 'SINGLE_CHOICE': {
      if (answer.selectedOptionIds?.length) {
        const selectedOptions = question.answerOptions?.filter(
          opt => opt.id && answer.selectedOptionIds?.includes(opt.id)
        );
        if (selectedOptions?.length) {
          return selectedOptions
            .map(opt => opt.text || opt.label)
            .filter(Boolean)
            .join(', ')
            .substring(0, 100);
        }
      }
      return 'Not answered';
    }

    case 'OPEN_TEXT':
    case 'BEHAVIORAL_EXAMPLE': {
      if (answer.textResponse) {
        return answer.textResponse.substring(0, 100) +
          (answer.textResponse.length > 100 ? '...' : '');
      }
      return 'Not answered';
    }

    default:
      return 'Not answered';
  }
}

/**
 * Create AnswerSummaryItem from answer and question data.
 */
export function createAnswerSummaryItem(
  answer: TestAnswer | null,
  question: SessionQuestion,
  questionIndex: number,
  competencyName?: string
): AnswerSummaryItem {
  const status: QuestionStatus = answer?.isSkipped
    ? 'skipped'
    : answer
    ? 'answered'
    : 'pending';

  return {
    questionId: question.id,
    questionIndex,
    questionText: question.questionText,
    questionType: question.questionType,
    behavioralIndicatorId: question.behavioralIndicatorId,
    competencyId: question.competencyId,
    competencyName,
    answer,
    answerDisplayText: formatAnswerDisplay(answer, question),
    status,
    timeSpentSeconds: answer?.timeSpentSeconds || 0,
    answeredAt: answer?.answeredAt || null,
  };
}

/**
 * Check if a submission error is retryable.
 */
export function isRetryableError(status?: number, code?: string): boolean {
  // Network errors are retryable
  if (!status) return true;

  // Server errors (5xx) are retryable
  if (status >= 500 && status < 600) return true;

  // Timeout is retryable
  if (status === 408 || code === 'TIMEOUT') return true;

  // Rate limiting is retryable
  if (status === 429) return true;

  // Client errors (4xx) are generally not retryable
  return false;
}

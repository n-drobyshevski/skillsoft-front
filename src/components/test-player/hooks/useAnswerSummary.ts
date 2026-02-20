import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { TestSession, SessionQuestion, TestAnswer, QuestionType, CurrentQuestionResponse } from '@/types/domain';
import { testSessionsClientApi, type ApiError } from '@/services/api.client';
import type { TestSessionAdapter } from '@/adapters/test-session-adapter';
import type { CompletionResult } from '@/adapters';
import { toast } from 'sonner';
import {
  useReviewStore,
  AnswerSummaryItem,
  CompetencyGroup,
  isRetryableError as isRetryableSubmissionError,
} from '@/store/review-store';
import type { PlayerState } from './usePlayerState';

/**
 * useAnswerSummary Hook
 *
 * Manages the answer summary review screen that appears after
 * the last question is answered. Handles loading answer data,
 * grouping by competency, editing from summary, and final submission.
 *
 * Also manages a questions cache that is populated as the user navigates
 * through questions, so the summary screen can display real question text.
 */

// ============================================================================
// Types
// ============================================================================

/** Cached question data for answer summary display */
interface CachedQuestionData {
  questionText: string;
  questionType: QuestionType;
  behavioralIndicatorId: string;
  competencyId?: string;
}

export interface UseAnswerSummaryProps {
  session: TestSession;
  adapter: TestSessionAdapter | null;
  effectiveAuthHeaders: Record<string, string>;
  state: PlayerState;
  setState: React.Dispatch<React.SetStateAction<PlayerState>>;
  setCurrentAnswer: (value: string | number | string[] | undefined) => void;
  setValidationError: (error: string | null) => void;
  questionStartTime: React.MutableRefObject<number>;
  initialQuestion: CurrentQuestionResponse;
  onTimerSync?: (seconds: number) => void;
  onComplete?: (result: CompletionResult) => void;
  onError?: (error: ApiError) => void;
}

export interface UseAnswerSummaryReturn {
  showSummary: boolean;
  summaryAnswers: AnswerSummaryItem[];
  summaryGroups: CompetencyGroup[];
  isSummarySubmitting: boolean;
  handleEnterSummary: () => Promise<void>;
  handleGoBackFromSummary: () => void;
  handleEditFromSummary: (questionId: string, questionIndex: number) => Promise<void>;
  handleSubmitFromSummary: () => Promise<void>;
  /** Cache a question's data (called by navigation hook when questions are loaded) */
  cacheQuestion: (question: SessionQuestion) => void;
}

// ============================================================================
// Utility Functions
// ============================================================================

function groupAnswersByCompetency(items: AnswerSummaryItem[], otherLabel: string): CompetencyGroup[] {
  const groups = new Map<string, CompetencyGroup>();

  for (const item of items) {
    const competencyId = item.competencyId || 'uncategorized';
    const competencyName = item.competencyName || otherLabel;

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

  return Array.from(groups.values()).sort((a, b) => {
    if (a.competencyId === 'uncategorized') return 1;
    if (b.competencyId === 'uncategorized') return -1;
    return a.competencyName.localeCompare(b.competencyName);
  });
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useAnswerSummary({
  session,
  adapter,
  effectiveAuthHeaders,
  state,
  setState,
  setCurrentAnswer,
  setValidationError,
  questionStartTime,
  initialQuestion,
  onTimerSync,
  onComplete,
  onError,
}: UseAnswerSummaryProps): UseAnswerSummaryReturn {
  const router = useRouter();
  const t = useTranslations('assessment');

  // Summary state
  const [showSummary, setShowSummary] = useState(false);
  const [summaryAnswers, setSummaryAnswers] = useState<AnswerSummaryItem[]>([]);
  const [summaryGroups, setSummaryGroups] = useState<CompetencyGroup[]>([]);
  const [isSummarySubmitting, setIsSummarySubmitting] = useState(false);

  // Cache of questions seen during navigation (for answer summary)
  const questionsCache = useRef<Map<string, CachedQuestionData>>(new Map());

  // Seed questions cache with initial question on mount
  useEffect(() => {
    if (initialQuestion.question) {
      const q = initialQuestion.question;
      questionsCache.current.set(q.id, {
        questionText: q.questionText,
        questionType: q.questionType,
        behavioralIndicatorId: q.behavioralIndicatorId,
        competencyId: q.competencyId,
      });
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Review store actions
  const enterReviewPhase = useReviewStore((s) => s.enterReviewPhase);
  const startSubmission = useReviewStore((s) => s.startSubmission);
  const completeSubmission = useReviewStore((s) => s.completeSubmission);
  const failSubmission = useReviewStore((s) => s.failSubmission);
  const resetReviewStore = useReviewStore((s) => s.reset);

  // ========================================================================
  // Public: Cache a question (called from navigation hook)
  // ========================================================================

  const cacheQuestion = (question: SessionQuestion) => {
    questionsCache.current.set(question.id, {
      questionText: question.questionText,
      questionType: question.questionType,
      behavioralIndicatorId: question.behavioralIndicatorId,
      competencyId: question.competencyId,
    });
  };

  // ========================================================================
  // Internal: Format answer for display
  // ========================================================================

  const formatAnswerForSummary = (answer: TestAnswer | null): string => {
    if (!answer || answer.isSkipped) {
      return t('player.summary.skippedAnswer');
    }

    if (answer.likertValue !== undefined) {
      return t('player.summary.likertValue', { value: answer.likertValue });
    }

    if (answer.selectedOptionIds?.length) {
      return t('player.summary.selectedCount', { count: answer.selectedOptionIds.length });
    }

    if (answer.textResponse) {
      return answer.textResponse.substring(0, 50) + (answer.textResponse.length > 50 ? '...' : '');
    }

    return t('player.summary.answerGiven');
  };

  // ========================================================================
  // Internal: Load question (for editing from summary)
  // ========================================================================

  const loadQuestionForEdit = async (direction: 'forward' | 'backward') => {
    try {
      const response = adapter
        ? await adapter.getCurrentQuestion(session.id)
        : await testSessionsClientApi.getCurrentQuestion(session.id, effectiveAuthHeaders);

      if (response) {
        // Cache loaded question data
        if (response.question) {
          cacheQuestion(response.question);
        }

        setState(prev => ({
          ...prev,
          currentQuestion: response.question,
          questionIndex: response.questionIndex,
          totalQuestions: response.totalQuestions,
          previousAnswer: response.previousAnswer,
          allowSkip: response.allowSkip,
          allowBackNavigation: response.allowBackNavigation,
          timeRemainingSeconds: response.timeRemainingSeconds,
          direction,
        }));

        if (response.previousAnswer) {
          if (response.previousAnswer.likertValue !== undefined) {
            setCurrentAnswer(response.previousAnswer.likertValue);
          } else if (response.previousAnswer.textResponse) {
            setCurrentAnswer(response.previousAnswer.textResponse);
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

        if (response.timeRemainingSeconds !== undefined && onTimerSync) {
          onTimerSync(response.timeRemainingSeconds);
        }

        setValidationError(null);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load question for edit:', error);
      throw error;
    }
    questionStartTime.current = Date.now();
  };

  // ========================================================================
  // Public: Enter answer summary
  // ========================================================================

  const handleEnterSummary = async () => {
    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const answers = adapter
        ? await adapter.getSessionAnswers(session.id)
        : await testSessionsClientApi.getSessionAnswers(session.id, effectiveAuthHeaders);

      const summaryItems: AnswerSummaryItem[] = [];
      const answerMap = new Map(answers.map(a => [a.questionId, a]));

      for (let i = 0; i < session.questionOrder.length; i++) {
        const questionId = session.questionOrder[i];
        const answer = answerMap.get(questionId) || null;
        const cachedQuestion = questionsCache.current.get(questionId);

        summaryItems.push({
          questionId,
          questionIndex: i,
          questionText: cachedQuestion?.questionText || t('player.summary.questionNumber', { number: i + 1 }),
          questionType: cachedQuestion?.questionType || ('LIKERT' as QuestionType),
          behavioralIndicatorId: cachedQuestion?.behavioralIndicatorId || '',
          competencyId: cachedQuestion?.competencyId,
          answer,
          answerDisplayText: formatAnswerForSummary(answer),
          status: answer?.isSkipped ? 'skipped' : answer ? 'answered' : 'pending',
          timeSpentSeconds: answer?.timeSpentSeconds || 0,
          answeredAt: answer?.answeredAt || null,
        });
      }

      const groups = groupAnswersByCompetency(summaryItems, t('player.summary.otherQuestions'));

      setSummaryAnswers(summaryItems);
      setSummaryGroups(groups);
      setShowSummary(true);
      enterReviewPhase(session.id, summaryItems);
    } catch (error) {
      console.error('Failed to load answer summary:', error);
      toast.error(t('player.toast.failedToLoadSummary'));
    }

    setState(prev => ({ ...prev, isSubmitting: false }));
  };

  // ========================================================================
  // Public: Go back from summary
  // ========================================================================

  const handleGoBackFromSummary = () => {
    setShowSummary(false);
    resetReviewStore();
  };

  // ========================================================================
  // Public: Edit an answer from summary
  // ========================================================================

  const handleEditFromSummary = async (questionId: string, questionIndex: number) => {
    setShowSummary(false);
    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      if (adapter) {
        await adapter.navigateToQuestion(session.id, questionIndex);
      } else {
        await testSessionsClientApi.navigateToQuestion(session.id, questionIndex, effectiveAuthHeaders);
      }
      await loadQuestionForEdit(questionIndex < state.questionIndex ? 'backward' : 'forward');
    } catch (error) {
      console.error('Failed to navigate to question for edit:', error);
      toast.error(t('player.toast.failedToNavigate'));
      setShowSummary(true);
    }

    setState(prev => ({ ...prev, isSubmitting: false }));
  };

  // ========================================================================
  // Public: Submit from summary
  // ========================================================================

  const handleSubmitFromSummary = async () => {
    if (isSummarySubmitting) return;

    setIsSummarySubmitting(true);
    startSubmission();

    try {
      const currentSession = adapter
        ? await adapter.getSession(session.id)
        : await testSessionsClientApi.getSessionById(session.id, effectiveAuthHeaders);

      if (!currentSession) {
        toast.error(t('player.toast.sessionNotFound'));
        if (onError) {
          onError({ message: 'Session not found', status: 404 } as ApiError);
        } else {
          router.push('/test-templates');
        }
        return;
      }

      if (currentSession.status === 'COMPLETED') {
        toast.info(t('player.toast.testAlreadyCompleted2'));
        if (onError) {
          onError({ message: 'Session already completed', status: 400 } as ApiError);
        } else {
          router.push('/test-templates');
        }
        return;
      }

      if (currentSession.status === 'ABANDONED') {
        toast.error(t('player.toast.sessionCancelled'));
        if (onError) {
          onError({ message: 'Session was abandoned', status: 400 } as ApiError);
        } else {
          router.push('/test-templates');
        }
        return;
      }

      if (currentSession.status === 'TIMED_OUT') {
        toast.warning(t('player.toast.testTimedOut'));
        if (onError) {
          onError({ message: 'Session timed out', status: 400 } as ApiError);
        } else {
          router.push('/test-templates');
        }
        return;
      }

      if (currentSession.status !== 'IN_PROGRESS' && currentSession.status !== 'NOT_STARTED') {
        toast.error(t('player.toast.cannotCompleteInStatus', { status: currentSession.status }));
        if (onError) {
          onError({ message: `Invalid session status: ${currentSession.status}`, status: 400 } as ApiError);
        } else {
          router.push('/test-templates');
        }
        return;
      }

      let completionResult: CompletionResult;
      if (adapter) {
        completionResult = await adapter.completeSession(session.id);
      } else {
        const result = await testSessionsClientApi.completeSession(session.id, effectiveAuthHeaders);
        completionResult = { resultId: result.id };
      }
      completeSubmission();

      if (onComplete) {
        onComplete(completionResult);
      } else {
        router.push(`/test-templates/results/${completionResult.resultId}`);
      }
    } catch (error) {
      console.error('Failed to complete session from summary:', error);
      const apiError = error as ApiError;
      const errorMessage = apiError.message?.toLowerCase() || '';

      if (errorMessage.includes('not in progress') || errorMessage.includes('cannot complete')) {
        try {
          const currentSession = adapter
            ? await adapter.getSession(session.id)
            : await testSessionsClientApi.getSessionById(session.id, effectiveAuthHeaders);
          if (currentSession?.status === 'COMPLETED') {
            toast.info(t('player.toast.testAlreadyCompleted'));
            if (onError) {
              onError(apiError);
            } else {
              router.push('/test-templates');
            }
            return;
          }
        } catch {
          // Ignore secondary fetch error
        }
        toast.error(t('player.toast.cannotCompleteChanged'));
        if (onError) {
          onError(apiError);
        } else {
          router.push('/test-templates');
        }
        return;
      }

      if (errorMessage.includes('abandon')) {
        toast.error(t('player.toast.sessionCancelled'));
        if (onError) {
          onError(apiError);
        } else {
          router.push('/test-templates');
        }
        return;
      }

      if (errorMessage.includes('timed out') || errorMessage.includes('expired')) {
        toast.warning(t('player.toast.testTimedOut'));
        if (onError) {
          onError(apiError);
        } else {
          router.push('/test-templates');
        }
        return;
      }

      failSubmission({
        code: apiError.code,
        message: apiError.message || t('player.toast.failedToCompleteTest'),
        isRetryable: isRetryableSubmissionError(apiError.status, apiError.code),
        timestamp: Date.now(),
      });

      if (apiError.status && apiError.status >= 500) {
        toast.error(t('player.toast.serverError'));
      } else {
        toast.error(t('player.toast.failedToCompleteTest'));
      }
    } finally {
      setIsSummarySubmitting(false);
    }
  };

  return {
    showSummary,
    summaryAnswers,
    summaryGroups,
    isSummarySubmitting,
    handleEnterSummary,
    handleGoBackFromSummary,
    handleEditFromSummary,
    handleSubmitFromSummary,
    cacheQuestion,
  };
}

export default useAnswerSummary;

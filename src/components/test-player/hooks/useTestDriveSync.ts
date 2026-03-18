import { useEffect } from 'react';
import { SessionQuestion } from '@/types/domain';
import { competenciesApi, behavioralIndicatorsApi } from '@/services/api';
import { useTestDriveStore } from '@/store/test-drive-store';

/**
 * useTestDriveSync Hook
 *
 * Manages test-drive mode lifecycle and question data synchronization.
 * When test-drive mode is active, this hook:
 * 1. Enables/disables test-drive mode in the global store on mount/unmount
 * 2. Syncs current question data (with psychometrics and scoring) to the insights panel
 * 3. Fetches full hierarchy data (competency + behavioral indicator) asynchronously
 *
 * This is a side-effect-only hook - it does not return state to the component.
 * The insights panel reads directly from the test-drive store.
 */

// ============================================================================
// Types
// ============================================================================

export interface UseTestDriveSyncProps {
  /** Whether test-drive mode is available (prop + adapter support) */
  testDriveAvailable: boolean;
  /** Whether the testDriveMode prop was set */
  testDriveMode: boolean;
  /** The current question to sync */
  currentQuestion: SessionQuestion | null;
  /** 0-based index of the current question */
  questionIndex: number;
  /** Total number of questions in the session */
  totalQuestions: number;
}

// ============================================================================
// Internal: Compute psychometrics from difficulty level
// ============================================================================

function computeDifficultyIndex(difficultyLevel?: string): number {
  switch (difficultyLevel) {
    case 'FOUNDATIONAL': return 0.8;
    case 'INTERMEDIATE': return 0.6;
    case 'ADVANCED': return 0.4;
    case 'EXPERT': return 0.25;
    default: return 0.5;
  }
}

function computeScoring(question: SessionQuestion) {
  return {
    maxScore: question.answerOptions?.reduce((max, opt) =>
      Math.max(max, opt.score ?? opt.value ?? 0), 0) ?? 5,
    optionScores: question.answerOptions?.reduce((acc, opt, idx) => {
      const optId = opt.id || `option-${idx}`;
      acc[optId] = opt.score ?? opt.value ?? 0;
      return acc;
    }, {} as Record<string, number>),
  };
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useTestDriveSync({
  testDriveAvailable,
  testDriveMode,
  currentQuestion,
  questionIndex,
  totalQuestions,
}: UseTestDriveSyncProps): void {
  // Store actions
  const enableTestDrive = useTestDriveStore((s) => s.enableTestDriveMode);
  const disableTestDrive = useTestDriveStore((s) => s.disableTestDriveMode);
  const setCurrentQuestionData = useTestDriveStore((s) => s.setCurrentQuestionData);

  // Enable/disable test-drive mode based on prop and adapter support
  useEffect(() => {
    if (testDriveAvailable) {
      enableTestDrive();
    }
    return () => {
      if (testDriveAvailable) {
        disableTestDrive();
      }
    };
  }, [testDriveAvailable, enableTestDrive, disableTestDrive]);

  // Update test-drive question data when current question changes
  useEffect(() => {
    if (!testDriveMode || !currentQuestion) return;

    const psychometrics = {
      difficultyIndex: computeDifficultyIndex(currentQuestion.difficultyLevel),
      discriminationIndex: 0.35,
    };
    const scoring = computeScoring(currentQuestion);

    // Set initial data immediately with loading placeholders
    setCurrentQuestionData({
      question: currentQuestion,
      psychometrics: {
        ...psychometrics,
        reliabilityCoefficient: 0.81,
        correctRate: 0.68,
        avgResponseTime: 45,
        sem: 0.15,
        timeLimit: currentQuestion.timeLimit,
      },
      scoring: {
        ...scoring,
        scoringMethod: 'Binary',
      },
      coverage: {
        questionsInIndicator: 3,
        questionsInCompetency: 8,
        contributionPct: 12,
      },
      usage: {
        assessmentCount: 12,
        lastModified: '2 нед. назад',
        position: questionIndex + 1,
        totalQuestions,
      },
    });

    // Fetch full competency and behavioral indicator data
    const fetchHierarchyData = async () => {
      try {
        // First fetch the behavioral indicator
        const indicator = await behavioralIndicatorsApi.getIndicatorById(currentQuestion.behavioralIndicatorId);

        // Then fetch the competency using competencyId from question or indicator
        const competencyId = currentQuestion.competencyId || indicator?.competencyId;
        const competency = competencyId
          ? await competenciesApi.getCompetencyById(competencyId)
          : null;

        // Update store with full data
        setCurrentQuestionData({
          question: currentQuestion,
          behavioralIndicator: indicator || undefined,
          competency: competency || undefined,
          psychometrics: {
            ...psychometrics,
            reliabilityCoefficient: 0.81,
            correctRate: 0.68,
            avgResponseTime: 45,
            sem: 0.15,
            timeLimit: currentQuestion.timeLimit,
          },
          scoring: {
            ...scoring,
            scoringMethod: 'Binary',
          },
          coverage: {
            questionsInIndicator: 3,
            questionsInCompetency: 8,
            contributionPct: 12,
          },
          usage: {
            assessmentCount: 12,
            lastModified: '2 нед. назад',
            position: questionIndex + 1,
            totalQuestions,
          },
        });
      } catch (error) {
        console.error('Failed to fetch test-drive hierarchy data:', error);
        // Keep the basic data already set
      }
    };

    fetchHierarchyData();
  }, [testDriveMode, currentQuestion, questionIndex, totalQuestions, setCurrentQuestionData]);
}

export default useTestDriveSync;

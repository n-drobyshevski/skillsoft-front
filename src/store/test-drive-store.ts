import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { SessionQuestion, Competency, BehavioralIndicator } from '@/types/domain';

/**
 * Test-Drive Mode Store
 *
 * Manages state for HR "test-drive" mode - a diagnostic view that shows
 * detailed question metadata, psychometric properties, and scoring information
 * to help HR administrators understand test mechanics.
 *
 * This mode is distinct from normal employee test-taking and uses an amber
 * color theme to differentiate from the standard emerald theme.
 */

/**
 * Extended question data with metadata for test-drive insights
 */
export interface TestDriveQuestionData {
  question: SessionQuestion;
  /** Full behavioral indicator this question measures */
  behavioralIndicator?: BehavioralIndicator;
  /** Full competency this question belongs to */
  competency?: Competency;
  /** Psychometric properties */
  psychometrics?: {
    difficultyIndex?: number; // 0-1 scale
    discriminationIndex?: number; // typically 0.3+ is good
    reliabilityCoefficient?: number;
  };
  /** Scoring information */
  scoring?: {
    maxScore: number;
    scoringRubric?: string;
    optionScores?: Record<string, number>; // optionId -> score
  };
}

interface TestDriveState {
  /** Whether test-drive mode is active */
  isTestDriveMode: boolean;
  /** Whether the insights panel is open */
  isPanelOpen: boolean;
  /** Active tab in the insights panel */
  activeTab: 'psychometrics' | 'scoring' | 'mapping' | 'metadata';
  /** Current question's extended data for insights */
  currentQuestionData: TestDriveQuestionData | null;
  /** Mapping data for hierarchy view */
  hierarchyData: {
    competencies: Competency[];
    indicatorsByCompetency: Record<string, BehavioralIndicator[]>;
  } | null;
}

interface TestDriveActions {
  /** Enable test-drive mode */
  enableTestDriveMode: () => void;
  /** Disable test-drive mode */
  disableTestDriveMode: () => void;
  /** Toggle test-drive mode */
  toggleTestDriveMode: () => void;
  /** Open the insights panel */
  openPanel: () => void;
  /** Close the insights panel */
  closePanel: () => void;
  /** Toggle the insights panel */
  togglePanel: () => void;
  /** Set the active tab */
  setActiveTab: (tab: TestDriveState['activeTab']) => void;
  /** Update current question data for insights display */
  setCurrentQuestionData: (data: TestDriveQuestionData | null) => void;
  /** Set hierarchy data for mapping tab */
  setHierarchyData: (data: TestDriveState['hierarchyData']) => void;
  /** Reset store to initial state */
  reset: () => void;
}

type TestDriveStore = TestDriveState & TestDriveActions;

const initialState: TestDriveState = {
  isTestDriveMode: false,
  isPanelOpen: false,
  activeTab: 'psychometrics',
  currentQuestionData: null,
  hierarchyData: null,
};

/**
 * Test-Drive Store
 *
 * Uses subscribeWithSelector for optimized component re-renders.
 * Components can subscribe to specific slices of state.
 */
export const useTestDriveStore = create<TestDriveStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    ...initialState,

    // Actions
    enableTestDriveMode: () => {
      set({ isTestDriveMode: true });
    },

    disableTestDriveMode: () => {
      set({
        isTestDriveMode: false,
        isPanelOpen: false,
        currentQuestionData: null,
      });
    },

    toggleTestDriveMode: () => {
      const { isTestDriveMode } = get();
      if (isTestDriveMode) {
        get().disableTestDriveMode();
      } else {
        get().enableTestDriveMode();
      }
    },

    openPanel: () => {
      const { isTestDriveMode } = get();
      if (isTestDriveMode) {
        set({ isPanelOpen: true });
      }
    },

    closePanel: () => {
      set({ isPanelOpen: false });
    },

    togglePanel: () => {
      const { isTestDriveMode, isPanelOpen } = get();
      if (isTestDriveMode) {
        set({ isPanelOpen: !isPanelOpen });
      }
    },

    setActiveTab: (tab) => {
      set({ activeTab: tab });
    },

    setCurrentQuestionData: (data) => {
      set({ currentQuestionData: data });
    },

    setHierarchyData: (data) => {
      set({ hierarchyData: data });
    },

    reset: () => {
      set(initialState);
    },
  }))
);

/**
 * Selector hooks for optimized subscriptions
 */
export const useIsTestDriveMode = () =>
  useTestDriveStore((state) => state.isTestDriveMode);

export const useIsPanelOpen = () =>
  useTestDriveStore((state) => state.isPanelOpen);

export const useActiveTab = () =>
  useTestDriveStore((state) => state.activeTab);

export const useCurrentQuestionData = () =>
  useTestDriveStore((state) => state.currentQuestionData);

export const useHierarchyData = () =>
  useTestDriveStore((state) => state.hierarchyData);

/**
 * Combined selector for panel state
 */
export const usePanelState = () =>
  useTestDriveStore((state) => ({
    isOpen: state.isPanelOpen,
    activeTab: state.activeTab,
    togglePanel: state.togglePanel,
    setActiveTab: state.setActiveTab,
  }));

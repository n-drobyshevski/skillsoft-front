// Test Player Hooks barrel export

// Player State Hook (with dirty tracking integration)
export { usePlayerState, type QuestionState } from './usePlayerState';
export type {
  PlayerState,
  UsePlayerStateProps,
  UsePlayerStateReturn,
} from './usePlayerState';
// Re-export extractAnswerValue for external use (exported from usePlayerState)
export { extractAnswerValue } from './usePlayerState';

// Answer Submission Hook
export {
  useAnswerSubmission,
} from './useAnswerSubmission';
export type {
  ValidationResult as AnswerValidationResult,
  UseAnswerSubmissionProps,
  UseAnswerSubmissionReturn,
} from './useAnswerSubmission';

// Keyboard Navigation Hook
export {
  useKeyboardNavigation,
  TEST_PLAYER_KEYBOARD_SHORTCUTS,
} from './useKeyboardNavigation';
export type {
  UseKeyboardNavigationProps,
  UseKeyboardNavigationReturn,
} from './useKeyboardNavigation';

// Test Timer Hook
export {
  useTestTimer,
  formatTimeWithContext,
} from './useTestTimer';
export type {
  UseTestTimerProps,
  UseTestTimerReturn,
} from './useTestTimer';

// Navigation State Hook (State Machine)
export {
  useNavigationState,
  useNavigationPhase,
  useIsNavigating,
  useCanInteract,
  useNavigationError,
  useCanRetry,
  usePendingNavigation,
  useNavigationDirection,
  areAnswersEqual,
  createNavigationError,
  shouldAutoSave,
} from './useNavigationState';
export type {
  NavigationPhase,
  NavigationDirection,
  NavigationError,
  PendingNavigation,
  NavigationState,
  NavigationActions,
  NavigationStore,
} from './useNavigationState';

// ============================================================================
// Composed Hooks (used by ImmersivePlayer)
// ============================================================================

// Timer Management Hook
export { useTimerManagement } from './useTimerManagement';
export type {
  UseTimerManagementProps,
  UseTimerManagementReturn,
} from './useTimerManagement';

// Answer Management Hook
export { useAnswerManagement } from './useAnswerManagement';
export type {
  ValidationResult,
  UseAnswerManagementProps,
  UseAnswerManagementReturn,
} from './useAnswerManagement';

// Question Navigation Hook
export { useQuestionNavigation } from './useQuestionNavigation';
export type {
  UseQuestionNavigationProps,
  UseQuestionNavigationReturn,
} from './useQuestionNavigation';

// Answer Summary Hook
export { useAnswerSummary } from './useAnswerSummary';
export type {
  UseAnswerSummaryProps,
  UseAnswerSummaryReturn,
} from './useAnswerSummary';

// Test-Drive Sync Hook
export { useTestDriveSync } from './useTestDriveSync';
export type {
  UseTestDriveSyncProps,
} from './useTestDriveSync';

// Immersive Mode Hook
export { useImmersiveMode } from './useImmersiveMode';
export type {
  UseImmersiveModeProps,
} from './useImmersiveMode';

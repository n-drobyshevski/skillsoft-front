// Test Player Hooks barrel export

// Player State Hook
export { usePlayerState, type QuestionState } from './usePlayerState';
export type {
  PlayerState,
  UsePlayerStateProps,
  UsePlayerStateReturn,
} from './usePlayerState';

// Answer Submission Hook
export {
  useAnswerSubmission,
  extractAnswerValue,
} from './useAnswerSubmission';
export type {
  ValidationResult,
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

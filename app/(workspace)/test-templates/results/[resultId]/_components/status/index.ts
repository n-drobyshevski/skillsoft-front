/**
 * Status components for test result scoring workflow.
 *
 * These components handle non-COMPLETED result states:
 * - ScoringPendingView: Loading UI with progress while scoring is in progress
 * - ScoringFailedView: Error recovery UI when scoring fails
 *
 * Used by ResultViewFactory for status-based routing.
 */

export { ScoringPendingView } from './ScoringPendingView';
export { ScoringFailedView } from './ScoringFailedView';

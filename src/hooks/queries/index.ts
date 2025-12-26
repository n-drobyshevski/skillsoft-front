/**
 * React Query Hooks
 *
 * Centralized exports for all query hooks used in client-side data fetching.
 * These hooks provide caching, refetching, and optimistic updates.
 */

// Psychometrics queries
export {
  // Query keys for external cache manipulation
  psychometricsKeys,
  // Dashboard
  usePsychometricsDashboard,
  // Items
  usePsychometricsItems,
  usePsychometricsItemDetail,
  useUpdateItemStatus,
  useRecalculateItem,
  useBatchUpdateItemStatus,
  // Competencies
  usePsychometricsCompetencies,
  usePsychometricsCompetencyDetail,
  // Flagged
  usePsychometricsFlaggedItems,
  // Big Five
  usePsychometricsBigFive,
  // Audit
  useTriggerAudit,
  // Prefetching
  prefetchPsychometricsDashboard,
  prefetchPsychometricsItems,
  prefetchPsychometricsItemDetail,
  prefetchPsychometricsCompetencyDetail,
} from './usePsychometricsQuery';

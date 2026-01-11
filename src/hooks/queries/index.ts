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

// Suggested Users queries
export {
  suggestedUsersKeys,
  useSuggestedUsers,
} from './useSuggestedUsers';

// Template Sharing queries
export {
  // Query keys for external cache manipulation
  templateSharingKeys,
  // Visibility
  useTemplateVisibility,
  useChangeVisibility,
  // Shares
  useTemplateShares,
  useShareWithUser,
  useShareWithTeam,
  useUpdateShare,
  useRevokeShare,
  useBulkShare,
  // Links
  useShareLinks,
  useActiveShareLinks,
  useCanCreateLink,
  useLinkCount,
  useCreateShareLink,
  useRevokeShareLink,
  useRevokeAllLinks,
  // Link Validation (public)
  useValidateShareLink,
  // Shared With Me
  useSharedWithMe,
  useSharedWithMeCount,
} from './useTemplateSharingQuery';

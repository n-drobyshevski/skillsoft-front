/**
 * Client-side Data Fetching Hooks
 *
 * Centralized exports for all data fetching hooks.
 * These hooks use simple useState + useEffect patterns for client-side data loading.
 * Server-side caching is handled by 'use cache' functions in api.cache.*.ts files.
 */

// Psychometrics hooks
export {
  // Key structure (for test compatibility)
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
} from './usePsychometricsQuery';

// Suggested Users hook
export {
  useSuggestedUsers,
} from './useSuggestedUsers';

// Template Sharing hooks
export {
  // Key structure (for test compatibility)
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
  useShareLinkStats,
} from './useTemplateSharingQuery';

'use client';

/**
 * React Query hooks for Psychometrics data fetching
 *
 * Provides client-side caching with stale-while-revalidate pattern for:
 * - Dashboard overview data
 * - Item statistics with filtering
 * - Competency reliability data
 * - Big Five trait analysis
 * - Flagged items
 *
 * Features:
 * - Automatic background refetching when data becomes stale
 * - Optimistic updates for status changes
 * - Query invalidation for mutations
 * - Prefetching utilities for navigation
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { psychometricsApi } from '@/services/api';
import { ItemValidityStatus } from '@/types/psychometrics';
import type {
  PsychometricHealthReport,
  ItemStatistics,
  ItemStatisticsDetail,
  ItemStatisticsFilterParams,
  CompetencyReliability,
  CompetencyReliabilityDetail,
  CompetencyReliabilityFilterParams,
  FlaggedItemSummary,
  BigFiveReliability,
  UpdateItemStatusRequest,
  AuditResult,
  Page,
} from '@/types/psychometrics';

// ============================================================================
// Query Keys - Centralized key management for cache operations
// ============================================================================

export const psychometricsKeys = {
  all: ['psychometrics'] as const,

  // Dashboard
  dashboard: () => [...psychometricsKeys.all, 'dashboard'] as const,

  // Items
  items: () => [...psychometricsKeys.all, 'items'] as const,
  itemsList: (params: ItemStatisticsFilterParams) =>
    [...psychometricsKeys.items(), 'list', params] as const,
  itemDetail: (questionId: string) =>
    [...psychometricsKeys.items(), 'detail', questionId] as const,

  // Competencies
  competencies: () => [...psychometricsKeys.all, 'competencies'] as const,
  competenciesList: (params: CompetencyReliabilityFilterParams) =>
    [...psychometricsKeys.competencies(), 'list', params] as const,
  competencyDetail: (competencyId: string) =>
    [...psychometricsKeys.competencies(), 'detail', competencyId] as const,

  // Flagged items
  flagged: () => [...psychometricsKeys.all, 'flagged'] as const,

  // Big Five
  bigFive: () => [...psychometricsKeys.all, 'big-five'] as const,
};

// ============================================================================
// Query Options - Reusable configuration for different data types
// ============================================================================

// Aligned with server-side cacheLife profiles (see QueryProvider.tsx QUERY_STALE_TIMES)
const STALE_TIMES = {
  dashboard: 60 * 1000,        // entityData tier - dashboard changes with assessments
  items: 60 * 1000,            // entityData tier - item data tied to entity changes
  competencies: 5 * 60 * 1000, // userData tier - competency reliability is stable
  bigFive: 10 * 60 * 1000,     // referenceData tier - personality traits very stable
  flagged: 60 * 1000,          // entityData tier - flagged items important to stay fresh
};

// ============================================================================
// Dashboard Hooks
// ============================================================================

/**
 * Hook to fetch psychometrics dashboard overview
 */
export function usePsychometricsDashboard(
  options?: Omit<UseQueryOptions<PsychometricHealthReport, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: psychometricsKeys.dashboard(),
    queryFn: () => psychometricsApi.getDashboard(),
    staleTime: STALE_TIMES.dashboard,
    ...options,
  });
}

// ============================================================================
// Items Hooks
// ============================================================================

/**
 * Hook to fetch paginated item statistics with filters
 */
export function usePsychometricsItems(
  params: ItemStatisticsFilterParams = {},
  options?: Omit<UseQueryOptions<Page<ItemStatistics>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: psychometricsKeys.itemsList(params),
    queryFn: () => psychometricsApi.getItems(params),
    staleTime: STALE_TIMES.items,
    ...options,
  });
}

/**
 * Hook to fetch single item detail
 */
export function usePsychometricsItemDetail(
  questionId: string,
  options?: Omit<UseQueryOptions<ItemStatisticsDetail, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: psychometricsKeys.itemDetail(questionId),
    queryFn: () => psychometricsApi.getItemDetail(questionId),
    staleTime: STALE_TIMES.items,
    enabled: !!questionId,
    ...options,
  });
}

/**
 * Mutation hook to update item validity status
 * Includes optimistic update and cache invalidation
 */
export function useUpdateItemStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      request,
    }: {
      questionId: string;
      request: UpdateItemStatusRequest;
    }) => psychometricsApi.updateItemStatus(questionId, request),

    onMutate: async ({ questionId, request }) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: psychometricsKeys.items() });
      await queryClient.cancelQueries({ queryKey: psychometricsKeys.flagged() });
      await queryClient.cancelQueries({
        queryKey: psychometricsKeys.itemDetail(questionId),
      });

      // Snapshot current caches for rollback
      const previousItemDetail = queryClient.getQueryData<ItemStatisticsDetail>(
        psychometricsKeys.itemDetail(questionId)
      );
      const previousItemsQueries = queryClient.getQueriesData<Page<ItemStatistics>>({
        queryKey: psychometricsKeys.items(),
      });
      const previousFlagged = queryClient.getQueryData<FlaggedItemSummary[]>(
        psychometricsKeys.flagged()
      );

      // Optimistically update item detail cache
      if (previousItemDetail) {
        queryClient.setQueryData<ItemStatisticsDetail>(
          psychometricsKeys.itemDetail(questionId),
          {
            ...previousItemDetail,
            validityStatus: request.newStatus,
          }
        );
      }

      // Optimistically update all cached items list pages
      for (const [queryKey, data] of previousItemsQueries) {
        if (!data) continue;
        queryClient.setQueryData<Page<ItemStatistics>>(queryKey, {
          ...data,
          content: data.content.map((item) =>
            item.questionId === questionId
              ? { ...item, validityStatus: request.newStatus }
              : item
          ),
        });
      }

      // Optimistically update flagged items cache
      if (previousFlagged) {
        if (request.newStatus !== ItemValidityStatus.FLAGGED_FOR_REVIEW) {
          // Remove from flagged list if status is no longer FLAGGED_FOR_REVIEW
          queryClient.setQueryData<FlaggedItemSummary[]>(
            psychometricsKeys.flagged(),
            previousFlagged.filter((item) => item.questionId !== questionId)
          );
        } else {
          // Update status in flagged list if item remains flagged
          queryClient.setQueryData<FlaggedItemSummary[]>(
            psychometricsKeys.flagged(),
            previousFlagged.map((item) =>
              item.questionId === questionId
                ? { ...item, validityStatus: request.newStatus }
                : item
            )
          );
        }
      }

      return { previousItemDetail, previousItemsQueries, previousFlagged };
    },

    onError: (_err, { questionId }, context) => {
      // Rollback all caches to their previous state
      if (context?.previousItemDetail) {
        queryClient.setQueryData(
          psychometricsKeys.itemDetail(questionId),
          context.previousItemDetail
        );
      }
      if (context?.previousItemsQueries) {
        for (const [queryKey, data] of context.previousItemsQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      if (context?.previousFlagged) {
        queryClient.setQueryData(
          psychometricsKeys.flagged(),
          context.previousFlagged
        );
      }
    },

    onSuccess: (updatedItem, { questionId }) => {
      // Replace optimistic data with real server response
      queryClient.setQueryData(
        psychometricsKeys.itemDetail(questionId),
        updatedItem
      );
    },

    onSettled: () => {
      // Always refetch to ensure server state consistency
      queryClient.invalidateQueries({
        queryKey: psychometricsKeys.items(),
      });
      queryClient.invalidateQueries({
        queryKey: psychometricsKeys.flagged(),
      });
      queryClient.invalidateQueries({
        queryKey: psychometricsKeys.dashboard(),
      });
    },
  });
}

/**
 * Mutation hook to recalculate item statistics
 */
export function useRecalculateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId: string) =>
      psychometricsApi.recalculateItem(questionId),

    onSuccess: (updatedItem, questionId) => {
      // Update caches with new data
      queryClient.setQueryData(
        psychometricsKeys.itemDetail(questionId),
        (old: ItemStatisticsDetail | undefined) =>
          old ? { ...old, ...updatedItem } : undefined
      );

      // Invalidate items list
      queryClient.invalidateQueries({
        queryKey: psychometricsKeys.items(),
      });
    },
  });
}

// ============================================================================
// Competencies Hooks
// ============================================================================

/**
 * Hook to fetch paginated competency reliability data
 */
export function usePsychometricsCompetencies(
  params: CompetencyReliabilityFilterParams = {},
  options?: Omit<UseQueryOptions<Page<CompetencyReliability>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: psychometricsKeys.competenciesList(params),
    queryFn: () => psychometricsApi.getCompetencies(params),
    staleTime: STALE_TIMES.competencies,
    ...options,
  });
}

/**
 * Hook to fetch single competency detail
 */
export function usePsychometricsCompetencyDetail(
  competencyId: string,
  options?: Omit<UseQueryOptions<CompetencyReliabilityDetail, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: psychometricsKeys.competencyDetail(competencyId),
    queryFn: () => psychometricsApi.getCompetencyDetail(competencyId),
    staleTime: STALE_TIMES.competencies,
    enabled: !!competencyId,
    ...options,
  });
}

// ============================================================================
// Flagged Items Hooks
// ============================================================================

/**
 * Hook to fetch all flagged items
 */
export function usePsychometricsFlaggedItems(
  options?: Omit<UseQueryOptions<FlaggedItemSummary[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: psychometricsKeys.flagged(),
    queryFn: () => psychometricsApi.getFlaggedItems(),
    staleTime: STALE_TIMES.flagged,
    ...options,
  });
}

// ============================================================================
// Big Five Hooks
// ============================================================================

/**
 * Hook to fetch Big Five trait reliability data
 */
export function usePsychometricsBigFive(
  options?: Omit<UseQueryOptions<BigFiveReliability[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: psychometricsKeys.bigFive(),
    queryFn: () => psychometricsApi.getBigFiveReliability(),
    staleTime: STALE_TIMES.bigFive,
    ...options,
  });
}

// ============================================================================
// Audit Hooks
// ============================================================================

/**
 * Mutation hook to trigger psychometric audit
 */
export function useTriggerAudit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => psychometricsApi.triggerAudit(),

    onSuccess: () => {
      // Invalidate all psychometrics data after audit
      queryClient.invalidateQueries({
        queryKey: psychometricsKeys.all,
      });
    },
  });
}

// ============================================================================
// Prefetching Utilities
// ============================================================================

/**
 * Prefetch dashboard data (useful for navigation)
 */
export function prefetchPsychometricsDashboard(queryClient: QueryClient) {
  return queryClient.prefetchQuery({
    queryKey: psychometricsKeys.dashboard(),
    queryFn: () => psychometricsApi.getDashboard(),
    staleTime: STALE_TIMES.dashboard,
  });
}

/**
 * Prefetch items list (useful for navigation from dashboard)
 */
export function prefetchPsychometricsItems(
  queryClient: QueryClient,
  params: ItemStatisticsFilterParams = {}
) {
  return queryClient.prefetchQuery({
    queryKey: psychometricsKeys.itemsList(params),
    queryFn: () => psychometricsApi.getItems(params),
    staleTime: STALE_TIMES.items,
  });
}

/**
 * Prefetch item detail (useful for hover on table rows)
 */
export function prefetchPsychometricsItemDetail(
  queryClient: QueryClient,
  questionId: string
) {
  return queryClient.prefetchQuery({
    queryKey: psychometricsKeys.itemDetail(questionId),
    queryFn: () => psychometricsApi.getItemDetail(questionId),
    staleTime: STALE_TIMES.items,
  });
}

/**
 * Prefetch competency detail (useful for hover on table rows)
 */
export function prefetchPsychometricsCompetencyDetail(
  queryClient: QueryClient,
  competencyId: string
) {
  return queryClient.prefetchQuery({
    queryKey: psychometricsKeys.competencyDetail(competencyId),
    queryFn: () => psychometricsApi.getCompetencyDetail(competencyId),
    staleTime: STALE_TIMES.competencies,
  });
}

// ============================================================================
// Batch Update Hook
// ============================================================================

/**
 * Mutation hook for batch status updates
 * Includes optimistic update and cache invalidation
 */
export function useBatchUpdateItemStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionIds,
      request,
    }: {
      questionIds: string[];
      request: UpdateItemStatusRequest;
    }) => psychometricsApi.batchUpdateItemStatus(questionIds, request.newStatus, request.reason),

    onMutate: async ({ questionIds, request }) => {
      const questionIdSet = new Set(questionIds);

      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: psychometricsKeys.items() });
      await queryClient.cancelQueries({ queryKey: psychometricsKeys.flagged() });

      // Snapshot current caches for rollback
      const previousItemsQueries = queryClient.getQueriesData<Page<ItemStatistics>>({
        queryKey: psychometricsKeys.items(),
      });
      const previousFlagged = queryClient.getQueryData<FlaggedItemSummary[]>(
        psychometricsKeys.flagged()
      );

      // Optimistically update all cached items list pages
      for (const [queryKey, data] of previousItemsQueries) {
        if (!data) continue;
        queryClient.setQueryData<Page<ItemStatistics>>(queryKey, {
          ...data,
          content: data.content.map((item) =>
            questionIdSet.has(item.questionId)
              ? { ...item, validityStatus: request.newStatus }
              : item
          ),
        });
      }

      // Optimistically update flagged items cache
      if (previousFlagged) {
        if (request.newStatus !== ItemValidityStatus.FLAGGED_FOR_REVIEW) {
          // Remove batch items from flagged list
          queryClient.setQueryData<FlaggedItemSummary[]>(
            psychometricsKeys.flagged(),
            previousFlagged.filter((item) => !questionIdSet.has(item.questionId))
          );
        } else {
          // Update status for batch items that are already in flagged list
          queryClient.setQueryData<FlaggedItemSummary[]>(
            psychometricsKeys.flagged(),
            previousFlagged.map((item) =>
              questionIdSet.has(item.questionId)
                ? { ...item, validityStatus: request.newStatus }
                : item
            )
          );
        }
      }

      return { previousItemsQueries, previousFlagged };
    },

    onError: (_err, _variables, context) => {
      // Rollback all caches to their previous state
      if (context?.previousItemsQueries) {
        for (const [queryKey, data] of context.previousItemsQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      if (context?.previousFlagged) {
        queryClient.setQueryData(
          psychometricsKeys.flagged(),
          context.previousFlagged
        );
      }
    },

    onSettled: () => {
      // Always refetch to ensure server state consistency
      queryClient.invalidateQueries({
        queryKey: psychometricsKeys.items(),
      });
      queryClient.invalidateQueries({
        queryKey: psychometricsKeys.flagged(),
      });
      queryClient.invalidateQueries({
        queryKey: psychometricsKeys.dashboard(),
      });
    },
  });
}

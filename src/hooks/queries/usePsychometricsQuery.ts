'use client';

/**
 * Client-side hooks for Psychometrics data fetching
 *
 * Provides fetch-based data loading for:
 * - Dashboard overview data
 * - Item statistics with filtering
 * - Competency reliability data
 * - Big Five trait analysis
 * - Flagged items
 *
 * Migrated from React Query to simple useState + useEffect patterns.
 * Mutations are plain async functions.
 * Prefetching utilities use router.prefetch() for route-level prefetching.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
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
  Page,
} from '@/types/psychometrics';

// ============================================================================
// Generic fetch hook (shared with useTemplateSharingQuery)
// ============================================================================

interface FetchState<T> {
  data: T | undefined;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  fetchStatus: 'idle' | 'fetching';
  refetch: () => void;
}

function useFetch<T>(
  fetchFn: () => Promise<T>,
  enabled: boolean = true,
): FetchState<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fetchStatus, setFetchStatus] = useState<'idle' | 'fetching'>(
    enabled ? 'fetching' : 'idle'
  );
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;
  const mountedRef = useRef(true);

  const doFetch = useCallback(() => {
    if (!mountedRef.current) return;
    setIsLoading(true);
    setFetchStatus('fetching');
    setIsError(false);
    setError(null);

    fetchFnRef.current()
      .then((result) => {
        if (!mountedRef.current) return;
        setData(result);
        setIsSuccess(true);
        setIsLoading(false);
        setFetchStatus('idle');
      })
      .catch((err: unknown) => {
        if (!mountedRef.current) return;
        setIsError(true);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
        setFetchStatus('idle');
      });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (enabled) {
      doFetch();
    } else {
      setIsLoading(false);
      setFetchStatus('idle');
    }
  }, [enabled, doFetch]);

  return {
    data,
    isLoading: enabled ? isLoading : false,
    isSuccess,
    isError,
    error,
    fetchStatus: enabled ? fetchStatus : 'idle',
    refetch: doFetch,
  };
}

// ============================================================================
// Generic mutation hook
// ============================================================================

interface MutationState<TData, TVariables> {
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  data: TData | undefined;
}

function useMutationFn<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
  },
): MutationState<TData, TVariables> {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | undefined>(undefined);

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setIsPending(true);
      setIsSuccess(false);
      setIsError(false);
      setError(null);

      try {
        const result = await mutationFn(variables);
        setData(result);
        setIsSuccess(true);
        options?.onSuccess?.(result, variables);
        return result;
      } catch (err) {
        const typedErr = err instanceof Error ? err : new Error(String(err));
        setError(typedErr);
        setIsError(true);
        options?.onError?.(typedErr, variables);
        throw typedErr;
      } finally {
        setIsPending(false);
      }
    },
    [mutationFn, options],
  );

  return { mutateAsync, isPending, isSuccess, isError, error, data };
}

// ============================================================================
// Query Keys - Kept for structural compatibility
// ============================================================================

export const psychometricsKeys = {
  all: ['psychometrics'] as const,
  dashboard: () => [...psychometricsKeys.all, 'dashboard'] as const,
  items: () => [...psychometricsKeys.all, 'items'] as const,
  itemsList: (params: ItemStatisticsFilterParams) =>
    [...psychometricsKeys.items(), 'list', params] as const,
  itemDetail: (questionId: string) =>
    [...psychometricsKeys.items(), 'detail', questionId] as const,
  competencies: () => [...psychometricsKeys.all, 'competencies'] as const,
  competenciesList: (params: CompetencyReliabilityFilterParams) =>
    [...psychometricsKeys.competencies(), 'list', params] as const,
  competencyDetail: (competencyId: string) =>
    [...psychometricsKeys.competencies(), 'detail', competencyId] as const,
  flagged: () => [...psychometricsKeys.all, 'flagged'] as const,
  bigFive: () => [...psychometricsKeys.all, 'big-five'] as const,
};

// ============================================================================
// Dashboard Hooks
// ============================================================================

/**
 * Hook to fetch psychometrics dashboard overview
 */
export function usePsychometricsDashboard() {
  return useFetch(() => psychometricsApi.getDashboard());
}

// ============================================================================
// Items Hooks
// ============================================================================

/**
 * Hook to fetch paginated item statistics with filters
 */
export function usePsychometricsItems(
  params: ItemStatisticsFilterParams = {},
) {
  return useFetch(() => psychometricsApi.getItems(params));
}

/**
 * Hook to fetch single item detail
 */
export function usePsychometricsItemDetail(questionId: string) {
  return useFetch(
    () => psychometricsApi.getItemDetail(questionId),
    !!questionId,
  );
}

/**
 * Mutation hook to update item validity status
 */
export function useUpdateItemStatus() {
  return useMutationFn(
    ({
      questionId,
      request,
    }: {
      questionId: string;
      request: UpdateItemStatusRequest;
    }) => psychometricsApi.updateItemStatus(questionId, request),
  );
}

/**
 * Mutation hook to recalculate item statistics
 */
export function useRecalculateItem() {
  return useMutationFn((questionId: string) =>
    psychometricsApi.recalculateItem(questionId),
  );
}

// ============================================================================
// Competencies Hooks
// ============================================================================

/**
 * Hook to fetch paginated competency reliability data
 */
export function usePsychometricsCompetencies(
  params: CompetencyReliabilityFilterParams = {},
) {
  return useFetch(() => psychometricsApi.getCompetencies(params));
}

/**
 * Hook to fetch single competency detail
 */
export function usePsychometricsCompetencyDetail(competencyId: string) {
  return useFetch(
    () => psychometricsApi.getCompetencyDetail(competencyId),
    !!competencyId,
  );
}

// ============================================================================
// Flagged Items Hooks
// ============================================================================

/**
 * Hook to fetch all flagged items
 */
export function usePsychometricsFlaggedItems() {
  return useFetch(() => psychometricsApi.getFlaggedItems());
}

// ============================================================================
// Big Five Hooks
// ============================================================================

/**
 * Hook to fetch Big Five trait reliability data
 */
export function usePsychometricsBigFive() {
  return useFetch(() => psychometricsApi.getBigFiveReliability());
}

// ============================================================================
// Audit Hooks
// ============================================================================

/**
 * Mutation hook to trigger psychometric audit
 */
export function useTriggerAudit() {
  return useMutationFn(() => psychometricsApi.triggerAudit());
}

// ============================================================================
// Batch Update Hook
// ============================================================================

/**
 * Mutation hook for batch status updates
 */
export function useBatchUpdateItemStatus() {
  return useMutationFn(
    ({
      questionIds,
      request,
    }: {
      questionIds: string[];
      request: UpdateItemStatusRequest;
    }) =>
      psychometricsApi.batchUpdateItemStatus(
        questionIds,
        request.newStatus,
        request.reason,
      ),
  );
}

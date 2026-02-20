'use client';

/**
 * Client-side hooks for Template Sharing and Visibility
 *
 * Provides fetch-based data loading and mutation functions for:
 * - Template visibility information
 * - User/team shares
 * - Share links
 * - Link validation (for anonymous access)
 *
 * Migrated from React Query to simple useState + useEffect patterns.
 * Mutations are plain async functions that refresh data on success.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { templateSharingApi } from '@/services/api';
import type {
  VisibilityInfo,
  TemplateShare,
  ShareLink,
  LinkValidationResult,
  ChangeVisibilityRequest,
  ShareUserRequest,
  ShareTeamRequest,
  CreateShareLinkRequest,
  UpdateShareRequest,
  BulkShareRequest,
  SharedTemplatesResponse,
  SharePermission,
} from '@/types/domain';

// ============================================================================
// Generic hook for data fetching (replaces useQuery)
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
// Generic hook for mutations (replaces useMutation)
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
// Query Keys - Kept for test compatibility (key structure only)
// ============================================================================

export const templateSharingKeys = {
  all: ['templateSharing'] as const,

  // Visibility
  visibility: (templateId: string) =>
    [...templateSharingKeys.all, 'visibility', templateId] as const,

  // Shares
  shares: (templateId: string) =>
    [...templateSharingKeys.all, 'shares', templateId] as const,
  sharesList: (templateId: string) =>
    [...templateSharingKeys.shares(templateId), 'list'] as const,

  // Links
  links: (templateId: string) =>
    [...templateSharingKeys.all, 'links', templateId] as const,
  linksList: (templateId: string) =>
    [...templateSharingKeys.links(templateId), 'list'] as const,
  activeLinks: (templateId: string) =>
    [...templateSharingKeys.links(templateId), 'active'] as const,
  linkCount: (templateId: string) =>
    [...templateSharingKeys.links(templateId), 'count'] as const,
  canCreateLink: (templateId: string) =>
    [...templateSharingKeys.links(templateId), 'canCreate'] as const,

  // Link validation (public)
  linkValidation: (token: string) =>
    [...templateSharingKeys.all, 'validate', token] as const,
};

// ============================================================================
// Visibility Hooks
// ============================================================================

/**
 * Hook to fetch template visibility information
 */
export function useTemplateVisibility(templateId: string) {
  return useFetch(
    () => templateSharingApi.getVisibility(templateId),
    !!templateId,
  );
}

/**
 * Mutation hook to change template visibility
 */
export function useChangeVisibility() {
  return useMutationFn(
    ({ templateId, request }: { templateId: string; request: ChangeVisibilityRequest }) =>
      templateSharingApi.changeVisibility(templateId, request),
  );
}

// ============================================================================
// Shares Hooks
// ============================================================================

/**
 * Hook to fetch template shares (users and teams)
 */
export function useTemplateShares(templateId: string) {
  return useFetch(
    () => templateSharingApi.listShares(templateId),
    !!templateId,
  );
}

/**
 * Mutation hook to share with a user
 */
export function useShareWithUser() {
  return useMutationFn(
    ({ templateId, request }: { templateId: string; request: ShareUserRequest }) =>
      templateSharingApi.shareWithUser(templateId, request),
  );
}

/**
 * Mutation hook to share with a team
 */
export function useShareWithTeam() {
  return useMutationFn(
    ({ templateId, request }: { templateId: string; request: ShareTeamRequest }) =>
      templateSharingApi.shareWithTeam(templateId, request),
  );
}

/**
 * Mutation hook to update a share's permission
 */
export function useUpdateShare() {
  return useMutationFn(
    ({
      templateId,
      shareId,
      request,
    }: {
      templateId: string;
      shareId: string;
      request: UpdateShareRequest;
    }) => templateSharingApi.updateShare(templateId, shareId, request),
  );
}

/**
 * Mutation hook to revoke a share
 */
export function useRevokeShare() {
  return useMutationFn(
    ({ templateId, shareId }: { templateId: string; shareId: string }) =>
      templateSharingApi.revokeShare(templateId, shareId),
  );
}

/**
 * Mutation hook for bulk sharing
 */
export function useBulkShare() {
  return useMutationFn(
    ({ templateId, request }: { templateId: string; request: BulkShareRequest }) =>
      templateSharingApi.bulkShare(templateId, request),
  );
}

// ============================================================================
// Links Hooks
// ============================================================================

/**
 * Hook to fetch all share links for a template
 */
export function useShareLinks(templateId: string) {
  return useFetch(
    () => templateSharingApi.listLinks(templateId),
    !!templateId,
  );
}

/**
 * Hook to fetch only active share links
 */
export function useActiveShareLinks(templateId: string) {
  return useFetch(
    () => templateSharingApi.listActiveLinks(templateId),
    !!templateId,
  );
}

/**
 * Hook to check if a new link can be created
 */
export function useCanCreateLink(templateId: string) {
  return useFetch(
    () => templateSharingApi.canCreateLink(templateId),
    !!templateId,
  );
}

/**
 * Hook to get link count
 */
export function useLinkCount(templateId: string) {
  return useFetch(
    () => templateSharingApi.getLinkCount(templateId),
    !!templateId,
  );
}

/**
 * Mutation hook to create a share link
 */
export function useCreateShareLink() {
  return useMutationFn(
    ({
      templateId,
      request,
    }: {
      templateId: string;
      request: CreateShareLinkRequest;
    }) => templateSharingApi.createLink(templateId, request),
  );
}

/**
 * Mutation hook to revoke a share link
 */
export function useRevokeShareLink() {
  return useMutationFn(
    ({ templateId, linkId }: { templateId: string; linkId: string }) =>
      templateSharingApi.revokeLink(templateId, linkId),
  );
}

/**
 * Mutation hook to revoke all links
 */
export function useRevokeAllLinks() {
  return useMutationFn(
    (templateId: string) => templateSharingApi.revokeAllLinks(templateId),
  );
}

// ============================================================================
// Link Validation Hooks (Public - No Auth Required)
// ============================================================================

/**
 * Hook to validate a share link token
 * This is used for anonymous access via share links
 */
export function useValidateShareLink(token: string | null) {
  return useFetch(
    () => templateSharingApi.validateLink(token!),
    !!token,
  );
}

// ============================================================================
// Shared With Me Hooks
// ============================================================================

/**
 * Hook to fetch templates shared with the current user
 */
export function useSharedWithMe() {
  return useFetch(
    () => templateSharingApi.getSharedWithMe(),
    true,
  );
}

/**
 * Hook to fetch count of templates shared with current user
 */
export function useSharedWithMeCount() {
  return useFetch(
    () => templateSharingApi.getSharedWithMeCount(),
    true,
  );
}

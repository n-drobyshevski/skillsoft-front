'use client';

/**
 * React Query hooks for Template Sharing and Visibility
 *
 * Provides client-side caching with stale-while-revalidate pattern for:
 * - Template visibility information
 * - User/team shares
 * - Share links
 * - Link validation (for anonymous access)
 *
 * Features:
 * - Automatic background refetching when data becomes stale
 * - Optimistic updates for mutations
 * - Query invalidation for related data
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
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
} from '@/types/domain';

// ============================================================================
// Query Keys - Centralized key management for cache operations
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
// Query Options - Reusable configuration for different data types
// ============================================================================

const STALE_TIMES = {
  visibility: 60 * 1000,      // 1 minute - visibility changes infrequently
  shares: 30 * 1000,          // 30 seconds - shares may change more often
  links: 60 * 1000,           // 1 minute - links are relatively stable
  validation: 5 * 60 * 1000,  // 5 minutes - validation result is stable
};

// ============================================================================
// Visibility Hooks
// ============================================================================

/**
 * Hook to fetch template visibility information
 */
export function useTemplateVisibility(
  templateId: string,
  options?: Omit<UseQueryOptions<VisibilityInfo, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: templateSharingKeys.visibility(templateId),
    queryFn: () => templateSharingApi.getVisibility(templateId),
    staleTime: STALE_TIMES.visibility,
    enabled: !!templateId,
    ...options,
  });
}

/**
 * Mutation hook to change template visibility
 */
export function useChangeVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      request,
    }: {
      templateId: string;
      request: ChangeVisibilityRequest;
    }) => templateSharingApi.changeVisibility(templateId, request),

    onSuccess: (updatedInfo, { templateId }) => {
      // Update visibility cache
      queryClient.setQueryData(
        templateSharingKeys.visibility(templateId),
        updatedInfo
      );

      // If visibility changed away from LINK, invalidate links
      queryClient.invalidateQueries({
        queryKey: templateSharingKeys.links(templateId),
      });
    },
  });
}

// ============================================================================
// Shares Hooks
// ============================================================================

/**
 * Hook to fetch template shares (users and teams)
 */
export function useTemplateShares(
  templateId: string,
  options?: Omit<UseQueryOptions<TemplateShare[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: templateSharingKeys.sharesList(templateId),
    queryFn: () => templateSharingApi.listShares(templateId),
    staleTime: STALE_TIMES.shares,
    enabled: !!templateId,
    ...options,
  });
}

/**
 * Mutation hook to share with a user
 */
export function useShareWithUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      request,
    }: {
      templateId: string;
      request: ShareUserRequest;
    }) => templateSharingApi.shareWithUser(templateId, request),

    onSuccess: (newShare, { templateId }) => {
      // Add to shares list
      queryClient.setQueryData<TemplateShare[]>(
        templateSharingKeys.sharesList(templateId),
        (old) => (old ? [...old, newShare] : [newShare])
      );

      // Update visibility counts
      queryClient.invalidateQueries({
        queryKey: templateSharingKeys.visibility(templateId),
      });
    },
  });
}

/**
 * Mutation hook to share with a team
 */
export function useShareWithTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      request,
    }: {
      templateId: string;
      request: ShareTeamRequest;
    }) => templateSharingApi.shareWithTeam(templateId, request),

    onSuccess: (newShare, { templateId }) => {
      // Add to shares list
      queryClient.setQueryData<TemplateShare[]>(
        templateSharingKeys.sharesList(templateId),
        (old) => (old ? [...old, newShare] : [newShare])
      );

      // Update visibility counts
      queryClient.invalidateQueries({
        queryKey: templateSharingKeys.visibility(templateId),
      });
    },
  });
}

/**
 * Mutation hook to update a share's permission
 */
export function useUpdateShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      shareId,
      request,
    }: {
      templateId: string;
      shareId: string;
      request: UpdateShareRequest;
    }) => templateSharingApi.updateShare(templateId, shareId, request),

    onSuccess: (updatedShare, { templateId }) => {
      // Update share in list
      queryClient.setQueryData<TemplateShare[]>(
        templateSharingKeys.sharesList(templateId),
        (old) =>
          old?.map((share) =>
            share.id === updatedShare.id ? updatedShare : share
          )
      );
    },
  });
}

/**
 * Mutation hook to revoke a share
 */
export function useRevokeShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      shareId,
    }: {
      templateId: string;
      shareId: string;
    }) => templateSharingApi.revokeShare(templateId, shareId),

    onSuccess: (_, { templateId, shareId }) => {
      // Remove from shares list
      queryClient.setQueryData<TemplateShare[]>(
        templateSharingKeys.sharesList(templateId),
        (old) => old?.filter((share) => share.id !== shareId)
      );

      // Update visibility counts
      queryClient.invalidateQueries({
        queryKey: templateSharingKeys.visibility(templateId),
      });
    },
  });
}

/**
 * Mutation hook for bulk sharing
 */
export function useBulkShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      request,
    }: {
      templateId: string;
      request: BulkShareRequest;
    }) => templateSharingApi.bulkShare(templateId, request),

    onSuccess: (response, { templateId }) => {
      // Add all created shares to list
      const createdShares = response.created || [];
      if (createdShares.length > 0) {
        queryClient.setQueryData<TemplateShare[]>(
          templateSharingKeys.sharesList(templateId),
          (old) => (old ? [...old, ...createdShares] : createdShares)
        );
      }

      // Update visibility counts
      queryClient.invalidateQueries({
        queryKey: templateSharingKeys.visibility(templateId),
      });
    },
  });
}

// ============================================================================
// Links Hooks
// ============================================================================

/**
 * Hook to fetch all share links for a template
 */
export function useShareLinks(
  templateId: string,
  options?: Omit<UseQueryOptions<ShareLink[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: templateSharingKeys.linksList(templateId),
    queryFn: () => templateSharingApi.listLinks(templateId),
    staleTime: STALE_TIMES.links,
    enabled: !!templateId,
    ...options,
  });
}

/**
 * Hook to fetch only active share links
 */
export function useActiveShareLinks(
  templateId: string,
  options?: Omit<UseQueryOptions<ShareLink[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: templateSharingKeys.activeLinks(templateId),
    queryFn: () => templateSharingApi.listActiveLinks(templateId),
    staleTime: STALE_TIMES.links,
    enabled: !!templateId,
    ...options,
  });
}

/**
 * Hook to check if a new link can be created
 */
export function useCanCreateLink(
  templateId: string,
  options?: Omit<UseQueryOptions<boolean, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: templateSharingKeys.canCreateLink(templateId),
    queryFn: () => templateSharingApi.canCreateLink(templateId),
    staleTime: STALE_TIMES.links,
    enabled: !!templateId,
    ...options,
  });
}

/**
 * Hook to get link count
 */
export function useLinkCount(
  templateId: string,
  options?: Omit<
    UseQueryOptions<{ activeCount: number; maxLinks: number }, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: templateSharingKeys.linkCount(templateId),
    queryFn: () => templateSharingApi.getLinkCount(templateId),
    staleTime: STALE_TIMES.links,
    enabled: !!templateId,
    ...options,
  });
}

/**
 * Mutation hook to create a share link
 */
export function useCreateShareLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      request,
    }: {
      templateId: string;
      request: CreateShareLinkRequest;
    }) => templateSharingApi.createLink(templateId, request),

    onSuccess: (newLink, { templateId }) => {
      // Add to links list
      queryClient.setQueryData<ShareLink[]>(
        templateSharingKeys.linksList(templateId),
        (old) => (old ? [newLink, ...old] : [newLink])
      );

      // Add to active links if active
      if (!newLink.revokedAt) {
        queryClient.setQueryData<ShareLink[]>(
          templateSharingKeys.activeLinks(templateId),
          (old) => (old ? [newLink, ...old] : [newLink])
        );
      }

      // Update link count
      queryClient.invalidateQueries({
        queryKey: templateSharingKeys.linkCount(templateId),
      });

      // Update can create status
      queryClient.invalidateQueries({
        queryKey: templateSharingKeys.canCreateLink(templateId),
      });

      // Update visibility counts
      queryClient.invalidateQueries({
        queryKey: templateSharingKeys.visibility(templateId),
      });
    },
  });
}

/**
 * Mutation hook to revoke a share link
 */
export function useRevokeShareLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      linkId,
    }: {
      templateId: string;
      linkId: string;
    }) => templateSharingApi.revokeLink(templateId, linkId),

    onSuccess: (_, { templateId, linkId }) => {
      // Update link in list to show as revoked
      const now = new Date().toISOString();
      queryClient.setQueryData<ShareLink[]>(
        templateSharingKeys.linksList(templateId),
        (old) =>
          old?.map((link) =>
            link.id === linkId ? { ...link, revokedAt: now } : link
          )
      );

      // Remove from active links
      queryClient.setQueryData<ShareLink[]>(
        templateSharingKeys.activeLinks(templateId),
        (old) => old?.filter((link) => link.id !== linkId)
      );

      // Update link count
      queryClient.invalidateQueries({
        queryKey: templateSharingKeys.linkCount(templateId),
      });

      // Update can create status
      queryClient.invalidateQueries({
        queryKey: templateSharingKeys.canCreateLink(templateId),
      });

      // Update visibility counts
      queryClient.invalidateQueries({
        queryKey: templateSharingKeys.visibility(templateId),
      });
    },
  });
}

/**
 * Mutation hook to revoke all links
 */
export function useRevokeAllLinks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) =>
      templateSharingApi.revokeAllLinks(templateId),

    onSuccess: (revokedCount, templateId) => {
      // Clear active links
      queryClient.setQueryData<ShareLink[]>(
        templateSharingKeys.activeLinks(templateId),
        []
      );

      // Refetch all links to get updated status
      queryClient.invalidateQueries({
        queryKey: templateSharingKeys.linksList(templateId),
      });

      // Update counts
      queryClient.invalidateQueries({
        queryKey: templateSharingKeys.linkCount(templateId),
      });
      queryClient.invalidateQueries({
        queryKey: templateSharingKeys.canCreateLink(templateId),
      });
      queryClient.invalidateQueries({
        queryKey: templateSharingKeys.visibility(templateId),
      });

      return revokedCount;
    },
  });
}

// ============================================================================
// Link Validation Hooks (Public - No Auth Required)
// ============================================================================

/**
 * Hook to validate a share link token
 * This is used for anonymous access via share links
 */
export function useValidateShareLink(
  token: string | null,
  options?: Omit<
    UseQueryOptions<LinkValidationResult, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: templateSharingKeys.linkValidation(token || ''),
    queryFn: () => templateSharingApi.validateLink(token!),
    staleTime: STALE_TIMES.validation,
    enabled: !!token,
    retry: false, // Don't retry on failure for validation
    ...options,
  });
}

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
  SharedTemplatesResponse,
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
 * Includes optimistic update and cache invalidation
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

    onMutate: async ({ templateId, request }) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({
        queryKey: templateSharingKeys.visibility(templateId),
      });

      // Snapshot current visibility data for rollback
      const previousVisibility = queryClient.getQueryData<VisibilityInfo>(
        templateSharingKeys.visibility(templateId)
      );

      // Optimistically update visibility
      if (previousVisibility) {
        queryClient.setQueryData<VisibilityInfo>(
          templateSharingKeys.visibility(templateId),
          {
            ...previousVisibility,
            visibility: request.visibility,
            visibilityChangedAt: new Date().toISOString(),
          }
        );
      }

      return { previousVisibility };
    },

    onError: (_err, { templateId }, context) => {
      // Rollback to snapshot on error
      if (context?.previousVisibility) {
        queryClient.setQueryData(
          templateSharingKeys.visibility(templateId),
          context.previousVisibility
        );
      }
    },

    onSuccess: (updatedInfo, { templateId }) => {
      // Replace optimistic data with real server response
      queryClient.setQueryData(
        templateSharingKeys.visibility(templateId),
        updatedInfo
      );
    },

    onSettled: (_, _err, { templateId }) => {
      // If visibility changed, invalidate links to sync with server
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
 * Includes optimistic update and cache invalidation
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

    onMutate: async ({ templateId, shareId, request }) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({
        queryKey: templateSharingKeys.sharesList(templateId),
      });

      // Snapshot current shares list for rollback
      const previousShares = queryClient.getQueryData<TemplateShare[]>(
        templateSharingKeys.sharesList(templateId)
      );

      // Optimistically update the share's permission
      if (previousShares) {
        queryClient.setQueryData<TemplateShare[]>(
          templateSharingKeys.sharesList(templateId),
          previousShares.map((share) =>
            share.id === shareId
              ? { ...share, permission: request.permission, expiresAt: request.expiresAt ?? share.expiresAt }
              : share
          )
        );
      }

      return { previousShares };
    },

    onError: (_err, { templateId }, context) => {
      // Rollback to snapshot on error
      if (context?.previousShares) {
        queryClient.setQueryData(
          templateSharingKeys.sharesList(templateId),
          context.previousShares
        );
      }
    },

    onSuccess: (updatedShare, { templateId }) => {
      // Replace optimistic data with real server response
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
 * Includes optimistic update and cache invalidation
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

    onMutate: async ({ templateId, shareId }) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({
        queryKey: templateSharingKeys.sharesList(templateId),
      });

      // Snapshot current shares list for rollback
      const previousShares = queryClient.getQueryData<TemplateShare[]>(
        templateSharingKeys.sharesList(templateId)
      );

      // Optimistically remove the revoked share
      if (previousShares) {
        queryClient.setQueryData<TemplateShare[]>(
          templateSharingKeys.sharesList(templateId),
          previousShares.filter((share) => share.id !== shareId)
        );
      }

      return { previousShares };
    },

    onError: (_err, { templateId }, context) => {
      // Rollback to snapshot on error
      if (context?.previousShares) {
        queryClient.setQueryData(
          templateSharingKeys.sharesList(templateId),
          context.previousShares
        );
      }
    },

    onSettled: (_, _err, { templateId }) => {
      // Always invalidate to sync with server
      queryClient.invalidateQueries({
        queryKey: templateSharingKeys.sharesList(templateId),
      });
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
 * Includes optimistic update and cache invalidation
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

    onMutate: async ({ templateId, linkId }) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({
        queryKey: templateSharingKeys.linksList(templateId),
      });
      await queryClient.cancelQueries({
        queryKey: templateSharingKeys.activeLinks(templateId),
      });

      // Snapshot current caches for rollback
      const previousLinks = queryClient.getQueryData<ShareLink[]>(
        templateSharingKeys.linksList(templateId)
      );
      const previousActiveLinks = queryClient.getQueryData<ShareLink[]>(
        templateSharingKeys.activeLinks(templateId)
      );

      // Optimistically mark link as revoked in the links list
      const now = new Date().toISOString();
      if (previousLinks) {
        queryClient.setQueryData<ShareLink[]>(
          templateSharingKeys.linksList(templateId),
          previousLinks.map((link) =>
            link.id === linkId
              ? { ...link, revokedAt: now, isActive: false }
              : link
          )
        );
      }

      // Optimistically remove from active links
      if (previousActiveLinks) {
        queryClient.setQueryData<ShareLink[]>(
          templateSharingKeys.activeLinks(templateId),
          previousActiveLinks.filter((link) => link.id !== linkId)
        );
      }

      return { previousLinks, previousActiveLinks };
    },

    onError: (_err, { templateId }, context) => {
      // Rollback all caches to their previous state
      if (context?.previousLinks) {
        queryClient.setQueryData(
          templateSharingKeys.linksList(templateId),
          context.previousLinks
        );
      }
      if (context?.previousActiveLinks) {
        queryClient.setQueryData(
          templateSharingKeys.activeLinks(templateId),
          context.previousActiveLinks
        );
      }
    },

    onSettled: (_, _err, { templateId }) => {
      // Always invalidate to sync with server
      queryClient.invalidateQueries({
        queryKey: templateSharingKeys.linksList(templateId),
      });
      queryClient.invalidateQueries({
        queryKey: templateSharingKeys.activeLinks(templateId),
      });
      queryClient.invalidateQueries({
        queryKey: templateSharingKeys.linkCount(templateId),
      });
      queryClient.invalidateQueries({
        queryKey: templateSharingKeys.canCreateLink(templateId),
      });
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

// ============================================================================
// Shared With Me Hooks
// ============================================================================

/**
 * Hook to fetch templates shared with the current user
 */
export function useSharedWithMe(
  options?: Omit<
    UseQueryOptions<SharedTemplatesResponse, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: [...templateSharingKeys.all, 'sharedWithMe'] as const,
    queryFn: () => templateSharingApi.getSharedWithMe(),
    staleTime: STALE_TIMES.shares,
    ...options,
  });
}

/**
 * Hook to fetch count of templates shared with current user
 */
export function useSharedWithMeCount(
  options?: Omit<UseQueryOptions<number, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...templateSharingKeys.all, 'sharedWithMeCount'] as const,
    queryFn: () => templateSharingApi.getSharedWithMeCount(),
    staleTime: STALE_TIMES.shares,
    ...options,
  });
}

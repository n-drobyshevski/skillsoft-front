/**
 * Tests for useTemplateSharingQuery hooks
 *
 * Tests React Query hooks for template sharing and visibility:
 * - Query hooks (useTemplateVisibility, useTemplateShares, useShareLinks)
 * - Mutation hooks (useChangeVisibility, useShareWithUser, useCreateShareLink, etc.)
 * - Cache invalidation and optimistic updates
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderQueryHook, createTestQueryClient, clearQueryCache } from '../utils/query-client-wrapper';
import { addHandler, server } from '../mocks/server';
import {
  sharingHandlers,
  sharingErrorHandlers,
  resetSharingStores,
  createMockVisibilityInfo,
  createMockShare,
  createMockShareLink,
  seedShare,
  seedLink,
} from '../mocks/sharing-handlers';
import {
  useTemplateVisibility,
  useChangeVisibility,
  useTemplateShares,
  useShareWithUser,
  useShareWithTeam,
  useUpdateShare,
  useRevokeShare,
  useBulkShare,
  useShareLinks,
  useActiveShareLinks,
  useCanCreateLink,
  useLinkCount,
  useCreateShareLink,
  useRevokeShareLink,
  useRevokeAllLinks,
  useValidateShareLink,
  templateSharingKeys,
} from '@/hooks/queries';
import { TemplateVisibility, SharePermission, GranteeType } from '@/types/domain';

// Add sharing handlers before all tests in this file
beforeEach(() => {
  server.use(...sharingHandlers);
  resetSharingStores();
});

afterEach(() => {
  server.resetHandlers();
});

describe('templateSharingKeys', () => {
  it('generates correct visibility key', () => {
    const key = templateSharingKeys.visibility('template-1');
    expect(key).toEqual(['templateSharing', 'visibility', 'template-1']);
  });

  it('generates correct shares list key', () => {
    const key = templateSharingKeys.sharesList('template-1');
    expect(key).toEqual(['templateSharing', 'shares', 'template-1', 'list']);
  });

  it('generates correct links list key', () => {
    const key = templateSharingKeys.linksList('template-1');
    expect(key).toEqual(['templateSharing', 'links', 'template-1', 'list']);
  });

  it('generates correct link validation key', () => {
    const key = templateSharingKeys.linkValidation('abc123');
    expect(key).toEqual(['templateSharing', 'validate', 'abc123']);
  });
});

describe('useTemplateVisibility', () => {
  it('fetches visibility info for a template', async () => {
    const { result, queryClient } = renderQueryHook(() =>
      useTemplateVisibility('template-1')
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.templateId).toBe('template-1');
    expect(result.current.data?.visibility).toBe(TemplateVisibility.PRIVATE);

    clearQueryCache(queryClient);
  });

  it('does not fetch when templateId is empty', async () => {
    const { result, queryClient } = renderQueryHook(() =>
      useTemplateVisibility('')
    );

    // Should not be loading because query is disabled
    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');

    clearQueryCache(queryClient);
  });

  it('handles not found error', async () => {
    server.use(sharingErrorHandlers.visibilityNotFound);

    const { result, queryClient } = renderQueryHook(() =>
      useTemplateVisibility('non-existent')
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    clearQueryCache(queryClient);
  });
});

describe('useChangeVisibility', () => {
  it('changes visibility and updates cache', async () => {
    const queryClient = createTestQueryClient();

    // Pre-populate visibility cache
    queryClient.setQueryData(
      templateSharingKeys.visibility('template-1'),
      createMockVisibilityInfo('template-1', { visibility: TemplateVisibility.PRIVATE })
    );

    const { result } = renderQueryHook(() => useChangeVisibility(), {
      queryClient,
    });

    await result.current.mutateAsync({
      templateId: 'template-1',
      request: { visibility: TemplateVisibility.PUBLIC },
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Check cache was updated
    const cachedData = queryClient.getQueryData(
      templateSharingKeys.visibility('template-1')
    );
    expect(cachedData).toBeDefined();

    clearQueryCache(queryClient);
  });

  it('throws error for invalid visibility change', async () => {
    server.use(sharingErrorHandlers.changeVisibilityFailed);

    const queryClient = createTestQueryClient();
    const { result } = renderQueryHook(() => useChangeVisibility(), {
      queryClient,
    });

    await expect(
      result.current.mutateAsync({
        templateId: 'template-1',
        request: { visibility: TemplateVisibility.LINK },
      })
    ).rejects.toThrow();

    clearQueryCache(queryClient);
  });
});

describe('useTemplateShares', () => {
  it('fetches shares list for a template', async () => {
    const { result, queryClient } = renderQueryHook(() =>
      useTemplateShares('template-1')
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);

    clearQueryCache(queryClient);
  });

  it('does not fetch when templateId is empty', async () => {
    const { result, queryClient } = renderQueryHook(() =>
      useTemplateShares('')
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');

    clearQueryCache(queryClient);
  });
});

describe('useShareWithUser', () => {
  it('creates user share and updates cache', async () => {
    const queryClient = createTestQueryClient();

    // Pre-populate shares cache
    queryClient.setQueryData(
      templateSharingKeys.sharesList('template-1'),
      []
    );

    const { result } = renderQueryHook(() => useShareWithUser(), {
      queryClient,
    });

    await result.current.mutateAsync({
      templateId: 'template-1',
      request: {
        email: 'test@example.com',
        permission: SharePermission.VIEW,
      },
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Check cache was updated
    const cachedShares = queryClient.getQueryData(
      templateSharingKeys.sharesList('template-1')
    ) as unknown[];
    expect(cachedShares).toHaveLength(1);

    clearQueryCache(queryClient);
  });

  it('handles share creation error', async () => {
    server.use(sharingErrorHandlers.shareFailed);

    const queryClient = createTestQueryClient();
    const { result } = renderQueryHook(() => useShareWithUser(), {
      queryClient,
    });

    await expect(
      result.current.mutateAsync({
        templateId: 'template-1',
        request: {
          email: 'invalid@example.com',
          permission: SharePermission.VIEW,
        },
      })
    ).rejects.toThrow();

    clearQueryCache(queryClient);
  });
});

describe('useShareWithTeam', () => {
  it('creates team share and updates cache', async () => {
    const queryClient = createTestQueryClient();

    // Pre-populate shares cache
    queryClient.setQueryData(
      templateSharingKeys.sharesList('template-1'),
      []
    );

    const { result } = renderQueryHook(() => useShareWithTeam(), {
      queryClient,
    });

    await result.current.mutateAsync({
      templateId: 'template-1',
      request: {
        teamId: 'team-1',
        permission: SharePermission.EDIT,
      },
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Check cache was updated
    const cachedShares = queryClient.getQueryData(
      templateSharingKeys.sharesList('template-1')
    ) as unknown[];
    expect(cachedShares).toHaveLength(1);

    clearQueryCache(queryClient);
  });
});

describe('useUpdateShare', () => {
  it('updates share permission and cache', async () => {
    const queryClient = createTestQueryClient();
    const mockShare = createMockShare('share-1', GranteeType.USER, SharePermission.VIEW);

    // Pre-populate shares cache
    queryClient.setQueryData(
      templateSharingKeys.sharesList('template-1'),
      [mockShare]
    );

    // Also seed the mock state so the handler can find it
    seedShare('template-1', { id: 'share-1', permission: SharePermission.VIEW });

    const { result } = renderQueryHook(() => useUpdateShare(), {
      queryClient,
    });

    await result.current.mutateAsync({
      templateId: 'template-1',
      shareId: 'share-1',
      request: { permission: SharePermission.EDIT },
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Check cache was updated with new permission
    const cachedShares = queryClient.getQueryData(
      templateSharingKeys.sharesList('template-1')
    ) as Array<{ id: string; permission: SharePermission }>;
    const updatedShare = cachedShares.find((s) => s.id === 'share-1');
    expect(updatedShare?.permission).toBe(SharePermission.EDIT);

    clearQueryCache(queryClient);
  });
});

describe('useRevokeShare', () => {
  it('removes share from cache on revoke', async () => {
    const queryClient = createTestQueryClient();
    const mockShare = createMockShare('share-1', GranteeType.USER, SharePermission.VIEW);

    // Pre-populate shares cache
    queryClient.setQueryData(
      templateSharingKeys.sharesList('template-1'),
      [mockShare]
    );

    // Also seed the mock state so the handler can find it
    seedShare('template-1', { id: 'share-1', permission: SharePermission.VIEW });

    const { result } = renderQueryHook(() => useRevokeShare(), {
      queryClient,
    });

    await result.current.mutateAsync({
      templateId: 'template-1',
      shareId: 'share-1',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Check share was removed from cache
    const cachedShares = queryClient.getQueryData(
      templateSharingKeys.sharesList('template-1')
    ) as unknown[];
    expect(cachedShares).toHaveLength(0);

    clearQueryCache(queryClient);
  });
});

describe('useBulkShare', () => {
  it('adds multiple shares to cache', async () => {
    const queryClient = createTestQueryClient();

    // Pre-populate shares cache
    queryClient.setQueryData(
      templateSharingKeys.sharesList('template-1'),
      []
    );

    const { result } = renderQueryHook(() => useBulkShare(), {
      queryClient,
    });

    await result.current.mutateAsync({
      templateId: 'template-1',
      request: {
        userShares: [
          { email: 'user1@example.com', permission: SharePermission.VIEW },
          { email: 'user2@example.com', permission: SharePermission.EDIT },
        ],
        teamShares: [],
      },
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Check shares were added to cache
    const cachedShares = queryClient.getQueryData(
      templateSharingKeys.sharesList('template-1')
    ) as unknown[];
    expect(cachedShares.length).toBeGreaterThan(0);

    clearQueryCache(queryClient);
  });
});

describe('useShareLinks', () => {
  it('fetches all share links for a template', async () => {
    const { result, queryClient } = renderQueryHook(() =>
      useShareLinks('template-1')
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);

    clearQueryCache(queryClient);
  });
});

describe('useActiveShareLinks', () => {
  it('fetches only active share links', async () => {
    const { result, queryClient } = renderQueryHook(() =>
      useActiveShareLinks('template-1')
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
    // All returned links should not be revoked
    result.current.data?.forEach((link) => {
      expect(link.revokedAt).toBeNull();
    });

    clearQueryCache(queryClient);
  });
});

describe('useCanCreateLink', () => {
  it('returns true when under link limit', async () => {
    const { result, queryClient } = renderQueryHook(() =>
      useCanCreateLink('template-1')
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe(true);

    clearQueryCache(queryClient);
  });
});

describe('useLinkCount', () => {
  it('returns link count information', async () => {
    const { result, queryClient } = renderQueryHook(() =>
      useLinkCount('template-1')
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.activeCount).toBeDefined();
    expect(result.current.data?.maxLinks).toBe(10);

    clearQueryCache(queryClient);
  });
});

describe('useCreateShareLink', () => {
  it('creates link and updates cache', async () => {
    const queryClient = createTestQueryClient();

    // Pre-populate links cache
    queryClient.setQueryData(
      templateSharingKeys.linksList('template-1'),
      []
    );
    queryClient.setQueryData(
      templateSharingKeys.activeLinks('template-1'),
      []
    );

    const { result } = renderQueryHook(() => useCreateShareLink(), {
      queryClient,
    });

    await result.current.mutateAsync({
      templateId: 'template-1',
      request: {
        permission: SharePermission.VIEW,
        expiresInDays: 7,
        label: 'Test Link',
      },
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Check link was added to cache
    const cachedLinks = queryClient.getQueryData(
      templateSharingKeys.linksList('template-1')
    ) as unknown[];
    expect(cachedLinks).toHaveLength(1);

    const cachedActiveLinks = queryClient.getQueryData(
      templateSharingKeys.activeLinks('template-1')
    ) as unknown[];
    expect(cachedActiveLinks).toHaveLength(1);

    clearQueryCache(queryClient);
  });

  it('handles link limit reached error', async () => {
    server.use(sharingErrorHandlers.linkLimitReached);

    const queryClient = createTestQueryClient();
    const { result } = renderQueryHook(() => useCreateShareLink(), {
      queryClient,
    });

    await expect(
      result.current.mutateAsync({
        templateId: 'template-1',
        request: {
          permission: SharePermission.VIEW,
          expiresInDays: 7,
        },
      })
    ).rejects.toThrow();

    clearQueryCache(queryClient);
  });
});

describe('useRevokeShareLink', () => {
  it('marks link as revoked in cache', async () => {
    const queryClient = createTestQueryClient();
    const mockLink = createMockShareLink('link-1', SharePermission.VIEW);

    // Pre-populate links cache
    queryClient.setQueryData(
      templateSharingKeys.linksList('template-1'),
      [mockLink]
    );
    queryClient.setQueryData(
      templateSharingKeys.activeLinks('template-1'),
      [mockLink]
    );

    // Also seed the mock state so the handler can find it
    seedLink('template-1', { id: 'link-1', permission: SharePermission.VIEW });

    const { result } = renderQueryHook(() => useRevokeShareLink(), {
      queryClient,
    });

    await result.current.mutateAsync({
      templateId: 'template-1',
      linkId: 'link-1',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Check link was marked as revoked
    const cachedLinks = queryClient.getQueryData(
      templateSharingKeys.linksList('template-1')
    ) as Array<{ id: string; revokedAt: string | null }>;
    const revokedLink = cachedLinks.find((l) => l.id === 'link-1');
    expect(revokedLink?.revokedAt).toBeDefined();

    // Check link was removed from active links
    const cachedActiveLinks = queryClient.getQueryData(
      templateSharingKeys.activeLinks('template-1')
    ) as unknown[];
    expect(cachedActiveLinks).toHaveLength(0);

    clearQueryCache(queryClient);
  });
});

describe('useRevokeAllLinks', () => {
  it('clears all active links from cache', async () => {
    const queryClient = createTestQueryClient();
    const mockLinks = [
      createMockShareLink('link-1', SharePermission.VIEW),
      createMockShareLink('link-2', SharePermission.EDIT),
    ];

    // Pre-populate links cache
    queryClient.setQueryData(
      templateSharingKeys.activeLinks('template-1'),
      mockLinks
    );

    const { result } = renderQueryHook(() => useRevokeAllLinks(), {
      queryClient,
    });

    await result.current.mutateAsync('template-1');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Check active links cache was cleared
    const cachedActiveLinks = queryClient.getQueryData(
      templateSharingKeys.activeLinks('template-1')
    ) as unknown[];
    expect(cachedActiveLinks).toHaveLength(0);

    clearQueryCache(queryClient);
  });
});

describe('useValidateShareLink', () => {
  it('validates a valid share link token', async () => {
    const { result, queryClient } = renderQueryHook(() =>
      useValidateShareLink('valid-token-123')
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.valid).toBe(true);
    expect(result.current.data?.templateId).toBeDefined();
    expect(result.current.data?.permission).toBeDefined();

    clearQueryCache(queryClient);
  });

  it('returns invalid for expired token', async () => {
    server.use(sharingErrorHandlers.linkExpired);

    const { result, queryClient } = renderQueryHook(() =>
      useValidateShareLink('expired-token')
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.valid).toBe(false);
    expect(result.current.data?.reason).toBe('EXPIRED');

    clearQueryCache(queryClient);
  });

  it('returns invalid for revoked token', async () => {
    server.use(sharingErrorHandlers.linkRevoked);

    const { result, queryClient } = renderQueryHook(() =>
      useValidateShareLink('revoked-token')
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.valid).toBe(false);
    expect(result.current.data?.reason).toBe('REVOKED');

    clearQueryCache(queryClient);
  });

  it('does not fetch when token is null', async () => {
    const { result, queryClient } = renderQueryHook(() =>
      useValidateShareLink(null)
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');

    clearQueryCache(queryClient);
  });
});

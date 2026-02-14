/**
 * MSW Handlers for Template Sharing API
 *
 * Provides mock handlers for:
 * - Visibility management
 * - User/Team shares
 * - Share links
 */
import { http, HttpResponse, delay } from 'msw';
import {
  TemplateVisibility,
  SharePermission,
  GranteeType,
  type VisibilityInfo,
  type TemplateShare,
  type ShareLink,
  type LinkValidationResult,
  type BulkShareResponse,
} from '@/types/domain';

const API_BASE = 'http://localhost:8080/api/v1/tests/templates';

// ============================================
// MOCK DATA STORES (mutable for tests)
// ============================================

export interface SharingMockState {
  visibility: Record<string, VisibilityInfo>;
  shares: Record<string, TemplateShare[]>;
  links: Record<string, ShareLink[]>;
}

export const sharingMockState: SharingMockState = {
  visibility: {},
  shares: {},
  links: {},
};

// ============================================
// MOCK DATA FACTORIES
// ============================================

export function createMockVisibilityInfo(
  templateId: string,
  overrides: Partial<VisibilityInfo> = {}
): VisibilityInfo {
  return {
    templateId,
    visibility: TemplateVisibility.PRIVATE,
    visibilityChangedAt: new Date().toISOString(),
    ownerId: 'owner-1',
    ownerName: 'Test Owner',
    activeSharesCount: 0,
    activeLinksCount: 0,
    ...overrides,
  };
}

/**
 * Create a mock share
 * @param idOrTemplateId - Share ID when called with 3 args, or templateId when called with 2 args
 * @param typeOrOverrides - GranteeType when called with 3 args, or overrides when called with 2 args
 * @param permission - Permission when called with 3 args
 */
export function createMockShare(
  idOrTemplateId: string,
  typeOrOverrides?: GranteeType | Partial<TemplateShare>,
  permission?: SharePermission
): TemplateShare {
  // Handle 3-argument signature: (id, granteeType, permission)
  if (typeof typeOrOverrides === 'string') {
    const id = idOrTemplateId;
    const granteeType = typeOrOverrides as GranteeType;
    return {
      id,
      templateId: 'template-1',
      granteeType,
      granteeId: granteeType === GranteeType.USER ? 'user-1' : 'team-1',
      granteeName: granteeType === GranteeType.USER ? 'John Doe' : 'Test Team',
      granteeEmail: granteeType === GranteeType.USER ? 'john@example.com' : undefined,
      permission: permission ?? SharePermission.VIEW,
      grantedById: 'owner-1',
      grantedByName: 'Test Owner',
      grantedAt: new Date().toISOString(),
      isActive: true,
    };
  }

  // Handle 2-argument signature: (templateId, overrides)
  const templateId = idOrTemplateId;
  const overrides = (typeOrOverrides as Partial<TemplateShare>) ?? {};
  const id = overrides.id ?? `share-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return {
    id,
    templateId,
    granteeType: GranteeType.USER,
    granteeId: 'user-1',
    granteeName: 'John Doe',
    granteeEmail: 'john@example.com',
    permission: SharePermission.VIEW,
    grantedById: 'owner-1',
    grantedByName: 'Test Owner',
    grantedAt: new Date().toISOString(),
    isActive: true,
    ...overrides,
  };
}

/**
 * Create a mock share link
 * @param idOrTemplateId - Link ID when called with 2 args (id, permission), or templateId when called with overrides
 * @param permissionOrOverrides - Permission when called with 2 args, or overrides when called with templateId
 */
export function createMockShareLink(
  idOrTemplateId: string,
  permissionOrOverrides?: SharePermission | Partial<ShareLink>
): ShareLink {
  // Handle 2-argument signature: (id, permission)
  if (typeof permissionOrOverrides === 'string' && Object.values(SharePermission).includes(permissionOrOverrides as SharePermission)) {
    const id = idOrTemplateId;
    const permission = permissionOrOverrides as SharePermission;
    return {
      id,
      templateId: 'template-1',
      token: `token-${id}`,
      tokenMasked: false,
      permission,
      label: 'Test Link',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      usageCount: 0,
      createdById: 'owner-1',
      createdByName: 'Test Owner',
      createdAt: new Date().toISOString(),
      isActive: true,
    };
  }

  // Handle templateId + overrides signature
  const templateId = idOrTemplateId;
  const overrides = (permissionOrOverrides as Partial<ShareLink>) ?? {};
  const id = overrides.id ?? `link-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const token = overrides.token ?? `token-${id}`;
  return {
    id,
    templateId,
    token,
    tokenMasked: false,
    permission: SharePermission.VIEW,
    label: 'Test Link',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    usageCount: 0,
    createdById: 'owner-1',
    createdByName: 'Test Owner',
    createdAt: new Date().toISOString(),
    isActive: true,
    ...overrides,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function resetSharingMockState() {
  sharingMockState.visibility = {};
  sharingMockState.shares = {};
  sharingMockState.links = {};
}

// Alias for backward compatibility
export const resetSharingStores = resetSharingMockState;

export function seedVisibility(templateId: string, info: Partial<VisibilityInfo> = {}) {
  sharingMockState.visibility[templateId] = createMockVisibilityInfo(templateId, info);
}

export function seedShare(templateId: string, share: Partial<TemplateShare> = {}) {
  if (!sharingMockState.shares[templateId]) {
    sharingMockState.shares[templateId] = [];
  }
  sharingMockState.shares[templateId].push(createMockShare(templateId, share));
}

export function seedLink(templateId: string, link: Partial<ShareLink> = {}) {
  if (!sharingMockState.links[templateId]) {
    sharingMockState.links[templateId] = [];
  }
  sharingMockState.links[templateId].push(createMockShareLink(templateId, link));
}

// ============================================
// MSW HANDLERS
// ============================================

export const sharingHandlers = [
  // ==================== VISIBILITY ====================

  // GET /templates/{id}/visibility
  http.get(`${API_BASE}/:templateId/visibility`, async ({ params }) => {
    await delay(50);
    const { templateId } = params as { templateId: string };

    const info = sharingMockState.visibility[templateId];
    if (!info) {
      // Return default visibility if not seeded
      return HttpResponse.json(createMockVisibilityInfo(templateId));
    }

    return HttpResponse.json(info);
  }),

  // PATCH /templates/{id}/visibility
  http.patch(`${API_BASE}/:templateId/visibility`, async ({ params, request }) => {
    await delay(50);
    const { templateId } = params as { templateId: string };
    const body = await request.json() as { visibility: TemplateVisibility };

    const existing = sharingMockState.visibility[templateId] ?? createMockVisibilityInfo(templateId);
    const updated: VisibilityInfo = {
      ...existing,
      visibility: body.visibility,
      visibilityChangedAt: new Date().toISOString(),
    };

    // If changing away from LINK, reset link count
    if (existing.visibility === TemplateVisibility.LINK && body.visibility !== TemplateVisibility.LINK) {
      updated.activeLinksCount = 0;
      // Revoke all links
      if (sharingMockState.links[templateId]) {
        sharingMockState.links[templateId] = sharingMockState.links[templateId].map(link => ({
          ...link,
          isActive: false,
          revokedAt: new Date().toISOString(),
        }));
      }
    }

    sharingMockState.visibility[templateId] = updated;
    return HttpResponse.json(updated);
  }),

  // GET /templates/{id}/visibility/can-change
  http.get(`${API_BASE}/:templateId/visibility/can-change`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const visibility = url.searchParams.get('visibility');
    // For tests, always return true unless explicitly set otherwise
    return HttpResponse.json(true);
  }),

  // ==================== SHARES ====================

  // GET /templates/{id}/shares
  http.get(`${API_BASE}/:templateId/shares`, async ({ params }) => {
    await delay(50);
    const { templateId } = params as { templateId: string };
    const shares = sharingMockState.shares[templateId] ?? [];
    return HttpResponse.json(shares.filter(s => s.isActive));
  }),

  // POST /templates/{id}/shares/users
  http.post(`${API_BASE}/:templateId/shares/users`, async ({ params, request }) => {
    await delay(50);
    const { templateId } = params as { templateId: string };
    const body = await request.json() as { userId?: string; email?: string; permission: SharePermission };

    const newShare = createMockShare(templateId, {
      granteeId: body.userId ?? 'user-new',
      granteeEmail: body.email,
      permission: body.permission,
    });

    if (!sharingMockState.shares[templateId]) {
      sharingMockState.shares[templateId] = [];
    }
    sharingMockState.shares[templateId].push(newShare);

    // Update visibility counts
    if (sharingMockState.visibility[templateId]) {
      sharingMockState.visibility[templateId].activeSharesCount++;
    }

    return HttpResponse.json(newShare, { status: 201 });
  }),

  // POST /templates/{id}/shares/teams
  http.post(`${API_BASE}/:templateId/shares/teams`, async ({ params, request }) => {
    await delay(50);
    const { templateId } = params as { templateId: string };
    const body = await request.json() as { teamId: string; permission: SharePermission };

    const newShare = createMockShare(templateId, {
      granteeType: GranteeType.TEAM,
      granteeId: body.teamId,
      granteeName: 'Test Team',
      permission: body.permission,
    });

    if (!sharingMockState.shares[templateId]) {
      sharingMockState.shares[templateId] = [];
    }
    sharingMockState.shares[templateId].push(newShare);

    return HttpResponse.json(newShare, { status: 201 });
  }),

  // PUT /templates/{id}/shares/{shareId}
  http.put(`${API_BASE}/:templateId/shares/:shareId`, async ({ params, request }) => {
    await delay(50);
    const { templateId, shareId } = params as { templateId: string; shareId: string };
    const body = await request.json() as { permission: SharePermission };

    const shares = sharingMockState.shares[templateId] ?? [];
    const shareIndex = shares.findIndex(s => s.id === shareId);

    if (shareIndex === -1) {
      return HttpResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    shares[shareIndex] = { ...shares[shareIndex], permission: body.permission };
    return HttpResponse.json(shares[shareIndex]);
  }),

  // DELETE /templates/{id}/shares/{shareId}
  http.delete(`${API_BASE}/:templateId/shares/:shareId`, async ({ params }) => {
    await delay(50);
    const { templateId, shareId } = params as { templateId: string; shareId: string };

    const shares = sharingMockState.shares[templateId] ?? [];
    const shareIndex = shares.findIndex(s => s.id === shareId);

    if (shareIndex === -1) {
      return HttpResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    shares[shareIndex] = {
      ...shares[shareIndex],
      isActive: false,
      revokedAt: new Date().toISOString(),
    };

    // Update visibility counts
    if (sharingMockState.visibility[templateId]) {
      sharingMockState.visibility[templateId].activeSharesCount--;
    }

    return new HttpResponse(null, { status: 204 });
  }),

  // POST /templates/{id}/shares/bulk
  http.post(`${API_BASE}/:templateId/shares/bulk`, async ({ params, request }) => {
    await delay(50);
    const { templateId } = params as { templateId: string };
    const body = await request.json() as { userShares: Array<{ userId?: string; email?: string; permission: SharePermission }>; teamShares: Array<{ teamId: string; permission: SharePermission }> };

    const created: TemplateShare[] = [];

    for (const userShare of body.userShares ?? []) {
      const share = createMockShare(templateId, {
        granteeId: userShare.userId ?? 'user-bulk',
        granteeEmail: userShare.email,
        permission: userShare.permission,
      });
      created.push(share);
    }

    for (const teamShare of body.teamShares ?? []) {
      const share = createMockShare(templateId, {
        granteeType: GranteeType.TEAM,
        granteeId: teamShare.teamId,
        granteeName: 'Bulk Team',
        permission: teamShare.permission,
      });
      created.push(share);
    }

    if (!sharingMockState.shares[templateId]) {
      sharingMockState.shares[templateId] = [];
    }
    sharingMockState.shares[templateId].push(...created);

    const response: BulkShareResponse = {
      createdCount: created.length,
      updatedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      created,
      updated: [],
      errors: {},
    };

    return HttpResponse.json(response);
  }),

  // ==================== LINKS ====================

  // GET /templates/{id}/links
  http.get(`${API_BASE}/:templateId/links`, async ({ params }) => {
    await delay(50);
    const { templateId } = params as { templateId: string };
    const links = sharingMockState.links[templateId] ?? [];
    return HttpResponse.json(links);
  }),

  // GET /templates/{id}/links/active
  http.get(`${API_BASE}/:templateId/links/active`, async ({ params }) => {
    await delay(50);
    const { templateId } = params as { templateId: string };
    const links = sharingMockState.links[templateId] ?? [];
    return HttpResponse.json(links.filter(l => l.isActive && !l.revokedAt));
  }),

  // GET /templates/{id}/links/can-create
  http.get(`${API_BASE}/:templateId/links/can-create`, async ({ params }) => {
    await delay(50);
    const { templateId } = params as { templateId: string };
    const links = sharingMockState.links[templateId] ?? [];
    const activeCount = links.filter(l => l.isActive && !l.revokedAt).length;
    return HttpResponse.json(activeCount < 10);
  }),

  // GET /templates/{id}/links/count
  http.get(`${API_BASE}/:templateId/links/count`, async ({ params }) => {
    await delay(50);
    const { templateId } = params as { templateId: string };
    const links = sharingMockState.links[templateId] ?? [];
    const activeCount = links.filter(l => l.isActive && !l.revokedAt).length;
    return HttpResponse.json({ activeCount, maxLinks: 10 });
  }),

  // POST /templates/{id}/links
  http.post(`${API_BASE}/:templateId/links`, async ({ params, request }) => {
    await delay(50);
    const { templateId } = params as { templateId: string };
    const body = await request.json() as { permission: SharePermission; expiresInDays: number; maxUses?: number; label?: string };

    const links = sharingMockState.links[templateId] ?? [];
    const activeCount = links.filter(l => l.isActive && !l.revokedAt).length;

    if (activeCount >= 10) {
      return HttpResponse.json({ error: 'Maximum link limit reached' }, { status: 409 });
    }

    const newLink = createMockShareLink(templateId, {
      permission: body.permission,
      expiresAt: new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000).toISOString(),
      maxUses: body.maxUses,
      label: body.label,
    });

    if (!sharingMockState.links[templateId]) {
      sharingMockState.links[templateId] = [];
    }
    sharingMockState.links[templateId].push(newLink);

    // Update visibility counts
    if (sharingMockState.visibility[templateId]) {
      sharingMockState.visibility[templateId].activeLinksCount++;
    }

    return HttpResponse.json(newLink, { status: 201 });
  }),

  // DELETE /templates/{id}/links/{linkId}
  http.delete(`${API_BASE}/:templateId/links/:linkId`, async ({ params }) => {
    await delay(50);
    const { templateId, linkId } = params as { templateId: string; linkId: string };

    const links = sharingMockState.links[templateId] ?? [];
    const linkIndex = links.findIndex(l => l.id === linkId);

    if (linkIndex === -1) {
      return HttpResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    links[linkIndex] = {
      ...links[linkIndex],
      isActive: false,
      revokedAt: new Date().toISOString(),
    };

    // Update visibility counts
    if (sharingMockState.visibility[templateId]) {
      sharingMockState.visibility[templateId].activeLinksCount--;
    }

    return new HttpResponse(null, { status: 204 });
  }),

  // DELETE /templates/{id}/links (revoke all)
  http.delete(`${API_BASE}/:templateId/links`, async ({ params }) => {
    await delay(50);
    const { templateId } = params as { templateId: string };

    const links = sharingMockState.links[templateId] ?? [];
    let revokedCount = 0;

    for (let i = 0; i < links.length; i++) {
      if (links[i].isActive && !links[i].revokedAt) {
        links[i] = {
          ...links[i],
          isActive: false,
          revokedAt: new Date().toISOString(),
        };
        revokedCount++;
      }
    }

    // Update visibility counts
    if (sharingMockState.visibility[templateId]) {
      sharingMockState.visibility[templateId].activeLinksCount = 0;
    }

    return HttpResponse.json(revokedCount);
  }),

  // ==================== PUBLIC ENDPOINTS ====================

  // GET /templates/validate-link (public)
  http.get(`${API_BASE}/validate-link`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return HttpResponse.json({
        valid: false,
        reason: 'MISSING_TOKEN',
      } satisfies LinkValidationResult);
    }

    // For testing: tokens starting with "valid-" return a valid response
    if (token.startsWith('valid-')) {
      return HttpResponse.json({
        valid: true,
        templateId: 'template-1',
        templateName: 'Test Template',
        permission: SharePermission.VIEW,
      } satisfies LinkValidationResult);
    }

    // Find the link by token across all templates
    for (const templateId of Object.keys(sharingMockState.links)) {
      const links = sharingMockState.links[templateId];
      const link = links.find(l => l.token === token);

      if (link) {
        if (!link.isActive || link.revokedAt) {
          return HttpResponse.json({
            valid: false,
            reason: 'REVOKED',
          } satisfies LinkValidationResult);
        }

        if (new Date(link.expiresAt) < new Date()) {
          return HttpResponse.json({
            valid: false,
            reason: 'EXPIRED',
          } satisfies LinkValidationResult);
        }

        if (link.maxUses && link.usageCount >= link.maxUses) {
          return HttpResponse.json({
            valid: false,
            reason: 'MAX_USES_REACHED',
          } satisfies LinkValidationResult);
        }

        return HttpResponse.json({
          valid: true,
          templateId,
          templateName: 'Test Template',
          permission: link.permission,
        } satisfies LinkValidationResult);
      }
    }

    return HttpResponse.json({
      valid: false,
      reason: 'NOT_FOUND',
    } satisfies LinkValidationResult);
  }),
];

// ============================================
// ERROR HANDLERS (for testing error states)
// ============================================

export const sharingErrorHandlers = {
  visibilityNotFound: http.get(`${API_BASE}/:templateId/visibility`, () => {
    return HttpResponse.json({ error: 'Template not found' }, { status: 404 });
  }),

  visibilityChangeFailed: http.patch(`${API_BASE}/:templateId/visibility`, () => {
    return HttpResponse.json({ error: 'Cannot change visibility' }, { status: 400 });
  }),

  changeVisibilityFailed: http.patch(`${API_BASE}/:templateId/visibility`, () => {
    return HttpResponse.json({ error: 'Cannot change visibility' }, { status: 400 });
  }),

  shareFailed: http.post(`${API_BASE}/:templateId/shares/users`, () => {
    return HttpResponse.json({ error: 'User not found' }, { status: 404 });
  }),

  linkLimitReached: http.post(`${API_BASE}/:templateId/links`, () => {
    return HttpResponse.json({ error: 'Maximum link limit reached' }, { status: 409 });
  }),

  linkExpired: http.get(`${API_BASE}/validate-link`, () => {
    return HttpResponse.json({
      valid: false,
      reason: 'EXPIRED',
    } satisfies LinkValidationResult);
  }),

  linkRevoked: http.get(`${API_BASE}/validate-link`, () => {
    return HttpResponse.json({
      valid: false,
      reason: 'REVOKED',
    } satisfies LinkValidationResult);
  }),

  linkNotFound: http.get(`${API_BASE}/validate-link`, () => {
    return HttpResponse.json({
      valid: false,
      reason: 'NOT_FOUND',
    } satisfies LinkValidationResult);
  }),

  serverError: http.get(`${API_BASE}/:templateId/*`, () => {
    return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
  }),
};

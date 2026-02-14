import { getAuthHeaders } from '../roleApi';
import { fetchApi, log } from './core';

import type {
  VisibilityInfo,
  ChangeVisibilityRequest,
  TemplateShare,
  ShareUserRequest,
  ShareTeamRequest,
  UpdateShareRequest,
  BulkShareRequest,
  BulkShareResponse,
  ShareLink,
  CreateShareLinkRequest,
  LinkValidationResult,
  LinkCountInfo,
  TemplateVisibility,
  SharePermission,
  SharedTemplatesResponse,
} from '@/types/domain';

const TEMPLATES_BASE = '/tests/templates';

/**
 * Template visibility and sharing API.
 * Provides functions for managing template access control.
 */
export const templateSharingApi = {
  // ==================== VISIBILITY ====================

  /**
   * Get visibility information for a template.
   */
  getVisibility: async (templateId: string): Promise<VisibilityInfo> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/visibility`, {
      tags: [`visibility-${templateId}`],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * Change template visibility setting.
   */
  changeVisibility: async (
    templateId: string,
    request: ChangeVisibilityRequest
  ): Promise<VisibilityInfo> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify(request),
      authHeaders,
    });
  },

  /**
   * Check if visibility can be changed to a specific value.
   */
  canChangeVisibility: async (
    templateId: string,
    visibility: TemplateVisibility
  ): Promise<boolean> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(
      `${TEMPLATES_BASE}/${templateId}/visibility/can-change?visibility=${visibility}`,
      { authHeaders }
    );
  },

  // ==================== USER/TEAM SHARES ====================

  /**
   * List all shares for a template.
   */
  listShares: async (templateId: string): Promise<TemplateShare[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/shares`, {
      tags: [`shares-${templateId}`],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * List only user shares for a template.
   */
  listUserShares: async (templateId: string): Promise<TemplateShare[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/shares/users`, {
      tags: [`shares-users-${templateId}`],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * List only team shares for a template.
   */
  listTeamShares: async (templateId: string): Promise<TemplateShare[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/shares/teams`, {
      tags: [`shares-teams-${templateId}`],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * Share template with a user.
   */
  shareWithUser: async (
    templateId: string,
    request: ShareUserRequest
  ): Promise<TemplateShare> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/shares/users`, {
      method: 'POST',
      body: JSON.stringify(request),
      authHeaders,
    });
  },

  /**
   * Share template with a team.
   */
  shareWithTeam: async (
    templateId: string,
    request: ShareTeamRequest
  ): Promise<TemplateShare> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/shares/teams`, {
      method: 'POST',
      body: JSON.stringify(request),
      authHeaders,
    });
  },

  /**
   * Bulk share with multiple users and teams.
   */
  bulkShare: async (
    templateId: string,
    request: BulkShareRequest
  ): Promise<BulkShareResponse> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/shares/bulk`, {
      method: 'POST',
      body: JSON.stringify(request),
      authHeaders,
    });
  },

  /**
   * Update an existing share.
   */
  updateShare: async (
    templateId: string,
    shareId: string,
    request: UpdateShareRequest
  ): Promise<TemplateShare> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/shares/${shareId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
      authHeaders,
    });
  },

  /**
   * Revoke a share.
   */
  revokeShare: async (templateId: string, shareId: string): Promise<void> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/shares/${shareId}`, {
      method: 'DELETE',
      authHeaders,
    });
  },

  /**
   * Check if current user can grant a specific permission.
   */
  canGrantPermission: async (
    templateId: string,
    permission: SharePermission
  ): Promise<boolean> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(
      `${TEMPLATES_BASE}/${templateId}/shares/can-grant?permission=${permission}`,
      { authHeaders }
    );
  },

  /**
   * Get count of active shares.
   */
  countShares: async (templateId: string): Promise<number> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/shares/count`, {
      authHeaders,
    });
  },

  // ==================== SHARE LINKS ====================

  /**
   * Validate a share link token (PUBLIC - no auth required).
   */
  validateLink: async (token: string): Promise<LinkValidationResult> => {
    // No auth headers - this is a public endpoint
    return fetchApi(`${TEMPLATES_BASE}/validate-link?token=${encodeURIComponent(token)}`, {
      cache: 'no-store', // Always validate fresh
    });
  },

  /**
   * List all links for a template.
   */
  listLinks: async (templateId: string): Promise<ShareLink[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/links`, {
      tags: [`links-${templateId}`],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * List only active links for a template.
   */
  listActiveLinks: async (templateId: string): Promise<ShareLink[]> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/links/active`, {
      tags: [`links-active-${templateId}`],
      revalidate: 60,
      authHeaders,
    });
  },

  /**
   * Create a new share link.
   */
  createLink: async (
    templateId: string,
    request: CreateShareLinkRequest
  ): Promise<ShareLink> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/links`, {
      method: 'POST',
      body: JSON.stringify(request),
      authHeaders,
    });
  },

  /**
   * Revoke a share link.
   */
  revokeLink: async (templateId: string, linkId: string): Promise<void> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/links/${linkId}`, {
      method: 'DELETE',
      authHeaders,
    });
  },

  /**
   * Revoke all share links for a template.
   */
  revokeAllLinks: async (templateId: string): Promise<number> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/links`, {
      method: 'DELETE',
      authHeaders,
    });
  },

  /**
   * Check if a new link can be created.
   */
  canCreateLink: async (templateId: string): Promise<boolean> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/links/can-create`, {
      authHeaders,
    });
  },

  /**
   * Get link count information.
   */
  getLinkCount: async (templateId: string): Promise<LinkCountInfo> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${TEMPLATES_BASE}/${templateId}/links/count`, {
      authHeaders,
    });
  },

  // ==================== SHARED WITH ME ====================

  /**
   * Get templates shared with the current user.
   * Returns templates where the user has been granted access via shares.
   *
   * NOTE: Backend endpoint pending implementation.
   * Required endpoint: GET /api/v1/tests/templates/shared-with-me
   * Should return: { items: SharedTemplateItem[], total: number }
   */
  getSharedWithMe: async (): Promise<SharedTemplatesResponse> => {
    try {
      const authHeaders = await getAuthHeaders();
      return await fetchApi(`${TEMPLATES_BASE}/shared-with-me`, {
        tags: ['shared-templates'],
        revalidate: 60,
        authHeaders,
      });
    } catch {
      // Graceful fallback if endpoint not yet implemented
      // Log warning but return empty result to keep UI functional
      log.warn('getSharedWithMe endpoint not available, returning empty result');
      return { items: [], total: 0 };
    }
  },

  /**
   * Get count of templates shared with the current user.
   *
   * NOTE: Backend endpoint pending implementation.
   * Required endpoint: GET /api/v1/tests/templates/shared-with-me/count
   */
  getSharedWithMeCount: async (): Promise<number> => {
    try {
      const authHeaders = await getAuthHeaders();
      return await fetchApi(`${TEMPLATES_BASE}/shared-with-me/count`, {
        authHeaders,
      });
    } catch {
      // Graceful fallback if endpoint not yet implemented
      return 0;
    }
  },
};

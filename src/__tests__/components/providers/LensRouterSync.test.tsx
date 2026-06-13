/**
 * Tests for LensRouterSync
 *
 * When the active lens changes, Server Components must re-render so they pick
 * up the new SKILLSOFT_ACTIVE_LENS cookie. The naive approach — always
 * router.refresh() — breaks when the user is sitting on a route that the new
 * (downgraded) lens cannot access: the in-place re-render fetches that route's
 * data with the lens-downgraded X-Effective-Role and the backend returns 403
 * (e.g. switching admin -> user while on /admin/teams/[id]).
 *
 * LensRouterSync must instead navigate to a safe route when the current path is
 * not visible in the newly-selected lens, and only refresh in place when it is.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { UserRole } from '@/types/user';
import { useLensStore } from '@/store/lens-store';

/** An admin-only route, absent from the user lens's visibleRoutes. */
const ADMIN_ONLY_ROUTE = '/admin/teams/03c014d8-7a18-4f1e-af24-d196dceb271c';

const mockRefresh = vi.fn();
const mockReplace = vi.fn();
let mockPathname = ADMIN_ONLY_ROUTE;

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh, replace: mockReplace, push: vi.fn() }),
  usePathname: () => mockPathname,
}));

import { LensRouterSync } from '@/components/providers/LensRouterSync';

beforeEach(() => {
  mockRefresh.mockClear();
  mockReplace.mockClear();
  mockPathname = ADMIN_ONLY_ROUTE;
  // Admin user currently viewing through the admin lens.
  useLensStore.setState({
    activeLens: 'admin',
    userRole: UserRole.ADMIN,
    isInitialized: true,
    isHydrated: true,
  });
});

describe('LensRouterSync route reconciliation on lens change', () => {
  it('redirects to a safe route when the current route is not visible in the new lens', () => {
    // Admin sitting on an admin-only page, then drops to the personal (user) lens.
    mockPathname = ADMIN_ONLY_ROUTE;

    render(<LensRouterSync />);

    act(() => {
      useLensStore.getState().setLens('user');
    });

    expect(mockReplace).toHaveBeenCalledWith('/dashboard');
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('refreshes in place when the current route remains visible in the new lens', () => {
    // /test-templates is visible in the user lens, so an in-place refresh is safe.
    mockPathname = '/test-templates';

    render(<LensRouterSync />);

    act(() => {
      useLensStore.getState().setLens('user');
    });

    expect(mockRefresh).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('does nothing on the initial subscription fire (no lens change yet)', () => {
    mockPathname = ADMIN_ONLY_ROUTE;

    render(<LensRouterSync />);

    expect(mockRefresh).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});

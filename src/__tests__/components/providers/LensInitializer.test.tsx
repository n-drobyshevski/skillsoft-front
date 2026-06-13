/**
 * Tests for LensInitializer
 *
 * Focus: the lens cookie (server source of truth) and localStorage (client
 * source of truth) can diverge on the first render after login. The server
 * renders the dashboard from the cookie; if it was cleared on sign-out, the
 * server falls back to the role default while the client restores the persisted
 * lens. LensInitializer must force exactly one router.refresh() in that case so
 * the server components re-render with the correct lens — and must NOT refresh
 * when cookie and persisted lens already agree.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { UserRole } from '@/types/user';
import { LENS_COOKIE_NAME, useLensStore } from '@/store/lens-store';

const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: mockRefresh }),
}));

// Clerk: signed-in ADMIN user, loaded.
const mockUseUser = vi.fn();
vi.mock('@clerk/nextjs', () => ({
  useUser: () => mockUseUser(),
}));

import { LensInitializer } from '@/components/providers/LensInitializer';

function setLensCookie(value: string | null) {
  if (value === null) {
    document.cookie = `${LENS_COOKIE_NAME}=; path=/; max-age=0`;
  } else {
    document.cookie = `${LENS_COOKIE_NAME}=${value}; path=/`;
  }
}

beforeEach(() => {
  mockRefresh.mockClear();
  localStorage.clear();
  setLensCookie(null);
  mockUseUser.mockReturnValue({
    isLoaded: true,
    user: { id: 'user_admin', publicMetadata: { role: 'ADMIN' } },
  });
  // Fresh store: hydrated (persist done), not yet initialized.
  useLensStore.setState({
    activeLens: 'user',
    userRole: UserRole.USER,
    isInitialized: false,
    isHydrated: true,
  });
});

afterEach(() => {
  setLensCookie(null);
});

describe('LensInitializer cookie/lens reconciliation', () => {
  it('refreshes the router when the server lens cookie diverges from the persisted lens', async () => {
    // Persisted client state: admin restored the "user" lens before sign-out.
    // localStorage key present => hasStoredLens; store hydrated to "user".
    localStorage.setItem('skillsoft-lens-store', JSON.stringify({ state: { activeLens: 'user' }, version: 0 }));
    useLensStore.setState({ activeLens: 'user' });
    // Server rendered with NO cookie (cleared on sign-out) -> role-default view.
    setLensCookie(null);

    render(<LensInitializer />);

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it('does NOT refresh when the server cookie already matches the persisted lens', async () => {
    localStorage.setItem('skillsoft-lens-store', JSON.stringify({ state: { activeLens: 'editor' }, version: 0 }));
    useLensStore.setState({ activeLens: 'editor' });
    // Server already rendered with the matching cookie -> no reconciliation needed.
    setLensCookie('editor');

    render(<LensInitializer />);

    // Give the effect a chance to run.
    await waitFor(() => {
      expect(useLensStore.getState().isInitialized).toBe(true);
    });
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});

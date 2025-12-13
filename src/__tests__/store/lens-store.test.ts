/**
 * Tests for lens-store Zustand store
 * Tests state mutations, persistence, and role-based lens management
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useLensStore, lensHelpers, type LensType } from '@/store/lens-store';
import { UserRole } from '@/types/user';

// Reset store before each test
beforeEach(() => {
  act(() => {
    useLensStore.setState({
      activeLens: 'user',
      userRole: UserRole.USER,
      isInitialized: false,
      isHydrated: false,
    });
  });
});

describe('LensStore', () => {
  describe('Initial State', () => {
    it('should have default values', () => {
      const state = useLensStore.getState();

      expect(state.activeLens).toBe('user');
      expect(state.userRole).toBe(UserRole.USER);
      expect(state.isInitialized).toBe(false);
      expect(state.isHydrated).toBe(false);
    });
  });

  describe('setLens', () => {
    it('should update lens for valid lens based on role', () => {
      // Setup as admin
      useLensStore.setState({
        userRole: UserRole.ADMIN,
        isInitialized: true,
      });

      act(() => {
        useLensStore.getState().setLens('admin');
      });

      expect(useLensStore.getState().activeLens).toBe('admin');
    });

    it('should not update lens for invalid lens based on role', () => {
      // Setup as user (can only have 'user' lens)
      useLensStore.setState({
        userRole: UserRole.USER,
        isInitialized: true,
      });

      act(() => {
        useLensStore.getState().setLens('admin');
      });

      expect(useLensStore.getState().activeLens).toBe('user'); // Unchanged
    });

    it('should allow editor to switch between user and editor lenses', () => {
      useLensStore.setState({
        userRole: UserRole.EDITOR,
        isInitialized: true,
      });

      act(() => {
        useLensStore.getState().setLens('editor');
      });
      expect(useLensStore.getState().activeLens).toBe('editor');

      act(() => {
        useLensStore.getState().setLens('user');
      });
      expect(useLensStore.getState().activeLens).toBe('user');
    });

    it('should not update if lens is the same', () => {
      useLensStore.setState({
        activeLens: 'user',
        userRole: UserRole.USER,
        isInitialized: true,
      });

      const initialState = useLensStore.getState();

      act(() => {
        useLensStore.getState().setLens('user');
      });

      // State reference should be the same (no update triggered)
      expect(useLensStore.getState().activeLens).toBe(initialState.activeLens);
    });
  });

  describe('initializeFromClerk', () => {
    it('should initialize with role default lens when no stored preference', () => {
      act(() => {
        useLensStore.getState().initializeFromClerk(UserRole.ADMIN, false);
      });

      expect(useLensStore.getState().userRole).toBe(UserRole.ADMIN);
      expect(useLensStore.getState().activeLens).toBe('admin');
      expect(useLensStore.getState().isInitialized).toBe(true);
    });

    it('should preserve stored lens when valid for role', () => {
      // Pre-set lens
      useLensStore.setState({ activeLens: 'user' });

      act(() => {
        useLensStore.getState().initializeFromClerk(UserRole.ADMIN, true);
      });

      expect(useLensStore.getState().activeLens).toBe('user'); // Preserved
      expect(useLensStore.getState().userRole).toBe(UserRole.ADMIN);
    });

    it('should override stored lens when invalid for role', () => {
      // Pre-set admin lens
      useLensStore.setState({ activeLens: 'admin' });

      act(() => {
        // USER role cannot have admin lens
        useLensStore.getState().initializeFromClerk(UserRole.USER, true);
      });

      expect(useLensStore.getState().activeLens).toBe('user'); // Reset to default
    });

    it('should not reinitialize if already initialized', () => {
      useLensStore.setState({
        userRole: UserRole.USER,
        isInitialized: true,
      });

      act(() => {
        useLensStore.getState().initializeFromClerk(UserRole.ADMIN, false);
      });

      expect(useLensStore.getState().userRole).toBe(UserRole.USER); // Unchanged
    });

    it('should set correct default lens for each role', () => {
      const testCases: Array<{ role: UserRole; expectedLens: LensType }> = [
        { role: UserRole.ADMIN, expectedLens: 'admin' },
        { role: UserRole.EDITOR, expectedLens: 'editor' },
        { role: UserRole.USER, expectedLens: 'user' },
      ];

      testCases.forEach(({ role, expectedLens }) => {
        // Reset
        useLensStore.setState({
          activeLens: 'user',
          userRole: UserRole.USER,
          isInitialized: false,
          isHydrated: false,
        });

        act(() => {
          useLensStore.getState().initializeFromClerk(role, false);
        });

        expect(useLensStore.getState().activeLens).toBe(expectedLens);
      });
    });
  });

  describe('reset', () => {
    it('should reset all state to defaults', () => {
      useLensStore.setState({
        activeLens: 'admin',
        userRole: UserRole.ADMIN,
        isInitialized: true,
        isHydrated: true,
      });

      act(() => {
        useLensStore.getState().reset();
      });

      const state = useLensStore.getState();
      expect(state.activeLens).toBe('user');
      expect(state.userRole).toBe(UserRole.USER);
      expect(state.isInitialized).toBe(false);
      expect(state.isHydrated).toBe(false);
    });
  });

  describe('setHydrated', () => {
    it('should mark store as hydrated', () => {
      expect(useLensStore.getState().isHydrated).toBe(false);

      act(() => {
        useLensStore.getState().setHydrated();
      });

      expect(useLensStore.getState().isHydrated).toBe(true);
    });
  });
});

describe('lensHelpers', () => {
  describe('getDefaultLens', () => {
    it('should return admin for ADMIN role', () => {
      expect(lensHelpers.getDefaultLens(UserRole.ADMIN)).toBe('admin');
    });

    it('should return editor for EDITOR role', () => {
      expect(lensHelpers.getDefaultLens(UserRole.EDITOR)).toBe('editor');
    });

    it('should return user for USER role', () => {
      expect(lensHelpers.getDefaultLens(UserRole.USER)).toBe('user');
    });
  });

  describe('getAvailableLenses', () => {
    it('should return all lenses for ADMIN', () => {
      expect(lensHelpers.getAvailableLenses(UserRole.ADMIN)).toEqual([
        'user',
        'editor',
        'admin',
      ]);
    });

    it('should return user and editor lenses for EDITOR', () => {
      expect(lensHelpers.getAvailableLenses(UserRole.EDITOR)).toEqual([
        'user',
        'editor',
      ]);
    });

    it('should return only user lens for USER', () => {
      expect(lensHelpers.getAvailableLenses(UserRole.USER)).toEqual(['user']);
    });
  });

  describe('isLensAvailable', () => {
    it('should return true for available lens', () => {
      expect(lensHelpers.isLensAvailable('admin', UserRole.ADMIN)).toBe(true);
      expect(lensHelpers.isLensAvailable('editor', UserRole.ADMIN)).toBe(true);
      expect(lensHelpers.isLensAvailable('user', UserRole.ADMIN)).toBe(true);
    });

    it('should return false for unavailable lens', () => {
      expect(lensHelpers.isLensAvailable('admin', UserRole.USER)).toBe(false);
      expect(lensHelpers.isLensAvailable('editor', UserRole.USER)).toBe(false);
      expect(lensHelpers.isLensAvailable('admin', UserRole.EDITOR)).toBe(false);
    });
  });
});

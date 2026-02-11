/**
 * Tests for lens switching functionality
 * Tests lens state management and available lenses based on role
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLensStore } from '@/store/lens-store';
import {
  useLens,
  useLensConfig,
  useAvailableLenses,
  useActiveLens,
} from '@/hooks/useLens';
import { UserRole } from '@/types/user';

// Reset store before each test
beforeEach(() => {
  useLensStore.setState({
    activeLens: 'user',
    userRole: UserRole.USER,
    isInitialized: true,
    isHydrated: true,
  });
});

describe('Lens Switching', () => {
  describe('Available Lenses by Role', () => {
    it('should provide only user lens for USER role', () => {
      useLensStore.setState({ userRole: UserRole.USER });

      const { result } = renderHook(() => useAvailableLenses());

      expect(result.current).toEqual(['user']);
    });

    it('should provide user and editor lenses for EDITOR role', () => {
      useLensStore.setState({ userRole: UserRole.EDITOR });

      const { result } = renderHook(() => useAvailableLenses());

      expect(result.current).toEqual(['user', 'editor']);
    });

    it('should provide all three lenses for ADMIN role', () => {
      useLensStore.setState({ userRole: UserRole.ADMIN });

      const { result } = renderHook(() => useAvailableLenses());

      expect(result.current).toEqual(['user', 'editor', 'admin']);
    });
  });

  describe('Lens Switching Permission', () => {
    it('should allow switching when lens is available', () => {
      useLensStore.setState({
        activeLens: 'user',
        userRole: UserRole.ADMIN,
        isInitialized: true,
      });

      const { result } = renderHook(() => useLens());

      act(() => {
        result.current.setLens('admin');
      });

      expect(result.current.activeLens).toBe('admin');
    });

    it('should not allow switching to unavailable lens', () => {
      useLensStore.setState({
        activeLens: 'user',
        userRole: UserRole.USER,
        isInitialized: true,
      });

      const { result } = renderHook(() => useLens());

      act(() => {
        result.current.setLens('admin'); // USER cannot access admin
      });

      expect(result.current.activeLens).toBe('user'); // Unchanged
    });

    it('should allow EDITOR to switch between user and editor', () => {
      useLensStore.setState({
        activeLens: 'user',
        userRole: UserRole.EDITOR,
        isInitialized: true,
      });

      const { result } = renderHook(() => useLens());

      // Switch to editor
      act(() => {
        result.current.setLens('editor');
      });
      expect(result.current.activeLens).toBe('editor');

      // Switch back to user
      act(() => {
        result.current.setLens('user');
      });
      expect(result.current.activeLens).toBe('user');
    });

    it('should not allow EDITOR to switch to admin', () => {
      useLensStore.setState({
        activeLens: 'user',
        userRole: UserRole.EDITOR,
        isInitialized: true,
      });

      const { result } = renderHook(() => useLens());

      act(() => {
        result.current.setLens('admin');
      });

      expect(result.current.activeLens).toBe('user'); // Unchanged
    });
  });

  describe('Lens Configuration', () => {
    it('should return user config for user lens', () => {
      useLensStore.setState({ activeLens: 'user' });

      const { result } = renderHook(() => useLensConfig());

      expect(result.current.id).toBe('user');
      expect(result.current.name).toBe('Личное');
    });

    it('should return editor config for editor lens', () => {
      useLensStore.setState({ activeLens: 'editor' });

      const { result } = renderHook(() => useLensConfig());

      expect(result.current.id).toBe('editor');
      expect(result.current.name).toBe('Контент');
    });

    it('should return admin config for admin lens', () => {
      useLensStore.setState({ activeLens: 'admin' });

      const { result } = renderHook(() => useLensConfig());

      expect(result.current.id).toBe('admin');
      expect(result.current.name).toBe('Админ');
    });

    it('should update config when lens changes', () => {
      useLensStore.setState({
        activeLens: 'user',
        userRole: UserRole.ADMIN,
        isInitialized: true,
      });

      const { result } = renderHook(() => useLensConfig());

      expect(result.current.id).toBe('user');

      act(() => {
        useLensStore.getState().setLens('admin');
      });

      expect(result.current.id).toBe('admin');
    });
  });

  describe('Active Lens Tracking', () => {
    it('should track active lens changes', () => {
      useLensStore.setState({
        activeLens: 'user',
        userRole: UserRole.ADMIN,
        isInitialized: true,
      });

      const { result } = renderHook(() => useActiveLens());

      expect(result.current).toBe('user');

      act(() => {
        useLensStore.getState().setLens('editor');
      });

      expect(result.current).toBe('editor');

      act(() => {
        useLensStore.getState().setLens('admin');
      });

      expect(result.current).toBe('admin');
    });
  });

  describe('Lens Visibility Logic', () => {
    it('should hide switcher for users with single lens option', () => {
      useLensStore.setState({ userRole: UserRole.USER });

      const { result } = renderHook(() => useAvailableLenses());

      // Users with only one lens should not see switcher
      expect(result.current.length).toBe(1);
    });

    it('should show switcher for users with multiple lens options', () => {
      useLensStore.setState({ userRole: UserRole.EDITOR });

      const { result } = renderHook(() => useAvailableLenses());

      // Editors have 2 options - should see switcher
      expect(result.current.length).toBeGreaterThan(1);
    });
  });

  describe('Lens Initialization', () => {
    it('should initialize with default lens based on role', () => {
      useLensStore.setState({
        activeLens: 'user',
        userRole: UserRole.USER,
        isInitialized: false,
        isHydrated: true,
      });

      const { result } = renderHook(() => useLens());

      act(() => {
        result.current.initializeFromClerk(UserRole.EDITOR, false);
      });

      // EDITOR should default to 'editor' lens
      expect(result.current.activeLens).toBe('editor');
      expect(result.current.userRole).toBe(UserRole.EDITOR);
      expect(result.current.isInitialized).toBe(true);
    });

    it('should preserve valid stored lens on initialization', () => {
      // Pre-set user lens before initialization
      useLensStore.setState({
        activeLens: 'user',
        userRole: UserRole.USER,
        isInitialized: false,
        isHydrated: true,
      });

      const { result } = renderHook(() => useLens());

      act(() => {
        // Initialize as EDITOR but preserve 'user' lens
        result.current.initializeFromClerk(UserRole.EDITOR, true);
      });

      // 'user' is valid for EDITOR, so should be preserved
      expect(result.current.activeLens).toBe('user');
    });

    it('should reset invalid stored lens on initialization', () => {
      // Pre-set admin lens before initialization
      useLensStore.setState({
        activeLens: 'admin',
        userRole: UserRole.USER,
        isInitialized: false,
        isHydrated: true,
      });

      const { result } = renderHook(() => useLens());

      act(() => {
        // Initialize as EDITOR - 'admin' is invalid
        result.current.initializeFromClerk(UserRole.EDITOR, true);
      });

      // 'admin' is NOT valid for EDITOR, so should reset to default
      expect(result.current.activeLens).toBe('editor');
    });
  });

  describe('Lens Reset', () => {
    it('should reset to initial state', () => {
      useLensStore.setState({
        activeLens: 'admin',
        userRole: UserRole.ADMIN,
        isInitialized: true,
        isHydrated: true,
      });

      const { result } = renderHook(() => useLens());

      act(() => {
        result.current.reset();
      });

      expect(result.current.activeLens).toBe('user');
      expect(result.current.userRole).toBe(UserRole.USER);
      expect(result.current.isInitialized).toBe(false);
    });
  });

  describe('Lens Color Themes', () => {
    it('should return distinct colors for each lens', () => {
      const lenses = ['user', 'editor', 'admin'] as const;
      const colors: string[] = [];

      for (const lens of lenses) {
        useLensStore.setState({ activeLens: lens });
        const { result } = renderHook(() => useLensConfig());
        colors.push(result.current.color);
      }

      // All colors should be unique
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(3);
    });

    it('should have emerald theme for user lens', () => {
      useLensStore.setState({ activeLens: 'user' });

      const { result } = renderHook(() => useLensConfig());

      expect(result.current.color).toContain('emerald');
    });

    it('should have blue theme for editor lens', () => {
      useLensStore.setState({ activeLens: 'editor' });

      const { result } = renderHook(() => useLensConfig());

      expect(result.current.color).toContain('blue');
    });

    it('should have violet theme for admin lens', () => {
      useLensStore.setState({ activeLens: 'admin' });

      const { result } = renderHook(() => useLensConfig());

      expect(result.current.color).toContain('violet');
    });
  });
});

/**
 * Tests for useLens hook
 * Tests Zustand store integration and lens state management
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useLens,
  useActiveLens,
  useLensConfig,
  useAvailableLenses,
  useUserRole,
  useLensReady,
} from '@/hooks/useLens';
import { useLensStore, type LensType } from '@/store/lens-store';
import { UserRole } from '@/types/user';

// Reset store before each test
beforeEach(() => {
  useLensStore.setState({
    activeLens: 'user',
    userRole: UserRole.USER,
    isInitialized: false,
    isHydrated: true,
  });
});

describe('useLens', () => {
  it('should return current lens state', () => {
    const { result } = renderHook(() => useLens());

    expect(result.current.activeLens).toBe('user');
    expect(result.current.userRole).toBe(UserRole.USER);
    expect(result.current.isHydrated).toBe(true);
  });

  it('should have setLens action', () => {
    const { result } = renderHook(() => useLens());

    expect(typeof result.current.setLens).toBe('function');
  });

  it('should have initializeFromClerk action', () => {
    const { result } = renderHook(() => useLens());

    expect(typeof result.current.initializeFromClerk).toBe('function');
  });

  it('should have reset action', () => {
    const { result } = renderHook(() => useLens());

    expect(typeof result.current.reset).toBe('function');
  });

  it('should update lens when setLens is called with valid lens for role', () => {
    // Initialize with ADMIN role to allow switching
    useLensStore.setState({
      activeLens: 'user',
      userRole: UserRole.ADMIN,
      isInitialized: true,
      isHydrated: true,
    });

    const { result } = renderHook(() => useLens());

    act(() => {
      result.current.setLens('admin');
    });

    expect(result.current.activeLens).toBe('admin');
  });

  it('should not update lens for unavailable lens based on role', () => {
    // USER role can only access 'user' lens
    useLensStore.setState({
      activeLens: 'user',
      userRole: UserRole.USER,
      isInitialized: true,
      isHydrated: true,
    });

    const { result } = renderHook(() => useLens());

    act(() => {
      result.current.setLens('admin'); // Should be ignored
    });

    expect(result.current.activeLens).toBe('user'); // Unchanged
  });

  it('should initialize from Clerk data with default lens', () => {
    const { result } = renderHook(() => useLens());

    act(() => {
      result.current.initializeFromClerk(UserRole.EDITOR, false);
    });

    expect(result.current.userRole).toBe(UserRole.EDITOR);
    expect(result.current.isInitialized).toBe(true);
    expect(result.current.activeLens).toBe('editor'); // Default for EDITOR
  });

  it('should preserve stored lens if valid for role', () => {
    // Pre-set lens to 'user'
    useLensStore.setState({
      activeLens: 'user',
      userRole: UserRole.USER,
      isInitialized: false,
      isHydrated: true,
    });

    const { result } = renderHook(() => useLens());

    act(() => {
      // EDITOR can use 'user' lens
      result.current.initializeFromClerk(UserRole.EDITOR, true);
    });

    expect(result.current.activeLens).toBe('user'); // Preserved
  });

  it('should only initialize once', () => {
    useLensStore.setState({
      activeLens: 'user',
      userRole: UserRole.USER,
      isInitialized: true, // Already initialized
      isHydrated: true,
    });

    const { result } = renderHook(() => useLens());

    act(() => {
      result.current.initializeFromClerk(UserRole.ADMIN, false);
    });

    // Should remain USER since already initialized
    expect(result.current.userRole).toBe(UserRole.USER);
  });

  it('should reset store to defaults', () => {
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

describe('useActiveLens', () => {
  it('should return only active lens', () => {
    useLensStore.setState({ activeLens: 'editor' });

    const { result } = renderHook(() => useActiveLens());
    expect(result.current).toBe('editor');
  });

  it('should update when lens changes', () => {
    useLensStore.setState({
      activeLens: 'user',
      userRole: UserRole.ADMIN,
      isInitialized: true,
      isHydrated: true,
    });

    const { result } = renderHook(() => useActiveLens());

    expect(result.current).toBe('user');

    act(() => {
      useLensStore.getState().setLens('admin');
    });

    expect(result.current).toBe('admin');
  });
});

describe('useLensConfig', () => {
  it('should return config for user lens', () => {
    useLensStore.setState({ activeLens: 'user' });

    const { result } = renderHook(() => useLensConfig());
    expect(result.current.id).toBe('user');
    expect(result.current.name).toBe('Личное');
  });

  it('should return config for admin lens', () => {
    useLensStore.setState({ activeLens: 'admin' });

    const { result } = renderHook(() => useLensConfig());
    expect(result.current.id).toBe('admin');
    expect(result.current.name).toBe('Админ');
  });

  it('should return config for editor lens', () => {
    useLensStore.setState({ activeLens: 'editor' });

    const { result } = renderHook(() => useLensConfig());
    expect(result.current.id).toBe('editor');
    expect(result.current.name).toBe('Контент');
  });
});

describe('useAvailableLenses', () => {
  it('should return available lenses for USER role', () => {
    useLensStore.setState({ userRole: UserRole.USER });

    const { result } = renderHook(() => useAvailableLenses());
    expect(result.current).toEqual(['user']);
  });

  it('should return available lenses for EDITOR role', () => {
    useLensStore.setState({ userRole: UserRole.EDITOR });

    const { result } = renderHook(() => useAvailableLenses());
    expect(result.current).toEqual(['user', 'editor']);
  });

  it('should return available lenses for ADMIN role', () => {
    useLensStore.setState({ userRole: UserRole.ADMIN });

    const { result } = renderHook(() => useAvailableLenses());
    expect(result.current).toEqual(['user', 'editor', 'admin']);
  });
});

describe('useUserRole', () => {
  it('should return current user role', () => {
    useLensStore.setState({ userRole: UserRole.ADMIN });

    const { result } = renderHook(() => useUserRole());
    expect(result.current).toBe(UserRole.ADMIN);
  });

  it('should update when role changes', () => {
    const { result } = renderHook(() => useUserRole());

    expect(result.current).toBe(UserRole.USER);

    act(() => {
      useLensStore.setState({ userRole: UserRole.EDITOR });
    });

    expect(result.current).toBe(UserRole.EDITOR);
  });
});

describe('useLensReady', () => {
  it('should return true when both initialized and hydrated', () => {
    useLensStore.setState({
      isInitialized: true,
      isHydrated: true,
    });

    const { result } = renderHook(() => useLensReady());
    expect(result.current).toBe(true);
  });

  it('should return false when not initialized', () => {
    useLensStore.setState({
      isInitialized: false,
      isHydrated: true,
    });

    const { result } = renderHook(() => useLensReady());
    expect(result.current).toBe(false);
  });

  it('should return false when not hydrated', () => {
    useLensStore.setState({
      isInitialized: true,
      isHydrated: false,
    });

    const { result } = renderHook(() => useLensReady());
    expect(result.current).toBe(false);
  });
});

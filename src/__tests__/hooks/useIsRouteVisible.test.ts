/**
 * Tests for useIsRouteVisible hook
 * Tests route visibility based on lens configuration
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useIsRouteVisible,
  useAreRoutesVisible,
  useFilterVisibleRoutes,
} from '@/hooks/useIsRouteVisible';
import { useLensStore } from '@/store/lens-store';
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

describe('useIsRouteVisible', () => {
  describe('user lens', () => {
    beforeEach(() => {
      useLensStore.setState({ activeLens: 'user' });
    });

    it('should show dashboard route', () => {
      const { result } = renderHook(() => useIsRouteVisible('/dashboard'));
      expect(result.current).toBe(true);
    });

    it('should show my-tests route', () => {
      const { result } = renderHook(() => useIsRouteVisible('/my-tests'));
      expect(result.current).toBe(true);
    });

    it('should show test-templates route', () => {
      const { result } = renderHook(() => useIsRouteVisible('/test-templates'));
      expect(result.current).toBe(true);
    });

    it('should hide HR competencies route', () => {
      const { result } = renderHook(() => useIsRouteVisible('/hr/competencies'));
      expect(result.current).toBe(false);
    });

    it('should hide admin users route', () => {
      const { result } = renderHook(() => useIsRouteVisible('/admin/users'));
      expect(result.current).toBe(false);
    });
  });

  describe('editor lens', () => {
    beforeEach(() => {
      useLensStore.setState({ activeLens: 'editor' });
    });

    it('should show HR routes', () => {
      const { result: compResult } = renderHook(() => useIsRouteVisible('/hr/competencies'));
      const { result: indResult } = renderHook(() => useIsRouteVisible('/hr/behavioral-indicators'));
      const { result: questResult } = renderHook(() => useIsRouteVisible('/hr/assessment-questions'));

      expect(compResult.current).toBe(true);
      expect(indResult.current).toBe(true);
      expect(questResult.current).toBe(true);
    });

    it('should hide admin routes', () => {
      const { result } = renderHook(() => useIsRouteVisible('/admin/users'));
      expect(result.current).toBe(false);
    });
  });

  describe('admin lens', () => {
    beforeEach(() => {
      useLensStore.setState({ activeLens: 'admin' });
    });

    it('should show all platform routes', () => {
      const { result: dashResult } = renderHook(() => useIsRouteVisible('/dashboard'));
      const { result: templatesResult } = renderHook(() => useIsRouteVisible('/test-templates'));

      expect(dashResult.current).toBe(true);
      expect(templatesResult.current).toBe(true);
    });

    it('should show all HR routes', () => {
      const { result: compResult } = renderHook(() => useIsRouteVisible('/hr/competencies'));
      const { result: indResult } = renderHook(() => useIsRouteVisible('/hr/behavioral-indicators'));

      expect(compResult.current).toBe(true);
      expect(indResult.current).toBe(true);
    });

    it('should show admin routes', () => {
      const { result } = renderHook(() => useIsRouteVisible('/admin/users'));
      expect(result.current).toBe(true);
    });
  });

  describe('lens switching', () => {
    it('should update visibility when lens changes', () => {
      useLensStore.setState({ activeLens: 'user' });
      const { result } = renderHook(() => useIsRouteVisible('/hr/competencies'));

      expect(result.current).toBe(false);

      act(() => {
        useLensStore.setState({ activeLens: 'editor' });
      });

      expect(result.current).toBe(true);
    });
  });

  describe('child routes', () => {
    it('should match child routes of visible parents', () => {
      useLensStore.setState({ activeLens: 'editor' });

      const { result: detailResult } = renderHook(() => useIsRouteVisible('/hr/competencies/comp-123'));
      const { result: editResult } = renderHook(() => useIsRouteVisible('/hr/competencies/comp-123/edit'));

      expect(detailResult.current).toBe(true);
      expect(editResult.current).toBe(true);
    });

    it('should not match child routes of hidden parents', () => {
      useLensStore.setState({ activeLens: 'user' });

      const { result } = renderHook(() => useIsRouteVisible('/admin/users/user-123'));
      expect(result.current).toBe(false);
    });
  });
});

describe('useAreRoutesVisible', () => {
  beforeEach(() => {
    useLensStore.setState({ activeLens: 'editor' });
  });

  it('should check multiple routes at once', () => {
    const routes = [
      '/dashboard',
      '/hr/competencies',
      '/admin/users',
    ];

    const { result } = renderHook(() => useAreRoutesVisible(routes));

    expect(result.current['/dashboard']).toBe(true);
    expect(result.current['/hr/competencies']).toBe(true);
    expect(result.current['/admin/users']).toBe(false);
  });

  it('should return stable reference when lens unchanged', () => {
    const routes = ['/dashboard', '/hr/competencies'];

    const { result, rerender } = renderHook(() => useAreRoutesVisible(routes));
    const firstResult = result.current;

    rerender();

    expect(result.current).toBe(firstResult);
  });

  it('should update when lens changes', () => {
    const routes = ['/admin/users'];

    const { result } = renderHook(() => useAreRoutesVisible(routes));

    expect(result.current['/admin/users']).toBe(false);

    act(() => {
      useLensStore.setState({ activeLens: 'admin' });
    });

    expect(result.current['/admin/users']).toBe(true);
  });

  it('should handle empty routes array', () => {
    const { result } = renderHook(() => useAreRoutesVisible([]));
    expect(result.current).toEqual({});
  });

  it('should handle single route', () => {
    const { result } = renderHook(() => useAreRoutesVisible(['/dashboard']));
    expect(result.current['/dashboard']).toBe(true);
  });
});

describe('useFilterVisibleRoutes', () => {
  const navigationItems = [
    { title: 'Dashboard', url: '/dashboard', icon: 'BarChart' },
    { title: 'Competencies', url: '/hr/competencies', icon: 'Target' },
    { title: 'Indicators', url: '/hr/behavioral-indicators', icon: 'Lightbulb' },
    { title: 'Questions', url: '/hr/assessment-questions', icon: 'FileQuestion' },
    { title: 'Users', url: '/admin/users', icon: 'Users' },
    { title: 'Settings', url: '/settings', icon: 'Settings' },
  ];

  const getRoute = (item: typeof navigationItems[0]) => item.url;

  describe('user lens filtering', () => {
    beforeEach(() => {
      useLensStore.setState({ activeLens: 'user' });
    });

    it('should filter to only user-visible routes', () => {
      const { result } = renderHook(() =>
        useFilterVisibleRoutes(navigationItems, getRoute)
      );

      const visibleTitles = result.current.map(item => item.title);

      expect(visibleTitles).toContain('Dashboard');
      expect(visibleTitles).not.toContain('Competencies');
      expect(visibleTitles).not.toContain('Users');
    });
  });

  describe('editor lens filtering', () => {
    beforeEach(() => {
      useLensStore.setState({ activeLens: 'editor' });
    });

    it('should include HR routes', () => {
      const { result } = renderHook(() =>
        useFilterVisibleRoutes(navigationItems, getRoute)
      );

      const visibleTitles = result.current.map(item => item.title);

      expect(visibleTitles).toContain('Dashboard');
      expect(visibleTitles).toContain('Competencies');
      expect(visibleTitles).toContain('Indicators');
      expect(visibleTitles).toContain('Questions');
      expect(visibleTitles).not.toContain('Users');
    });
  });

  describe('admin lens filtering', () => {
    beforeEach(() => {
      useLensStore.setState({ activeLens: 'admin' });
    });

    it('should include all routes', () => {
      const { result } = renderHook(() =>
        useFilterVisibleRoutes(navigationItems, getRoute)
      );

      const visibleTitles = result.current.map(item => item.title);

      expect(visibleTitles).toContain('Dashboard');
      expect(visibleTitles).toContain('Competencies');
      expect(visibleTitles).toContain('Indicators');
      expect(visibleTitles).toContain('Questions');
      expect(visibleTitles).toContain('Users');
    });
  });

  it('should update filtered items when lens changes', () => {
    useLensStore.setState({ activeLens: 'user' });

    const { result } = renderHook(() =>
      useFilterVisibleRoutes(navigationItems, getRoute)
    );

    const userVisibleCount = result.current.length;

    act(() => {
      useLensStore.setState({ activeLens: 'admin' });
    });

    expect(result.current.length).toBeGreaterThan(userVisibleCount);
  });

  it('should handle empty items array', () => {
    const { result } = renderHook(() =>
      useFilterVisibleRoutes([], getRoute)
    );

    expect(result.current).toEqual([]);
  });

  it('should preserve item order', () => {
    useLensStore.setState({ activeLens: 'editor' });

    const { result } = renderHook(() =>
      useFilterVisibleRoutes(navigationItems, getRoute)
    );

    // Check that the relative order is preserved
    const titles = result.current.map(item => item.title);
    if (titles.includes('Dashboard') && titles.includes('Competencies')) {
      expect(titles.indexOf('Dashboard')).toBeLessThan(titles.indexOf('Competencies'));
    }
  });

  it('should work with custom getRoute function', () => {
    useLensStore.setState({ activeLens: 'editor' });

    const customItems = [
      { name: 'Home', path: '/dashboard' },
      { name: 'Library', path: '/hr/competencies' },
    ];

    const customGetRoute = (item: typeof customItems[0]) => item.path;

    const { result } = renderHook(() =>
      useFilterVisibleRoutes(customItems, customGetRoute)
    );

    expect(result.current).toHaveLength(2);
  });
});

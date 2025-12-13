/**
 * Tests for AppSidebar component logic
 * Tests sidebar navigation filtering based on lens and role
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLensStore } from '@/store/lens-store';
import { useFilterVisibleRoutes, useIsRouteVisible } from '@/hooks/useIsRouteVisible';
import { UserRole } from '@/types/user';

// Navigation items similar to what AppSidebar uses
const platformNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: 'BarChart' },
  { title: 'Test Templates', url: '/test-templates', icon: 'FileText' },
];

const libraryNavItems = [
  { title: 'Competencies', url: '/hr/competencies', icon: 'Target' },
  { title: 'Behavioral Indicators', url: '/hr/behavioral-indicators', icon: 'Lightbulb' },
  { title: 'Assessment Questions', url: '/hr/assessment-questions', icon: 'FileQuestion' },
  { title: 'Skill Mapper', url: '/skill-mapper', icon: 'Map' },
];

const adminNavItems = [
  { title: 'Users', url: '/admin/users', icon: 'Users' },
  { title: 'Settings', url: '/settings', icon: 'Settings' },
];

const getRoute = (item: { url: string }) => item.url;

// Reset store before each test
beforeEach(() => {
  useLensStore.setState({
    activeLens: 'user',
    userRole: UserRole.USER,
    isInitialized: true,
    isHydrated: true,
  });
});

describe('AppSidebar Navigation Filtering', () => {
  describe('User Lens Navigation', () => {
    beforeEach(() => {
      useLensStore.setState({ activeLens: 'user', userRole: UserRole.USER });
    });

    it('should show dashboard for user lens', () => {
      const { result } = renderHook(() => useIsRouteVisible('/dashboard'));
      expect(result.current).toBe(true);
    });

    it('should show test-templates for user lens', () => {
      const { result } = renderHook(() => useIsRouteVisible('/test-templates'));
      expect(result.current).toBe(true);
    });

    it('should hide HR library routes for user lens', () => {
      const { result: compResult } = renderHook(() => useIsRouteVisible('/hr/competencies'));
      const { result: indResult } = renderHook(() => useIsRouteVisible('/hr/behavioral-indicators'));
      const { result: questResult } = renderHook(() => useIsRouteVisible('/hr/assessment-questions'));

      expect(compResult.current).toBe(false);
      expect(indResult.current).toBe(false);
      expect(questResult.current).toBe(false);
    });

    it('should hide admin routes for user lens', () => {
      const { result } = renderHook(() => useIsRouteVisible('/admin/users'));
      expect(result.current).toBe(false);
    });

    it('should filter library items to empty for user lens', () => {
      const { result } = renderHook(() => useFilterVisibleRoutes(libraryNavItems, getRoute));
      expect(result.current).toHaveLength(0);
    });

    it('should filter admin items to empty for user lens', () => {
      const { result } = renderHook(() => useFilterVisibleRoutes(adminNavItems, getRoute));
      expect(result.current).toHaveLength(0);
    });
  });

  describe('Editor Lens Navigation', () => {
    beforeEach(() => {
      useLensStore.setState({ activeLens: 'editor', userRole: UserRole.EDITOR });
    });

    it('should show dashboard for editor lens', () => {
      const { result } = renderHook(() => useIsRouteVisible('/dashboard'));
      expect(result.current).toBe(true);
    });

    it('should show test-templates for editor lens', () => {
      const { result } = renderHook(() => useIsRouteVisible('/test-templates'));
      expect(result.current).toBe(true);
    });

    it('should show HR library routes for editor lens', () => {
      const { result: compResult } = renderHook(() => useIsRouteVisible('/hr/competencies'));
      const { result: indResult } = renderHook(() => useIsRouteVisible('/hr/behavioral-indicators'));
      const { result: questResult } = renderHook(() => useIsRouteVisible('/hr/assessment-questions'));

      expect(compResult.current).toBe(true);
      expect(indResult.current).toBe(true);
      expect(questResult.current).toBe(true);
    });

    it('should show skill-mapper for editor lens', () => {
      const { result } = renderHook(() => useIsRouteVisible('/skill-mapper'));
      expect(result.current).toBe(true);
    });

    it('should hide admin routes for editor lens', () => {
      const { result } = renderHook(() => useIsRouteVisible('/admin/users'));
      expect(result.current).toBe(false);
    });

    it('should filter platform items correctly for editor lens', () => {
      const { result } = renderHook(() => useFilterVisibleRoutes(platformNavItems, getRoute));

      const visibleUrls = result.current.map(item => item.url);
      expect(visibleUrls).toContain('/dashboard');
      expect(visibleUrls).toContain('/test-templates');
    });

    it('should show all library items for editor lens', () => {
      const { result } = renderHook(() => useFilterVisibleRoutes(libraryNavItems, getRoute));
      expect(result.current.length).toBe(libraryNavItems.length);
    });

    it('should filter admin items to empty for editor lens', () => {
      const { result } = renderHook(() => useFilterVisibleRoutes(adminNavItems, getRoute));
      expect(result.current).toHaveLength(0);
    });
  });

  describe('Admin Lens Navigation', () => {
    beforeEach(() => {
      useLensStore.setState({ activeLens: 'admin', userRole: UserRole.ADMIN });
    });

    it('should show all platform routes for admin lens', () => {
      const { result: dashResult } = renderHook(() => useIsRouteVisible('/dashboard'));
      const { result: templatesResult } = renderHook(() => useIsRouteVisible('/test-templates'));

      expect(dashResult.current).toBe(true);
      expect(templatesResult.current).toBe(true);
    });

    it('should show all HR library routes for admin lens', () => {
      const { result: compResult } = renderHook(() => useIsRouteVisible('/hr/competencies'));
      const { result: indResult } = renderHook(() => useIsRouteVisible('/hr/behavioral-indicators'));
      const { result: questResult } = renderHook(() => useIsRouteVisible('/hr/assessment-questions'));
      const { result: mapperResult } = renderHook(() => useIsRouteVisible('/skill-mapper'));

      expect(compResult.current).toBe(true);
      expect(indResult.current).toBe(true);
      expect(questResult.current).toBe(true);
      expect(mapperResult.current).toBe(true);
    });

    it('should show admin routes for admin lens', () => {
      const { result } = renderHook(() => useIsRouteVisible('/admin/users'));
      expect(result.current).toBe(true);
    });

    it('should show all platform items for admin lens', () => {
      const { result } = renderHook(() => useFilterVisibleRoutes(platformNavItems, getRoute));
      expect(result.current.length).toBe(platformNavItems.length);
    });

    it('should show all library items for admin lens', () => {
      const { result } = renderHook(() => useFilterVisibleRoutes(libraryNavItems, getRoute));
      expect(result.current.length).toBe(libraryNavItems.length);
    });

    it('should show admin items for admin lens', () => {
      const { result } = renderHook(() => useFilterVisibleRoutes(adminNavItems, getRoute));
      expect(result.current.length).toBeGreaterThan(0);
    });
  });

  describe('Dynamic Lens Switching', () => {
    it('should update visible routes when lens changes', () => {
      useLensStore.setState({ activeLens: 'user', userRole: UserRole.ADMIN });

      const { result: libResult } = renderHook(() =>
        useFilterVisibleRoutes(libraryNavItems, getRoute)
      );

      // User lens - no library items
      expect(libResult.current).toHaveLength(0);

      // Switch to editor lens
      act(() => {
        useLensStore.setState({ activeLens: 'editor' });
      });

      // Editor lens - all library items
      expect(libResult.current.length).toBe(libraryNavItems.length);
    });

    it('should update admin visibility when switching to admin lens', () => {
      useLensStore.setState({ activeLens: 'user', userRole: UserRole.ADMIN });

      const { result } = renderHook(() =>
        useFilterVisibleRoutes(adminNavItems, getRoute)
      );

      // User lens - no admin items
      expect(result.current).toHaveLength(0);

      // Switch to admin lens
      act(() => {
        useLensStore.setState({ activeLens: 'admin' });
      });

      // Admin lens - admin items visible
      expect(result.current.length).toBeGreaterThan(0);
    });
  });

  describe('Child Route Visibility', () => {
    it('should show competency detail routes when competencies visible', () => {
      useLensStore.setState({ activeLens: 'editor' });

      const { result: listResult } = renderHook(() => useIsRouteVisible('/hr/competencies'));
      const { result: detailResult } = renderHook(() => useIsRouteVisible('/hr/competencies/comp-123'));
      const { result: editResult } = renderHook(() => useIsRouteVisible('/hr/competencies/comp-123/edit'));

      expect(listResult.current).toBe(true);
      expect(detailResult.current).toBe(true);
      expect(editResult.current).toBe(true);
    });

    it('should hide competency detail routes when competencies hidden', () => {
      useLensStore.setState({ activeLens: 'user' });

      const { result: listResult } = renderHook(() => useIsRouteVisible('/hr/competencies'));
      const { result: detailResult } = renderHook(() => useIsRouteVisible('/hr/competencies/comp-123'));

      expect(listResult.current).toBe(false);
      expect(detailResult.current).toBe(false);
    });

    it('should show test session routes under test-templates', () => {
      useLensStore.setState({ activeLens: 'user' });

      const { result: templatesResult } = renderHook(() => useIsRouteVisible('/test-templates'));
      const { result: sessionResult } = renderHook(() => useIsRouteVisible('/test-templates/take/session-123'));

      expect(templatesResult.current).toBe(true);
      expect(sessionResult.current).toBe(true);
    });
  });

  describe('Navigation Item Ordering', () => {
    it('should preserve item order when filtering', () => {
      useLensStore.setState({ activeLens: 'editor' });

      const { result } = renderHook(() =>
        useFilterVisibleRoutes(libraryNavItems, getRoute)
      );

      // Check that items maintain their relative order
      const urls = result.current.map(item => item.url);
      expect(urls.indexOf('/hr/competencies')).toBeLessThan(urls.indexOf('/hr/behavioral-indicators'));
      expect(urls.indexOf('/hr/behavioral-indicators')).toBeLessThan(urls.indexOf('/hr/assessment-questions'));
    });
  });
});

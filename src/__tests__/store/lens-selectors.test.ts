/**
 * Tests for lens-selectors
 * Tests memoized selectors for lens store computed values
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useLensStore } from '@/store/lens-store';
import {
  selectLensConfig,
  selectAvailableLenses,
  selectIsRouteVisible,
  selectHasFeature,
  selectActiveLens,
  selectUserRole,
  selectIsInitialized,
  selectIsHydrated,
  selectIsReady,
} from '@/store/lens-selectors';
import { LENS_CONFIGS } from '@/config/lens-configs';
import { UserRole } from '@/types/user';

// Reset store before each test
beforeEach(() => {
  useLensStore.setState({
    activeLens: 'user',
    userRole: UserRole.USER,
    isInitialized: false,
    isHydrated: false,
  });
});

describe('Lens Selectors', () => {
  describe('selectLensConfig', () => {
    it('should return user config for user lens', () => {
      useLensStore.setState({ activeLens: 'user' });

      const state = useLensStore.getState();
      const config = selectLensConfig(state);

      expect(config).toBe(LENS_CONFIGS.user);
      expect(config.id).toBe('user');
      expect(config.name).toBe('Личное');
    });

    it('should return editor config for editor lens', () => {
      useLensStore.setState({ activeLens: 'editor' });

      const state = useLensStore.getState();
      const config = selectLensConfig(state);

      expect(config).toBe(LENS_CONFIGS.editor);
      expect(config.id).toBe('editor');
      expect(config.name).toBe('Контент');
    });

    it('should return admin config for admin lens', () => {
      useLensStore.setState({ activeLens: 'admin' });

      const state = useLensStore.getState();
      const config = selectLensConfig(state);

      expect(config).toBe(LENS_CONFIGS.admin);
      expect(config.id).toBe('admin');
      expect(config.name).toBe('Админ');
    });

    it('should return stable references to prevent re-renders', () => {
      useLensStore.setState({ activeLens: 'admin' });

      const state1 = useLensStore.getState();
      const state2 = useLensStore.getState();
      const config1 = selectLensConfig(state1);
      const config2 = selectLensConfig(state2);

      expect(config1).toBe(config2); // Same reference
    });
  });

  describe('selectAvailableLenses', () => {
    it('should return only user lens for USER role', () => {
      useLensStore.setState({ userRole: UserRole.USER });

      const state = useLensStore.getState();
      const lenses = selectAvailableLenses(state);

      expect(lenses).toEqual(['user']);
    });

    it('should return user and editor lenses for EDITOR role', () => {
      useLensStore.setState({ userRole: UserRole.EDITOR });

      const state = useLensStore.getState();
      const lenses = selectAvailableLenses(state);

      expect(lenses).toEqual(['user', 'editor']);
    });

    it('should return all lenses for ADMIN role', () => {
      useLensStore.setState({ userRole: UserRole.ADMIN });

      const state = useLensStore.getState();
      const lenses = selectAvailableLenses(state);

      expect(lenses).toEqual(['user', 'editor', 'admin']);
    });

    it('should return stable array references', () => {
      useLensStore.setState({ userRole: UserRole.ADMIN });

      const state1 = useLensStore.getState();
      const state2 = useLensStore.getState();
      const lenses1 = selectAvailableLenses(state1);
      const lenses2 = selectAvailableLenses(state2);

      expect(lenses1).toBe(lenses2); // Same reference
    });
  });

  describe('selectIsRouteVisible', () => {
    describe('user lens route visibility', () => {
      beforeEach(() => {
        useLensStore.setState({ activeLens: 'user' });
      });

      it('should show dashboard in user lens', () => {
        const state = useLensStore.getState();
        const selector = selectIsRouteVisible('/dashboard');
        expect(selector(state)).toBe(true);
      });

      it('should show my-tests in user lens', () => {
        const state = useLensStore.getState();
        const selector = selectIsRouteVisible('/my-tests');
        expect(selector(state)).toBe(true);
      });

      it('should show test-templates in user lens', () => {
        const state = useLensStore.getState();
        const selector = selectIsRouteVisible('/test-templates');
        expect(selector(state)).toBe(true);
      });

      it('should hide HR routes in user lens', () => {
        const state = useLensStore.getState();
        expect(selectIsRouteVisible('/hr/competencies')(state)).toBe(false);
        expect(selectIsRouteVisible('/hr/behavioral-indicators')(state)).toBe(false);
        expect(selectIsRouteVisible('/hr/assessment-questions')(state)).toBe(false);
      });

      it('should hide admin routes in user lens', () => {
        const state = useLensStore.getState();
        expect(selectIsRouteVisible('/admin/users')(state)).toBe(false);
      });
    });

    describe('editor lens route visibility', () => {
      beforeEach(() => {
        useLensStore.setState({ activeLens: 'editor' });
      });

      it('should show dashboard in editor lens', () => {
        const state = useLensStore.getState();
        expect(selectIsRouteVisible('/dashboard')(state)).toBe(true);
      });

      it('should show test-templates in editor lens', () => {
        const state = useLensStore.getState();
        expect(selectIsRouteVisible('/test-templates')(state)).toBe(true);
      });

      it('should show HR routes in editor lens', () => {
        const state = useLensStore.getState();
        expect(selectIsRouteVisible('/hr/competencies')(state)).toBe(true);
        expect(selectIsRouteVisible('/hr/behavioral-indicators')(state)).toBe(true);
        expect(selectIsRouteVisible('/hr/assessment-questions')(state)).toBe(true);
      });

      it('should show skill-mapper in editor lens', () => {
        const state = useLensStore.getState();
        expect(selectIsRouteVisible('/skill-mapper')(state)).toBe(true);
      });

      it('should hide admin routes in editor lens', () => {
        const state = useLensStore.getState();
        expect(selectIsRouteVisible('/admin/users')(state)).toBe(false);
      });
    });

    describe('admin lens route visibility', () => {
      beforeEach(() => {
        useLensStore.setState({ activeLens: 'admin' });
      });

      it('should show all platform routes in admin lens', () => {
        const state = useLensStore.getState();
        expect(selectIsRouteVisible('/dashboard')(state)).toBe(true);
        expect(selectIsRouteVisible('/test-templates')(state)).toBe(true);
      });

      it('should show all HR routes in admin lens', () => {
        const state = useLensStore.getState();
        expect(selectIsRouteVisible('/hr/competencies')(state)).toBe(true);
        expect(selectIsRouteVisible('/hr/behavioral-indicators')(state)).toBe(true);
        expect(selectIsRouteVisible('/hr/assessment-questions')(state)).toBe(true);
      });

      it('should show admin routes in admin lens', () => {
        const state = useLensStore.getState();
        expect(selectIsRouteVisible('/admin/users')(state)).toBe(true);
      });

      it('should show skill-mapper in admin lens', () => {
        const state = useLensStore.getState();
        expect(selectIsRouteVisible('/skill-mapper')(state)).toBe(true);
      });
    });

    describe('child route matching', () => {
      it('should match child routes of visible parent routes', () => {
        useLensStore.setState({ activeLens: 'editor' });

        const state = useLensStore.getState();
        expect(selectIsRouteVisible('/hr/competencies/123')(state)).toBe(true);
        expect(selectIsRouteVisible('/hr/competencies/123/edit')(state)).toBe(true);
      });

      it('should not match child routes of hidden parent routes', () => {
        useLensStore.setState({ activeLens: 'user' });

        const state = useLensStore.getState();
        expect(selectIsRouteVisible('/admin/users/123')(state)).toBe(false);
      });
    });

    describe('route normalization', () => {
      it('should handle trailing slashes', () => {
        useLensStore.setState({ activeLens: 'editor' });

        const state = useLensStore.getState();
        expect(selectIsRouteVisible('/hr/competencies/')(state)).toBe(true);
      });

      it('should handle empty route', () => {
        useLensStore.setState({ activeLens: 'user' });

        const state = useLensStore.getState();
        expect(selectIsRouteVisible('/')(state)).toBe(false); // Root not in visible routes
      });
    });
  });

  describe('selectHasFeature', () => {
    describe('user lens features', () => {
      beforeEach(() => {
        useLensStore.setState({ activeLens: 'user' });
      });

      it('should have view-profile feature', () => {
        const state = useLensStore.getState();
        expect(selectHasFeature('view-profile')(state)).toBe(true);
      });

      it('should have take-tests feature', () => {
        const state = useLensStore.getState();
        expect(selectHasFeature('take-tests')(state)).toBe(true);
      });

      it('should not have edit features', () => {
        const state = useLensStore.getState();
        expect(selectHasFeature('edit-competencies')(state)).toBe(false);
        expect(selectHasFeature('create-competencies')(state)).toBe(false);
        expect(selectHasFeature('delete-competencies')(state)).toBe(false);
      });

      it('should not have admin features', () => {
        const state = useLensStore.getState();
        expect(selectHasFeature('manage-users')(state)).toBe(false);
        expect(selectHasFeature('system-settings')(state)).toBe(false);
      });
    });

    describe('editor lens features', () => {
      beforeEach(() => {
        useLensStore.setState({ activeLens: 'editor' });
      });

      it('should have view features', () => {
        const state = useLensStore.getState();
        expect(selectHasFeature('view-competencies')(state)).toBe(true);
        expect(selectHasFeature('view-indicators')(state)).toBe(true);
        expect(selectHasFeature('view-questions')(state)).toBe(true);
      });

      it('should have edit features', () => {
        const state = useLensStore.getState();
        expect(selectHasFeature('edit-competencies')(state)).toBe(true);
        expect(selectHasFeature('create-competencies')(state)).toBe(true);
        expect(selectHasFeature('edit-indicators')(state)).toBe(true);
        expect(selectHasFeature('create-indicators')(state)).toBe(true);
      });

      it('should not have delete features', () => {
        const state = useLensStore.getState();
        expect(selectHasFeature('delete-competencies')(state)).toBe(false);
        expect(selectHasFeature('delete-indicators')(state)).toBe(false);
      });

      it('should not have admin features', () => {
        const state = useLensStore.getState();
        expect(selectHasFeature('manage-users')(state)).toBe(false);
        expect(selectHasFeature('system-settings')(state)).toBe(false);
      });
    });

    describe('admin lens features', () => {
      beforeEach(() => {
        useLensStore.setState({ activeLens: 'admin' });
      });

      it('should have all view features', () => {
        const state = useLensStore.getState();
        expect(selectHasFeature('view-competencies')(state)).toBe(true);
        expect(selectHasFeature('view-indicators')(state)).toBe(true);
        expect(selectHasFeature('view-questions')(state)).toBe(true);
      });

      it('should have all CRUD features', () => {
        const state = useLensStore.getState();
        expect(selectHasFeature('edit-competencies')(state)).toBe(true);
        expect(selectHasFeature('create-competencies')(state)).toBe(true);
        expect(selectHasFeature('delete-competencies')(state)).toBe(true);
        expect(selectHasFeature('edit-indicators')(state)).toBe(true);
        expect(selectHasFeature('create-indicators')(state)).toBe(true);
        expect(selectHasFeature('delete-indicators')(state)).toBe(true);
      });

      it('should have admin-specific features', () => {
        const state = useLensStore.getState();
        expect(selectHasFeature('manage-users')(state)).toBe(true);
        expect(selectHasFeature('system-settings')(state)).toBe(true);
      });
    });

    it('should return false for non-existent features', () => {
      useLensStore.setState({ activeLens: 'admin' });

      const state = useLensStore.getState();
      expect(selectHasFeature('non-existent-feature')(state)).toBe(false);
    });
  });

  describe('selectActiveLens', () => {
    it('should return the active lens', () => {
      useLensStore.setState({ activeLens: 'editor' });

      const state = useLensStore.getState();
      expect(selectActiveLens(state)).toBe('editor');
    });

    it('should update when lens changes', () => {
      useLensStore.setState({ activeLens: 'user' });
      expect(selectActiveLens(useLensStore.getState())).toBe('user');

      useLensStore.setState({ activeLens: 'admin' });
      expect(selectActiveLens(useLensStore.getState())).toBe('admin');
    });
  });

  describe('selectUserRole', () => {
    it('should return the user role', () => {
      useLensStore.setState({ userRole: UserRole.ADMIN });

      const state = useLensStore.getState();
      expect(selectUserRole(state)).toBe(UserRole.ADMIN);
    });

    it('should return default USER role', () => {
      const state = useLensStore.getState();
      expect(selectUserRole(state)).toBe(UserRole.USER);
    });
  });

  describe('selectIsInitialized', () => {
    it('should return false by default', () => {
      const state = useLensStore.getState();
      expect(selectIsInitialized(state)).toBe(false);
    });

    it('should return true after initialization', () => {
      useLensStore.setState({ isInitialized: true });

      const state = useLensStore.getState();
      expect(selectIsInitialized(state)).toBe(true);
    });
  });

  describe('selectIsHydrated', () => {
    it('should return false by default', () => {
      const state = useLensStore.getState();
      expect(selectIsHydrated(state)).toBe(false);
    });

    it('should return true after hydration', () => {
      useLensStore.setState({ isHydrated: true });

      const state = useLensStore.getState();
      expect(selectIsHydrated(state)).toBe(true);
    });
  });

  describe('selectIsReady', () => {
    it('should return false when neither initialized nor hydrated', () => {
      useLensStore.setState({ isInitialized: false, isHydrated: false });

      const state = useLensStore.getState();
      expect(selectIsReady(state)).toBe(false);
    });

    it('should return false when only initialized', () => {
      useLensStore.setState({ isInitialized: true, isHydrated: false });

      const state = useLensStore.getState();
      expect(selectIsReady(state)).toBe(false);
    });

    it('should return false when only hydrated', () => {
      useLensStore.setState({ isInitialized: false, isHydrated: true });

      const state = useLensStore.getState();
      expect(selectIsReady(state)).toBe(false);
    });

    it('should return true when both initialized and hydrated', () => {
      useLensStore.setState({ isInitialized: true, isHydrated: true });

      const state = useLensStore.getState();
      expect(selectIsReady(state)).toBe(true);
    });
  });
});

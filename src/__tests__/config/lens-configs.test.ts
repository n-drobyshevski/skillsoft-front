/**
 * Tests for lens-configs
 * Tests lens configuration validation and structure
 */
import { describe, it, expect } from 'vitest';
import { LENS_CONFIGS, getLensConfig, type LensConfig } from '@/config/lens-configs';
import type { LensType } from '@/store/lens-store';

describe('LENS_CONFIGS', () => {
  describe('Structure', () => {
    it('should define three lens types', () => {
      expect(Object.keys(LENS_CONFIGS)).toHaveLength(3);
      expect(LENS_CONFIGS.user).toBeDefined();
      expect(LENS_CONFIGS.editor).toBeDefined();
      expect(LENS_CONFIGS.admin).toBeDefined();
    });

    it('should have consistent structure for all lenses', () => {
      const requiredFields: (keyof LensConfig)[] = [
        'id',
        'name',
        'description',
        'icon',
        'color',
        'bgColor',
        'borderColor',
        'visibleRoutes',
        'dashboardWidgets',
        'features',
      ];

      Object.values(LENS_CONFIGS).forEach(config => {
        requiredFields.forEach(field => {
          expect(config[field]).toBeDefined();
        });
      });
    });
  });

  describe('User Lens', () => {
    const userConfig = LENS_CONFIGS.user;

    it('should have correct id', () => {
      expect(userConfig.id).toBe('user');
    });

    it('should have Russian name', () => {
      expect(userConfig.name).toBe('Личное');
    });

    it('should have Russian description', () => {
      expect(userConfig.description).toBe('Ваш профиль и настройки');
    });

    it('should have user icon', () => {
      expect(userConfig.icon).toBe('user');
    });

    it('should have emerald color theme', () => {
      expect(userConfig.color).toContain('emerald');
      expect(userConfig.bgColor).toContain('emerald');
    });

    describe('Visible Routes', () => {
      it('should include dashboard', () => {
        expect(userConfig.visibleRoutes).toContain('/dashboard');
      });

      it('should include my-tests', () => {
        expect(userConfig.visibleRoutes).toContain('/my-tests');
      });

      it('should include test-templates', () => {
        expect(userConfig.visibleRoutes).toContain('/test-templates');
      });

      it('should not include HR routes', () => {
        expect(userConfig.visibleRoutes).not.toContain('/hr/competencies');
        expect(userConfig.visibleRoutes).not.toContain('/hr/behavioral-indicators');
        expect(userConfig.visibleRoutes).not.toContain('/hr/assessment-questions');
      });

      it('should not include admin routes', () => {
        expect(userConfig.visibleRoutes).not.toContain('/admin/users');
      });
    });

    describe('Features', () => {
      it('should have view-profile feature', () => {
        expect(userConfig.features).toContain('view-profile');
      });

      it('should have take-tests feature', () => {
        expect(userConfig.features).toContain('take-tests');
      });

      it('should not have edit features', () => {
        expect(userConfig.features).not.toContain('edit-competencies');
        expect(userConfig.features).not.toContain('create-competencies');
        expect(userConfig.features).not.toContain('delete-competencies');
      });
    });

    describe('Dashboard Widgets', () => {
      it('should include my-progress', () => {
        expect(userConfig.dashboardWidgets).toContain('my-progress');
      });

      it('should include recent-activity', () => {
        expect(userConfig.dashboardWidgets).toContain('recent-activity');
      });
    });
  });

  describe('Editor Lens', () => {
    const editorConfig = LENS_CONFIGS.editor;

    it('should have correct id', () => {
      expect(editorConfig.id).toBe('editor');
    });

    it('should have Russian name', () => {
      expect(editorConfig.name).toBe('Контент');
    });

    it('should have edit icon', () => {
      expect(editorConfig.icon).toBe('edit');
    });

    it('should have blue color theme', () => {
      expect(editorConfig.color).toContain('blue');
      expect(editorConfig.bgColor).toContain('blue');
    });

    describe('Visible Routes', () => {
      it('should include dashboard', () => {
        expect(editorConfig.visibleRoutes).toContain('/dashboard');
      });

      it('should include test-templates', () => {
        expect(editorConfig.visibleRoutes).toContain('/test-templates');
      });

      it('should include all HR routes', () => {
        expect(editorConfig.visibleRoutes).toContain('/hr/competencies');
        expect(editorConfig.visibleRoutes).toContain('/hr/behavioral-indicators');
        expect(editorConfig.visibleRoutes).toContain('/hr/assessment-questions');
      });

      it('should include skill-mapper', () => {
        expect(editorConfig.visibleRoutes).toContain('/skill-mapper');
      });

      it('should not include admin routes', () => {
        expect(editorConfig.visibleRoutes).not.toContain('/admin/users');
      });
    });

    describe('Features', () => {
      it('should have view features', () => {
        expect(editorConfig.features).toContain('view-competencies');
        expect(editorConfig.features).toContain('view-indicators');
        expect(editorConfig.features).toContain('view-questions');
      });

      it('should have edit features', () => {
        expect(editorConfig.features).toContain('edit-competencies');
        expect(editorConfig.features).toContain('edit-indicators');
        expect(editorConfig.features).toContain('edit-questions');
      });

      it('should have create features', () => {
        expect(editorConfig.features).toContain('create-competencies');
        expect(editorConfig.features).toContain('create-indicators');
        expect(editorConfig.features).toContain('create-questions');
      });

      it('should not have delete features', () => {
        expect(editorConfig.features).not.toContain('delete-competencies');
        expect(editorConfig.features).not.toContain('delete-indicators');
        expect(editorConfig.features).not.toContain('delete-questions');
      });

      it('should not have admin features', () => {
        expect(editorConfig.features).not.toContain('manage-users');
        expect(editorConfig.features).not.toContain('system-settings');
      });
    });

    describe('Dashboard Widgets', () => {
      it('should include content management widgets', () => {
        expect(editorConfig.dashboardWidgets).toContain('content-stats');
        expect(editorConfig.dashboardWidgets).toContain('pending-reviews');
        expect(editorConfig.dashboardWidgets).toContain('recent-edits');
      });
    });
  });

  describe('Admin Lens', () => {
    const adminConfig = LENS_CONFIGS.admin;

    it('should have correct id', () => {
      expect(adminConfig.id).toBe('admin');
    });

    it('should have Russian name', () => {
      expect(adminConfig.name).toBe('Админ');
    });

    it('should have shield icon', () => {
      expect(adminConfig.icon).toBe('shield');
    });

    it('should have violet color theme', () => {
      expect(adminConfig.color).toContain('violet');
      expect(adminConfig.bgColor).toContain('violet');
    });

    describe('Visible Routes', () => {
      it('should include all platform routes', () => {
        expect(adminConfig.visibleRoutes).toContain('/dashboard');
        expect(adminConfig.visibleRoutes).toContain('/test-templates');
      });

      it('should include all HR routes', () => {
        expect(adminConfig.visibleRoutes).toContain('/hr/competencies');
        expect(adminConfig.visibleRoutes).toContain('/hr/behavioral-indicators');
        expect(adminConfig.visibleRoutes).toContain('/hr/assessment-questions');
      });

      it('should include admin routes', () => {
        expect(adminConfig.visibleRoutes).toContain('/admin/users');
      });

      it('should include skill-mapper', () => {
        expect(adminConfig.visibleRoutes).toContain('/skill-mapper');
      });

      it('should have the most routes of all lenses', () => {
        expect(adminConfig.visibleRoutes.length).toBeGreaterThan(
          LENS_CONFIGS.editor.visibleRoutes.length
        );
        expect(adminConfig.visibleRoutes.length).toBeGreaterThan(
          LENS_CONFIGS.user.visibleRoutes.length
        );
      });
    });

    describe('Features', () => {
      it('should have all CRUD features for competencies', () => {
        expect(adminConfig.features).toContain('view-competencies');
        expect(adminConfig.features).toContain('edit-competencies');
        expect(adminConfig.features).toContain('create-competencies');
        expect(adminConfig.features).toContain('delete-competencies');
      });

      it('should have all CRUD features for indicators', () => {
        expect(adminConfig.features).toContain('view-indicators');
        expect(adminConfig.features).toContain('edit-indicators');
        expect(adminConfig.features).toContain('create-indicators');
        expect(adminConfig.features).toContain('delete-indicators');
      });

      it('should have all CRUD features for questions', () => {
        expect(adminConfig.features).toContain('view-questions');
        expect(adminConfig.features).toContain('edit-questions');
        expect(adminConfig.features).toContain('create-questions');
        expect(adminConfig.features).toContain('delete-questions');
      });

      it('should have admin-specific features', () => {
        expect(adminConfig.features).toContain('manage-users');
        expect(adminConfig.features).toContain('system-settings');
      });

      it('should have the most features of all lenses', () => {
        expect(adminConfig.features.length).toBeGreaterThan(
          LENS_CONFIGS.editor.features.length
        );
        expect(adminConfig.features.length).toBeGreaterThan(
          LENS_CONFIGS.user.features.length
        );
      });
    });

    describe('Dashboard Widgets', () => {
      it('should include admin-specific widgets', () => {
        expect(adminConfig.dashboardWidgets).toContain('system-stats');
        expect(adminConfig.dashboardWidgets).toContain('user-activity');
        expect(adminConfig.dashboardWidgets).toContain('security-alerts');
      });
    });
  });
});

describe('getLensConfig', () => {
  it('should return user config for user lens', () => {
    const config = getLensConfig('user');
    expect(config).toBe(LENS_CONFIGS.user);
  });

  it('should return editor config for editor lens', () => {
    const config = getLensConfig('editor');
    expect(config).toBe(LENS_CONFIGS.editor);
  });

  it('should return admin config for admin lens', () => {
    const config = getLensConfig('admin');
    expect(config).toBe(LENS_CONFIGS.admin);
  });

  it('should default to user config for unknown lens types', () => {
    // Type cast to test default case
    const config = getLensConfig('unknown' as LensType);
    expect(config).toBe(LENS_CONFIGS.user);
  });

  it('should return stable references', () => {
    const config1 = getLensConfig('admin');
    const config2 = getLensConfig('admin');
    expect(config1).toBe(config2);
  });
});

describe('Lens Permission Hierarchy', () => {
  it('should have admin with superset of editor routes', () => {
    const adminRoutes = new Set(LENS_CONFIGS.admin.visibleRoutes);
    const editorRoutes = LENS_CONFIGS.editor.visibleRoutes;

    editorRoutes.forEach(route => {
      expect(adminRoutes.has(route)).toBe(true);
    });
  });

  it('should have admin with superset of editor features', () => {
    const adminFeatures = new Set(LENS_CONFIGS.admin.features);
    const editorFeatures = LENS_CONFIGS.editor.features;

    editorFeatures.forEach(feature => {
      expect(adminFeatures.has(feature)).toBe(true);
    });
  });

  it('should give admin delete privileges that editor lacks', () => {
    expect(LENS_CONFIGS.admin.features).toContain('delete-competencies');
    expect(LENS_CONFIGS.editor.features).not.toContain('delete-competencies');
  });

  it('should give admin user management that editor lacks', () => {
    expect(LENS_CONFIGS.admin.features).toContain('manage-users');
    expect(LENS_CONFIGS.editor.features).not.toContain('manage-users');
  });
});

describe('Color Theme Consistency', () => {
  it('should have dark mode variants for all colors', () => {
    Object.values(LENS_CONFIGS).forEach(config => {
      expect(config.color).toContain('dark:');
      expect(config.bgColor).toContain('dark:');
      expect(config.borderColor).toContain('dark:');
    });
  });

  it('should use consistent color families', () => {
    expect(LENS_CONFIGS.user.color).toContain('emerald');
    expect(LENS_CONFIGS.editor.color).toContain('blue');
    expect(LENS_CONFIGS.admin.color).toContain('violet');
  });

  it('should have matching bg and text colors', () => {
    // User: emerald
    expect(LENS_CONFIGS.user.color).toContain('emerald');
    expect(LENS_CONFIGS.user.bgColor).toContain('emerald');

    // Editor: blue
    expect(LENS_CONFIGS.editor.color).toContain('blue');
    expect(LENS_CONFIGS.editor.bgColor).toContain('blue');

    // Admin: violet
    expect(LENS_CONFIGS.admin.color).toContain('violet');
    expect(LENS_CONFIGS.admin.bgColor).toContain('violet');
  });
});

describe('Icon Mappings', () => {
  it('should use distinct icons for each lens', () => {
    const icons = new Set([
      LENS_CONFIGS.user.icon,
      LENS_CONFIGS.editor.icon,
      LENS_CONFIGS.admin.icon,
    ]);

    expect(icons.size).toBe(3);
  });

  it('should use appropriate icon names', () => {
    expect(LENS_CONFIGS.user.icon).toBe('user');
    expect(LENS_CONFIGS.editor.icon).toBe('edit');
    expect(LENS_CONFIGS.admin.icon).toBe('shield');
  });
});

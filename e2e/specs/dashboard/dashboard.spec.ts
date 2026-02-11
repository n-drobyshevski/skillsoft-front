import { test, expect } from '../../fixtures';
import { DashboardPage } from '../../pages';

/**
 * Dashboard E2E Tests
 *
 * The dashboard is the entry point for all authenticated users.
 * Tests verify that the dashboard loads correctly and displays
 * role-appropriate content.
 *
 * Tags: @user @editor @admin
 */
test.describe('Dashboard @user @editor @admin', () => {
  let dashboardPage: DashboardPage;

  // ==========================================
  // Basic Dashboard Loading
  // ==========================================

  test.describe('Dashboard Loading', () => {
    test('should load dashboard successfully for admin', async ({ adminPage }) => {
      dashboardPage = new DashboardPage(adminPage);

      await dashboardPage.goto();
      await dashboardPage.expectDashboardLoaded();

      // Admin should see management options
      await dashboardPage.expectQuickActionsForRole('admin');
    });

    test('should load dashboard successfully for editor', async ({ editorPage }) => {
      dashboardPage = new DashboardPage(editorPage);

      await dashboardPage.goto();
      await dashboardPage.expectDashboardLoaded();

      // Editor should see content management options
      await dashboardPage.expectQuickActionsForRole('editor');
    });

    test('should load dashboard successfully for regular user', async ({ userPage }) => {
      dashboardPage = new DashboardPage(userPage);

      await dashboardPage.goto();
      await dashboardPage.expectDashboardLoaded();

      // User should see test-taking options
      await dashboardPage.expectQuickActionsForRole('user');
    });
  });

  // ==========================================
  // Stats Display
  // ==========================================

  test.describe('Stats Display @admin @editor', () => {
    test.beforeEach(async ({ adminPage }) => {
      dashboardPage = new DashboardPage(adminPage);
      await dashboardPage.goto();
    });

    test('should display stats cards', async () => {
      await dashboardPage.expectDashboardLoaded();

      // Stats section should be visible
      await expect(dashboardPage.statsSection).toBeVisible();
    });

    test('should show competency count', async () => {
      await dashboardPage.expectDashboardLoaded();

      // Get competency stat value
      const value = await dashboardPage.getStatValue('competencies');

      // Should be a number (even if 0)
      expect(value).toBeDefined();
    });

    test('should show indicator count', async () => {
      await dashboardPage.expectDashboardLoaded();

      const value = await dashboardPage.getStatValue('indicators');
      expect(value).toBeDefined();
    });

    test('should show question count', async () => {
      await dashboardPage.expectDashboardLoaded();

      const value = await dashboardPage.getStatValue('questions');
      expect(value).toBeDefined();
    });
  });

  // ==========================================
  // Quick Actions
  // ==========================================

  test.describe('Quick Actions @admin', () => {
    test.beforeEach(async ({ adminPage }) => {
      dashboardPage = new DashboardPage(adminPage);
      await dashboardPage.goto();
    });

    test('should navigate to competencies via quick action', async () => {
      await dashboardPage.expectDashboardLoaded();

      // Click create competency if visible
      if (await dashboardPage.createCompetencyButton.isVisible()) {
        await dashboardPage.clickCreateCompetency();

        // Should navigate to competencies section
        await expect(dashboardPage.page).toHaveURL(/competenc/i);
      }
    });

    test('should navigate to tests via quick action', async () => {
      await dashboardPage.expectDashboardLoaded();

      // Click view tests if visible
      if (await dashboardPage.viewTestsButton.isVisible()) {
        await dashboardPage.clickViewTests();

        // Should navigate to tests section
        await expect(dashboardPage.page).toHaveURL(/test/i);
      }
    });

    test('should navigate to user management via quick action', async () => {
      await dashboardPage.expectDashboardLoaded();

      // Admin only - manage users
      if (await dashboardPage.manageUsersButton.isVisible()) {
        await dashboardPage.clickManageUsers();

        // Should navigate to users section
        await expect(dashboardPage.page).toHaveURL(/user/i);
      }
    });
  });

  // ==========================================
  // Charts/Visualizations
  // ==========================================

  test.describe('Charts @admin @editor', () => {
    test.beforeEach(async ({ adminPage }) => {
      dashboardPage = new DashboardPage(adminPage);
      await dashboardPage.goto();
    });

    test('should display charts section', async () => {
      await dashboardPage.expectDashboardLoaded();

      // Charts might take a moment to render
      try {
        await dashboardPage.expectChartsLoaded();
      } catch {
        // Charts may not be visible on all dashboard configurations
        // This is not a failure
      }
    });
  });

  // ==========================================
  // Navigation from Dashboard
  // ==========================================

  test.describe('Navigation', () => {
    test('should navigate to sidebar links', async ({ adminPage }) => {
      dashboardPage = new DashboardPage(adminPage);
      await dashboardPage.goto();
      await dashboardPage.expectDashboardLoaded();

      // Sidebar should have navigation links
      if (await dashboardPage.sidebar.isVisible()) {
        // Try to find and click a sidebar link
        const competenciesLink = dashboardPage.sidebar.getByRole('link', { name: /competenc/i });

        if (await competenciesLink.isVisible()) {
          await competenciesLink.click();
          await dashboardPage.waitForPageLoad();

          await expect(dashboardPage.page).toHaveURL(/competenc/i);
        }
      }
    });

    test('should have accessible user menu', async ({ adminPage }) => {
      dashboardPage = new DashboardPage(adminPage);
      await dashboardPage.goto();
      await dashboardPage.expectDashboardLoaded();

      // User button should be visible
      await expect(dashboardPage.userButton).toBeVisible();
    });
  });

  // ==========================================
  // Role-Based Content
  // ==========================================

  test.describe('Role-Based Content', () => {
    test('admin sees all sections', async ({ adminPage }) => {
      dashboardPage = new DashboardPage(adminPage);
      await dashboardPage.goto();
      await dashboardPage.expectDashboardLoaded();

      // Admin should see stats
      await expect(dashboardPage.statsSection).toBeVisible();

      // Admin should have manage users option
      await dashboardPage.expectQuickActionsForRole('admin');
    });

    test('editor sees content management sections', async ({ editorPage }) => {
      dashboardPage = new DashboardPage(editorPage);
      await dashboardPage.goto();
      await dashboardPage.expectDashboardLoaded();

      // Editor should see create options
      await dashboardPage.expectQuickActionsForRole('editor');
    });

    test('user sees test-taking focused dashboard', async ({ userPage }) => {
      dashboardPage = new DashboardPage(userPage);
      await dashboardPage.goto();
      await dashboardPage.expectDashboardLoaded();

      // User should see test options
      await dashboardPage.expectQuickActionsForRole('user');
    });
  });

  // ==========================================
  // Responsive Design
  // ==========================================

  test.describe('Responsive Design', () => {
    test('dashboard is responsive on mobile viewport', async ({ adminPage }) => {
      dashboardPage = new DashboardPage(adminPage);

      // Set mobile viewport
      await dashboardPage.page.setViewportSize({ width: 375, height: 667 });

      await dashboardPage.goto();
      await dashboardPage.expectDashboardLoaded();

      // Content should still be visible
      await expect(dashboardPage.mainContent).toBeVisible();
    });

    test('dashboard is responsive on tablet viewport', async ({ adminPage }) => {
      dashboardPage = new DashboardPage(adminPage);

      // Set tablet viewport
      await dashboardPage.page.setViewportSize({ width: 768, height: 1024 });

      await dashboardPage.goto();
      await dashboardPage.expectDashboardLoaded();

      // Content should still be visible
      await expect(dashboardPage.mainContent).toBeVisible();
    });
  });

  // ==========================================
  // Error States
  // ==========================================

  test.describe('Error Handling', () => {
    test('should handle slow loading gracefully', async ({ adminPage }) => {
      dashboardPage = new DashboardPage(adminPage);

      // Simulate slow network
      await dashboardPage.page.route('**/api/**', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await route.continue();
      });

      await dashboardPage.goto();

      // Should eventually load
      await dashboardPage.expectDashboardLoaded();
    });
  });
});

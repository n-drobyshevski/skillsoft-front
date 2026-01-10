import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Team Management Page Object
 *
 * Handles interactions with the team management pages:
 * - /admin/teams (team listing)
 * - /admin/teams/new (create team)
 * - /admin/teams/[teamId] (team details)
 * - /admin/teams/[teamId]/edit (edit team)
 */
export class TeamManagementPage extends BasePage {
  // ==========================================
  // Locators - Page Header & Navigation
  // ==========================================

  /** Main page heading */
  readonly pageTitle: Locator;

  /** Button to create a new team */
  readonly createTeamButton: Locator;

  /** Back button for navigation */
  readonly backButton: Locator;

  // ==========================================
  // Locators - Teams List/Table
  // ==========================================

  /** Container for the teams table */
  readonly teamsTable: Locator;

  /** Individual team rows in the table */
  readonly teamRows: Locator;

  /** Empty state when no teams exist */
  readonly emptyState: Locator;

  /** Table header row */
  readonly tableHeader: Locator;

  // ==========================================
  // Locators - Search & Filters
  // ==========================================

  /** Search input for filtering teams */
  readonly searchInput: Locator;

  /** Status filter tabs container */
  readonly statusFilterTabs: Locator;

  /** All status filter tab */
  readonly allStatusTab: Locator;

  /** Draft status filter tab */
  readonly draftStatusTab: Locator;

  /** Active status filter tab */
  readonly activeStatusTab: Locator;

  /** Archived status filter tab */
  readonly archivedStatusTab: Locator;

  /** Column visibility dropdown trigger */
  readonly columnToggleButton: Locator;

  // ==========================================
  // Locators - Team Form (Create/Edit)
  // ==========================================

  /** Team name input field */
  readonly teamNameInput: Locator;

  /** Team description textarea */
  readonly teamDescriptionInput: Locator;

  /** Member search input in form */
  readonly memberSearchInput: Locator;

  /** Search results container for member search */
  readonly memberSearchResults: Locator;

  /** Selected members list in form */
  readonly selectedMembersList: Locator;

  /** Leader selection dropdown */
  readonly leaderSelect: Locator;

  /** Activate immediately toggle switch */
  readonly activateImmediatelySwitch: Locator;

  /** Form submit/save button */
  readonly saveButton: Locator;

  /** Form cancel button */
  readonly cancelButton: Locator;

  // ==========================================
  // Locators - Team Detail Page
  // ==========================================

  /** Team hero/profile card section */
  readonly teamHeroCard: Locator;

  /** Edit team button on detail page */
  readonly editTeamButton: Locator;

  /** More actions dropdown trigger */
  readonly moreActionsButton: Locator;

  /** Add members button/menu item */
  readonly addMembersButton: Locator;

  /** Activate team button/menu item */
  readonly activateTeamButton: Locator;

  /** Archive team button/menu item */
  readonly archiveTeamButton: Locator;

  /** Team tabs navigation */
  readonly teamTabs: Locator;

  /** Members tab trigger */
  readonly membersTab: Locator;

  /** Profile tab trigger */
  readonly profileTab: Locator;

  // ==========================================
  // Locators - Team Members Management
  // ==========================================

  /** Members grid container */
  readonly membersGrid: Locator;

  /** Individual member cards */
  readonly memberCards: Locator;

  /** Search input on members tab */
  readonly memberListSearchInput: Locator;

  /** Add member button on members tab */
  readonly addMemberButton: Locator;

  /** Member count display */
  readonly memberCountDisplay: Locator;

  // ==========================================
  // Locators - Add Member Dialog
  // ==========================================

  /** Add member dialog container */
  readonly addMemberDialog: Locator;

  /** Search input in add member dialog */
  readonly addMemberSearchInput: Locator;

  /** User list in add member dialog */
  readonly addMemberUserList: Locator;

  /** Selected count badge in dialog */
  readonly selectedCountBadge: Locator;

  /** Clear selection button in dialog */
  readonly clearSelectionButton: Locator;

  /** Add members submit button in dialog */
  readonly addMembersSubmitButton: Locator;

  /** Cancel button in add member dialog */
  readonly addMemberCancelButton: Locator;

  // ==========================================
  // Locators - Confirmation Dialogs
  // ==========================================

  /** Confirmation dialog container */
  readonly confirmationDialog: Locator;

  /** Confirm action button in dialog */
  readonly confirmActionButton: Locator;

  /** Cancel action button in dialog */
  readonly cancelActionButton: Locator;

  // ==========================================
  // Locators - Team Drawer (Quick View)
  // ==========================================

  /** Team drawer/sheet container */
  readonly teamDrawer: Locator;

  /** View details link in drawer */
  readonly viewDetailsLink: Locator;

  /** Edit team link in drawer */
  readonly editTeamLink: Locator;

  // ==========================================
  // Locators - Stats Cards
  // ==========================================

  /** Total teams stat card */
  readonly totalTeamsStat: Locator;

  /** Average team size stat card */
  readonly avgTeamSizeStat: Locator;

  /** Draft teams count stat card */
  readonly draftTeamsStat: Locator;

  /** Active teams count stat card */
  readonly activeTeamsStat: Locator;

  /** Archived teams count stat card */
  readonly archivedTeamsStat: Locator;

  constructor(page: Page) {
    super(page);

    // Page header & navigation
    this.pageTitle = page.getByRole('heading', { level: 1 });
    this.createTeamButton = page.getByRole('link', { name: /create|new|создать/i }).first();
    this.backButton = page.getByRole('button', { name: /back|назад/i }).first();

    // Teams list/table
    this.teamsTable = page.locator('table, [role="table"]').first();
    this.teamRows = page.locator('tbody tr, [role="row"]:not(:first-child)');
    this.emptyState = page.locator('[data-testid="empty-state"], .empty-state, :text("No teams")').first();
    this.tableHeader = page.locator('thead, [role="rowgroup"]:first-child').first();

    // Search & filters
    this.searchInput = page.getByPlaceholder(/search|поиск/i).first();
    this.statusFilterTabs = page.locator('[role="tablist"]').first();
    this.allStatusTab = page.getByRole('tab', { name: /all|все/i });
    this.draftStatusTab = page.getByRole('tab', { name: /draft|черновик/i });
    this.activeStatusTab = page.getByRole('tab', { name: /active|активн/i });
    this.archivedStatusTab = page.getByRole('tab', { name: /archived|архив/i });
    this.columnToggleButton = page.getByRole('button', { name: /columns|столбцы|view/i }).first();

    // Team form (create/edit)
    this.teamNameInput = page.getByPlaceholder(/team name|название команды/i).first();
    this.teamDescriptionInput = page.locator('textarea').first();
    this.memberSearchInput = page.locator('input[placeholder*="search" i], input[placeholder*="поиск" i]').nth(1);
    this.memberSearchResults = page.locator('[data-testid="member-search-results"], .search-results').first();
    this.selectedMembersList = page.locator('[data-testid="selected-members"], .selected-members').first();
    this.leaderSelect = page.locator('[data-testid="leader-select"], [role="combobox"]').first();
    this.activateImmediatelySwitch = page.locator('[role="switch"]').first();
    this.saveButton = page.getByRole('button', { name: /save|create|сохранить|создать/i }).first();
    this.cancelButton = page.getByRole('button', { name: /cancel|отмена/i }).first();

    // Team detail page
    this.teamHeroCard = page.locator('.card, [data-testid="team-hero"]').first();
    this.editTeamButton = page.getByRole('link', { name: /edit|редактировать/i }).first();
    this.moreActionsButton = page.getByRole('button', { name: /more|еще/i }).first();
    this.addMembersButton = page.getByRole('menuitem', { name: /add member|добавить/i });
    this.activateTeamButton = page.getByRole('menuitem', { name: /activate|активировать/i });
    this.archiveTeamButton = page.getByRole('menuitem', { name: /archive|архивировать/i });
    this.teamTabs = page.locator('[role="tablist"]').first();
    this.membersTab = page.getByRole('tab', { name: /members|участники/i });
    this.profileTab = page.getByRole('tab', { name: /profile|профиль/i });

    // Team members management
    this.membersGrid = page.locator('[data-testid="members-grid"], .members-grid, .grid').first();
    this.memberCards = page.locator('[data-testid="member-card"], .member-card, .card:has([data-testid="member-avatar"])');
    this.memberListSearchInput = page.getByPlaceholder(/search member|поиск участник/i).first();
    this.addMemberButton = page.getByRole('button', { name: /add member|добавить участника/i }).first();
    this.memberCountDisplay = page.locator('[data-testid="member-count"], :text-matches("\\\\d+ member|\\\\d+ участник")').first();

    // Add member dialog
    this.addMemberDialog = page.locator('[role="dialog"]:has-text("Add"), [role="dialog"]:has-text("Добавить")');
    this.addMemberSearchInput = this.addMemberDialog.locator('input[type="text"]').first();
    this.addMemberUserList = this.addMemberDialog.locator('[data-testid="user-list"], .user-list').first();
    this.selectedCountBadge = this.addMemberDialog.locator('.badge, [data-testid="selected-count"]').first();
    this.clearSelectionButton = this.addMemberDialog.getByRole('button', { name: /clear|очистить/i });
    this.addMembersSubmitButton = this.addMemberDialog.getByRole('button', { name: /add|добавить/i }).last();
    this.addMemberCancelButton = this.addMemberDialog.getByRole('button', { name: /cancel|отмена/i });

    // Confirmation dialogs
    this.confirmationDialog = page.locator('[role="alertdialog"], [data-testid="confirm-dialog"]');
    this.confirmActionButton = this.confirmationDialog.getByRole('button', { name: /confirm|yes|да|подтвердить/i });
    this.cancelActionButton = this.confirmationDialog.getByRole('button', { name: /cancel|no|нет|отмена/i });

    // Team drawer (quick view)
    this.teamDrawer = page.locator('[data-state="open"][role="dialog"], [data-testid="team-drawer"]');
    this.viewDetailsLink = this.teamDrawer.getByRole('link', { name: /view details|подробнее/i }).first();
    this.editTeamLink = this.teamDrawer.getByRole('link', { name: /edit|редактировать/i }).first();

    // Stats cards
    this.totalTeamsStat = page.locator('.card:has-text("Total"), .card:has-text("Всего")').first();
    this.avgTeamSizeStat = page.locator('.card:has-text("Average"), .card:has-text("Средн")').first();
    this.draftTeamsStat = page.locator('.card:has-text("Draft"), .card:has-text("Черновик")').first();
    this.activeTeamsStat = page.locator('.card:has-text("Active"), .card:has-text("Активн")').first();
    this.archivedTeamsStat = page.locator('.card:has-text("Archived"), .card:has-text("Архив")').first();
  }

  // ==========================================
  // Navigation Methods
  // ==========================================

  /**
   * Navigate to the teams list page.
   */
  async goto(): Promise<void> {
    await this.navigateTo('/admin/teams');
  }

  /**
   * Navigate to a specific team's detail page.
   * @param teamId - The UUID of the team
   */
  async gotoTeam(teamId: string): Promise<void> {
    await this.navigateTo(`/admin/teams/${teamId}`);
  }

  /**
   * Navigate to the create team page.
   */
  async gotoCreateTeam(): Promise<void> {
    await this.navigateTo('/admin/teams/new');
  }

  /**
   * Navigate to edit a specific team.
   * @param teamId - The UUID of the team
   */
  async gotoEditTeam(teamId: string): Promise<void> {
    await this.navigateTo(`/admin/teams/${teamId}/edit`);
  }

  // ==========================================
  // Team CRUD Methods
  // ==========================================

  /**
   * Create a new team by filling out the form and submitting.
   * @param name - The team name (required)
   * @param description - Optional team description
   * @param options - Additional options for team creation
   */
  async createTeam(
    name: string,
    description?: string,
    options?: {
      memberNames?: string[];
      leaderName?: string;
      activateImmediately?: boolean;
    }
  ): Promise<void> {
    // Fill team name
    await this.teamNameInput.fill(name);

    // Fill description if provided
    if (description) {
      await this.teamDescriptionInput.fill(description);
    }

    // Add members if provided
    if (options?.memberNames?.length) {
      for (const memberName of options.memberNames) {
        await this.searchAndAddMemberInForm(memberName);
      }
    }

    // Select leader if provided
    if (options?.leaderName) {
      await this.leaderSelect.click();
      await this.page.getByRole('option', { name: new RegExp(options.leaderName, 'i') }).click();
    }

    // Toggle activate immediately if needed
    if (options?.activateImmediately) {
      await this.activateImmediatelySwitch.click();
    }

    // Submit the form
    await this.saveButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Edit an existing team's basic information.
   * @param teamId - The UUID of the team to edit
   * @param updates - The fields to update
   */
  async editTeam(
    teamId: string,
    updates: { name?: string; description?: string }
  ): Promise<void> {
    await this.gotoEditTeam(teamId);

    if (updates.name) {
      await this.teamNameInput.clear();
      await this.teamNameInput.fill(updates.name);
    }

    if (updates.description !== undefined) {
      await this.teamDescriptionInput.clear();
      if (updates.description) {
        await this.teamDescriptionInput.fill(updates.description);
      }
    }

    await this.saveButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Archive a team (soft delete).
   * @param teamId - The UUID of the team to archive
   */
  async archiveTeam(teamId: string): Promise<void> {
    await this.gotoTeam(teamId);
    await this.moreActionsButton.click();
    await this.archiveTeamButton.click();
    await this.waitForDialog();
    await this.confirmActionButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Activate a draft team.
   * @param teamId - The UUID of the team to activate
   */
  async activateTeam(teamId: string): Promise<void> {
    await this.gotoTeam(teamId);
    await this.moreActionsButton.click();
    await this.activateTeamButton.click();
    await this.waitForDialog();
    await this.confirmActionButton.click();
    await this.waitForPageLoad();
  }

  // ==========================================
  // Search & Filter Methods
  // ==========================================

  /**
   * Search for teams by name or description.
   * @param query - The search query
   */
  async searchTeams(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.waitForLoadingComplete();
  }

  /**
   * Clear the search input.
   */
  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
    await this.waitForLoadingComplete();
  }

  /**
   * Filter teams by status using the tab filters.
   * @param status - The status to filter by
   */
  async filterByStatus(status: 'all' | 'draft' | 'active' | 'archived'): Promise<void> {
    const tabMap = {
      all: this.allStatusTab,
      draft: this.draftStatusTab,
      active: this.activeStatusTab,
      archived: this.archivedStatusTab,
    };

    await tabMap[status].click();
    await this.waitForLoadingComplete();
  }

  // ==========================================
  // Member Management Methods
  // ==========================================

  /**
   * Search and add a member using the form's member search.
   * @param userName - The name of the user to search and add
   */
  private async searchAndAddMemberInForm(userName: string): Promise<void> {
    const formMemberSearch = this.page.locator('input').filter({ hasText: '' }).nth(1);
    await formMemberSearch.fill(userName);
    await this.page.waitForTimeout(500); // Wait for search debounce
    await this.page.locator(`[data-testid="user-result"], .user-result, .search-result:has-text("${userName}")`).first().click();
  }

  /**
   * Add a member to an existing team via the add member dialog.
   * @param userName - The name or email of the user to add
   */
  async addMember(userName: string): Promise<void> {
    // Open add member dialog
    await this.addMemberButton.click();
    await expect(this.addMemberDialog).toBeVisible({ timeout: 5000 });

    // Search for user
    await this.addMemberSearchInput.fill(userName);
    await this.page.waitForTimeout(500); // Wait for search debounce

    // Select the user from results
    const userRow = this.addMemberDialog.locator(`.rounded-lg:has-text("${userName}")`).first();
    await userRow.click();

    // Submit
    await this.addMembersSubmitButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Remove a member from the team.
   * @param userName - The name of the user to remove
   */
  async removeMember(userName: string): Promise<void> {
    // Find the member card and open its action menu
    const memberCard = this.memberCards.filter({ hasText: userName }).first();
    const menuButton = memberCard.getByRole('button', { name: /menu|actions/i }).first();
    await menuButton.click();

    // Click remove option
    await this.page.getByRole('menuitem', { name: /remove|удалить/i }).click();

    // Confirm the action
    await this.waitForDialog();
    await this.confirmActionButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Set a member as the team leader.
   * @param userName - The name of the user to make leader
   */
  async setLeader(userName: string): Promise<void> {
    // Find the member card and open its action menu
    const memberCard = this.memberCards.filter({ hasText: userName }).first();
    const menuButton = memberCard.getByRole('button', { name: /menu|actions/i }).first();
    await menuButton.click();

    // Click make leader option
    await this.page.getByRole('menuitem', { name: /leader|лидер/i }).click();
    await this.waitForPageLoad();
  }

  /**
   * Get the number of members displayed in the team.
   * @returns The count of visible member cards
   */
  async getMemberCount(): Promise<number> {
    await this.waitForLoadingComplete();
    return this.memberCards.count();
  }

  /**
   * Get the number of teams in the table.
   * @returns The count of team rows
   */
  async getTeamCount(): Promise<number> {
    await this.waitForLoadingComplete();
    return this.teamRows.count();
  }

  // ==========================================
  // Team List Interaction Methods
  // ==========================================

  /**
   * Get a team row by name.
   * @param teamName - The name of the team
   * @returns Locator for the team row
   */
  getTeamRow(teamName: string): Locator {
    return this.teamRows.filter({ hasText: teamName });
  }

  /**
   * Click on a team row to open the quick view drawer.
   * @param teamName - The name of the team
   */
  async openTeamDrawer(teamName: string): Promise<void> {
    await this.getTeamRow(teamName).click();
    await expect(this.teamDrawer).toBeVisible({ timeout: 5000 });
  }

  /**
   * Open the team detail page from the drawer.
   */
  async openTeamDetailsFromDrawer(): Promise<void> {
    await this.viewDetailsLink.click();
    await this.waitForPageLoad();
  }

  /**
   * Open the row action menu for a specific team.
   * @param teamName - The name of the team
   */
  async openTeamRowMenu(teamName: string): Promise<void> {
    const row = this.getTeamRow(teamName);
    const menuButton = row.getByRole('button', { name: /open menu/i }).first();
    await menuButton.click();
  }

  // ==========================================
  // Assertion Methods
  // ==========================================

  /**
   * Assert that a team exists in the teams list.
   * @param teamName - The name of the team to check
   */
  async expectTeamExists(teamName: string): Promise<void> {
    await expect(this.getTeamRow(teamName)).toBeVisible();
  }

  /**
   * Assert that a team does not exist in the teams list.
   * @param teamName - The name of the team to check
   */
  async expectTeamNotExists(teamName: string): Promise<void> {
    await expect(this.getTeamRow(teamName)).not.toBeVisible();
  }

  /**
   * Assert that a team has a specific status.
   * @param teamName - The name of the team
   * @param status - The expected status
   */
  async expectTeamStatus(teamName: string, status: 'draft' | 'active' | 'archived'): Promise<void> {
    const row = this.getTeamRow(teamName);
    const statusBadge = row.locator('.badge, [data-testid="status-badge"]').first();
    await expect(statusBadge).toHaveText(new RegExp(status, 'i'));
  }

  /**
   * Assert that a member exists in the members list.
   * @param userName - The name of the user to check
   */
  async expectMemberInList(userName: string): Promise<void> {
    const memberCard = this.memberCards.filter({ hasText: userName }).first();
    await expect(memberCard).toBeVisible();
  }

  /**
   * Assert that a member does not exist in the members list.
   * @param userName - The name of the user to check
   */
  async expectMemberNotInList(userName: string): Promise<void> {
    const memberCard = this.memberCards.filter({ hasText: userName }).first();
    await expect(memberCard).not.toBeVisible();
  }

  /**
   * Assert that a specific user is the team leader.
   * @param userName - The name of the expected leader
   */
  async expectLeader(userName: string): Promise<void> {
    // Look for the crown icon badge next to the user
    const memberCard = this.memberCards.filter({ hasText: userName }).first();
    const leaderBadge = memberCard.locator('.badge:has-text("Leader"), .badge:has-text("Лидер"), [data-testid="leader-badge"]');
    await expect(leaderBadge).toBeVisible();
  }

  /**
   * Assert the total number of members matches the expected count.
   * @param count - The expected number of members
   */
  async expectMemberCount(count: number): Promise<void> {
    await expect(this.memberCards).toHaveCount(count);
  }

  /**
   * Assert the total number of teams matches the expected count.
   * @param count - The expected number of teams
   */
  async expectTeamCount(count: number): Promise<void> {
    await expect(this.teamRows).toHaveCount(count);
  }

  /**
   * Assert that the page shows the empty state.
   */
  async expectEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
  }

  /**
   * Assert the teams page is fully loaded.
   */
  async expectPageLoaded(): Promise<void> {
    await expect(this.pageTitle).toBeVisible();
    await this.waitForLoadingComplete();
  }

  /**
   * Assert a success toast message appears.
   * @param message - Optional specific message to match
   */
  async expectSuccessMessage(message?: string | RegExp): Promise<void> {
    if (message) {
      await this.waitForToast(message);
    } else {
      await this.waitForSuccessToast();
    }
  }

  /**
   * Assert an error toast message appears.
   * @param message - Optional specific message to match
   */
  async expectErrorMessage(message?: string | RegExp): Promise<void> {
    if (message) {
      await this.waitForToast(message);
    } else {
      await this.waitForErrorToast();
    }
  }

  /**
   * Assert that the add member dialog is visible.
   */
  async expectAddMemberDialogVisible(): Promise<void> {
    await expect(this.addMemberDialog).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert that the confirmation dialog is visible.
   */
  async expectConfirmationDialogVisible(): Promise<void> {
    await expect(this.confirmationDialog).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert that the team drawer is visible.
   */
  async expectTeamDrawerVisible(): Promise<void> {
    await expect(this.teamDrawer).toBeVisible({ timeout: 5000 });
  }

  // ==========================================
  // Helper Methods
  // ==========================================

  /**
   * Close the add member dialog.
   */
  async closeAddMemberDialog(): Promise<void> {
    await this.addMemberCancelButton.click();
    await expect(this.addMemberDialog).not.toBeVisible();
  }

  /**
   * Close the team drawer.
   */
  async closeTeamDrawer(): Promise<void> {
    // Click outside or press Escape
    await this.page.keyboard.press('Escape');
    await expect(this.teamDrawer).not.toBeVisible();
  }

  /**
   * Navigate to the members tab on the team detail page.
   */
  async switchToMembersTab(): Promise<void> {
    await this.membersTab.click();
    await this.waitForLoadingComplete();
  }

  /**
   * Navigate to the profile tab on the team detail page.
   */
  async switchToProfileTab(): Promise<void> {
    await this.profileTab.click();
    await this.waitForLoadingComplete();
  }

  /**
   * Get the text content of a specific stat card.
   * @param statType - The type of stat to read
   * @returns The stat value as a string
   */
  async getStatValue(
    statType: 'total' | 'average' | 'draft' | 'active' | 'archived'
  ): Promise<string> {
    const statMap = {
      total: this.totalTeamsStat,
      average: this.avgTeamSizeStat,
      draft: this.draftTeamsStat,
      active: this.activeTeamsStat,
      archived: this.archivedTeamsStat,
    };

    const statCard = statMap[statType];
    const valueElement = statCard.locator('.text-2xl, .font-bold').first();
    return valueElement.textContent() ?? '';
  }
}

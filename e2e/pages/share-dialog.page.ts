import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Permission levels for template sharing
 */
export type SharePermission = 'view' | 'edit' | 'manage';

/**
 * Visibility options for templates
 */
export type TemplateVisibility = 'private' | 'public' | 'link';

/**
 * Share Dialog Page Object
 *
 * Handles interactions with the template sharing modal/dialog.
 * This is a modal component that can be triggered from template pages.
 *
 * Features:
 * - Visibility settings (PRIVATE, PUBLIC, LINK)
 * - People tab: Share with users/teams
 * - Links tab: Create and manage share links
 * - Responsive design: Dialog on desktop, Drawer on mobile
 */
export class ShareDialogPage extends BasePage {
  // ==========================================
  // Locators - Dialog Container
  // ==========================================
  readonly shareDialog: Locator;
  readonly shareDrawer: Locator;
  readonly dialogTitle: Locator;
  readonly dialogDescription: Locator;
  readonly closeButton: Locator;

  // ==========================================
  // Locators - Visibility Section
  // ==========================================
  readonly visibilitySection: Locator;
  readonly visibilityRadioGroup: Locator;
  readonly privateOption: Locator;
  readonly publicOption: Locator;
  readonly linkOption: Locator;
  readonly visibilityConfirmDialog: Locator;

  // ==========================================
  // Locators - Tabs
  // ==========================================
  readonly tabsList: Locator;
  readonly peopleTab: Locator;
  readonly linksTab: Locator;
  readonly peopleTabContent: Locator;
  readonly linksTabContent: Locator;

  // ==========================================
  // Locators - People Tab (Add User Form)
  // ==========================================
  readonly addUserForm: Locator;
  readonly emailInput: Locator;
  readonly permissionSelect: Locator;
  readonly addUserButton: Locator;

  // ==========================================
  // Locators - People Tab (User List)
  // ==========================================
  readonly userShareList: Locator;
  readonly userShareItems: Locator;
  readonly usersSection: Locator;
  readonly teamsSection: Locator;
  readonly emptyPeopleState: Locator;

  // ==========================================
  // Locators - Links Tab (Create Link Form)
  // ==========================================
  readonly createLinkButton: Locator;
  readonly createLinkForm: Locator;
  readonly linkPermissionSelect: Locator;
  readonly expiresSelect: Locator;
  readonly maxUsesInput: Locator;
  readonly linkLabelInput: Locator;
  readonly submitLinkButton: Locator;
  readonly cancelLinkButton: Locator;

  // ==========================================
  // Locators - Links Tab (Link List)
  // ==========================================
  readonly shareLinkList: Locator;
  readonly shareLinkItems: Locator;
  readonly emptyLinksState: Locator;
  readonly linkLimitWarning: Locator;

  // ==========================================
  // Locators - Copy Link
  // ==========================================
  readonly copyLinkButton: Locator;
  readonly shareLinkInput: Locator;

  // ==========================================
  // Locators - Confirmation Dialogs
  // ==========================================
  readonly removeUserDialog: Locator;
  readonly revokeLinkDialog: Locator;
  readonly revokeLinksConfirmDialog: Locator;

  constructor(page: Page) {
    super(page);

    // Dialog containers (responsive - Dialog on desktop, Drawer on mobile)
    this.shareDialog = page.locator('[role="dialog"]:has-text("Share")');
    this.shareDrawer = page.locator('[data-vaul-drawer]:has-text("Share")');
    this.dialogTitle = page.locator('[role="dialog"] h2, [data-vaul-drawer] h2').filter({ hasText: /share/i });
    this.dialogDescription = page.locator('[role="dialog"] p, [data-vaul-drawer] p').filter({ hasText: /control who can access/i });
    this.closeButton = page.locator('[role="dialog"] button:has-text("Close"), [data-vaul-drawer] button:has-text("Close")');

    // Visibility section
    this.visibilitySection = page.locator('h3:has-text("Visibility")').locator('..').locator('..');
    this.visibilityRadioGroup = page.getByRole('radiogroup');
    this.privateOption = page.locator('label[for="visibility-PRIVATE"], label:has-text("Private")').first();
    this.publicOption = page.locator('label[for="visibility-PUBLIC"], label:has-text("Public")').first();
    this.linkOption = page.locator('label[for="visibility-LINK"], label:has-text("Anyone with link")').first();
    this.visibilityConfirmDialog = page.locator('[role="alertdialog"]:has-text("revoke"), [role="alertdialog"]:has-text("links will be")');

    // Tabs
    this.tabsList = page.getByRole('tablist');
    this.peopleTab = page.getByRole('tab', { name: /people/i });
    this.linksTab = page.getByRole('tab', { name: /links/i });
    this.peopleTabContent = page.getByRole('tabpanel').filter({ has: page.locator('input[type="email"], input[placeholder*="email"]') });
    this.linksTabContent = page.getByRole('tabpanel').filter({ has: page.locator('button:has-text("Create")') });

    // Add user form
    this.addUserForm = page.locator('form:has(input[type="email"]), form:has(input[placeholder*="email"])');
    this.emailInput = page.locator('input[type="email"], input[placeholder*="email"]');
    this.permissionSelect = page.locator('button[role="combobox"]:has-text("View"), button[role="combobox"]:has-text("Edit"), button[role="combobox"]:has-text("Manage")').first();
    this.addUserButton = page.locator('form button[type="submit"]:has(svg), form button:has-text("Add")').first();

    // User share list
    this.userShareList = page.locator('[data-testid="user-share-list"], .space-y-1, .space-y-2').filter({ has: page.locator('[class*="avatar"], .rounded-full') });
    this.userShareItems = page.locator('.rounded-lg.border:has([class*="avatar"])');
    this.usersSection = page.locator('h4:has-text("Users")').locator('..').locator('..');
    this.teamsSection = page.locator('h4:has-text("Teams")').locator('..').locator('..');
    this.emptyPeopleState = page.locator('.text-center:has(svg):has-text("shared")');

    // Create link form
    this.createLinkButton = page.getByRole('button', { name: /create.*link|new.*link/i });
    this.createLinkForm = page.locator('.rounded-lg.border.bg-muted\\/30:has(form)');
    this.linkPermissionSelect = this.createLinkForm.locator('button[role="combobox"]').first();
    this.expiresSelect = this.createLinkForm.locator('button[role="combobox"]').nth(1);
    this.maxUsesInput = page.locator('input[type="number"]');
    this.linkLabelInput = page.locator('input[placeholder*="label"], input[placeholder*="Label"]');
    this.submitLinkButton = page.locator('form button[type="submit"]:has-text("Create"), form button:has-text("Generate")');
    this.cancelLinkButton = page.locator('form button:has-text("Cancel")');

    // Link list
    this.shareLinkList = page.locator('.space-y-2:has(.rounded-lg.border:has(svg))');
    this.shareLinkItems = page.locator('.rounded-lg.border:has(svg[class*="Link2"], svg[class*="link"])');
    this.emptyLinksState = page.locator('.text-center:has(svg):has-text("No links")');
    this.linkLimitWarning = page.locator('.border-amber-500, .bg-amber-50').filter({ hasText: /limit|maximum/i });

    // Copy link
    this.copyLinkButton = page.getByRole('button', { name: /copy/i });
    this.shareLinkInput = page.locator('input[readonly][class*="mono"], input[readonly][value*="shared"]');

    // Confirmation dialogs
    this.removeUserDialog = page.locator('[role="alertdialog"]:has-text("remove"), [role="alertdialog"]:has-text("Remove")');
    this.revokeLinkDialog = page.locator('[role="alertdialog"]:has-text("revoke"), [role="alertdialog"]:has-text("Revoke")');
    this.revokeLinksConfirmDialog = page.locator('[role="alertdialog"]:has-text("links will be"), [role="alertdialog"]:has-text("revoked")');
  }

  // ==========================================
  // Navigation (Override - Modal Component)
  // ==========================================

  /**
   * Share dialog is a modal component, so goto navigates to template detail
   * and then opens the share dialog.
   * @param templateId - The template ID to open share dialog for
   */
  async goto(templateId?: string): Promise<void> {
    if (templateId) {
      await this.navigateTo(`/test-templates/${templateId}`);
      await this.waitForPageLoad();
      await this.open();
    }
  }

  // ==========================================
  // Dialog Open/Close Methods
  // ==========================================

  /**
   * Open the share dialog by clicking the share button on the page.
   * Assumes we're already on a template detail page.
   */
  async open(): Promise<void> {
    const shareButton = this.page.getByRole('button', { name: /share/i });
    await shareButton.click();
    await this.waitForShareDialog();
  }

  /**
   * Open share dialog for a specific template by navigating to template and clicking share.
   * @param templateId - The template ID
   */
  async openForTemplate(templateId: string): Promise<void> {
    await this.goto(templateId);
  }

  /**
   * Wait for the share dialog to be visible.
   */
  async waitForShareDialog(): Promise<void> {
    // Wait for either dialog (desktop) or drawer (mobile)
    await expect(
      this.shareDialog.or(this.shareDrawer)
    ).toBeVisible({ timeout: 5000 });
  }

  /**
   * Close the share dialog.
   */
  async close(): Promise<void> {
    // Try close button first
    if (await this.closeButton.isVisible()) {
      await this.closeButton.click();
    } else {
      // Press Escape as fallback
      await this.page.keyboard.press('Escape');
    }
    await expect(this.shareDialog.or(this.shareDrawer)).not.toBeVisible();
  }

  // ==========================================
  // Visibility Methods
  // ==========================================

  /**
   * Set the template visibility.
   * @param visibility - The visibility option to select
   */
  async setVisibility(visibility: TemplateVisibility): Promise<void> {
    const optionMap: Record<TemplateVisibility, Locator> = {
      private: this.privateOption,
      public: this.publicOption,
      link: this.linkOption,
    };

    const option = optionMap[visibility];
    await option.click();

    // Handle confirmation dialog if changing from LINK visibility
    if (await this.visibilityConfirmDialog.isVisible({ timeout: 1000 }).catch(() => false)) {
      await this.confirmVisibilityChange();
    }

    // Wait for the change to take effect
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Confirm visibility change when warned about revoking links.
   */
  async confirmVisibilityChange(): Promise<void> {
    const confirmButton = this.visibilityConfirmDialog.getByRole('button', { name: /confirm|continue|yes/i });
    await confirmButton.click();
    await expect(this.visibilityConfirmDialog).not.toBeVisible();
  }

  /**
   * Cancel visibility change dialog.
   */
  async cancelVisibilityChange(): Promise<void> {
    const cancelButton = this.visibilityConfirmDialog.getByRole('button', { name: /cancel/i });
    await cancelButton.click();
    await expect(this.visibilityConfirmDialog).not.toBeVisible();
  }

  /**
   * Get the currently selected visibility.
   * @returns The current visibility setting
   */
  async getVisibility(): Promise<TemplateVisibility> {
    // Check which option has the check icon visible
    if (await this.privateOption.locator('svg[class*="Check"]').isVisible()) {
      return 'private';
    }
    if (await this.publicOption.locator('svg[class*="Check"]').isVisible()) {
      return 'public';
    }
    if (await this.linkOption.locator('svg[class*="Check"]').isVisible()) {
      return 'link';
    }
    // Default fallback - check for selected state
    const radioValue = await this.visibilityRadioGroup.locator('input[type="radio"]:checked').getAttribute('value');
    return (radioValue?.toLowerCase() as TemplateVisibility) || 'private';
  }

  // ==========================================
  // Tab Navigation Methods
  // ==========================================

  /**
   * Switch to the People tab.
   */
  async switchToPeopleTab(): Promise<void> {
    await this.peopleTab.click();
    await expect(this.peopleTab).toHaveAttribute('data-state', 'active');
  }

  /**
   * Switch to the Links tab.
   */
  async switchToLinksTab(): Promise<void> {
    await this.linksTab.click();
    await expect(this.linksTab).toHaveAttribute('data-state', 'active');
  }

  // ==========================================
  // User Sharing Methods
  // ==========================================

  /**
   * Search for a user to share with by entering email.
   * @param email - The email address to search for
   */
  async searchUser(email: string): Promise<void> {
    await this.switchToPeopleTab();
    await this.emailInput.fill(email);
  }

  /**
   * Select a user from search results dropdown (if using UserPicker component).
   * @param userName - The user name to select from dropdown
   */
  async selectUser(userName: string): Promise<void> {
    // Wait for search results to appear
    const searchResults = this.page.locator('[role="listbox"], [cmdk-list], .absolute.top-full');
    await expect(searchResults).toBeVisible({ timeout: 3000 });

    // Click on the user in results
    const userOption = searchResults.locator(`text="${userName}"`).or(
      searchResults.locator(`[role="option"]:has-text("${userName}")`)
    );
    await userOption.click();
  }

  /**
   * Set the permission level for sharing.
   * @param permission - The permission level
   */
  async setPermission(permission: SharePermission): Promise<void> {
    await this.permissionSelect.click();

    // Wait for dropdown to open
    const dropdown = this.page.locator('[role="listbox"], [data-radix-select-content]');
    await expect(dropdown).toBeVisible();

    // Map permission to display text
    const permissionText: Record<SharePermission, RegExp> = {
      view: /view/i,
      edit: /edit/i,
      manage: /manage/i,
    };

    const option = dropdown.getByRole('option', { name: permissionText[permission] });
    await option.click();
  }

  /**
   * Share template with a user by email.
   * @param email - The user's email address
   * @param permission - The permission level (defaults to 'view')
   */
  async shareWithUser(email: string, permission: SharePermission = 'view'): Promise<void> {
    await this.switchToPeopleTab();
    await this.emailInput.fill(email);
    await this.setPermission(permission);
    await this.addUserButton.click();

    // Wait for success toast or list update
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Remove a user from the share list.
   * @param userName - The user name to remove
   */
  async removeUser(userName: string): Promise<void> {
    const userItem = this.getUserShareItem(userName);
    const removeButton = userItem.getByRole('button', { name: /remove|delete/i }).or(
      userItem.locator('button:has(svg[class*="Trash"])')
    );

    await removeButton.click();

    // Confirm removal
    await expect(this.removeUserDialog).toBeVisible();
    const confirmButton = this.removeUserDialog.getByRole('button', { name: /remove|confirm|yes/i });
    await confirmButton.click();

    await expect(this.removeUserDialog).not.toBeVisible();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Change permission for an existing shared user.
   * @param userName - The user name
   * @param permission - The new permission level
   */
  async changeUserPermission(userName: string, permission: SharePermission): Promise<void> {
    const userItem = this.getUserShareItem(userName);
    const permSelect = userItem.locator('button[role="combobox"]');
    await permSelect.click();

    const dropdown = this.page.locator('[role="listbox"], [data-radix-select-content]');
    await expect(dropdown).toBeVisible();

    const permissionText: Record<SharePermission, RegExp> = {
      view: /view/i,
      edit: /edit/i,
      manage: /manage/i,
    };

    const option = dropdown.getByRole('option', { name: permissionText[permission] });
    await option.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get a user share item locator by name.
   * @param userName - The user name
   */
  getUserShareItem(userName: string): Locator {
    return this.userShareItems.filter({ hasText: userName });
  }

  /**
   * Get all shared user names.
   * @returns Array of user names
   */
  async getSharedUsers(): Promise<string[]> {
    await this.switchToPeopleTab();

    if (await this.emptyPeopleState.isVisible()) {
      return [];
    }

    const items = await this.userShareItems.all();
    const names: string[] = [];

    for (const item of items) {
      const nameElement = item.locator('.font-medium').first();
      const name = await nameElement.textContent();
      if (name) {
        names.push(name.trim());
      }
    }

    return names;
  }

  // ==========================================
  // Share Links Methods
  // ==========================================

  /**
   * Create a new share link.
   * @param options - Link creation options
   */
  async createShareLink(options: {
    permission?: SharePermission;
    expiresInDays?: number;
    maxUses?: number;
    label?: string;
  } = {}): Promise<void> {
    await this.switchToLinksTab();

    // Click create link button
    await this.createLinkButton.click();
    await expect(this.createLinkForm).toBeVisible();

    // Set permission if provided
    if (options.permission) {
      await this.linkPermissionSelect.click();
      const dropdown = this.page.locator('[role="listbox"], [data-radix-select-content]');
      await expect(dropdown).toBeVisible();
      await dropdown.getByRole('option', { name: new RegExp(options.permission, 'i') }).click();
    }

    // Set expiration if provided
    if (options.expiresInDays) {
      await this.expiresSelect.click();
      const dropdown = this.page.locator('[role="listbox"], [data-radix-select-content]');
      await expect(dropdown).toBeVisible();
      // Match common expiration options
      const expirationMap: Record<number, string> = {
        1: '1 day',
        7: '7 days',
        14: '14 days',
        30: '30 days',
        90: '90 days',
        365: '1 year',
      };
      const optionText = expirationMap[options.expiresInDays] || `${options.expiresInDays}`;
      await dropdown.getByRole('option', { name: new RegExp(optionText, 'i') }).click();
    }

    // Set max uses if provided
    if (options.maxUses !== undefined && options.maxUses > 0) {
      await this.maxUsesInput.fill(options.maxUses.toString());
    }

    // Set label if provided
    if (options.label) {
      await this.linkLabelInput.fill(options.label);
    }

    // Submit the form
    await this.submitLinkButton.click();
    await expect(this.createLinkForm).not.toBeVisible({ timeout: 5000 });
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get a share link item locator by label.
   * @param label - The link label
   */
  getShareLinkItem(label: string): Locator {
    return this.shareLinkItems.filter({ hasText: label });
  }

  /**
   * Copy a share link to clipboard.
   * @param linkLabel - Optional label to identify specific link
   */
  async copyShareLink(linkLabel?: string): Promise<void> {
    await this.switchToLinksTab();

    let copyButton: Locator;
    if (linkLabel) {
      const linkItem = this.getShareLinkItem(linkLabel);
      copyButton = linkItem.getByRole('button', { name: /copy/i });
    } else {
      copyButton = this.copyLinkButton.first();
    }

    await copyButton.click();

    // Wait for "Copied!" feedback
    await expect(copyButton.or(this.page.locator('button:has-text("Copied")'))).toBeVisible();
  }

  /**
   * Get the share link URL text from the input.
   * @returns The share link URL
   */
  async getShareLink(): Promise<string> {
    await this.switchToLinksTab();
    const linkInput = this.shareLinkInput.first();
    return (await linkInput.getAttribute('value')) || '';
  }

  /**
   * Revoke a share link.
   * @param linkLabel - The label of the link to revoke
   */
  async revokeShareLink(linkLabel: string): Promise<void> {
    await this.switchToLinksTab();

    const linkItem = this.getShareLinkItem(linkLabel);
    const revokeButton = linkItem.getByRole('button', { name: /revoke|delete/i }).or(
      linkItem.locator('button:has(svg[class*="Trash"])')
    );

    await revokeButton.click();

    // Confirm revocation
    await expect(this.revokeLinkDialog).toBeVisible();
    const confirmButton = this.revokeLinkDialog.getByRole('button', { name: /revoke|confirm|yes/i });
    await confirmButton.click();

    await expect(this.revokeLinkDialog).not.toBeVisible();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get the count of active share links.
   * @returns Number of active links
   */
  async getShareLinkCount(): Promise<number> {
    await this.switchToLinksTab();
    return this.shareLinkItems.count();
  }

  // ==========================================
  // Form Actions
  // ==========================================

  /**
   * Submit the current form (add user or create link).
   */
  async submit(): Promise<void> {
    const submitButton = this.addUserButton.or(this.submitLinkButton);
    await submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Cancel the current form operation.
   */
  async cancel(): Promise<void> {
    if (await this.createLinkForm.isVisible()) {
      await this.cancelLinkButton.click();
      await expect(this.createLinkForm).not.toBeVisible();
    } else {
      await this.close();
    }
  }

  // ==========================================
  // Assertions
  // ==========================================

  /**
   * Assert that the share dialog is visible.
   */
  async expectDialogVisible(): Promise<void> {
    await expect(this.shareDialog.or(this.shareDrawer)).toBeVisible();
  }

  /**
   * Assert that the share dialog is not visible.
   */
  async expectDialogNotVisible(): Promise<void> {
    await expect(this.shareDialog.or(this.shareDrawer)).not.toBeVisible();
  }

  /**
   * Assert that a user is in the share list.
   * @param userName - The user name to check
   */
  async expectUserInList(userName: string): Promise<void> {
    await this.switchToPeopleTab();
    const userItem = this.getUserShareItem(userName);
    await expect(userItem).toBeVisible();
  }

  /**
   * Assert that a user is not in the share list.
   * @param userName - The user name to check
   */
  async expectUserNotInList(userName: string): Promise<void> {
    await this.switchToPeopleTab();
    const userItem = this.getUserShareItem(userName);
    await expect(userItem).not.toBeVisible();
  }

  /**
   * Assert that a user has a specific permission.
   * @param userName - The user name
   * @param permission - The expected permission
   */
  async expectPermission(userName: string, permission: SharePermission): Promise<void> {
    await this.switchToPeopleTab();
    const userItem = this.getUserShareItem(userName);
    const permissionBadge = userItem.locator('span, [class*="badge"]').filter({ hasText: new RegExp(permission, 'i') });
    await expect(permissionBadge).toBeVisible();
  }

  /**
   * Assert that the visibility is set to a specific value.
   * @param visibility - The expected visibility
   */
  async expectVisibility(visibility: TemplateVisibility): Promise<void> {
    const optionMap: Record<TemplateVisibility, Locator> = {
      private: this.privateOption,
      public: this.publicOption,
      link: this.linkOption,
    };

    const option = optionMap[visibility];
    const checkIcon = option.locator('svg[class*="Check"]');
    await expect(checkIcon).toBeVisible();
  }

  /**
   * Assert that a share link exists with given label.
   * @param label - The link label
   */
  async expectLinkExists(label: string): Promise<void> {
    await this.switchToLinksTab();
    const linkItem = this.getShareLinkItem(label);
    await expect(linkItem).toBeVisible();
  }

  /**
   * Assert that no share links exist.
   */
  async expectNoLinks(): Promise<void> {
    await this.switchToLinksTab();
    await expect(this.emptyLinksState).toBeVisible();
  }

  /**
   * Assert that no users are shared with.
   */
  async expectNoSharedUsers(): Promise<void> {
    await this.switchToPeopleTab();
    await expect(this.emptyPeopleState).toBeVisible();
  }

  /**
   * Assert that a success toast is shown after sharing.
   */
  async expectShareSuccess(): Promise<void> {
    await this.waitForSuccessToast();
  }

  /**
   * Assert that an error toast is shown.
   */
  async expectShareError(): Promise<void> {
    await this.waitForErrorToast();
  }

  /**
   * Assert that the link limit warning is visible.
   */
  async expectLinkLimitWarning(): Promise<void> {
    await this.switchToLinksTab();
    await expect(this.linkLimitWarning).toBeVisible();
  }

  /**
   * Assert that the create link button is disabled.
   */
  async expectCreateLinkDisabled(): Promise<void> {
    await this.switchToLinksTab();
    await expect(this.createLinkButton).toBeDisabled();
  }

  /**
   * Assert the share link count.
   * @param count - Expected number of links
   */
  async expectLinkCount(count: number): Promise<void> {
    await this.switchToLinksTab();
    await expect(this.shareLinkItems).toHaveCount(count);
  }

  /**
   * Assert the shared users count.
   * @param count - Expected number of shared users
   */
  async expectSharedUsersCount(count: number): Promise<void> {
    await this.switchToPeopleTab();
    if (count === 0) {
      await expect(this.emptyPeopleState).toBeVisible();
    } else {
      await expect(this.userShareItems).toHaveCount(count);
    }
  }
}

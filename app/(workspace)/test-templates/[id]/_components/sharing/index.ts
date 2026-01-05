/**
 * Template Sharing Components
 *
 * A complete UI for managing template visibility and sharing:
 * - VisibilitySelector: Radio group for PUBLIC/PRIVATE/LINK modes
 * - ShareDialog: Main dialog with tabs for people and links
 * - UserShareList: List of shared users/teams
 * - ShareLinkManager: Create and manage share links
 * - PermissionSelect: Dropdown for VIEW/EDIT/MANAGE permissions
 * - CopyLinkButton: Copy share URL to clipboard
 */

// Main components
export { ShareDialog, ShareButton } from './ShareDialog';
export { VisibilitySelector, VisibilityBadge } from './VisibilitySelector';
export { UserShareList } from './UserShareList';
export { ShareLinkManager } from './ShareLinkManager';

// Base components
export { PermissionSelect, PermissionBadge } from './PermissionSelect';
export { CopyLinkButton, ShareUrlDisplay } from './CopyLinkButton';

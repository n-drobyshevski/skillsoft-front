/**
 * Template Sharing Components
 *
 * A complete UI for managing template visibility and sharing:
 * - ResponsiveShareModal: Mobile-first responsive modal (Dialog on desktop, Drawer on mobile)
 * - ShareModalContent: Extracted content for sharing (used by ResponsiveShareModal)
 * - VisibilitySelector: Radio group for PUBLIC/PRIVATE/LINK modes
 * - ShareDialog: Legacy wrapper (now uses ResponsiveShareModal internally)
 * - UserShareList: List of shared users/teams
 * - ShareLinkManager: Create and manage share links
 * - PermissionSelect: Dropdown for VIEW/EDIT/MANAGE permissions
 * - CopyLinkButton: Copy share URL to clipboard
 * - ShareBadge: Visual indicators for shared items
 */

// New responsive components (recommended)
export { ResponsiveShareModal, ShareButton } from './ResponsiveShareModal';
export { ShareModalContent } from './ShareModalContent';
export { UserPicker, UserSearchInput } from './UserPicker';
export { TeamPicker } from './TeamPicker';

// Legacy components (for backward compatibility)
export { ShareDialog } from './ShareDialog';

// Core components
export { VisibilitySelector, VisibilityBadge } from './VisibilitySelector';
export { UserShareList } from './UserShareList';
export { ShareLinkManager } from './ShareLinkManager';

// Badge components
export { ShareBadge, SharedByBadge, ShareIndicator } from './ShareBadge';
export { PermissionSelect, PermissionBadge } from './PermissionSelect';
export { CopyLinkButton, ShareUrlDisplay } from './CopyLinkButton';

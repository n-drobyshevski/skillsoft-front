'use client';

import { ResponsiveShareModal, ShareButton as ResponsiveShareButton } from './ResponsiveShareModal';

interface ShareDialogProps {
  templateId: string;
  templateName: string;
  isOwner?: boolean;
  canManage?: boolean;
  trigger?: React.ReactNode;
}

/**
 * ShareDialog - Main dialog for managing template sharing
 *
 * Now uses ResponsiveShareModal internally for mobile-first UX:
 * - Desktop (>=768px): Centered dialog modal
 * - Mobile (<768px): Bottom sheet drawer with swipe-to-close
 *
 * Features:
 * - Visibility settings section
 * - Tabs for Users/Teams and Links
 * - Add user/team form with permission selection
 * - Share link management
 * - 44px touch targets on mobile
 *
 * @deprecated Use ResponsiveShareModal directly for new code
 */
export function ShareDialog({
  templateId,
  templateName,
  isOwner = false,
  canManage = false,
  trigger,
}: ShareDialogProps) {
  return (
    <ResponsiveShareModal
      templateId={templateId}
      templateName={templateName}
      isOwner={isOwner}
      canManage={canManage}
      trigger={trigger}
    />
  );
}

/**
 * ShareButton - Convenience wrapper for ShareDialog with a button trigger
 *
 * @deprecated Use ResponsiveShareModal or ShareButton from ResponsiveShareModal directly
 */
export { ResponsiveShareButton as ShareButton };

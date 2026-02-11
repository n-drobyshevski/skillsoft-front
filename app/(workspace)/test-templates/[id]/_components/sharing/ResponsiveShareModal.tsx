'use client';

import * as React from 'react';
import { Share2 } from 'lucide-react';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { ShareModalContent } from './ShareModalContent';

interface ResponsiveShareModalProps {
  /** Template ID for sharing operations */
  templateId: string;
  /** Template name to display in modal header */
  templateName: string;
  /** Whether the current user is the owner */
  isOwner?: boolean;
  /** Whether the current user can manage sharing */
  canManage?: boolean;
  /** Custom trigger element (defaults to Share button) */
  trigger?: React.ReactNode;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
}

/**
 * ResponsiveShareModal - A responsive modal for template sharing
 *
 * Automatically switches between:
 * - Desktop (>=768px): Dialog component with centered modal
 * - Mobile (<768px): Drawer component with bottom sheet pattern
 *
 * Features:
 * - Mobile-first design with 44px touch targets
 * - Bottom sheet with swipe-to-close on mobile
 * - Shared content component for consistent UX
 * - SSR-safe with hydration handling
 *
 * @example
 * ```tsx
 * <ResponsiveShareModal
 *   templateId="123"
 *   templateName="My Assessment"
 *   isOwner={true}
 * />
 * ```
 */
export function ResponsiveShareModal({
  templateId,
  templateName,
  isOwner = false,
  canManage = false,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ResponsiveShareModalProps) {
  // Internal state for uncontrolled usage
  const [internalOpen, setInternalOpen] = React.useState(false);

  // Support both controlled and uncontrolled modes
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const onOpenChange = isControlled ? controlledOnOpenChange : setInternalOpen;

  // Responsive breakpoint detection
  const { isMobileOrTablet, isHydrated } = useBreakpoint();

  // Default trigger button
  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-1.5">
      <Share2 className="h-4 w-4" />
      Share
    </Button>
  );

  const triggerElement = trigger || defaultTrigger;

  // Modal header content (shared between Dialog and Drawer)
  const headerTitle = (
    <span className="flex items-center gap-2">
      <Share2 className="h-5 w-5" />
      Share &quot;{templateName}&quot;
    </span>
  );

  const headerDescription = 'Control who can access and use this template';

  // The main content (shared between Dialog and Drawer)
  const content = (
    <ShareModalContent
      templateId={templateId}
      templateName={templateName}
      isOwner={isOwner}
      canManage={canManage}
      variant={isMobileOrTablet ? 'mobile' : 'desktop'}
    />
  );

  // SSR: Default to desktop Dialog to prevent hydration mismatch
  // The component will re-render on client with correct variant
  if (!isHydrated) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{triggerElement}</DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{headerTitle}</DialogTitle>
            <DialogDescription>{headerDescription}</DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  // Desktop: Use Dialog (centered modal)
  if (!isMobileOrTablet) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{triggerElement}</DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{headerTitle}</DialogTitle>
            <DialogDescription>{headerDescription}</DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  // Mobile/Tablet: Use Drawer (bottom sheet)
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>{triggerElement}</DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>{headerTitle}</DrawerTitle>
          <DrawerDescription>{headerDescription}</DrawerDescription>
        </DrawerHeader>
        {content}
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline" className="min-h-[44px]">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

/**
 * ShareButton - Convenience wrapper for ResponsiveShareModal
 *
 * Pre-configured button trigger with customizable appearance.
 */
interface ShareButtonProps {
  templateId: string;
  templateName: string;
  isOwner?: boolean;
  canManage?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function ShareButton({
  templateId,
  templateName,
  isOwner = false,
  canManage = false,
  variant = 'outline',
  size = 'sm',
  className,
}: ShareButtonProps) {
  return (
    <ResponsiveShareModal
      templateId={templateId}
      templateName={templateName}
      isOwner={isOwner}
      canManage={canManage}
      trigger={
        <Button variant={variant} size={size} className={cn('gap-1.5', className)}>
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      }
    />
  );
}

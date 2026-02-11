'use client';

import * as React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface ResponsiveModalProps {
  /** Control open state */
  open: boolean;
  /** Called when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Modal title */
  title: string;
  /** Optional description below title */
  description?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Footer content (buttons, etc.) */
  footer?: React.ReactNode;
  /** Additional class names for content */
  className?: string;
  /** Maximum width for dialog (desktop only) */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Show drag handle on mobile sheet */
  showDragHandle?: boolean;
}

const maxWidthClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
};

/**
 * ResponsiveModal - Adaptive modal that uses Sheet on mobile and Dialog on desktop.
 *
 * On mobile (< 768px):
 * - Renders as a bottom sheet
 * - Has rounded top corners
 * - Includes drag handle indicator
 * - Respects safe area insets
 *
 * On desktop (>= 768px):
 * - Renders as a centered dialog
 * - Standard modal behavior
 *
 * @example
 * ```tsx
 * <ResponsiveModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Create Item"
 *   description="Fill in the details below"
 *   footer={
 *     <>
 *       <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
 *       <Button onClick={handleSubmit}>Create</Button>
 *     </>
 *   }
 * >
 *   <form>...</form>
 * </ResponsiveModal>
 * ```
 */
export function ResponsiveModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  maxWidth = 'lg',
  showDragHandle = true,
}: ResponsiveModalProps) {
  const isMobile = useIsMobile();

  // Mobile: Render as bottom sheet
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className={cn(
            // Rounded top corners for bottom sheet appearance
            'rounded-t-2xl',
            // Max height with safe area support
            'max-h-[85dvh]',
            // Safe area bottom padding
            'pb-safe',
            // Smooth scrolling for content
            'overflow-y-auto overscroll-contain',
            // Remove default padding to allow custom layout
            'p-0',
            className
          )}
        >
          {/* Drag handle indicator */}
          {showDragHandle && (
            <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-background z-10">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>
          )}

          <div className="px-4 pb-4">
            <SheetHeader className="text-left p-0 pb-4">
              <SheetTitle className="text-lg font-semibold">{title}</SheetTitle>
              {description && (
                <SheetDescription className="text-sm text-muted-foreground">
                  {description}
                </SheetDescription>
              )}
            </SheetHeader>

            {/* Main content */}
            <div className="space-y-4">{children}</div>

            {/* Footer */}
            {footer && (
              <SheetFooter className="mt-6 p-0 flex-col-reverse gap-2 sm:flex-row">
                {footer}
              </SheetFooter>
            )}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Render as centered dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(maxWidthClasses[maxWidth], className)}
        showCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        {/* Main content */}
        <div className="space-y-4">{children}</div>

        {/* Footer */}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

/**
 * ResponsiveModalTrigger - Wrapper for triggering the modal
 * Use this component to wrap your trigger button/element
 */
export interface ResponsiveModalTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

/**
 * Hook to manage responsive modal state
 *
 * @example
 * ```tsx
 * const modal = useResponsiveModal();
 *
 * return (
 *   <>
 *     <Button onClick={modal.open}>Open Modal</Button>
 *     <ResponsiveModal {...modal.props} title="My Modal">
 *       Content here
 *     </ResponsiveModal>
 *   </>
 * );
 * ```
 */
export function useResponsiveModal(initialOpen = false) {
  const [isOpen, setIsOpen] = React.useState(initialOpen);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
    props: {
      open: isOpen,
      onOpenChange: setIsOpen,
    },
  };
}

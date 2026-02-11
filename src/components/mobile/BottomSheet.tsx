'use client';

import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * BottomSheet Component
 *
 * A mobile-optimized modal that slides up from the bottom of the screen.
 * Supports drag-to-dismiss and multiple snap points.
 *
 * Features:
 * - Drag handle for intuitive interaction
 * - Snap points (collapsed, half, full)
 * - Backdrop blur and dismiss on outside click
 * - Keyboard accessible
 * - Body scroll lock when open
 *
 * @example
 * ```tsx
 * <BottomSheet
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 * >
 *   <div className="p-4">
 *     <p>Are you sure you want to retire these items?</p>
 *     <div className="flex gap-2 mt-4">
 *       <Button onClick={onConfirm}>Confirm</Button>
 *       <Button variant="outline" onClick={onCancel}>Cancel</Button>
 *     </div>
 *   </div>
 * </BottomSheet>
 * ```
 */

export type SnapPoint = 'collapsed' | 'half' | 'full';

export interface BottomSheetProps {
  /** Whether the sheet is open */
  isOpen: boolean;

  /** Callback when the sheet should close */
  onClose: () => void;

  /** Sheet content */
  children: React.ReactNode;

  /** Title for the sheet header */
  title?: string;

  /** Description for accessibility */
  description?: string;

  /** Initial snap point (default: 'half') */
  initialSnapPoint?: SnapPoint;

  /** Available snap points (default: ['collapsed', 'half', 'full']) */
  snapPoints?: SnapPoint[];

  /** Whether to show the close button (default: true) */
  showCloseButton?: boolean;

  /** Whether to close on backdrop click (default: true) */
  closeOnBackdropClick?: boolean;

  /** Whether to close on escape key (default: true) */
  closeOnEscape?: boolean;

  /** Custom class for the sheet container */
  className?: string;

  /** Callback when snap point changes */
  onSnapPointChange?: (snapPoint: SnapPoint) => void;

  /** Minimum height in pixels (default: 100) */
  minHeight?: number;

  /** Whether to show the drag handle (default: true) */
  showDragHandle?: boolean;

  /** Footer content */
  footer?: React.ReactNode;
}

// Height percentages for snap points
const SNAP_POINT_HEIGHTS: Record<SnapPoint, number> = {
  collapsed: 15,
  half: 50,
  full: 90,
};

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  description,
  initialSnapPoint = 'half',
  snapPoints = ['collapsed', 'half', 'full'],
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className,
  onSnapPointChange,
  minHeight = 100,
  showDragHandle = true,
  footer,
}: BottomSheetProps) {
  const [currentSnapPoint, setCurrentSnapPoint] = useState<SnapPoint>(initialSnapPoint);
  const [sheetHeight, setSheetHeight] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Calculate viewport-based heights
  const getSnapPointY = useCallback(
    (snapPoint: SnapPoint) => {
      if (typeof window === 'undefined') return 0;
      const vh = window.innerHeight;
      const targetHeight = (SNAP_POINT_HEIGHTS[snapPoint] / 100) * vh;
      return vh - Math.max(targetHeight, minHeight);
    },
    [minHeight]
  );

  // Update sheet height on resize
  useEffect(() => {
    const updateHeight = () => {
      if (typeof window !== 'undefined') {
        setSheetHeight(window.innerHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Handle drag end - snap to nearest point
  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const velocity = info.velocity.y;
      const currentY = info.point.y;

      // If velocity is high, use it to determine direction
      if (Math.abs(velocity) > 500) {
        if (velocity > 0) {
          // Dragging down - go to smaller snap point or close
          const currentIndex = snapPoints.indexOf(currentSnapPoint);
          if (currentIndex > 0) {
            const newSnapPoint = snapPoints[currentIndex - 1];
            setCurrentSnapPoint(newSnapPoint);
            onSnapPointChange?.(newSnapPoint);
          } else {
            onClose();
          }
        } else {
          // Dragging up - go to larger snap point
          const currentIndex = snapPoints.indexOf(currentSnapPoint);
          if (currentIndex < snapPoints.length - 1) {
            const newSnapPoint = snapPoints[currentIndex + 1];
            setCurrentSnapPoint(newSnapPoint);
            onSnapPointChange?.(newSnapPoint);
          }
        }
        return;
      }

      // Otherwise, snap to nearest point based on position
      let nearestSnapPoint = currentSnapPoint;
      let minDistance = Infinity;

      for (const snapPoint of snapPoints) {
        const snapY = getSnapPointY(snapPoint);
        const distance = Math.abs(currentY - snapY);
        if (distance < minDistance) {
          minDistance = distance;
          nearestSnapPoint = snapPoint;
        }
      }

      // If dragged below collapsed point, close
      if (currentY > sheetHeight - minHeight) {
        onClose();
        return;
      }

      setCurrentSnapPoint(nearestSnapPoint);
      onSnapPointChange?.(nearestSnapPoint);
    },
    [snapPoints, currentSnapPoint, getSnapPointY, sheetHeight, minHeight, onClose, onSnapPointChange]
  );

  // Reset snap point when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentSnapPoint(initialSnapPoint);
    }
  }, [isOpen, initialSnapPoint]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={closeOnBackdropClick ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'sheet-title' : undefined}
            aria-describedby={description ? 'sheet-description' : undefined}
            initial={{ y: sheetHeight }}
            animate={{ y: getSnapPointY(currentSnapPoint) }}
            exit={{ y: sheetHeight }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 400,
            }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{
              top: getSnapPointY('full'),
              bottom: sheetHeight,
            }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            className={cn(
              'fixed inset-x-0 bottom-0 z-50',
              'bg-background rounded-t-2xl shadow-2xl',
              'flex flex-col max-h-[90vh]',
              'touch-none', // Prevent scroll interference
              className
            )}
            style={{
              height: `${SNAP_POINT_HEIGHTS.full}vh`,
            }}
          >
            {/* Drag Handle */}
            {showDragHandle && (
              <div
                className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
              </div>
            )}

            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-4 pb-2 border-b">
                <div>
                  {title && (
                    <h2 id="sheet-title" className="text-lg font-semibold">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p id="sheet-description" className="text-sm text-muted-foreground">
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={onClose}
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="border-t bg-background px-4 py-3 safe-area-inset-bottom">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Confirmation Bottom Sheet
 * Pre-configured for confirm/cancel actions
 */
export interface ConfirmationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'default' | 'destructive';
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function ConfirmationSheet({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'default',
  isLoading = false,
  children,
}: ConfirmationSheetProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      initialSnapPoint="collapsed"
      snapPoints={['collapsed']}
      footer={
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            className="flex-1"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </Button>
        </div>
      }
    >
      {children && <div className="px-4 py-2">{children}</div>}
    </BottomSheet>
  );
}

/**
 * Action Sheet
 * Pre-configured for action selection
 */
export interface ActionSheetAction {
  label: string;
  icon?: React.ElementType;
  variant?: 'default' | 'destructive';
  onClick: () => void;
}

export interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  actions: ActionSheetAction[];
}

export function ActionSheet({
  isOpen,
  onClose,
  title,
  actions,
}: ActionSheetProps) {
  const handleAction = (action: ActionSheetAction) => {
    action.onClick();
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      initialSnapPoint="collapsed"
      snapPoints={['collapsed']}
      showCloseButton={false}
    >
      <div className="px-2 py-1">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleAction(action)}
            className={cn(
              'flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left',
              'hover:bg-muted transition-colors',
              action.variant === 'destructive' && 'text-red-600'
            )}
          >
            {action.icon && <action.icon className="h-5 w-5" />}
            <span className="font-medium">{action.label}</span>
          </button>
        ))}
      </div>
      <div className="px-4 py-2 border-t">
        <Button variant="outline" className="w-full" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </BottomSheet>
  );
}

/**
 * Filter Sheet
 * Pre-configured for filter selection
 */
export interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
  title?: string;
  children: React.ReactNode;
  hasActiveFilters?: boolean;
}

export function FilterSheet({
  isOpen,
  onClose,
  onApply,
  onReset,
  title = 'Filters',
  children,
  hasActiveFilters = false,
}: FilterSheetProps) {
  const handleApply = () => {
    onApply();
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      initialSnapPoint="half"
      snapPoints={['half', 'full']}
      footer={
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onReset}
            disabled={!hasActiveFilters}
          >
            Reset
          </Button>
          <Button className="flex-1" onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      }
    >
      <div className="px-4 py-2">{children}</div>
    </BottomSheet>
  );
}

export default BottomSheet;

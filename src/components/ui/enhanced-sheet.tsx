'use client';

import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { springConfig } from '@/lib/animation-config';

/**
 * Snap point types for the enhanced sheet
 * - peek: 25% of viewport height - minimal content preview
 * - half: 55% of viewport height - balanced content view
 * - full: 92% of viewport height - full content view
 */
export type SnapPoint = 'peek' | 'half' | 'full';

/**
 * Snap point heights as percentage of viewport
 */
const SNAP_POINT_HEIGHTS: Record<SnapPoint, number> = {
  peek: 0.25,
  half: 0.55,
  full: 0.92,
};

/**
 * Enhanced Sheet Props
 */
interface EnhancedSheetProps {
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Children content */
  children: React.ReactNode;
  /** Available snap points */
  snapPoints?: SnapPoint[];
  /** Default snap point when opening */
  defaultSnapPoint?: SnapPoint;
  /** Callback when snap point changes */
  onSnapChange?: (point: SnapPoint) => void;
  /** Custom class name for content */
  className?: string;
  /** Accessible title for screen readers (required for accessibility) */
  title?: string;
  /** Accessible description for screen readers */
  description?: string;
}

/**
 * Enhanced Drag Handle Component
 */
interface DragHandleProps {
  isDragging: boolean;
}

function DragHandle({ isDragging }: DragHandleProps) {
  return (
    <div
      className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
      aria-hidden="true"
    >
      {/* Touch target - 48x24px for accessibility */}
      <div className="flex items-center justify-center w-12 h-6 touch-manipulation">
        {/* Visual indicator - 48x6px */}
        <motion.div
          animate={{
            width: isDragging ? 56 : 48,
            height: isDragging ? 8 : 6,
            opacity: isDragging ? 0.8 : 0.4,
          }}
          transition={springConfig.stiff}
          className="bg-muted-foreground rounded-full"
        />
      </div>
    </div>
  );
}

/**
 * EnhancedSheet - Bottom sheet with snap points and improved UX
 */
export function EnhancedSheet({
  open,
  onOpenChange,
  children,
  snapPoints = ['peek', 'half', 'full'],
  defaultSnapPoint = 'half',
  onSnapChange,
  className,
  title = 'Sheet',
  description,
}: EnhancedSheetProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  // Convert snap points to Vaul format (decimal values)
  const vaulSnapPoints = React.useMemo(
    () => snapPoints.map((point) => SNAP_POINT_HEIGHTS[point]),
    [snapPoints]
  );

  const defaultSnapValue = SNAP_POINT_HEIGHTS[defaultSnapPoint];

  return (
    <DrawerPrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={vaulSnapPoints}
      activeSnapPoint={defaultSnapValue}
      modal={true}
    >
      <DrawerPrimitive.Portal>
        {/* Overlay with fade animation */}
        <DrawerPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/50',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          )}
        />

        {/* Content */}
        <DrawerPrimitive.Content
          className={cn(
            // Base styles
            'bg-background fixed z-50 inset-x-0 bottom-0',
            'flex flex-col',
            // Rounded top corners
            'rounded-t-2xl',
            // Border
            'border-t border-border/50',
            // Safe area padding
            'pb-safe',
            // Max height
            'max-h-[92dvh]',
            // Custom class
            className
          )}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
          onPointerCancel={() => setIsDragging(false)}
        >
          {/* Visually hidden title for accessibility (required by Radix Dialog) */}
          <DrawerPrimitive.Title className="sr-only">
            {title}
          </DrawerPrimitive.Title>
          {/* Description is always rendered to satisfy Radix accessibility requirements */}
          <DrawerPrimitive.Description className="sr-only">
            {description || title}
          </DrawerPrimitive.Description>

          {/* Enhanced drag handle */}
          <DragHandle isDragging={isDragging} />

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {children}
          </div>
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
}

/**
 * EnhancedSheetTrigger - Trigger button for the enhanced sheet
 */
export function EnhancedSheetTrigger({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Trigger>) {
  return (
    <DrawerPrimitive.Trigger className={className} {...props}>
      {children}
    </DrawerPrimitive.Trigger>
  );
}

/**
 * EnhancedSheetClose - Close button for the enhanced sheet
 */
export function EnhancedSheetClose({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Close>) {
  return (
    <DrawerPrimitive.Close className={className} {...props}>
      {children}
    </DrawerPrimitive.Close>
  );
}

/**
 * EnhancedSheetHeader - Header section with title and description
 */
interface EnhancedSheetHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function EnhancedSheetHeader({
  title,
  description,
  className,
}: EnhancedSheetHeaderProps) {
  return (
    <div className={cn('px-4 pb-4', className)}>
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  );
}

/**
 * EnhancedSheetFooter - Footer section with actions
 */
export function EnhancedSheetFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mt-auto flex flex-col gap-2 p-4 border-t border-border/50',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * EnhancedSheetGrid - Grid layout for menu items (3-column)
 */
export function EnhancedSheetGrid({
  children,
  className,
  columns = 3,
}: {
  children: React.ReactNode;
  className?: string;
  columns?: 2 | 3 | 4;
}) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div className={cn('grid gap-2 px-4', gridCols[columns], className)}>
      {children}
    </div>
  );
}

/**
 * EnhancedSheetGridItem - Individual grid item for the sheet menu
 */
interface EnhancedSheetGridItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  active?: boolean;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export function EnhancedSheetGridItem({
  icon,
  label,
  description,
  active = false,
  onClick,
  href,
  className,
}: EnhancedSheetGridItemProps) {
  const content = (
    <>
      {/* Icon container */}
      <div
        className={cn(
          'flex items-center justify-center size-10 rounded-full shrink-0',
          active ? 'bg-primary/20' : 'bg-muted'
        )}
      >
        {icon}
      </div>

      {/* Label */}
      <span
        className={cn(
          'text-xs font-medium text-center leading-tight',
          active && 'text-primary'
        )}
      >
        {label}
      </span>

      {/* Description (optional) */}
      {description && (
        <span className="text-[10px] text-muted-foreground text-center leading-tight truncate w-full">
          {description}
        </span>
      )}
    </>
  );

  const baseClassName = cn(
    // Layout
    'flex flex-col items-center gap-2 p-3 rounded-xl',
    // Touch target
    'min-h-[80px]',
    'touch-manipulation select-none',
    // Transitions
    'transition-colors duration-150',
    'active:scale-[0.98]',
    // Colors
    active
      ? 'bg-primary/10 text-primary'
      : 'bg-muted/50 hover:bg-muted active:bg-muted/80',
    className
  );

  if (href) {
    // Render as link
    const Link = require('next/link').default;
    return (
      <Link href={href} onClick={onClick} className={baseClassName}>
        {content}
      </Link>
    );
  }

  // Render as button
  return (
    <button type="button" onClick={onClick} className={baseClassName}>
      {content}
    </button>
  );
}

export { SNAP_POINT_HEIGHTS };

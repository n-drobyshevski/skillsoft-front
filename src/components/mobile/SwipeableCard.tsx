'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ban, CheckCircle, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useSwipeActions,
  useIsTouchDevice,
  usePrefersReducedMotion,
  type SwipeActionConfig,
} from '@/hooks/useSwipeActions';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * SwipeableCard Component
 *
 * A card component that supports swipe gestures for mobile actions.
 * Reveals action buttons on left/right swipe with visual feedback.
 *
 * Features:
 * - Left swipe: Destructive actions (retire, delete)
 * - Right swipe: Positive actions (approve, activate)
 * - Long press: Enter selection mode
 * - Snap-back animation when released
 * - Haptic feedback on threshold crossing
 *
 * @example
 * ```tsx
 * <SwipeableCard
 *   onSwipeLeft={() => handleRetire(item.id)}
 *   onSwipeRight={() => handleApprove(item.id)}
 *   onLongPress={() => handleSelectItem(item.id)}
 *   leftActions={[
 *     { icon: Ban, label: 'Retire', variant: 'destructive' },
 *   ]}
 *   rightActions={[
 *     { icon: CheckCircle, label: 'Approve', variant: 'success' },
 *   ]}
 * >
 *   <ItemContent item={item} />
 * </SwipeableCard>
 * ```
 */

export interface SwipeAction {
  icon: React.ElementType;
  label: string;
  variant: 'destructive' | 'success' | 'warning' | 'default';
  onClick?: () => void;
}

export interface SwipeableCardProps extends Omit<SwipeActionConfig, 'leftActionWidth' | 'rightActionWidth'> {
  children: React.ReactNode;

  /** Actions to show when swiping left */
  leftActions?: SwipeAction[];

  /** Actions to show when swiping right */
  rightActions?: SwipeAction[];

  /** Additional class name for the card */
  className?: string;

  /** Whether the card is selected */
  isSelected?: boolean;

  /** Whether to enable swipe (auto-detects mobile) */
  enableSwipe?: boolean;

  /** Border color override */
  borderColor?: string;

  /** Fallback for desktop - show action menu button */
  showDesktopActions?: boolean;

  /** Desktop action menu content */
  desktopActionsContent?: React.ReactNode;
}

const actionVariantStyles = {
  destructive: 'bg-red-500 text-white',
  success: 'bg-emerald-500 text-white',
  warning: 'bg-amber-500 text-white',
  default: 'bg-slate-500 text-white',
};

const actionVariantHoverStyles = {
  destructive: 'hover:bg-red-600',
  success: 'hover:bg-emerald-600',
  warning: 'hover:bg-amber-600',
  default: 'hover:bg-slate-600',
};

export function SwipeableCard({
  children,
  leftActions = [],
  rightActions = [],
  className,
  isSelected,
  enableSwipe,
  borderColor,
  showDesktopActions = true,
  desktopActionsContent,
  onSwipeLeft,
  onSwipeRight,
  onLongPress,
  disabled,
  ...swipeConfig
}: SwipeableCardProps) {
  const isMobile = useIsMobile();
  const isTouch = useIsTouchDevice();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Only enable swipe on mobile/touch devices unless explicitly set
  const swipeEnabled = enableSwipe ?? (isMobile || isTouch);

  const leftActionWidth = leftActions.length * 72; // 72px per action
  const rightActionWidth = rightActions.length * 72;

  const {
    x,
    state,
    leftOpacity,
    rightOpacity,
    leftScale,
    rightScale,
    backgroundColor,
    handlers,
    reset,
    controls,
    isSwiping,
  } = useSwipeActions({
    onSwipeLeft,
    onSwipeRight,
    onLongPress,
    leftActionWidth,
    rightActionWidth,
    disabled: disabled || !swipeEnabled,
    ...swipeConfig,
  });

  // Handle action click and reset
  const handleActionClick = (action: SwipeAction) => {
    action.onClick?.();
    reset();
  };

  // Close on outside click
  React.useEffect(() => {
    if (state === 'left-open' || state === 'right-open') {
      const handleClick = (e: MouseEvent) => {
        // Check if click is outside the card
        const target = e.target as HTMLElement;
        if (!target.closest('[data-swipeable-card]')) {
          reset();
        }
      };

      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [state, reset]);

  return (
    <div
      data-swipeable-card
      className={cn(
        'relative overflow-hidden rounded-lg',
        isSelected && 'ring-2 ring-primary',
        className
      )}
    >
      {/* Left Actions (revealed on right swipe) */}
      {rightActions.length > 0 && swipeEnabled && (
        <motion.div
          className="absolute inset-y-0 left-0 flex items-stretch"
          style={{
            opacity: rightOpacity,
            width: rightActionWidth,
          }}
        >
          {rightActions.map((action, index) => (
            <motion.button
              key={index}
              style={{ scale: rightScale }}
              className={cn(
                'flex flex-col items-center justify-center w-[72px] gap-1',
                actionVariantStyles[action.variant],
                actionVariantHoverStyles[action.variant]
              )}
              onClick={() => handleActionClick(action)}
            >
              <action.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{action.label}</span>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Right Actions (revealed on left swipe) */}
      {leftActions.length > 0 && swipeEnabled && (
        <motion.div
          className="absolute inset-y-0 right-0 flex items-stretch"
          style={{
            opacity: leftOpacity,
            width: leftActionWidth,
          }}
        >
          {leftActions.map((action, index) => (
            <motion.button
              key={index}
              style={{ scale: leftScale }}
              className={cn(
                'flex flex-col items-center justify-center w-[72px] gap-1',
                actionVariantStyles[action.variant],
                actionVariantHoverStyles[action.variant]
              )}
              onClick={() => handleActionClick(action)}
            >
              <action.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{action.label}</span>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Main Card Content */}
      <motion.div
        style={{
          x: swipeEnabled ? x : 0,
          backgroundColor: swipeEnabled ? backgroundColor : 'transparent',
        }}
        animate={controls}
        drag={swipeEnabled ? 'x' : false}
        dragConstraints={{
          left: -leftActionWidth,
          right: rightActionWidth,
        }}
        dragElastic={0.1}
        dragMomentum={false}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { type: 'spring', stiffness: 500, damping: 30 }
        }
        className={cn(
          'relative bg-card border rounded-lg',
          borderColor,
          isSwiping && 'cursor-grabbing',
          swipeEnabled && 'touch-pan-y'
        )}
        {...(swipeEnabled ? handlers : {})}
      >
        {children}

        {/* Desktop Actions Button */}
        {!swipeEnabled && showDesktopActions && desktopActionsContent && (
          <div className="absolute top-2 right-2">
            {desktopActionsContent}
          </div>
        )}
      </motion.div>

      {/* Swipe Hint (shown on first render on mobile) */}
      <SwipeHint show={swipeEnabled && state === 'idle'} />
    </div>
  );
}

/**
 * Subtle hint showing swipe capability
 */
function SwipeHint({ show }: { show: boolean }) {
  const [hasShown, setHasShown] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (show && !hasShown) {
      // Check if we've shown the hint before
      const hintShown = localStorage.getItem('swipe-hint-shown');
      if (!hintShown) {
        setIsVisible(true);
        const timeout = setTimeout(() => {
          setIsVisible(false);
          setHasShown(true);
          localStorage.setItem('swipe-hint-shown', 'true');
        }, 3000);
        return () => clearTimeout(timeout);
      }
    }
  }, [show, hasShown]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/10 rounded-lg"
    >
      <motion.div
        animate={{
          x: [-20, 20, -20],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="flex items-center gap-2 text-sm font-medium text-white bg-black/60 px-3 py-1.5 rounded-full"
      >
        <span>← Swipe for actions →</span>
      </motion.div>
    </motion.div>
  );
}

/**
 * Pre-configured swipe card for psychometric items
 */
export interface PsychometricSwipeCardProps {
  children: React.ReactNode;
  onRetire?: () => void;
  onFlagForReview?: () => void;
  onApprove?: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
  isNegative?: boolean;
  isCritical?: boolean;
  className?: string;
  disabled?: boolean;
}

export function PsychometricSwipeCard({
  children,
  onRetire,
  onFlagForReview,
  onApprove,
  onSelect,
  isSelected,
  isNegative,
  isCritical,
  className,
  disabled,
}: PsychometricSwipeCardProps) {
  const leftActions: SwipeAction[] = [];
  const rightActions: SwipeAction[] = [];

  // Left swipe reveals destructive actions
  if (onRetire) {
    leftActions.push({
      icon: Ban,
      label: 'Retire',
      variant: 'destructive',
      onClick: onRetire,
    });
  }

  if (onFlagForReview) {
    leftActions.push({
      icon: Eye,
      label: 'Review',
      variant: 'warning',
      onClick: onFlagForReview,
    });
  }

  // Right swipe reveals positive actions
  if (onApprove) {
    rightActions.push({
      icon: CheckCircle,
      label: 'Approve',
      variant: 'success',
      onClick: onApprove,
    });
  }

  // Determine border color based on severity
  const borderColor = isNegative
    ? 'border-l-4 border-l-red-500'
    : isCritical
    ? 'border-l-4 border-l-orange-500'
    : 'border-l-4 border-l-amber-500';

  return (
    <SwipeableCard
      leftActions={leftActions}
      rightActions={rightActions}
      onSwipeLeft={onRetire}
      onSwipeRight={onApprove}
      onLongPress={onSelect}
      isSelected={isSelected}
      borderColor={borderColor}
      className={className}
      disabled={disabled}
    >
      {children}
    </SwipeableCard>
  );
}

export default SwipeableCard;

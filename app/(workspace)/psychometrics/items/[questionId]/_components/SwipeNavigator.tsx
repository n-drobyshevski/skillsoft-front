'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SwipeNavigatorProps {
  /** Current item ID */
  currentId: string;
  /** Previous item ID (null if first) */
  prevId: string | null;
  /** Next item ID (null if last) */
  nextId: string | null;
  /** Previous item label for preview */
  prevLabel?: string;
  /** Next item label for preview */
  nextLabel?: string;
  /** Base URL path for navigation */
  basePath?: string;
  /** Content to wrap */
  children: React.ReactNode;
  /** Callback when navigation starts */
  onNavigate?: (direction: 'prev' | 'next', targetId: string) => void;
  /** Additional className */
  className?: string;
}

const SWIPE_THRESHOLD = 80; // Minimum distance to trigger navigation
const EDGE_ZONE = 30; // Edge zone for swipe detection (px from edge)
const PEEK_AMOUNT = 0.15; // 15% of screen width for peek preview

/**
 * Trigger haptic feedback if available
 */
function triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'medium') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 25,
      heavy: 50,
    };
    navigator.vibrate(patterns[style]);
  }
}

/**
 * SwipeNavigator - Gesture-based navigation between items
 *
 * Features:
 * - Edge swipe detection (starts from screen edges)
 * - Peek preview of next/prev item
 * - Haptic feedback on successful swipe
 * - Position indicator dots
 * - Framer Motion for smooth animations
 *
 * Only active on mobile devices.
 */
export function SwipeNavigator({
  currentId,
  prevId,
  nextId,
  prevLabel = 'Предыдущий',
  nextLabel = 'Следующий',
  basePath = '/psychometrics/items',
  children,
  onNavigate,
  className,
}: SwipeNavigatorProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const x = useMotionValue(0);
  const controls = useAnimation();

  // Calculate peek opacity based on drag distance
  const leftPeekOpacity = useTransform(x, [0, 100], [0, 1]);
  const rightPeekOpacity = useTransform(x, [-100, 0], [1, 0]);

  // Scale effect for dragged content
  const scale = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);

  const handleDragEnd = useCallback(
    async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;

      // Determine if swipe was significant enough
      const swipeDistance = Math.abs(offset.x);
      const swipeVelocity = Math.abs(velocity.x);
      const isSignificantSwipe = swipeDistance > SWIPE_THRESHOLD || swipeVelocity > 500;

      if (isSignificantSwipe && !isNavigating) {
        const direction = offset.x > 0 ? 'prev' : 'next';
        const targetId = direction === 'prev' ? prevId : nextId;

        if (targetId) {
          setIsNavigating(true);
          setSwipeDirection(direction === 'prev' ? 'right' : 'left');
          triggerHaptic('medium');

          // Animate off screen
          await controls.start({
            x: direction === 'prev' ? window.innerWidth : -window.innerWidth,
            transition: { duration: 0.25, ease: 'easeOut' },
          });

          // Notify parent
          onNavigate?.(direction, targetId);

          // Navigate
          router.push(`${basePath}/${targetId}`);
        } else {
          // No item in that direction - snap back with bounce
          triggerHaptic('light');
          controls.start({
            x: 0,
            transition: { type: 'spring', stiffness: 500, damping: 30 },
          });
        }
      } else {
        // Snap back
        controls.start({
          x: 0,
          transition: { type: 'spring', stiffness: 500, damping: 30 },
        });
      }
    },
    [prevId, nextId, basePath, router, controls, isNavigating, onNavigate]
  );

  // Reset state when currentId changes
  useEffect(() => {
    setIsNavigating(false);
    setSwipeDirection(null);
    controls.set({ x: 0 });
  }, [currentId, controls]);

  // Desktop: Just render children
  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
    >
      {/* Left peek preview (previous item) */}
      {prevId && (
        <motion.div
          className="absolute inset-y-0 left-0 w-[15%] flex items-center justify-center bg-muted/80 backdrop-blur-sm z-10 pointer-events-none"
          style={{ opacity: leftPeekOpacity }}
        >
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ChevronLeft className="h-6 w-6" />
            <span className="text-xs font-medium">{prevLabel}</span>
          </div>
        </motion.div>
      )}

      {/* Right peek preview (next item) */}
      {nextId && (
        <motion.div
          className="absolute inset-y-0 right-0 w-[15%] flex items-center justify-center bg-muted/80 backdrop-blur-sm z-10 pointer-events-none"
          style={{ opacity: rightPeekOpacity }}
        >
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ChevronRight className="h-6 w-6" />
            <span className="text-xs font-medium">{nextLabel}</span>
          </div>
        </motion.div>
      )}

      {/* Draggable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: nextId ? -200 : 0, right: prevId ? 200 : 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x, scale }}
        className="touch-pan-y"
      >
        {children}
      </motion.div>

      {/* Navigation indicator dots */}
      <div className="flex justify-center gap-1.5 py-3">
        <div
          className={cn(
            'h-1.5 rounded-full transition-all',
            prevId ? 'w-1.5 bg-muted-foreground/30' : 'w-0'
          )}
        />
        <div className="w-3 h-1.5 rounded-full bg-primary" />
        <div
          className={cn(
            'h-1.5 rounded-full transition-all',
            nextId ? 'w-1.5 bg-muted-foreground/30' : 'w-0'
          )}
        />
      </div>
    </div>
  );
}

/**
 * SwipeIndicator - Visual hint for swipe availability
 *
 * Shows a subtle animation on first view to indicate swipe is available.
 */
interface SwipeIndicatorProps {
  direction: 'left' | 'right' | 'both';
  className?: string;
}

export function SwipeIndicator({ direction, className }: SwipeIndicatorProps) {
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Only show once per session
    const key = 'swipe-indicator-shown';
    if (sessionStorage.getItem(key)) {
      setHasShown(true);
      return;
    }

    const timer = setTimeout(() => {
      sessionStorage.setItem(key, 'true');
      setHasShown(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (hasShown) return null;

  return (
    <motion.div
      className={cn(
        'fixed bottom-24 left-1/2 -translate-x-1/2 z-50',
        'px-4 py-2 rounded-full bg-foreground/90 text-background text-sm font-medium',
        'flex items-center gap-2',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ delay: 1 }}
    >
      {(direction === 'left' || direction === 'both') && (
        <ChevronLeft className="h-4 w-4" />
      )}
      <span>Свайпните для навигации</span>
      {(direction === 'right' || direction === 'both') && (
        <ChevronRight className="h-4 w-4" />
      )}
    </motion.div>
  );
}

export default SwipeNavigator;

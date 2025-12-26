'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * MobileTabs - Root tabs container
 */
const MobileTabs = TabsPrimitive.Root;

/**
 * MobileTabsList - Horizontally scrollable tab list with fade indicators
 *
 * Features:
 * - Horizontal scroll with snap behavior
 * - Fade indicators when content overflows
 * - Touch-friendly scroll momentum
 * - Hidden scrollbar for clean appearance
 */
function MobileTabsList({
  className,
  children,
  showScrollIndicators = true,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  showScrollIndicators?: boolean;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = React.useState(false);
  const [showRightFade, setShowRightFade] = React.useState(false);

  const checkScroll = React.useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

    // Show fade indicators if content overflows
    const hasOverflow = scrollWidth > clientWidth;
    setShowLeftFade(hasOverflow && scrollLeft > 10);
    setShowRightFade(hasOverflow && scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  React.useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;

    if (ref) {
      ref.addEventListener('scroll', checkScroll, { passive: true });
      // Also check on resize
      const resizeObserver = new ResizeObserver(checkScroll);
      resizeObserver.observe(ref);

      return () => {
        ref.removeEventListener('scroll', checkScroll);
        resizeObserver.disconnect();
      };
    }
  }, [checkScroll]);

  const scrollToDirection = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative">
      {/* Left fade indicator */}
      {showScrollIndicators && showLeftFade && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <button
            type="button"
            onClick={() => scrollToDirection('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-background/80 backdrop-blur-sm shadow-sm border opacity-70 hover:opacity-100 transition-opacity touch-target-min"
            aria-label="Scroll tabs left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Right fade indicator */}
      {showScrollIndicators && showRightFade && (
        <>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <button
            type="button"
            onClick={() => scrollToDirection('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-background/80 backdrop-blur-sm shadow-sm border opacity-70 hover:opacity-100 transition-opacity touch-target-min"
            aria-label="Scroll tabs right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
      >
        <TabsPrimitive.List
          className={cn(
            'inline-flex items-center gap-1 p-1 bg-muted rounded-lg min-w-full w-max',
            className
          )}
          {...props}
        >
          {children}
        </TabsPrimitive.List>
      </div>
    </div>
  );
}

/**
 * MobileTabsTrigger - Individual tab button with touch-friendly sizing
 *
 * Features:
 * - Minimum 44px touch target
 * - Snap behavior for smooth scrolling
 * - Keyboard accessible
 * - Visual active state
 */
function MobileTabsTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        // Base styles
        'inline-flex items-center justify-center whitespace-nowrap px-4 py-2.5 text-sm font-medium',
        // Touch target - minimum 44px as per Apple HIG
        'min-h-[44px] min-w-[44px] touch-manipulation',
        // Snap behavior for smooth horizontal scroll
        'snap-start scroll-ml-1',
        // Appearance
        'rounded-md transition-all',
        'text-muted-foreground hover:text-foreground',
        // Active state
        'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        // Focus styles
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        // Disabled state
        'disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

/**
 * MobileTabsContent - Tab content panel
 */
function MobileTabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn(
        'mt-4 ring-offset-background',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        // Animation for content change
        'data-[state=inactive]:hidden',
        'data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  );
}

/**
 * MobileTabsBadge - Badge to show counts or indicators on tabs
 */
function MobileTabsBadge({
  children,
  className,
  variant = 'default',
}: {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}) {
  const variantClasses = {
    default: 'bg-muted-foreground/20 text-muted-foreground',
    success: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
    error: 'bg-red-500/20 text-red-600 dark:text-red-400',
  };

  return (
    <span
      className={cn(
        'ml-1.5 px-1.5 py-0.5 text-xs font-medium rounded-full',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export {
  MobileTabs,
  MobileTabsList,
  MobileTabsTrigger,
  MobileTabsContent,
  MobileTabsBadge,
};

'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { AssessmentGoal } from '@/types/domain';

export type GoalFilter = 'all' | AssessmentGoal;

interface GoalFilterTabsProps {
  value: GoalFilter;
  onChange: (value: GoalFilter) => void;
  counts?: Record<GoalFilter, number>;
  className?: string;
}

interface FilterOption {
  value: GoalFilter;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Все' },
  { value: AssessmentGoal.OVERVIEW, label: 'Обзор' },
  { value: AssessmentGoal.JOB_FIT, label: 'Должность' },
  { value: AssessmentGoal.TEAM_FIT, label: 'Команда' },
];

/**
 * Goal Filter Tabs - Mobile-Optimized
 *
 * Segmented control for filtering results by assessment goal.
 * Displays counts for each filter option.
 *
 * Features:
 * - Horizontal scroll on mobile with gradient fade indicators
 * - 40px touch targets (mobile) / 36px (desktop)
 * - Count badges with semantic styling
 * - Hidden scrollbar for clean appearance
 * - WCAG AAA compliant touch targets
 */
export function GoalFilterTabs({
  value,
  onChange,
  counts,
  className,
}: GoalFilterTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const hasOverflow = scrollWidth > clientWidth;
    setShowLeftFade(hasOverflow && scrollLeft > 5);
    setShowRightFade(hasOverflow && scrollLeft < scrollWidth - clientWidth - 5);
  }, []);

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll, { passive: true });
      const resizeObserver = new ResizeObserver(checkScroll);
      resizeObserver.observe(ref);
      return () => {
        ref.removeEventListener('scroll', checkScroll);
        resizeObserver.disconnect();
      };
    }
  }, [checkScroll]);

  return (
    <div className={cn('relative', className)}>
      {/* Left fade indicator */}
      {showLeftFade && (
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none rounded-l-lg" />
      )}

      {/* Right fade indicator */}
      {showRightFade && (
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none rounded-r-lg" />
      )}

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide scroll-smooth"
      >
        <div
          className="inline-flex items-center gap-1 p-1 bg-muted rounded-lg w-max"
          role="tablist"
          aria-label="Фильтр по типу теста"
        >
          {FILTER_OPTIONS.map((option) => {
            const isActive = value === option.value;
            const count = counts?.[option.value];

            return (
              <button
                key={option.value}
                role="tab"
                aria-selected={isActive}
                onClick={() => onChange(option.value)}
                className={cn(
                  // Base styles with proper touch targets
                  'relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md',
                  // 40px on mobile, 36px on desktop for touch targets
                  'min-h-[40px] sm:min-h-[36px]',
                  // Prevent text wrapping, optimize touch response
                  'whitespace-nowrap touch-manipulation',
                  'transition-all duration-200',
                  // Focus ring for accessibility
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  // Active/inactive states
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                )}
              >
                {option.label}
                {count !== undefined && count > 0 && (
                  <span
                    className={cn(
                      'px-1.5 py-0.5 text-[10px] font-semibold rounded-full min-w-[18px] text-center tabular-nums',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted-foreground/20 text-muted-foreground'
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

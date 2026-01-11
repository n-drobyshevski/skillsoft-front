'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { AssessmentGoal } from '@/types/domain';

export type GoalFilter = 'all' | AssessmentGoal;

interface GoalFilterTabsProps {
  value: GoalFilter;
  onChange: (value: GoalFilter) => void;
  counts?: Record<GoalFilter, number>;
  className?: string;
  /** Optional translated label for "All" filter */
  allLabel?: string;
  /** Optional translated labels for goal filters */
  goalLabels?: Record<AssessmentGoal, string>;
}

interface FilterOption {
  value: GoalFilter;
  label: string;
}

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
  allLabel,
  goalLabels,
}: GoalFilterTabsProps) {
  const t = useTranslations('profile.results');
  const tAccessibility = useTranslations('profile.accessibility');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);
  const [announcedFilter, setAnnouncedFilter] = useState<string>('');

  // Build filter options with translations
  const filterOptions: FilterOption[] = useMemo(() => [
    { value: 'all', label: allLabel || t('filterAll') },
    { value: AssessmentGoal.OVERVIEW, label: goalLabels?.[AssessmentGoal.OVERVIEW] || t('filterOverview') },
    { value: AssessmentGoal.JOB_FIT, label: goalLabels?.[AssessmentGoal.JOB_FIT] || t('filterJobFit') },
    { value: AssessmentGoal.TEAM_FIT, label: goalLabels?.[AssessmentGoal.TEAM_FIT] || t('filterTeamFit') },
  ], [allLabel, goalLabels, t]);

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

  // Update announced filter when value changes (for screen reader announcement)
  useEffect(() => {
    const currentOption = filterOptions.find(opt => opt.value === value);
    if (currentOption) {
      setAnnouncedFilter(currentOption.label);
    }
  }, [value, filterOptions]);

  return (
    <div className={cn('relative', className)}>
      {/* Aria-live announcement for filter changes */}
      <span className="sr-only" role="status" aria-live="polite">
        {announcedFilter && tAccessibility('filterChanged', { filter: announcedFilter })}
      </span>

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
          aria-label={t('title')}
        >
          {filterOptions.map((option) => {
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
                  // 44px on mobile (WCAG AAA), 36px on desktop for touch targets
                  'min-h-[44px] sm:min-h-[36px]',
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
                      'px-1.5 py-0.5 text-xs-safe font-semibold rounded-full min-w-[18px] text-center tabular-nums',
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

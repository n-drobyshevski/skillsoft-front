'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface FilterOption<T extends string = string> {
  value: T | 'all';
  label: string;
  count?: number;
  color?: 'emerald' | 'amber' | 'orange' | 'red' | 'blue' | 'violet' | 'gray';
}

interface QuickFilterPillsProps<T extends string> {
  options: FilterOption<T>[];
  value: T | 'all';
  onChange: (value: T | 'all') => void;
  allLabel?: string;
  className?: string;
  size?: 'sm' | 'md';
  /** Enable horizontal scroll on mobile (default: true) */
  mobileScroll?: boolean;
}

const colorStyles: Record<string, {
  active: string;
  inactive: string;
  count: string;
}> = {
  emerald: {
    active: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700',
    inactive: 'hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-900/20',
    count: 'bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200',
  },
  amber: {
    active: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700',
    inactive: 'hover:bg-amber-50 hover:border-amber-200 dark:hover:bg-amber-900/20',
    count: 'bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200',
  },
  orange: {
    active: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700',
    inactive: 'hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-900/20',
    count: 'bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200',
  },
  red: {
    active: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700',
    inactive: 'hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20',
    count: 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200',
  },
  blue: {
    active: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700',
    inactive: 'hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20',
    count: 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
  },
  violet: {
    active: 'bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-700',
    inactive: 'hover:bg-violet-50 hover:border-violet-200 dark:hover:bg-violet-900/20',
    count: 'bg-violet-200 text-violet-800 dark:bg-violet-800 dark:text-violet-200',
  },
  gray: {
    active: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/40 dark:text-gray-300 dark:border-gray-600',
    inactive: 'hover:bg-gray-50 hover:border-gray-200 dark:hover:bg-gray-800/20',
    count: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  },
};

const defaultColors = {
  active: 'bg-primary/10 text-primary border-primary/30 dark:bg-primary/20 dark:border-primary/40',
  inactive: 'hover:bg-muted hover:border-border',
  count: 'bg-muted text-muted-foreground',
};

const sizeStyles = {
  sm: {
    pill: 'px-2.5 py-1.5 text-xs gap-1 min-h-[44px]',
    count: 'text-xs px-1.5 py-0.5',
  },
  md: {
    pill: 'px-3 py-1.5 text-sm gap-1.5 min-h-[44px]',
    count: 'text-xs px-2 py-0.5',
  },
};

/**
 * QuickFilterPills - Pill-style filter selector for status/category filtering
 * Supports colored pills with optional count badges.
 * Mobile-optimized with horizontal scroll, snap behavior, and scroll indicators.
 */
export function QuickFilterPills<T extends string>({
  options,
  value,
  onChange,
  allLabel = 'Все',
  className,
  size = 'md',
  mobileScroll = true,
}: QuickFilterPillsProps<T>) {
  const styles = sizeStyles[size];
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  // Check scroll position for fade indicators
  const updateScrollFades = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || !mobileScroll) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const hasOverflow = scrollWidth > clientWidth;

    setShowLeftFade(hasOverflow && scrollLeft > 8);
    setShowRightFade(hasOverflow && scrollLeft < scrollWidth - clientWidth - 8);
  }, [mobileScroll]);

  // Update fades on mount and scroll - using layout effect for sync updates
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Schedule initial check after DOM paint
    const timeoutId = setTimeout(updateScrollFades, 0);

    container.addEventListener('scroll', updateScrollFades, { passive: true });
    window.addEventListener('resize', updateScrollFades);

    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener('scroll', updateScrollFades);
      window.removeEventListener('resize', updateScrollFades);
    };
  }, [updateScrollFades]);

  // Add "all" option if not present
  const allOptions: FilterOption<T>[] = options.some(opt => opt.value === 'all')
    ? options
    : [{ value: 'all' as T | 'all', label: allLabel }, ...options];

  // Scroll active pill into view on mobile
  const handleChange = (optionValue: T | 'all') => {
    onChange(optionValue);
  };

  return (
    <div className="relative sm:static">
      {/* Left fade indicator */}
      {mobileScroll && showLeftFade && (
        <div
          className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10 sm:hidden"
          aria-hidden="true"
        />
      )}

      {/* Right fade indicator */}
      {mobileScroll && showRightFade && (
        <div
          className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10 sm:hidden"
          aria-hidden="true"
        />
      )}

      <div
        ref={scrollContainerRef}
        className={cn(
          // Base styles
          'flex items-center gap-2',
          // Mobile scroll behavior
          mobileScroll && [
            '-mx-4 px-4 sm:mx-0 sm:px-0', // Extend to edges on mobile
            'overflow-x-auto',
            'scrollbar-none', // Hide scrollbar
            'snap-x snap-mandatory', // Snap behavior
            'scroll-smooth',
            // Flex wrap on desktop only
            'sm:flex-wrap sm:overflow-visible',
          ],
          className
        )}
        role="group"
        aria-label="Фильтры"
        style={{
          // Hide scrollbar cross-browser
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {allOptions.map((option) => {
          const isActive = value === option.value;
          const colors = option.color ? colorStyles[option.color] : defaultColors;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange(option.value)}
              className={cn(
                'inline-flex items-center rounded-full border font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'whitespace-nowrap shrink-0', // Prevent wrapping on mobile
                'snap-start', // Snap alignment
                styles.pill,
                isActive
                  ? colors.active
                  : cn(
                      'bg-background border-border text-muted-foreground',
                      colors.inactive
                    )
              )}
              aria-pressed={isActive}
            >
              <span>{option.label}</span>
              {option.count !== undefined && (
                <span
                  className={cn(
                    'inline-flex items-center justify-center rounded-full font-medium',
                    styles.count,
                    isActive ? colors.count : 'bg-muted text-muted-foreground'
                  )}
                >
                  {option.count}
                </span>
              )}
            </button>
          );
        })}
        {/* Spacer for scroll padding on mobile */}
        {mobileScroll && <div className="w-4 shrink-0 sm:hidden" aria-hidden="true" />}
      </div>
    </div>
  );
}

/**
 * StatusFilterPills - Pre-configured for psychometric status filtering
 */
interface StatusFilterPillsProps {
  activeCount?: number;
  probationCount?: number;
  flaggedCount?: number;
  retiredCount?: number;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function StatusFilterPills({
  activeCount,
  probationCount,
  flaggedCount,
  retiredCount,
  value,
  onChange,
  className,
}: StatusFilterPillsProps) {
  const options: FilterOption[] = [
    { value: 'all', label: 'Все' },
    { value: 'ACTIVE', label: 'Активные', count: activeCount, color: 'emerald' },
    { value: 'PROBATION', label: 'Пробационные', count: probationCount, color: 'amber' },
    { value: 'FLAGGED_FOR_REVIEW', label: 'На проверке', count: flaggedCount, color: 'orange' },
    { value: 'RETIRED', label: 'Отключенные', count: retiredCount, color: 'red' },
  ];

  return (
    <QuickFilterPills
      options={options}
      value={value as string | 'all'}
      onChange={onChange}
      className={className}
    />
  );
}

/**
 * ReliabilityFilterPills - Pre-configured for reliability status filtering
 */
interface ReliabilityFilterPillsProps {
  reliableCount?: number;
  acceptableCount?: number;
  unreliableCount?: number;
  insufficientCount?: number;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ReliabilityFilterPills({
  reliableCount,
  acceptableCount,
  unreliableCount,
  insufficientCount,
  value,
  onChange,
  className,
}: ReliabilityFilterPillsProps) {
  const options: FilterOption[] = [
    { value: 'all', label: 'Все' },
    { value: 'RELIABLE', label: 'Надежные', count: reliableCount, color: 'emerald' },
    { value: 'ACCEPTABLE', label: 'Приемлемые', count: acceptableCount, color: 'amber' },
    { value: 'UNRELIABLE', label: 'Ненадежные', count: unreliableCount, color: 'red' },
    { value: 'INSUFFICIENT_DATA', label: 'Недостаточно данных', count: insufficientCount, color: 'gray' },
  ];

  return (
    <QuickFilterPills
      options={options}
      value={value as string | 'all'}
      onChange={onChange}
      className={className}
    />
  );
}

export default QuickFilterPills;

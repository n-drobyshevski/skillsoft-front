'use client';

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { QuickFilterPills, FilterOption } from '@/app/(workspace)/psychometrics/_components/QuickFilterPills';
import type { ActivityEventType } from '@/types/activity';
import type { DateRangeValue } from './useActivityFilters';

export interface ActivityFilterPillsProps {
  /** Current status filter value */
  statusValue: ActivityEventType | 'all';
  /** Status filter change handler */
  onStatusChange: (value: ActivityEventType | 'all') => void;
  /** Current passed filter value */
  passedValue: 'all' | 'true' | 'false';
  /** Passed filter change handler */
  onPassedChange: (value: 'all' | 'true' | 'false') => void;
  /** Current date range filter value */
  dateRangeValue: DateRangeValue;
  /** Date range filter change handler */
  onDateRangeChange: (value: DateRangeValue) => void;
  /** Optional className */
  className?: string;
  /** Show date range filter (default: true) */
  showDateRange?: boolean;
}

/**
 * ActivityFilterPills - Mobile-optimized filter pills for activity page.
 *
 * Features:
 * - Three filter rows: Status, Result, Date Range
 * - Horizontal scroll with fade indicators on mobile
 * - Color-coded pills matching status semantics
 * - Uses existing QuickFilterPills component
 */
export function ActivityFilterPills({
  statusValue,
  onStatusChange,
  passedValue,
  onPassedChange,
  dateRangeValue,
  onDateRangeChange,
  className,
  showDateRange = true,
}: ActivityFilterPillsProps) {
  const t = useTranslations('activity');

  // Status filter options
  const statusOptions: FilterOption<ActivityEventType>[] = [
    { value: 'all', label: t('filters.allStatuses') },
    { value: 'COMPLETED', label: t('completed'), color: 'emerald' },
    { value: 'ABANDONED', label: t('abandoned'), color: 'amber' },
    { value: 'TIMED_OUT', label: t('timedOut'), color: 'red' },
  ];

  // Result filter options
  const resultOptions: FilterOption<'true' | 'false'>[] = [
    { value: 'all', label: t('filters.allResults') },
    { value: 'true', label: t('passed'), color: 'emerald' },
    { value: 'false', label: t('failed'), color: 'gray' },
  ];

  // Date range filter options
  const dateRangeOptions: FilterOption<Exclude<DateRangeValue, 'all'>>[] = [
    { value: 'all', label: t('filters.allTime') },
    { value: '7d', label: t('filters.last7Days'), color: 'blue' },
    { value: '30d', label: t('filters.last30Days'), color: 'blue' },
    { value: '90d', label: t('filters.last90Days'), color: 'blue' },
  ];

  return (
    <div className={cn('space-y-2', className)}>
      {/* Status Filter */}
      <QuickFilterPills
        options={statusOptions}
        value={statusValue}
        onChange={onStatusChange}
        size="sm"
      />

      {/* Result Filter */}
      <QuickFilterPills
        options={resultOptions}
        value={passedValue}
        onChange={onPassedChange}
        size="sm"
      />

      {/* Date Range Filter */}
      {showDateRange && (
        <QuickFilterPills
          options={dateRangeOptions}
          value={dateRangeValue}
          onChange={onDateRangeChange}
          size="sm"
        />
      )}
    </div>
  );
}

/**
 * Compact version with single row for desktop inline display
 */
export interface ActivityFilterSelectsProps {
  statusValue: ActivityEventType | 'all';
  onStatusChange: (value: ActivityEventType | 'all') => void;
  passedValue: 'all' | 'true' | 'false';
  onPassedChange: (value: 'all' | 'true' | 'false') => void;
  dateRangeValue: DateRangeValue;
  onDateRangeChange: (value: DateRangeValue) => void;
  className?: string;
}

export default ActivityFilterPills;
